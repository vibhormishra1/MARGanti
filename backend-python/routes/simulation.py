# FastAPI route — single endpoint per SRS REQ-M3-01.
# Accepts raw dict from Node to avoid Pydantic 422 errors caused by
# Firebase null coercion (empty arrays → null, missing optional fields).

import logging
from fastapi import APIRouter, HTTPException, Request

from core.agent_runner import process_simulation_round

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/round")
async def simulate_round(request: Request):
    """
    POST /simulate/round
    Accepts the current state as raw JSON, runs one agent round,
    returns the updated state for Node to write to Firebase.
    """
    try:
        body = await request.json()
        state_dict = body.get("state", body)

        # Minimal validation — just check required fields exist
        if "session_id" not in state_dict or "crisis" not in state_dict:
            raise HTTPException(
                status_code=400,
                detail="Missing required fields: session_id, crisis",
            )

        updated_state = await process_simulation_round(state_dict)
        return updated_state

    except HTTPException:
        raise
    except Exception as exc:
        session_id = state_dict.get("session_id", "unknown") if 'state_dict' in dir() else "unknown"
        logger.exception("[Route] Unhandled error in session %s", session_id)
        raise HTTPException(
            status_code=500,
            detail={"error": str(exc), "session_id": session_id},
        )
