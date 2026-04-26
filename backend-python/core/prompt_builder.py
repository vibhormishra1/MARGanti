# Assembles agent prompts following the CoT structure from REQ-M3-08.
# Context compression: last 6 messages only (REQ-M3-11) — pure Python slicing,
# no LLM summarisation (F-04 fix).

import json
import logging

logger = logging.getLogger(__name__)

# Valid node IDs that agents are allowed to reference.
# Injected into prompts so the LLM knows the complete set.
VALID_NODES = [
    "HOSPITAL_A", "DEPOT_B", "WAYPOINT_C", "COLD_STORAGE_D", "NGO_BASE_E"
]


def build_agent_prompt(
    role: str,
    state: dict,
    physics_error: str | None = None,
) -> str:
    """
    Builds a Chain-of-Thought prompt for a working agent.

    Injects:
    - Role declaration
    - Current crisis state (time, severity)
    - Agent's own profile (assets, constraints)
    - Last 6 messages from shared_history (context compression — REQ-M3-11)
    - Physics error feedback if previous proposal was rejected (REQ-M3-14)
    - Strict JSON output instruction (REQ-M3-07)

    Note: We do NOT ask the agent to calculate ETA (REQ-M3-10).
    The agent proposes from_node, to_node, transport_method, quantity.
    Python calculates ETA.
    """
    history       = state.get("shared_history", [])
    recent        = history[-6:]  # deterministic slicing — no LLM summarisation
    agent_profile = state.get("agents", {}).get(role, {})
    time_left     = state["crisis"]["time_remaining_minutes"]

    prompt = f"""You are the {role.upper()} AGENT in an autonomous crisis logistics swarm.

SITUATION
---------
Scenario : {state['crisis']['type']}
Location : {state['crisis']['location']}
Severity : {state['crisis']['severity']}
Grid     : {state['crisis']['grid_status']}
Roads    : {state['crisis']['road_status']}

CRITICAL: {time_left} MINUTES UNTIL COLD-CHAIN MEDICAL SUPPLIES SPOIL.

YOUR PROFILE
------------
{json.dumps(agent_profile, indent=2)}

VALID NODE IDs (use EXACTLY these strings in from_node / to_node)
--------------
{json.dumps(VALID_NODES)}

RECENT NEGOTIATION (last {len(recent)} messages)
------------------
{json.dumps(recent, indent=2)}
"""

    # Inject physics error as a system override (REQ-M3-14)
    if physics_error:
        prompt += f"""
SYSTEM OVERRIDE — PHYSICS VIOLATION DETECTED
--------------------------------------------
Your previous proposal was REJECTED by the physics engine:
  {physics_error}

You MUST revise your proposal. Choose a different transport method,
reduce quantity, or select a closer waypoint.
"""

    # Urgency escalation (REQ-M3-09)
    if time_left < 60:
        prompt += """
URGENCY ESCALATION
------------------
Time is CRITICALLY LOW. Prioritise the FASTEST option regardless of
efficiency or cost. Partial supply evacuation is acceptable.
"""

    prompt += f"""
INSTRUCTIONS
------------
1. Think step-by-step (write your reasoning in internal_reasoning).
2. Propose ONE concrete action: request, offer, reject, hold, or resolve.
3. If proposing transport, specify from_node and to_node using VALID NODE IDs only.
4. Do NOT generate GPS coordinates — only node IDs.
5. Do NOT calculate ETA — the physics engine does that.
6. Set consensus_reached=true only if you believe the current plan is viable end-to-end.
7. Round number for this response: {state.get('round_number', 1)}
"""
    return prompt


def build_director_prompt(state: dict) -> str:
    """
    Builds the Swarm Director synthesis prompt.
    Director sees only the last 6 messages (same compression).
    Director does NOT output numerical values — REQ-M3-18.
    """
    history = state.get("shared_history", [])
    recent  = history[-6:]

    return f"""You are the SWARM DIRECTOR — the final authority in this crisis swarm.

The working agents have completed their negotiations.
Your role: synthesise their work into a final decision.

NEGOTIATION SUMMARY (last {len(recent)} messages)
-----------
{json.dumps(recent, indent=2)}

TIME REMAINING: {state['crisis']['time_remaining_minutes']} minutes.

SIMULATION STATUS: {state.get('status')}

INSTRUCTIONS
------------
1. If a viable evacuation plan emerged from negotiations → approval_status: APPROVED.
2. If agents deadlocked or time is nearly exhausted → approval_status: FORCED.
3. Write executive_summary as a clear, one-paragraph human-readable briefing.
4. List risk_flags: any unresolved concerns or single points of failure.
5. Do NOT output any numbers (ETA, quantities, distances) — only narrative.
   All numbers are owned by the physics engine.
"""
