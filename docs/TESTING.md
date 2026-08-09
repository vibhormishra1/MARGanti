# Testing Philosophy & Verification Framework — MARG v2

## Document Metadata
- **Document Title**: TESTING.md
- **System**: MARG v2 Quality Assurance
- **Status**: Production Testing Specification

---

## 1. Testing Philosophy & Pyramid

MARG v2 enforces a **Strict Neurosymbolic Verification Hierarchy**. Because AI agents exhibit non-deterministic reasoning, testing is divided into deterministic unit tests, symbolic rule validation, API contract tests, and agent behavior benchmarks.

```
                    NEUROSYMBOLIC TESTING PYRAMID
                    
                 /─────────────────────────────\
                /   Agent Benchmark Evaluation  \
               /  (Consensus Rate, CoT Quality)  \
              /───────────────────────────────────\
             /     Integration & Contract Tests    \
            /   (Node Gateway <-> Python Engine)    \
           /─────────────────────────────────────────\
          /   Symbolic Physics Gate Validation Tests  \
         /  (100% Deterministic Rule Verification)     \
        /───────────────────────────────────────────────\
       /    Unit Tests (Zod Schemas, Pydantic Models)    \
      /─────────────────────────────────────────────────\
```

---

## 2. Test Suite Breakdown

### 2.1 Symbolic Physics Unit Tests (`backend-python/tests/test_physics.py`)
Validates every rejection rule code without calling external AI APIs:
1. `test_reject_coordinate_injection()`: Verifies immediate rejection when LLM outputs `lat`/`lng` keys.
2. `test_reject_solar_fridge_offline_grid()`: Verifies rejection when `solar_fridge` is requested with `grid_status == "offline"`.
3. `test_reject_drone_overcapacity()`: Verifies rejection when drone quantity exceeds 100 units.
4. `test_reject_eta_violation()`: Verifies rejection when travel duration exceeds `time_remaining_minutes`.

### 2.2 Schema & Gateway Contract Tests (`backend-node/tests/test_gateway.test.js`)
1. `test_start_simulation_valid()`: Verifies initial state creation and UUID generation.
2. `test_run_round_schema_validation()`: Verifies Zod rejection of invalid session IDs.
3. `test_python_response_validation()`: Verifies Zod validation of Python state responses.

### 2.3 Agent Benchmark & Replay Evaluation (`backend-python/tests/test_agent_benchmarks.py`)
Uses deterministic replay logs to evaluate LLM performance:
- **Metrics**: Consensus Convergence Speed, CoT Reasoning Depth, Physics Rejection Recovery Rate.

---

## 3. Automated Replay Engine

Every simulation session writes a complete audit log to Postgres/Redis. The Replay Engine allows developers to re-execute exact agent prompts against modified physics rules or alternative LLM providers to benchmark performance improvements.

```bash
# Example Replay Command
python -m tests.replay_engine --session-id "c9a4b2e8-5f12-4d3a-9e11-8f2a4b6c8d10" --provider groq
```

---

## 4. Document Cross-References
- See [PHYSICS_ENGINE.md](PHYSICS_ENGINE.md) for physics validation rules.
- See [DEPLOYMENT.md](DEPLOYMENT.md) for CI/CD integration.
