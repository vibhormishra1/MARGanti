# Strict Pydantic contracts for both incoming state and LLM output.
# Two separate concerns:
#   - SharedGlobalState: what Node sends us
#   - AgentResponse / SwarmDirectorResponse: what Gemini must return
#
# AgentResponse is also used as response_schema for Gemini structured output.
# This eliminates json.loads() brittleness — Gemini is forced at the API level.

from pydantic import BaseModel, Field
from typing import Literal, List, Dict, Any, Optional


# ── Gemini Output Schemas ────────────────────────────────────────────────────

class AgentResponse(BaseModel):
    # Field name is "round" (not "round_num") — matches what Gemini returns
    # and what we store in shared_history. No alias needed.
    agent:              Literal["hospital", "transport", "ngo", "swarm_director", "system"]
    round:              int
    action:             Literal["request", "offer", "reject", "hold", "resolve"]
    resource:           str
    quantity:           int
    proposed_transport: Literal["truck", "drone", "none"]
    # internal_reasoning: CoT — forces Gemini to reason before deciding (REQ-M3-08)
    internal_reasoning: str
    public_message:     str
    priority:           Literal["low", "medium", "high", "critical"]
    # from_node / to_node: agent declares route — physics engine validates distance
    # These fields are what allow physics to look up NODE_DISTANCES properly.
    from_node:          Optional[str] = None
    to_node:            Optional[str] = None
    consensus_reached:  bool
    degraded:           bool = False


class SwarmDirectorResponse(BaseModel):
    approval_status:   Literal["APPROVED", "MODIFIED", "FORCED", "FAILED"]
    executive_summary: str
    risk_flags:        List[str]


# ── Incoming State Schema ────────────────────────────────────────────────────

class CrisisState(BaseModel):
    type:                   str
    location:               str
    severity:               str
    time_remaining_minutes: int
    grid_status:            str
    road_status:            str


class SharedGlobalState(BaseModel):
    session_id:          str
    round_number:        int
    status:              str
    crisis:              CrisisState
    agents:              Dict[str, Any]
    shared_history:      List[Dict[str, Any]]
    validated_decisions: List[Dict[str, Any]]
    conflicts:           List[Dict[str, Any]]
    final_consensus_plan: Optional[Dict[str, Any]] = None
    system_message:       Optional[str] = None
