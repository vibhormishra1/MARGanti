import React from "react";
import { AgentMessage } from "@marg/domain";

interface MultiAgentChatProps {
  messages: AgentMessage[];
}

export const MultiAgentChat: React.FC<MultiAgentChatProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
        <p className="text-sm text-slate-500">Waiting for agents to begin reasoning...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex flex-col ${msg.role === 'COORDINATOR' ? 'items-center' : 'items-start'}`}>
          <div className={`max-w-[85%] rounded-lg p-4 ${
            msg.role === 'COORDINATOR' ? 'bg-indigo-900/30 border border-indigo-800/50 w-full text-center' : 
            msg.role === 'INCIDENT_COMMANDER' ? 'bg-red-900/20 border border-red-900/50' : 
            'bg-slate-800 border border-slate-700'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                msg.role === 'COORDINATOR' ? 'bg-indigo-600 text-white' :
                msg.role === 'INCIDENT_COMMANDER' ? 'bg-red-600 text-white' :
                'bg-slate-700 text-slate-300'
              }`}>
                {msg.role.replace("_", " ")}
              </span>
              <span className="text-[10px] text-slate-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              {msg.confidenceScore && (
                <span className="text-[10px] text-emerald-400 font-bold ml-auto">
                  {msg.confidenceScore}% CONF
                </span>
              )}
            </div>
            
            <p className="text-sm text-slate-200 leading-relaxed mb-3">
              {msg.content}
            </p>
            
            {msg.reasoningTrace && msg.reasoningTrace.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Reasoning Trace</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {msg.reasoningTrace.map((trace, i) => (
                    <li key={i} className="text-xs text-slate-400 font-mono">{trace}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
