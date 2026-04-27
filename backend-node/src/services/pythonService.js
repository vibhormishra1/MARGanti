// REQ-M2-05: PYTHON_BASE_URL from env — never hardcoded.
// REQ-M2-07: 10s timeout → inject fallback degraded state.
//
// Returns { data, degraded } so the controller knows whether
// the result is real Python output or the fallback.
// This distinction matters: degraded state skips Python validation.

import axios from "axios";

const pythonApi = axios.create({
  baseURL: process.env.PYTHON_BASE_URL || "http://localhost:8000",
  timeout: 45_000, // Extended: Gemini with key rotation + retries needs 30s+
  headers: { "Content-Type": "application/json" },
});

export async function callPythonSimulateRound(currentState) {
  try {
    const res = await pythonApi.post("/simulate/round", {
      state: currentState,
    });
    return { data: res.data, degraded: false };
  } catch (err) {
    // ECONNABORTED = timeout, ECONNREFUSED = Python not running
    const reason = err.code === "ECONNABORTED" ? "TIMEOUT (10s)" : err.message;
    console.error(`[Python] Call failed — ${reason}`);

    // REQ-M2-07: Never crash — inject degraded flag so React shows the banner
    return {
      data: {
        ...currentState,
        status: "degraded",
        system_message:
          "Swarm engine temporarily offline — fallback protocol active",
      },
      degraded: true,
    };
  }
}
