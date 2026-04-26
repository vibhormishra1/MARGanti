# Orchestrates the agent negotiation loop.
# Key invariants enforced here:
#   - Time deducted ONCE per round (not per agent)
#   - all(consensus_flags) guarded against empty list
#   - async execution via asyncio.to_thread() — safe_call is sync/blocking
#   - Each agent gets max 2 physics validation attempts
#   - Director builds final_consensus_plan from validated_decisions,
#     falling back to hardcoded demo sequence only if decisions are empty

import asyncio
import logging
from typing import Any

from services.gemini_service import safe_call
from core.prompt_builder import build_agent_prompt, build_director_prompt
from physics.physics_engine import validate_physics, TICK_MINUTES
from schemas.state_models import AgentResponse, SwarmDirectorResponse

logger = logging.getLogger(__name__)

MAX_ROUNDS = 3

# Agents active in round 1. NGO joins from round 2.
ROUND_1_AGENTS = ["hospital", "transport"]
LATER_AGENTS   = ["ngo"]


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
    logger.info("[Runner] Starting round %d", round_num)

    # ── Termination check ───────────────────────────────────────────────────
    if round_num > MAX_ROUNDS or state.get("status") == "forced_resolution":
        logger.info("[Runner] Max rounds reached — invoking Swarm Director.")
        state["status"] = "forced_resolution"
        return await _run_swarm_director(state)

    # ── Determine active agents for this round ──────────────────────────────
    active_agents = list(ROUND_1_AGENTS)
    if round_num >= 2:
        active_agents.extend(LATER_AGENTS)

    consensus_flags: list[bool] = []

    # ── Agent execution loop ────────────────────────────────────────────────
    for agent_name in active_agents:
        physics_error: str | None = None
        final_response: dict | None = None

        # Up to 2 attempts per agent to pass the physics gate
        for attempt in range(2):
            prompt = build_agent_prompt(agent_name, state, physics_error)

            # safe_call is synchronous (time.sleep inside).
            # asyncio.to_thread runs it in a thread pool — event loop not blocked.
            raw = await asyncio.to_thread(safe_call, prompt, AgentResponse)

            # Inject metadata that the LLM schema doesn't provide
            raw["round"] = round_num
            raw["agent"] = agent_name

            validation = validate_physics(raw, state)

            if validation["valid"]:
                final_response = raw
                logger.info("[Physics] %s passed (attempt %d)", agent_name, attempt + 1)
                break
            else:
                physics_error = validation["error"]
                logger.warning(
                    "[Physics] %s BLOCKED (attempt %d): %s",
                    agent_name, attempt + 1, physics_error
                )

        # If both attempts failed physics, use last response with error annotation
        if final_response is None:
            logger.error("[Physics] %s failed both attempts — using last response.", agent_name)
            raw["public_message"] = f"Proposal blocked: {physics_error}"
            raw["consensus_reached"] = False
            final_response = raw

        state["shared_history"].append(final_response)

        # Track validated decisions separately from raw history
        if final_response.get("action") in ("offer", "resolve") and not final_response.get("degraded"):
            state["validated_decisions"].append(final_response)

        consensus_flags.append(bool(final_response.get("consensus_reached", False)))

    # ── Deduct time ONCE after all agents complete (REQ-M4-03) ─────────────
    # This is the ONLY place TICK_MINUTES is subtracted.
    # Physics engine defines TICK_MINUTES; agent_runner applies it once per round.
    state["crisis"]["time_remaining_minutes"] = max(
        0,
        state["crisis"]["time_remaining_minutes"] - TICK_MINUTES
    )
    logger.info(
        "[Runner] Round %d complete. Time remaining: %d min.",
        round_num, state["crisis"]["time_remaining_minutes"]
    )

    # ── Consensus check ─────────────────────────────────────────────────────
    # Guard: all([]) is True in Python — explicit length check required.
    if consensus_flags and all(consensus_flags):
        logger.info("[Runner] Consensus reached in round %d.", round_num)
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
    director_res = await asyncio.to_thread(safe_call, prompt, SwarmDirectorResponse)

    # ── Build transport_sequence from validated_decisions ───────────────────
    decisions = state.get("validated_decisions", [])
    if decisions:
        transport_sequence = [
            {
                "method":      d.get("proposed_transport", "drone"),
                "from":        d.get("from_node", "NGO_BASE_E"),
                "to":          d.get("to_node", "WAYPOINT_C"),
                "quantity":    d.get("quantity", 100),
                # ETA calculated by physics engine using NODE_DISTANCES
                "eta_minutes": _compute_eta(
                    d.get("from_node"), d.get("to_node"),
                    d.get("proposed_transport", "drone"), state
                ),
            }
            for d in decisions
            if d.get("proposed_transport") in ("truck", "drone")
        ]
    else:
        # Pure demo fallback — only used if no agent reached an offer/resolve
        logger.warning("[Director] No validated_decisions — using demo fallback route.")
        transport_sequence = [
            {"method": "drone", "from": "NGO_BASE_E",  "to": "WAYPOINT_C",    "quantity": 100, "eta_minutes": 11},
            {"method": "truck", "from": "WAYPOINT_C",  "to": "COLD_STORAGE_D","quantity": 100, "eta_minutes": 72},
        ]

    state["final_consensus_plan"] = {
        "status":          director_res.get("approval_status", "FAILED"),
        "confidence_note": director_res.get("executive_summary", "Plan finalised."),
        "risk_flags":      director_res.get("risk_flags", []),
        "route_nodes":     _extract_route_nodes(transport_sequence),
        "transport_sequence": transport_sequence,
    }

    # Push Director narrative to shared_history for the chat feed
    state["shared_history"].append({
        "agent":          "swarm_director",
        "round":          state["round_number"],
        "public_message": director_res.get("executive_summary", "Plan finalised."),
        "priority":       "critical",
        "internal_reasoning": None,
    })

    logger.info("[Director] Final plan built: %s", state["final_consensus_plan"]["status"])
    return state


def _compute_eta(from_node: str | None, to_node: str | None, transport: str, state: dict) -> int:
    """
    Deterministic ETA calculation using NODE_DISTANCES.
    Returns 0 if route is unknown (shouldn't happen — physics gate blocks unknown routes).
    """
    from physics.physics_engine import NODE_DISTANCES, ENVIRONMENT_RULES
    if not from_node or not to_node:
        return 0
    distance = NODE_DISTANCES.get((from_node, to_node), 0)
    scenario  = state["crisis"]["type"]
    rules     = ENVIRONMENT_RULES.get(scenario, ENVIRONMENT_RULES["cyclone_grid_failure"])
    speed     = rules["drone_speed_kmh"] if transport == "drone" else rules["truck_max_speed_kmh"]
    return int((distance / speed) * 60) if speed > 0 else 0


def _extract_route_nodes(transport_sequence: list[dict]) -> list[str]:
    """
    Extracts ordered unique node IDs from transport_sequence for map polylines.
    """
    nodes: list[str] = []
    for seg in transport_sequence:
        if seg.get("from") and seg["from"] not in nodes:
            nodes.append(seg["from"])
        if seg.get("to") and seg["to"] not in nodes:
            nodes.append(seg["to"])
    return nodes
