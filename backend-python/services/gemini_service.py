# Handles all Gemini API communication.
# Key decisions:
#   - Model instantiated LAZILY (get_model()) — not at import time.
#     Import-time instantiation runs before load_dotenv() in main.py,
#     meaning api_key is None and genai.configure() receives nothing.
#   - safe_call() is now fully async — uses asyncio.to_thread for the
#     blocking SDK call and asyncio.wait_for to kill hung connections.
#   - Exponential backoff: 1s → 2s between retries, using asyncio.sleep.
#   - response_schema enforces structured output at the API level —
#     no json.loads() on free-form text.

import os
import json
import logging
import asyncio
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Module-level sentinel — model built once per process lifetime after config
_model = None
_GEMINI_TIMEOUT = 12.0  # seconds before we kill the call


def get_model():
    """
    Lazy initialiser. Called on first agent execution, not at import.
    By this point load_dotenv() has already run in main.py.
    """
    global _model
    if _model is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "GEMINI_API_KEY is not set. "
                "Check that load_dotenv() ran before this call."
            )
        genai.configure(api_key=api_key)
        # REQ-M3-05: gemini-2.0-flash for free-tier latency
        _model = genai.GenerativeModel("gemini-2.0-flash")
        logger.info("[Gemini] Model initialised: gemini-2.0-flash")
    return _model


def _blocking_call(prompt: str, schema_class) -> dict:
    """
    Pure synchronous Gemini call.
    Runs inside asyncio.to_thread — never called directly from async context.
    """
    model = get_model()
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=schema_class,  # API-level enforcement
            temperature=0.15,              # REQ-M3-06: low temperature
            top_p=0.85,
            max_output_tokens=400,
        )
    )
    return json.loads(response.text)


async def safe_call(prompt: str, schema_class, retries: int = 2) -> dict:
    """
    Async wrapper around the blocking Gemini call.
    - asyncio.to_thread: runs blocking SDK in thread pool (event loop never blocked)
    - asyncio.wait_for: kills hung connections after _GEMINI_TIMEOUT seconds
    - Exponential backoff: 1s → 2s between retries, using asyncio.sleep (non-blocking)

    Parameters
    ----------
    prompt       : The fully-assembled agent prompt string.
    schema_class : Pydantic model class — passed as response_schema so
                   Gemini is forced to return exactly this structure.
    retries      : Max retries on failure (default 2 → 3 total attempts).

    Returns
    -------
    dict : Parsed response matching schema_class fields, OR the fallback
           degraded dict if all retries fail.
    """
    wait = 1
    last_err = None

    for attempt in range(retries + 1):
        try:
            # wait_for kills the coroutine if Gemini hangs
            result = await asyncio.wait_for(
                asyncio.to_thread(_blocking_call, prompt, schema_class),
                timeout=_GEMINI_TIMEOUT,
            )
            return result

        except asyncio.TimeoutError:
            last_err = TimeoutError(f"Gemini call timed out after {_GEMINI_TIMEOUT}s")
            logger.warning(
                "[Gemini] Attempt %d/%d — TIMEOUT. Retrying in %ds.",
                attempt + 1, retries + 1, wait
            )
        except Exception as exc:
            last_err = exc
            logger.warning(
                "[Gemini] Attempt %d/%d — %s. Retrying in %ds.",
                attempt + 1, retries + 1, str(exc), wait
            )

        if attempt < retries:
            await asyncio.sleep(wait)  # non-blocking sleep
            wait *= 2

    logger.error(
        "[Gemini] All %d attempts failed. Last: %s",
        retries + 1, str(last_err)
    )

    # REQ-M3-21: Fallback — never crash. Return a hold action with degraded=True.
    return {
        "agent":              "system",
        "round":              0,
        "action":             "hold",
        "resource":           "none",
        "quantity":           0,
        "proposed_transport": "none",
        "from_node":          None,
        "to_node":            None,
        "internal_reasoning": f"API failure after {retries + 1} attempts: {str(last_err)}",
        "public_message":     "Agent temporarily offline — fallback protocol active.",
        "priority":           "low",
        "consensus_reached":  False,
        "degraded":           True,
    }
