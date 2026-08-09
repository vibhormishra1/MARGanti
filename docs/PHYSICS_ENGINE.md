# Deterministic Physics & Symbolic Validation Engine — MARG v2

## Document Metadata
- **Document Title**: PHYSICS_ENGINE.md
- **System**: MARG v2 Symbolic Core
- **Status**: Production Specification

---

## 1. Symbolic Verification Philosophy

The Physics Validation Engine acts as an impenetrable safety gate between neural LLM recommendations and the human command center. It operates on **zero AI, zero probabilities, and pure deterministic execution**.

```
                   PHYSICS VALIDATION GATEWAY TOPOLOGY
                   
                 [ Neural Agent Proposal (AgentResponse) ]
                                     │
                                     ▼
                   ┌───────────────────────────────────┐
                   │    Rule 1: Coordinate Check       │
                   └─────────────────┬─────────────────┘
                                     │ (Pass)
                                     ▼
                   ┌───────────────────────────────────┐
                   │    Rule 2: Power Grid Status      │
                   └─────────────────┬─────────────────┘
                                     │ (Pass)
                                     ▼
                   ┌───────────────────────────────────┐
                   │    Rule 3: Vehicle Payload Limit  │
                   └─────────────────┬─────────────────┘
                                     │ (Pass)
                                     ▼
                   ┌───────────────────────────────────┐
                   │    Rule 4: Google Maps ETA Gate   │
                   └─────────────────┬─────────────────┘
                                     │ (Pass)
                                     ▼
                   [ ACCEPT: Write to Validated Decisions ]
```

---

## 2. Exhaustive Validation Rulebook & Error Codes

### 1. `PHYSICS_COORDINATE_INJECTION`
- **Condition**: LLMs are strictly forbidden from generating spatial coordinate keys (`latitude`, `longitude`, `lat`, `lng`, `coordinates`).
- **Rationale**: Prevents LLMs from hallucinating geographic locations. LLMs must reference established uppercase node IDs (`GMCH_HOSPITAL`, `KHANAPARA_DEPOT`).

### 2. `PHYSICS_ASSET_UNAVAILABLE`
- **Condition**: Rejects proposals requesting `solar_fridge` or grid-powered cooling when `grid_status` is `offline`.
- **Rationale**: Grid power failures require alternative cooling methods (drones or dry ice packs).

### 3. `PHYSICS_CAPACITY_VIOLATION`
- **Condition**: Rejects proposals where `proposed_transport == "drone"` and `quantity > 100`.
- **Rationale**: Enforces hard physical payload caps for aerial drone waves.

### 4. `PHYSICS_UNKNOWN_ROUTE`
- **Condition**: Rejects proposals specifying `from_node` or `to_node` IDs not defined in the current `region_config.nodes` graph.

### 5. `PHYSICS_ETA_VIOLATION`
- **Condition**: Rejects proposals where calculated travel time ($\text{ETA}$) exceeds `time_remaining_minutes`.
- **Mathematical Formulation**:
  $$\text{ETA}_{\text{minutes}} = \left( \frac{D_{\text{road}}}{v_{\text{effective}}} \right) \times 60$$
  If $\text{ETA}_{\text{minutes}} > \text{time\_remaining\_minutes}$, return failure.

---

## 3. Data Flow Before and After Physics Validation

```python
# BEFORE VALIDATION (Raw LLM Proposal)
raw_agent_response = {
    "agent": "transport",
    "round": 1,
    "action": "offer",
    "resource": "cold_evac_5000_units",
    "quantity": 500,  # VIOLATION: Exceeds drone limit (100)
    "proposed_transport": "drone",
    "from_node": "KHANAPARA_DEPOT",
    "to_node": "GMCH_HOSPITAL",
    "internal_reasoning": "Drones are faster than trucks in flood waters.",
    "public_message": "Deploying 500 units via drone wave.",
    "priority": "critical",
    "consensus_reached": False
}

# PHYSICS ENGINE EVALUATION
validation = validate_physics(raw_agent_response, current_state)
# Result: {"valid": False, "error": "PHYSICS_CAPACITY_VIOLATION: Drone max payload is 100 units. Agent proposed 500."}

# AFTER VALIDATION (Retry Feedback Loop)
# Error string is injected into prompt for Attempt #2. Agent reduces quantity to 100.
```

---

## 4. Document Cross-References
- See [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) for agent execution loop.
- See [MAP_ENGINE.md](MAP_ENGINE.md) for Directions API polyline verification.
