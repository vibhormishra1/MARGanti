# Orchestrates the agent negotiation loop.
# Key invariants enforced here:
#   - Time deducted ONCE per round (not per agent)
#   - all(consensus_flags) guarded against empty list
#   - async execution via asyncio.to_thread() — safe_call is now async
#   - Each agent gets max 2 physics validation attempts
#   - Hospital participates in ALL rounds (not dropped after round 1)
#   - Director builds final_consensus_plan from validated_decisions,
#     falling back to hardcoded demo sequence only if decisions are empty

import asyncio
import logging
from typing import Any

from typing import Optional, List

from services.gemini_service import safe_call
from core.prompt_builder import build_agent_prompt, build_director_prompt
from physics.physics_engine import validate_physics, TICK_MINUTES, NODE_DISTANCES, ENVIRONMENT_RULES
from schemas.state_models import AgentResponse, SwarmDirectorResponse

logger = logging.getLogger(__name__)

MAX_ROUNDS = 3

# Hospital stays active every round — its needs don't resolve until plan is approved.
# Transport is the primary logistics agent — always active.
# NGO is the escalation agent — joins round 2+ as backup when Transport struggles.
AGENTS_BY_ROUND = {
    1: ["hospital", "transport"],
    2: ["hospital", "transport", "ngo"],
    3: ["hospital", "transport", "ngo"],
}


async def process_simulation_round(state: dict) -> dict:
    """
    Executes one simulation round:
      1. Increment round counter.
      2. Check termination conditions.
      3. Run active agents sequentially (each with physics feedback loop).
      4. Deduct TICK_MINUTES ONCE after all agents complete.
      5. Check consensus.
      6. If terminal, call Swarm Director.

    Sequential (not parallel) because each agent reads the previous agent's
    output from shared_history — order is causally significant.

    Returns the mutated state dict for Node to write to Firebase.
    """
    round_num = state.get("round_number", 0) + 1
    state["round_number"] = round_num

    # ── Firebase null coercion guard ────────────────────────────────────────
    # Firebase RTDB converts empty arrays [] to null/missing keys.
    # Ensure all list fields exist before any code touches them.
    if not state.get("shared_history"):
        state["shared_history"] = []
    if not state.get("validated_decisions"):
        state["validated_decisions"] = []
    if not state.get("conflicts"):
        state["conflicts"] = []

    logger.info("[Runner] Round %d starting. Time left: %d min.",
                round_num, state["crisis"]["time_remaining_minutes"])

    # ── Termination check ───────────────────────────────────────────────────
    if round_num > MAX_ROUNDS or state.get("status") == "forced_resolution":
        logger.info("[Runner] Max rounds reached — forcing Director.")
        state["status"] = "forced_resolution"
        return await _run_swarm_director(state)

    # ── Determine active agents for this round ──────────────────────────────
    active_agents = AGENTS_BY_ROUND.get(round_num, ["hospital", "transport", "ngo"])
    consensus_flags = []  # type: List[bool]

    # ── Agent execution loop ────────────────────────────────────────────────
    for agent_name in active_agents:
        physics_error = None  # Optional[str]
        final_response = None  # Optional[dict]

        # Up to 2 attempts per agent to pass the physics gate
        for attempt in range(2):
            prompt = build_agent_prompt(agent_name, state, physics_error)

            # safe_call is now fully async (uses asyncio.to_thread + wait_for internally)
            raw = await safe_call(prompt, AgentResponse)

            # Overwrite agent/round — Gemini fills these but may be wrong
            raw["round"] = round_num
            raw["agent"] = agent_name

            validation = validate_physics(raw, state)

            if validation["valid"]:
                final_response = raw
                # Capture validated transport decisions for Director plan building
                if (raw.get("action") in ("offer", "resolve")
                        and raw.get("proposed_transport") in ("truck", "drone")
                        and not raw.get("degraded")):
                    state["validated_decisions"].append({
                        "method":      raw["proposed_transport"],
                        "from":        raw.get("from_node"),
                        "to":          raw.get("to_node"),
                        "quantity":    raw.get("quantity", 0),
                        "eta_minutes": _compute_eta(
                            raw.get("from_node"), raw.get("to_node"),
                            raw["proposed_transport"], state
                        ),
                    })
                logger.info("[Runner] %s passed physics (attempt %d).", agent_name, attempt + 1)
                break
            else:
                physics_error = validation["error"]
                logger.warning("[Physics] Blocked %s (attempt %d): %s",
                               agent_name, attempt + 1, physics_error)

        # If both attempts failed physics, use last response with error annotation
        if final_response is None:
            logger.error("[Runner] %s failed both attempts.", agent_name)
            raw["public_message"] = f"Proposal blocked: {physics_error}"
            raw["consensus_reached"] = False
            final_response = raw

        state["shared_history"].append(final_response)
        consensus_flags.append(bool(final_response.get("consensus_reached", False)))

    # ── Deduct time ONCE after all agents complete (REQ-M4-03) ─────────────
    # This is the ONLY place TICK_MINUTES is subtracted.
    state["crisis"]["time_remaining_minutes"] = max(
        0, state["crisis"]["time_remaining_minutes"] - TICK_MINUTES
    )
    logger.info("[Runner] Round %d done. Time left: %d min.",
                round_num, state["crisis"]["time_remaining_minutes"])

    # ── Consensus check ─────────────────────────────────────────────────────
    # Guard: all([]) is True in Python — explicit length check required.
    if consensus_flags and all(consensus_flags):
        logger.info("[Runner] Consensus in round %d.", round_num)
        state["status"] = "consensus_reached"
        return await _run_swarm_director(state)

    return state


