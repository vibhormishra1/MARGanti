// REQ-M1-13: resource, transport, ETA per segment
// REQ-M1-14: confidence_note from Swarm Director
// REQ-M1-15: non-functional approve button — purely for human-in-loop narrative

export default function DecisionPanel({ plan, simStatus }) {
  const isDone = ["consensus_reached", "forced_resolution"].includes(simStatus);
  if (!isDone || !plan) return null;

  return (
    <div
      id="decision-panel"
      className="border-t border-marg-blue bg-gray-950 p-4 animate-fadeIn"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">
          Swarm Consensus Plan
        </p>
        <span
          className={`text-xs px-2 py-0.5 rounded font-bold ${
            simStatus === "forced_resolution"
              ? "bg-amber-700 text-white"
              : "bg-green-800 text-white"
          }`}
        >
          {simStatus === "forced_resolution" ? "⚡ FORCED" : "✓ CONSENSUS"}
        </span>
      </div>

      {/* Transport steps — REQ-M1-13 */}
      <div className="space-y-2 mb-3">
        {plan.transport_sequence?.map((seg, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-gray-900 rounded px-3 py-2"
          >
            <span className="text-lg">
              {seg.method === "drone" ? "🚁" : "🚚"}
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-200">
                {seg.method.toUpperCase()}: {seg.from} → {seg.to}
              </p>
              <p className="text-xs text-gray-500">
                {seg.quantity} units · ETA: {seg.eta_minutes} min
              </p>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded ${
                seg.method === "drone"
                  ? "bg-blue-900 text-blue-300"
                  : "bg-orange-900 text-orange-300"
              }`}
            >
              {seg.eta_minutes}m
            </span>
          </div>
        ))}
      </div>

      {/* Director narrative — REQ-M1-14 */}
      {plan.confidence_note && (
        <p className="text-xs text-gray-400 italic mb-3 pl-2 border-l-2 border-blue-900">
          &ldquo;{plan.confidence_note}&rdquo;
        </p>
      )}

      {/* Non-functional approve button — REQ-M1-15 */}
      <button
        id="btn-approve"
        disabled
        className="w-full py-3 rounded border-2 border-green-700 text-green-500
                   font-bold text-sm opacity-80 cursor-not-allowed"
      >
        🧑‍✈️ Review &amp; Approve Plan (Human Override Required)
      </button>
      <p className="text-center text-xs text-gray-600 mt-1">
        AI negotiates. Humans command. No action executes without approval.
      </p>
    </div>
  );
}
