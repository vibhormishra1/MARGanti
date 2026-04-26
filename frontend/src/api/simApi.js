// Every HTTP call to Node backend lives here.
// Components never call axios directly.

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_NODE_BASE_URL,
  timeout: 15000,  // 15s — runRound waits up to 8s for Python (REQ-M2-07 allows 10s)
  headers: { "Content-Type": "application/json" },
});

/**
 * startSimulation
 * POST /api/simulation/start
 * Returns { session_id: "uuid" }
 * The scenario is HARDCODED here — user never types it (REQ-M1-02)
 */
export async function startSimulation() {
  const res = await api.post("/api/simulation/start", {
    scenario: "cyclone_grid_failure",
  });
  return res.data;
}

/**
 * runRound
 * POST /api/simulation/run-round
 * Tells Node to trigger one Python agent round.
 * State update comes via Firebase push — not this response.
 */
export async function runRound(sessionId) {
  const res = await api.post("/api/simulation/run-round", {
    session_id: sessionId,
  });
  return res.data;
}

/**
 * resetSimulation
 * DELETE /api/simulation/:id
 * Cleans up session on Node + Firebase side.
 */
export async function resetSimulation(sessionId) {
  const res = await api.delete(`/api/simulation/${sessionId}`);
  return res.data;
}
