# Handles all Gemini API communication.
# Key features:
#   - API key rotation: supports multiple keys (comma-separated in GEMINI_API_KEY)
#     Auto-rotates to next key on quota exhaustion (429 / ResourceExhausted)
#   - Model instantiated LAZILY (get_model()) — not at import time.
#   - safe_call() is fully async — uses asyncio.to_thread + asyncio.wait_for
#   - response_schema uses plain dict schemas (Gemini rejects Pydantic defaults)

import os
import json
import logging
import asyncio
import google.generativeai as genai

logger = logging.getLogger(__name__)

_model = None
_GEMINI_TIMEOUT = 15.0

# ── Multi-key rotation ───────────────────────────────────────────────────────
_api_keys = []
_current_key_index = 0


def _load_keys():
    """Parse comma-separated API keys from env."""
    global _api_keys
    raw = os.getenv("GEMINI_API_KEY", "")
    _api_keys = [k.strip() for k in raw.split(",") if k.strip()]
    if not _api_keys:
        raise EnvironmentError(
            "GEMINI_API_KEY is not set. "
            "Set one or more keys (comma-separated) in the environment."
        )
    logger.info("[Gemini] Loaded %d API key(s).", len(_api_keys))


def _rotate_key():
    """Switch to the next API key and reconfigure the model."""
    global _current_key_index, _model
    _current_key_index = (_current_key_index + 1) % len(_api_keys)
    new_key = _api_keys[_current_key_index]
    genai.configure(api_key=new_key)
    _model = genai.GenerativeModel("gemini-2.0-flash")
    logger.info("[Gemini] Rotated to API key #%d.", _current_key_index + 1)


def get_model():
    """Lazy initialiser. Called on first agent execution."""
    global _model
    if _model is None:
        if not _api_keys:
            _load_keys()
        genai.configure(api_key=_api_keys[_current_key_index])
        _model = genai.GenerativeModel("gemini-2.0-flash")
        logger.info("[Gemini] Model initialised: gemini-2.0-flash (key #%d)", _current_key_index + 1)
    return _model


# ── Plain dict schemas for Gemini structured output ──────────────────────────
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

_SCHEMA_MAP = {
    "AgentResponse": AGENT_RESPONSE_SCHEMA,
    "SwarmDirectorResponse": DIRECTOR_RESPONSE_SCHEMA,
}


def _is_quota_error(exc):
    """Check if the exception is a Gemini rate-limit / quota error."""
    msg = str(exc).lower()
    return any(kw in msg for kw in ("resource exhausted", "429", "quota", "rate limit"))


def _blocking_call(prompt, schema_class):
    """Pure synchronous Gemini call."""
    model = get_model()
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
    Async wrapper with API key rotation on quota exhaustion.
    If a key is exhausted, rotates to the next key and retries.
    """
    wait = 1
    last_err = None
    keys_tried = 0

    for attempt in range(retries + 1):
        try:
            result = await asyncio.wait_for(
                asyncio.to_thread(_blocking_call, prompt, schema_class),
                timeout=_GEMINI_TIMEOUT,
            )
            return result

        except asyncio.TimeoutError:
            last_err = TimeoutError(f"Gemini call timed out after {_GEMINI_TIMEOUT}s")
            logger.warning("[Gemini] Attempt %d/%d — TIMEOUT.", attempt + 1, retries + 1)

        except Exception as exc:
            last_err = exc
            if _is_quota_error(exc) and len(_api_keys) > 1 and keys_tried < len(_api_keys):
                keys_tried += 1
                logger.warning("[Gemini] Key #%d quota exhausted. Rotating...", _current_key_index + 1)
                _rotate_key()
                # Don't sleep — immediately retry with new key
                continue
            logger.warning("[Gemini] Attempt %d/%d — %s.", attempt + 1, retries + 1, str(exc))

        if attempt < retries:
            await asyncio.sleep(wait)
            wait *= 2

    logger.error("[Gemini] All %d attempts failed. Last: %s", retries + 1, str(last_err))

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
