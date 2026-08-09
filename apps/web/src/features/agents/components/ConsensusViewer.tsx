"use client";

import React, { useState } from "react";
import { AgentConsensus } from "@marg/domain";
import { Button } from "@/components/ui/button";
import { httpClient } from "@/lib/http-client";
import { useQueryClient } from "@tanstack/react-query";
import { agentSessionKeys } from "../api/agent-session.api";

interface ConsensusViewerProps {
  incidentId: string;
  consensus: AgentConsensus;
  status: string;
}

export const ConsensusViewer: React.FC<ConsensusViewerProps> = ({ incidentId, consensus, status }) => {
  const [isApproving, setIsApproving] = useState(false);
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await httpClient.post(`/api/v1/incidents/${incidentId}/agent-sessions/approve`, { notes: "Approved by Commander" });
      queryClient.invalidateQueries({ queryKey: agentSessionKeys.byIncident(incidentId) });
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-emerald-900/50 rounded-xl p-6 shadow-2xl relative overflow-hidden mt-6">
      {/* Decorative pulse for attention */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <span>🎯</span> Final Consensus Reached
        </h3>
        <span className="text-emerald-400 font-bold bg-emerald-900/30 px-3 py-1 rounded-full text-xs border border-emerald-800">
          {consensus.overallConfidence}% CONFIDENCE
        </span>
      </div>

      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6">
        <p className="text-slate-300 text-sm leading-relaxed">{consensus.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolutions</h4>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {consensus.conflictsResolved.map((res, i) => (
              <li key={i}>{res}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Joint Action Plan</h4>
          <div className="space-y-2">
            {consensus.recommendedActions.map((action: any) => (
              <div key={action.id} className="bg-slate-800 p-2 rounded border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200">{action.type}</span>
                  <span className="text-[10px] uppercase text-emerald-400">{action.priority}</span>
                </div>
                <p className="text-xs text-slate-400">{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {status === "CONSENSUS_REACHED" && (
        <div className="border-t border-slate-800 pt-6 mt-2 flex items-center justify-end gap-4">
          <Button variant="outline" className="text-slate-300 border-slate-700 hover:bg-slate-800">
            Reject Consensus
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isApproving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8"
          >
            {isApproving ? "Approving..." : "Approve & Execute Plan"}
          </Button>
        </div>
      )}
      
      {status === "APPROVED" && (
        <div className="border-t border-emerald-900/50 pt-4 mt-2 text-center text-emerald-400 font-bold">
          ✓ Consensus Approved and Executing
        </div>
      )}
    </div>
  );
};