async def _run_swarm_director(state: dict) -> dict:
    """
    Invokes the Swarm Director to synthesise a final plan.

    Plan construction priority:
    1. Use validated_decisions if available — decisions that passed physics.
    2. Fall back to hardcoded demo sequence if no validated decisions exist.
       (Ensures demo never shows an empty plan card.)
    """
    logger.info("[Director] Synthesising final plan.")
    prompt       = build_director_prompt(state)
    director_res = await safe_call(prompt, SwarmDirectorResponse)

    # ── Build transport_sequence from validated_decisions ───────────────────
    decisions = state.get("validated_decisions", [])
    if decisions:
        transport_sequence = [
            d for d in decisions
            if d.get("method") in ("truck", "drone") and d.get("from") and d.get("to")
        ]
    else:
        # Pure demo fallback — only used if no agent reached an offer/resolve
        logger.warning("[Director] No validated_decisions — using demo fallback.")
        transport_sequence = [
            {"method": "drone", "from": "NGO_BASE_E",  "to": "WAYPOINT_C",     "quantity": 100, "eta_minutes": 11},
            {"method": "truck", "from": "WAYPOINT_C",  "to": "COLD_STORAGE_D", "quantity": 100, "eta_minutes": 72},
        ]

    route_nodes = _extract_route_nodes(transport_sequence)

    state["final_consensus_plan"] = {
        "status":             director_res.get("approval_status", "FAILED"),
        "confidence_note":    director_res.get("executive_summary", "Plan finalised."),
        "risk_flags":         director_res.get("risk_flags", []),
        "route_nodes":        route_nodes,
        "transport_sequence": transport_sequence,
    }

    # Push Director narrative to shared_history for the chat feed
    state["shared_history"].append({
        "agent":              "swarm_director",
        "round":              state["round_number"],
        "public_message":     director_res.get("executive_summary", "Plan finalised."),
        "internal_reasoning": None,
        "priority":           "critical",
        "consensus_reached":  True,
        "degraded":           False,
    })

    logger.info("[Director] Plan: %s", state["final_consensus_plan"]["status"])
    return state


def _compute_eta(from_node, to_node, transport, state) -> int:
    """
    Deterministic ETA calculation using NODE_DISTANCES.
    Uses worst-case 45km if route is unknown or nodes missing.
    """
    scenario = state["crisis"]["type"]
    rules    = ENVIRONMENT_RULES.get(scenario, ENVIRONMENT_RULES["cyclone_grid_failure"])
    if from_node and to_node:
        distance = NODE_DISTANCES.get((from_node, to_node), 45)
    else:
        distance = 45  # worst-case fallback
    speed = rules["drone_speed_kmh"] if transport == "drone" else rules["truck_max_speed_kmh"]
    return int((distance / speed) * 60) if speed > 0 and distance > 0 else 0


def _extract_route_nodes(transport_sequence: list) -> list:
    """
    Extracts ordered unique node IDs from transport_sequence for map polylines.
    """
    nodes = []  # type: List[str]
    for seg in transport_sequence:
        if seg.get("from") and seg["from"] not in nodes:
            nodes.append(seg["from"])
        if seg.get("to") and seg["to"] not in nodes:
            nodes.append(seg["to"])
    return nodes
