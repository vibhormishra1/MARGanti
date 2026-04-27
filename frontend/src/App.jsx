// Dropped Context + useReducer — plain useState is fine for one session.
// Firebase subscription lives here in a useEffect, same as Gemini/GPT's approach.
// Cleaner, easier to debug during hackathon.

import { useState, useEffect } from "react";
import { subscribeToSession } from "./services/firebase";
import ControlPanel from "./components/ControlPanel";
import CountdownTimer from "./components/CountdownTimer";
import AgentChat from "./components/AgentChat";
import MapView from "./components/MapView";
import DecisionPanel from "./components/DecisionPanel";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [simState, setSimState] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setSimState(null);
      return;
    }
    // subscribeToSession returns the onValue unsubscribe function directly.
    // React cleanup calls it when sessionId changes or component unmounts.
    const unsubscribe = subscribeToSession(sessionId, (freshState) => {
      setSimState(freshState);
    });
    return () => unsubscribe();
  }, [sessionId]);

  const crisis    = simState?.crisis;
  const history   = simState?.shared_history ?? [];
  const finalPlan = simState?.final_consensus_plan ?? null;
  const simStatus = simState?.status ?? "idle";

  return (
    <div className="h-screen flex flex-col bg-marg-navy overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-marg-blue shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-marg-blue font-bold text-xl tracking-widest">
            M.A.R.G.
          </span>
          <span className="text-gray-500 text-sm hidden sm:inline">
            Multi-Agent Routing and Guidance
          </span>
        </div>
        {crisis && (
          <CountdownTimer timeRemaining={crisis.time_remaining_minutes} />
        )}
      </header>

      {/* Body — stacks vertically on mobile, side-by-side on desktop */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left panel — full width on mobile, 384px on desktop */}
        <aside className="w-full md:w-96 flex flex-col border-b md:border-b-0 md:border-r border-marg-blue shrink-0 overflow-hidden max-h-[50vh] md:max-h-full">
          <ControlPanel
            sessionId={sessionId}
            setSessionId={setSessionId}
            simStatus={simStatus}
          />
          <AgentChat messages={history} />
        </aside>

        {/* Right panel — fills rest */}
        <main className="flex flex-col flex-1 overflow-hidden min-h-[50vh] md:min-h-full">
          {/* Pass the history and the status so the map can react in real-time */}
          <MapView finalPlan={finalPlan} history={history} simStatus={simStatus} />
          <DecisionPanel plan={finalPlan} simStatus={simStatus} />
        </main>
      </div>
    </div>
  );
}
