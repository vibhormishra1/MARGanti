// REQ-M1-01: exactly two buttons, no free text input
// REQ-M1-02: hardcoded scenario payload
// REQ-M1-04: reset clears state properly — no window.location.reload() (GPT's lazy fix)

import { useState } from "react";
import { startSimulation, runRound, resetSimulation } from "../api/simApi";

export default function ControlPanel({ sessionId, setSessionId, simStatus }) {
  const [loading, setLoading]           = useState(false);
  const [roundLoading, setRoundLoading] = useState(false);
  const [error, setError]               = useState(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const { session_id } = await startSimulation();
      setSessionId(session_id);
      // Firebase subscription in App.jsx kicks in automatically when sessionId changes
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunRound() {
    setRoundLoading(true);
    setError(null);
    try {
      await runRound(sessionId);
      // State update comes via Firebase — nothing to do here
    } catch (e) {
      setError(e.message);
    } finally {
      setRoundLoading(false);
    }
  }

  async function handleReset() {
    if (sessionId) {
      try {
        await resetSimulation(sessionId);
      } catch (_) {
        // Even if server call fails, reset local state — demo must not get stuck
      }
    }
    setSessionId(null);
  }

  const isIdle    = !sessionId;
  const isRunning = simStatus === "running";

  return (
    <div id="control-panel" className="p-4 border-b border-marg-blue">
      <p className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-3">
        Swarm Command
      </p>

      {isIdle && (
        <button
          id="btn-trigger-crisis"
          onClick={handleStart}
          disabled={loading}
          className="w-full py-3 rounded bg-marg-red hover:bg-red-800
                     text-white font-bold text-sm tracking-wide
                     transition-colors disabled:opacity-50"
        >
          {loading ? "Initialising..." : "⚡ Cyclone Grid Failure — Trigger"}
        </button>
      )}

      {isRunning && (
        <button
          id="btn-run-round"
          onClick={handleRunRound}
          disabled={roundLoading}
          className="w-full py-2 rounded bg-marg-blue hover:bg-blue-800
                     text-white font-bold text-sm transition-colors disabled:opacity-50"
        >
          {roundLoading ? "Agents Thinking..." : "▶ Run Next Agent Round"}
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400 bg-red-900/30 p-2 rounded">
          ⚠ {error}
        </p>
      )}

      {!isIdle && (
        <button
          id="btn-reset"
          onClick={handleReset}
          className="w-full mt-3 py-2 rounded border border-gray-700
                     text-gray-500 text-xs hover:text-gray-300 transition-colors"
        >
          ↺ Reset Simulation
        </button>
      )}
    </div>
  );
}
