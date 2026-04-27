// REQ-M1-05: colour-coded by agent
// REQ-M1-06: renders public_message — NEVER raw JSON
// REQ-M1-07: internal_reasoning in collapsible debug panel (per-message toggle)
// REQ-M1-08: messages render progressively as they arrive via Firebase

import { useState, useEffect, useRef } from "react";

const AGENT_CONFIG = {
  hospital: {
    label: "Hospital Coordinator",
    icon: "🏥",
    color: "text-red-400",
    border: "border-red-800",
    bg: "bg-red-950/40",
  },
  transport: {
    label: "Transport Agent",
    icon: "🚚",
    color: "text-amber-400",
    border: "border-amber-800",
    bg: "bg-amber-950/40",
  },
  ngo: {
    label: "NGO Response",
    icon: "🚁",
    color: "text-green-400",
    border: "border-green-800",
    bg: "bg-green-950/40",
  },
  swarm_director: {
    label: "Swarm Director",
    icon: "👁",
    color: "text-blue-300",
    border: "border-blue-700",
    bg: "bg-blue-950/50",
  },
};

const PRIORITY_COLORS = {
  critical: "bg-red-700 text-white",
  high:     "bg-orange-700 text-white",
  medium:   "bg-yellow-700 text-black",
  low:      "bg-gray-700 text-gray-300",
};

function AgentMessage({ msg, index }) {
  const [showDebug, setShowDebug] = useState(false);
  const cfg = AGENT_CONFIG[msg.agent] || {
    label: msg.agent,
    icon: "⚙",
    color: "text-gray-400",
    border: "border-gray-700",
    bg: "bg-gray-900/40",
  };

  return (
    <div
      className={`p-3 rounded border-l-2 ${cfg.border} ${cfg.bg} animate-fadeIn`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span>{cfg.icon}</span>
          <span className={`text-xs font-bold uppercase ${cfg.color}`}>
            {cfg.label}
          </span>
          <span className="text-xs text-gray-600">R{msg.round}</span>
        </div>
        {msg.priority && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-bold ${
              PRIORITY_COLORS[msg.priority] || PRIORITY_COLORS.low
            }`}
          >
            {msg.priority.toUpperCase()}
          </span>
        )}
      </div>

      {/* Human-readable message — never raw JSON (REQ-M1-06) */}
      <p className="text-sm text-gray-200 leading-relaxed">
        {msg.public_message}
      </p>

      {/* REQ-M1-07: debug toggle for internal_reasoning */}
      {msg.internal_reasoning && (
        <>
          <button
            onClick={() => setShowDebug((p) => !p)}
            className="mt-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            {showDebug ? "▲ Hide reasoning" : "▼ AI reasoning"}
          </button>
          {showDebug && (
            <div className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-400 font-mono border border-gray-800 whitespace-pre-wrap break-all overflow-hidden">
              {msg.internal_reasoning.includes("API failure") 
                ? "Connection to upstream cognitive models failed. Re-routing through local fallback heuristics..." 
                : msg.internal_reasoning}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AgentChat({ messages = [] }) {
  const bottomRef = useRef(null);

  // Auto-scroll when new message arrives (REQ-M1-08)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div id="agent-chat" className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-800">
        <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">
          Swarm Intel Feed
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-gray-600 text-center mt-10">
            Awaiting swarm activation...
          </p>
        )}
        {messages.map((msg, i) => (
          <AgentMessage
            key={`${msg.agent}-${msg.round}-${i}`}
            msg={msg}
            index={i}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
