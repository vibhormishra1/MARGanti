"use client";

import React, { useState } from "react";
import { ChatInterface } from "./ChatInterface";

interface CollaborationSidebarProps {
  contextId: string; // incidentId or missionId
}

export const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({ contextId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeOperators: any[] = [];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-l-xl shadow-2xl flex flex-col items-center gap-2 transition-transform z-40 border border-r-0 border-blue-500"
      >
        <span className="text-xl">💬</span>
        <span className="writing-vertical-rl font-bold tracking-widest text-sm">COLLABORATE</span>
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-80 lg:w-96 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900">
        <h2 className="font-black text-white text-lg">Team Comms</h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white p-1"
        >
          ✕
        </button>
      </div>

      {/* Presence Panel */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Active Operators</h3>
        <div className="space-y-3">
          {activeOperators.map(op => (
            <div key={op.id} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                  {op.name.charAt(0)}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${op.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-200 leading-tight">{op.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">{op.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface channelId={`incident-${contextId}-chat`} />
      </div>
    </div>
  );
};
