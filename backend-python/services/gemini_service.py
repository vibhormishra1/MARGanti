# Handles all Gemini API communication.
# Key decisions:
#   - Model instantiated LAZILY (get_model()) — not at import time.
#   - safe_call() is fully async — uses asyncio.to_thread for the
#     blocking SDK call and asyncio.wait_for to kill hung connections.
#   - Exponential backoff: 1s → 2s between retries, using asyncio.sleep.
#   - response_schema uses a plain dict schema — NOT a Pydantic class,
#     because Gemini rejects schemas with 'default' fields.

import os
import json
import logging
import asyncio
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Module-level sentinel — model built once per process lifetime after config
_model = None
_GEMINI_TIMEOUT = 15.0  # seconds before we kill the call


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
        _model = genai.GenerativeModel("gemini-2.0-flash")
        logger.info("[Gemini] Model initialised: gemini-2.0-flash")
    return _model


# ── Plain dict schemas for Gemini structured output ──────────────────────────
# Gemini's response_schema rejects Pydantic classes that have `default` values.
# So we define the schemas as plain dicts that Gemini understands.

AGENT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "agent":              {"type": "string"},
        "round":              {"type": "integer"},
        "action":             {"type": "string", "enum": ["request", "offer", "reject", "hold", "resolve"]},
        "resource":           {"type": "string"},
        "quantity":           {"type": "integer"},
        "proposed_transport": {"type": "string", "enum": ["truck", "drone", "none"]},
        "from_node":          {"type": "string"},
        "to_node":            {"type": "string"},
        "internal_reasoning": {"type": "string"},
        "public_message":     {"type": "string"},
        "priority":           {"type": "string", "enum": ["low", "medium", "high", "critical"]},
        "consensus_reached":  {"type": "boolean"},
    },
    "required": [
        "agent", "round", "action", "resource", "quantity",
        "proposed_transport", "internal_reasoning", "public_message",
        "priority", "consensus_reached"
    ],
}

DIRECTOR_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "approval_status":   {"type": "string", "enum": ["APPROVED", "MODIFIED", "FORCED", "FAILED"]},
        "executive_summary": {"type": "string"},
        "risk_flags":        {"type": "array", "items": {"type": "string"}},
    },
    "required": ["approval_status", "executive_summary", "risk_flags"],
}

# Map from Pydantic class name to dict schema
_SCHEMA_MAP = {
    "AgentResponse": AGENT_RESPONSE_SCHEMA,
    "SwarmDirectorResponse": DIRECTOR_RESPONSE_SCHEMA,
}


def _blocking_call(prompt, schema_class):
    """
    Pure synchronous Gemini call.
    Runs inside asyncio.to_thread — never called directly from async context.
    """
    model = get_model()

    # Resolve the dict schema from the Pydantic class name
    schema_name = schema_class.__name__ if hasattr(schema_class, '__name__') else str(schema_class)
    dict_schema = _SCHEMA_MAP.get(schema_name)

    gen_config_kwargs = {
        "response_mime_type": "application/json",
        "temperature": 0.15,
        "top_p": 0.85,
        "max_output_tokens": 500,
    }
    if dict_schema:
        gen_config_kwargs["response_schema"] = dict_schema

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(**gen_config_kwargs),
    )
    return json.loads(response.text)


async def safe_call(prompt, schema_class, retries=2):
    """
    Async wrapper around the blocking Gemini call.
    - asyncio.to_thread: runs blocking SDK in thread pool
    - asyncio.wait_for: kills hung connections after _GEMINI_TIMEOUT seconds
    - Exponential backoff: 1s → 2s between retries
    """
    wait = 1
    last_err = None

    for attempt in range(retries + 1):
        try:
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
            await asyncio.sleep(wait)
            wait *= 2

    logger.error(
        "[Gemini] All %d attempts failed. Last: %s",
        retries + 1, str(last_err)
    )

    # Fallback — never crash. Return a hold action with degraded=True.
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
