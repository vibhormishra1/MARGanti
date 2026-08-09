import React from "react";
import { SpecialistRole } from "@marg/domain";

interface AgentStatusDashboardProps {
  activeAgents: SpecialistRole[];
  status: string;
}

export const AgentStatusDashboard: React.FC<AgentStatusDashboardProps> = ({ activeAgents, status }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Active Agents</h3>
      <div className="flex flex-wrap gap-3">
        {activeAgents.map((role) => (
          <div key={role} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-full px-3 py-1.5">
            <div className={`w-2 h-2 rounded-full ${status === 'PLANNING' || status === 'DEBATING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-xs font-bold text-slate-300">{role.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
