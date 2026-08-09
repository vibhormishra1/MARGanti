"use client";

import React from "react";
import { useIncident } from "../api/incident.api";
import { AIAnalysisPanel } from "./analysis/AIAnalysisPanel";
import { AgentWorkspace } from "../../agents/components/AgentWorkspace";

interface IncidentDetailsProps {
  incidentId: string;
}

export const IncidentDetails: React.FC<IncidentDetailsProps> = ({ incidentId }) => {
  const { data: incident, isLoading } = useIncident(incidentId);

  if (isLoading) {
    return <div className="p-6 text-slate-400">Loading incident details...</div>;
  }

  if (!incident) {
    return <div className="p-6 text-red-400">Incident not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Basic Incident Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-black text-white">{incident.title}</h2>
            <p className="text-sm text-slate-500 mt-1">
              Reported on {new Date(incident.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            incident.priority === 'CRITICAL' ? 'bg-red-900 text-red-200' :
            incident.priority === 'HIGH' ? 'bg-orange-900 text-orange-200' :
            incident.priority === 'MEDIUM' ? 'bg-amber-900 text-amber-200' :
            'bg-emerald-900 text-emerald-200'
          }`}>
            {incident.priority}
          </span>
        </div>
        <p className="text-slate-300 mb-4">{incident.description}</p>
        <div className="text-sm text-slate-500">
          <strong>Status:</strong> {incident.status}
        </div>
      </div>

      {/* AI Advisory Panel */}
      <AIAnalysisPanel incidentId={incidentId} />

      {/* Multi-Agent Orchestration Engine */}
      <div className="mt-8">
        <AgentWorkspace incidentId={incidentId} />
      </div>
    </div>
  );
};
