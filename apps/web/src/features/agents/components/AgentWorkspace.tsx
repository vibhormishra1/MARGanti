"use client";

import React, { useState } from "react";
import { useAgentSession, useStartAgentSession } from "../api/agent-session.api";
import { AgentStatusDashboard } from "./AgentStatusDashboard";
import { MultiAgentChat } from "./MultiAgentChat";
import { ConsensusViewer } from "./ConsensusViewer";
import { Button } from "@/components/ui/button";
import { httpClient } from "@/lib/http-client";
import { useQueryClient } from "@tanstack/react-query";
import { agentSessionKeys } from "../api/agent-session.api";

interface AgentWorkspaceProps {
  incidentId: string;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ incidentId }) => {
  const { data: session, isLoading } = useAgentSession(incidentId);
  const startMutation = useStartAgentSession(incidentId);
  const queryClient = useQueryClient();
  const [isStepping, setIsStepping] = useState(false);
  const [isGeneratingConsensus, setIsGeneratingConsensus] = useState(false);

  const handleStep = async () => {
    setIsStepping(true);
    try {
      await httpClient.post(`/api/v1/incidents/${incidentId}/agent-sessions/step`);
      // Since it's a mock, in reality we'd use WebSockets for streaming chat.
      // Here we just invalidate to refresh the mock state.
      queryClient.invalidateQueries({ queryKey: agentSessionKeys.byIncident(incidentId) });
    } finally {
      setIsStepping(false);
    }
  };

  const handleConsensus = async () => {
    setIsGeneratingConsensus(true);
    try {
      await httpClient.post(`/api/v1/incidents/${incidentId}/agent-sessions/consensus`);
      queryClient.invalidateQueries({ queryKey: agentSessionKeys.byIncident(incidentId) });
    } finally {
      setIsGeneratingConsensus(false);
    }
  };

  if (isLoading) return <div className="text-slate-500 animate-pulse">Loading Workspace...</div>;

  if (!session) {
    return (
      <div className="bg-slate-900 border border-indigo-900/50 rounded-xl p-8 text-center shadow-xl">
        <h2 className="text-2xl font-black text-white mb-2">Multi-Agent Workspace</h2>
        <p className="text-slate-400 mb-6 max-w-lg mx-auto">
          Summon the specialist agent task force to collaboratively analyze this incident and draft a coordinated execution plan.
        </p>
        <Button 
          onClick={() => startMutation.mutate()} 
          disabled={startMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-6 rounded-lg text-lg"
        >
          {startMutation.isPending ? "Initializing Engine..." : "Boot Orchestrator"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🌐</span> Multi-Agent Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-1">Shared Context Active • ID: {session.id}</p>
        </div>
        <div className="flex gap-2">
          {session.status === "PLANNING" && (
            <>
              <Button onClick={handleStep} disabled={isStepping} className="bg-indigo-900 hover:bg-indigo-800 text-indigo-100">
                {isStepping ? "Thinking..." : "Step Conversation"}
              </Button>
              <Button onClick={handleConsensus} disabled={isGeneratingConsensus} className="bg-emerald-700 hover:bg-emerald-600 text-white">
                {isGeneratingConsensus ? "Synthesizing..." : "Force Consensus"}
              </Button>
            </>
          )}
        </div>
      </div>

      <AgentStatusDashboard activeAgents={session.activeAgents} status={session.status} />
      
      <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-4">
        <MultiAgentChat messages={session.conversationHistory} />
      </div>

      {session.consensus && (
        <ConsensusViewer incidentId={incidentId} consensus={session.consensus} status={session.status} />
      )}
    </div>
  );
};
