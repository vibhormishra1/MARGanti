# The Symbolic half of the Neurosymbolic architecture.
# Zero AI. Zero probability. Pure deterministic Python.
#
# Key fixes over all three prior versions:
#   - NODE_DISTANCES lookup by (from_node, to_node) — not hardcoded 45km
#   - TICK_MINUTES deducted ONCE per round in agent_runner, not here
#   - Solar fridge blocked when grid is offline (F-07 from SRS flaw analysis)
#   - Coordinate injection protection (REQ-M4-07)
#   - All error codes match SRS Section 5.2

from typing import Tuple

import logging

logger = logging.getLogger(__name__)

# ── Hardcoded node distances (km) ────────────────────────────────────────────
# Bidirectional lookup: (origin, destination) → km
# These are the ONLY valid routes. If the LLM proposes a route not in this
# table, it receives PHYSICS_UNKNOWN_ROUTE.
NODE_DISTANCES: dict[Tuple[str, str], int] = {
    ("HOSPITAL_A",    "DEPOT_B"):         45,
    ("HOSPITAL_A",    "WAYPOINT_C"):      20,
    ("HOSPITAL_A",    "COLD_STORAGE_D"): 38,
    ("DEPOT_B",       "HOSPITAL_A"):      45,
    ("DEPOT_B",       "WAYPOINT_C"):      25,
    ("DEPOT_B",       "COLD_STORAGE_D"): 30,
    ("WAYPOINT_C",    "HOSPITAL_A"):      20,
    ("WAYPOINT_C",    "DEPOT_B"):         25,
    ("WAYPOINT_C",    "COLD_STORAGE_D"): 18,
    ("NGO_BASE_E",    "HOSPITAL_A"):      30,
    ("NGO_BASE_E",    "WAYPOINT_C"):      15,
    ("NGO_BASE_E",    "COLD_STORAGE_D"): 28,
    ("COLD_STORAGE_D","HOSPITAL_A"):      38,
    ("COLD_STORAGE_D","WAYPOINT_C"):      18,
}

# ── Environment rules per scenario ───────────────────────────────────────────
ENVIRONMENT_RULES = {
    "cyclone_grid_failure": {
        "truck_max_speed_kmh":    15,    # flooded roads (REQ-M4-01)
        "drone_speed_kmh":        80,
        "drone_max_payload_units":100,
        "grid_status":            "offline",
        "solar_fridge_available": False,  # F-07: fridge needs power, grid is offline
        "dry_ice_available":      True,
    }
}

# Deducted from time_remaining_minutes ONCE per completed round.
# Defined here so physics_engine owns the simulation time contract.
TICK_MINUTES: int = 30


def validate_physics(agent_response: dict, current_state: dict) -> dict:
    """
    Validates a single agent response against deterministic physics rules.

    Returns
    -------
    {"valid": True, "error": None}
        if the response passes all checks.
    {"valid": False, "error": "ERROR_CODE: explanation"}
        if any check fails. The caller feeds this error back to the LLM.
    """
    scenario = current_state["crisis"]["type"]
    rules    = ENVIRONMENT_RULES.get(scenario, ENVIRONMENT_RULES["cyclone_grid_failure"])

    transport = agent_response.get("proposed_transport", "none")
    quantity  = agent_response.get("quantity", 0)
    resource  = agent_response.get("resource", "").lower()
    action    = agent_response.get("action", "hold")
    from_node = agent_response.get("from_node")
    to_node   = agent_response.get("to_node")
    time_left = current_state["crisis"]["time_remaining_minutes"]

    # ── Check 1: Coordinate injection (REQ-M4-07) ──────────────────────────
    # If the LLM somehow generated lat/lng fields, reject immediately.
    for forbidden in ("latitude", "longitude", "lat", "lng", "coordinates"):
        if forbidden in agent_response:
            return {
                "valid": False,
                "error": "PHYSICS_COORDINATE_INJECTION: LLM generated GPS coordinates. "
                         "Only node IDs are permitted.",
            }

    # ── Check 2: Asset availability (REQ-M4-06) ────────────────────────────
    if "solar_fridge" in resource and not rules["solar_fridge_available"]:
        return {
            "valid": False,
            "error": "PHYSICS_ASSET_UNAVAILABLE: Solar fridges require grid power. "
                     "Grid is offline. Use drones or dry-ice packs instead.",
        }

    # ── Check 3: Drone capacity (REQ-M4-05) ────────────────────────────────
    if transport == "drone" and quantity > rules["drone_max_payload_units"]:
        return {
            "valid": False,
            "error": (
                f"PHYSICS_CAPACITY_VIOLATION: Drone max payload is "
                f"{rules['drone_max_payload_units']} units. "
                f"Agent proposed {quantity}. Reduce quantity or use multiple drone waves."
            ),
        }

    # ── Check 4: ETA validation (REQ-M4-04) ────────────────────────────────
    # Only run if agent declared a route and action involves movement.
    if transport in ("truck", "drone") and action in ("offer", "request", "resolve"):
        if from_node and to_node:
            distance_km = NODE_DISTANCES.get((from_node, to_node))

            if distance_km is None:
                return {
                    "valid": False,
                    "error": (
                        f"PHYSICS_UNKNOWN_ROUTE: No known route between "
                        f"{from_node} and {to_node}. "
                        f"Valid nodes: HOSPITAL_A, DEPOT_B, WAYPOINT_C, "
                        f"COLD_STORAGE_D, NGO_BASE_E."
                    ),
                }

            speed_kmh = (
                rules["truck_max_speed_kmh"]
                if transport == "truck"
                else rules["drone_speed_kmh"]
            )
            # ETA in minutes — deterministic, no LLM involvement
            eta_minutes = (distance_km / speed_kmh) * 60

            if eta_minutes > time_left:
                return {
                    "valid": False,
                    "error": (
                        f"PHYSICS_ETA_VIOLATION: {transport.title()} ETA for "
                        f"{from_node} → {to_node} is {eta_minutes:.0f} min. "
                        f"Only {time_left} min remain before spoilage. "
                        f"Switch to drone or choose a closer waypoint."
                    ),
                }
        # If from_node/to_node not declared but transport is proposed,
        # we can't validate ETA. Log a warning but don't block.
        else:
            logger.warning(
                "[Physics] Agent proposed %s but did not declare from_node/to_node. "
                "ETA cannot be validated.",
                transport,
            )

    return {"valid": True, "error": None}
