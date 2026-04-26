# FastAPI route — single endpoint per SRS REQ-M3-01.
# Incoming state validated against SharedGlobalState Pydantic model
# before agent_runner sees it (fix for "accepts any Dict[str, Any]").

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from schemas.state_models import SharedGlobalState
from core.agent_runner import process_simulation_round

logger = logging.getLogger(__name__)
router = APIRouter()


class SimulateRoundRequest(BaseModel):
    # Node sends: { "state": { ...SharedGlobalState... } }
    state: SharedGlobalState


@router.post("/round")
async def simulate_round(request: SimulateRoundRequest):
    """
    POST /simulate/round
    Accepts the current SharedGlobalState, runs one agent round,
    returns the updated state for Node to write to Firebase.
    """
    try:
        # Convert Pydantic model back to dict for the agent runner.
        # model_dump() with mode="json" ensures nested models are also dicts.
        state_dict = request.state.model_dump(mode="json")

        updated_state = await process_simulation_round(state_dict)
        return updated_state

    except Exception as exc:
        session_id = request.state.session_id
        logger.exception("[Route] Unhandled error in session %s", session_id)
        raise HTTPException(
            status_code=500,
            detail={"error": str(exc), "session_id": session_id},
        )
