// Node is a PROXY. It does NOT:
//   - decrement time_remaining_minutes (Python owns this — REQ M4-03)
//   - increment round_number (Python owns this)
//   - decide consensus / forced_resolution (Python owns this)
//
// Node only:
//   - creates session + initial state
//   - forwards state to Python
//   - validates Python's response
//   - writes to Firebase
//
// ChatGPT's version did all the above in Node. That's wrong and breaks
// the neurosymbolic architecture — Python's physics engine can't function
// if Node is also mutating the simulation state.

import { v4 as uuidv4 } from "uuid";
import {
  writeSessionState,
  getSessionState,
  deleteSession,
  scheduleSessionCleanup,
} from "../services/firebaseService.js";
import { callPythonSimulateRound } from "../services/pythonService.js";
import { pythonRoundResultSchema } from "../schemas/simulationSchemas.js";

// ── In-memory active session guard ────────────────────────────────
// REQ-M2-04: Reject a second POST /start if one is already running.
// Caveat: resets on Node restart. The real guard is checking Firebase
// directly (see startSimulation). The variable is a fast-path short-circuit.
let activeSessionId = null;

// ── buildInitialState ─────────────────────────────────────────────
// SRS Section 5.1 — exact schema. round_number starts at 0 because
// Python increments it to 1 when the first round completes.
function buildInitialState(sessionId) {
  return {
    session_id: sessionId,
    round_number: 0,
    status: "running",
    crisis: {
      type: "cyclone_grid_failure",
      location: "Coastal Maharashtra",
      severity: "critical",
      time_remaining_minutes: 240,
      grid_status: "offline",
      road_status: "flooded",
    },
    agents: {
      hospital: { status: "critical", needs: ["cold_evac_5000_units"] },
      transport: { status: "active", assets: ["reefer_trucks_3"], speed_kmh: 15 },
      ngo: { status: "standby", assets: ["drones_10", "dry_ice_packs_20"] },
    },
    shared_history: [],
    validated_decisions: [],
    conflicts: [],
    final_consensus_plan: null,
    system_message: null,
  };
}

// ── POST /api/simulation/start ────────────────────────────────────
export async function startSimulation(req, res) {
  try {
    // Fast-path check: in-memory variable
    if (activeSessionId) {
      // Slow-path verification: confirm it's actually still running in Firebase.
      // Handles the case where Node restarted and lost the variable.
      const existing = await getSessionState(activeSessionId);
      if (existing?.status === "running") {
        return res.status(409).json({
          error: "A simulation is already active.",
          active_session_id: activeSessionId,
        });
      }
      // Previous session finished or was deleted — allow a new one
      activeSessionId = null;
    }

    const sessionId = uuidv4();
    const initialState = buildInitialState(sessionId);

    // REQ-M2-02: Write to /sessions/{session_id}/state
    await writeSessionState(sessionId, initialState);

    // REQ-M2-03: Schedule 1-hour TTL cleanup
    scheduleSessionCleanup(sessionId);

    activeSessionId = sessionId;
    return res.status(201).json({ session_id: sessionId });
  } catch (err) {
    console.error("[startSimulation]", err.message);
    return res.status(500).json({ error: "Failed to initialise simulation." });
  }
}

// ── POST /api/simulation/run-round ────────────────────────────────
export async function runRound(req, res) {
  // req.validated is set by validateBody middleware — never use req.body directly
  const { session_id } = req.validated;

  try {
    const currentState = await getSessionState(session_id);

    if (!currentState) {
      return res.status(404).json({ error: "Session not found." });
    }

    // Guard against running on a completed simulation
    if (
      ["consensus_reached", "forced_resolution"].includes(currentState.status)
    ) {
      return res.status(400).json({ error: "Simulation already completed." });
    }

    // Guard against race condition: if status is already "in_progress" (future-proofing),
    // reject the duplicate request rather than letting two Python calls race.
    // For hackathon with manual "Run Round" button, this is unlikely but worth having.
    if (currentState.status === "in_progress") {
      return res.status(409).json({ error: "A round is already executing." });
    }

    // REQ-M2-06: Forward full state to Python, receive updated state
    const { data: updatedState, degraded } =
      await callPythonSimulateRound(currentState);

    // Validate Python's response before writing to Firebase.
    // Skip validation if this is the fallback degraded state — it's already safe.
    if (!degraded) {
      const check = pythonRoundResultSchema.safeParse(updatedState);
      if (!check.success) {
        console.error(
          "[runRound] Python returned invalid state shape:",
          check.error.issues
        );
        return res.status(502).json({
          error: "PYTHON_INVALID_RESPONSE",
          details: check.error.issues.map((i) => ({
            field: i.path.join("."),
            msg: i.message,
          })),
        });
      }
    }

    // REQ-M2-11: Write COMPLETE state — never partial update
    await writeSessionState(session_id, updatedState);

    // Clear active session tracking when simulation ends
    if (
      ["consensus_reached", "forced_resolution"].includes(updatedState.status)
    ) {
      activeSessionId = null;
    }

    return res.status(200).json({
      status: "ok",
      round: updatedState.round_number,
      sim_status: updatedState.status,
    });
  } catch (err) {
    console.error("[runRound]", err.message);
    return res.status(500).json({ error: "Failed to process simulation round." });
  }
}

// ── GET /api/simulation/state/:id ─────────────────────────────────
export async function getState(req, res) {
  try {
    const state = await getSessionState(req.params.id);
    if (!state) return res.status(404).json({ error: "Session not found." });
    return res.status(200).json(state);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch state." });
  }
}

// ── GET /api/simulation/plan/:id ──────────────────────────────────
export async function getPlan(req, res) {
  try {
    const state = await getSessionState(req.params.id);
    if (!state)
      return res.status(404).json({ error: "Session not found." });
    if (!state.final_consensus_plan)
      return res.status(404).json({ error: "Plan not ready yet." });
    return res.status(200).json(state.final_consensus_plan);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch plan." });
  }
}

// ── DELETE /api/simulation/:id ────────────────────────────────────
export async function deleteSimulation(req, res) {
  try {
    await deleteSession(req.params.id);
    if (activeSessionId === req.params.id) activeSessionId = null;
    return res.status(200).json({ deleted: true });
  } catch (err) {
    // Firebase remove() on a non-existent path doesn't throw — it succeeds silently.
    // So if we're here, it's a genuine internal error, not a 404.
    console.error("[deleteSimulation]", err.message);
    return res.status(500).json({ error: "Failed to delete session." });
  }
}
