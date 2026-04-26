# Handles all Gemini API communication.
# Key decisions:
#   - Model instantiated LAZILY (get_model()) — not at import time.
#     Import-time instantiation runs before load_dotenv() in main.py,
#     meaning api_key is None and genai.configure() receives nothing.
#   - safe_call() is a regular (sync) function — callers run it via
#     asyncio.to_thread() to avoid blocking the FastAPI event loop.
#   - Exponential backoff: 1s → 2s between retries.
#   - response_schema enforces structured output at the API level —
#     no json.loads() on free-form text.

import os
import time
import json
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Module-level sentinel — model built once per process lifetime after config
_model = None


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


def safe_call(prompt: str, schema_class, retries: int = 2) -> dict:
    """
    Synchronous Gemini call with exponential backoff and a safe fallback.

    Why sync? FastAPI callers wrap this in asyncio.to_thread() so it runs
    in a thread pool — the event loop is never blocked.

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
    model    = get_model()
    wait     = 1
    last_err = None

    for attempt in range(retries + 1):
        try:
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
            # response.text is guaranteed JSON by response_mime_type + response_schema.
            # Still parse defensively — SDK bugs exist.
            parsed = json.loads(response.text)
            return parsed

        except Exception as exc:
            last_err = exc
            if attempt < retries:
                logger.warning(
                    "[Gemini] Attempt %d/%d failed: %s. Retrying in %ds.",
                    attempt + 1, retries + 1, str(exc), wait
                )
                time.sleep(wait)  # sync — caller is already in a thread
                wait *= 2
            else:
                logger.error(
                    "[Gemini] All %d retries exhausted. Last error: %s",
                    retries + 1, str(last_err)
                )

    # REQ-M3-21: Fallback — never crash. Return a hold action with degraded=True.
    # The agent runner detects degraded=True and marks the response accordingly.
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
