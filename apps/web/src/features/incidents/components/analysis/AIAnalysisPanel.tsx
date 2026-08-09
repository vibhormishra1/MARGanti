"use client";

import React, { useState } from "react";
import { useIncidentAnalysis, useRequestAnalysis } from "../../api/ai-analysis.api";
import { HumanApprovalUI } from "./HumanApprovalUI";
import { Button } from "@/components/ui/button";

interface AIAnalysisPanelProps {
  incidentId: string;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ incidentId }) => {
  const { data: analysis, isLoading, isError } = useIncidentAnalysis(incidentId);
  const requestMutation = useRequestAnalysis(incidentId);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-slate-900/50 p-6 rounded-xl border border-slate-800">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-slate-800 rounded w-full mb-2"></div>
        <div className="h-10 bg-slate-800 rounded w-5/6"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
        <span className="text-4xl mb-3">🤖</span>
        <h3 className="text-lg font-bold text-slate-300 mb-2">AI Incident Analysis</h3>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Generate a comprehensive AI advisory report including risk assessment, impact estimation, and recommended actions.
        </p>
        <Button
          onClick={() => requestMutation.mutate()}
          disabled={requestMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
        >
          {requestMutation.isPending ? "Generating Analysis..." : "Request AI Analysis"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 p-6 rounded-xl border border-indigo-900/50 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span>🧠</span> AI Advisory Report
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-300 rounded-md">
            Confidence: <span className="text-indigo-400">{analysis.confidenceScore}%</span>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-md ${
            analysis.status === "APPROVED" ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800" :
            analysis.status === "REJECTED" ? "bg-red-900/50 text-red-400 border border-red-800" :
            "bg-amber-900/50 text-amber-400 border border-amber-800"
          }`}>
            {analysis.status.replace("_", " ")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Incident Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h4>
          <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h5 className="text-xs font-bold text-slate-500 mb-1">AI Reasoning</h5>
            <p className="text-xs text-slate-400 italic">{analysis.explanation}</p>
          </div>
        </div>

        {/* Risk Assessment Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Risk Assessment</h4>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              analysis.riskAssessment.level === 'CRITICAL' ? 'bg-red-600 text-white' :
              analysis.riskAssessment.level === 'HIGH' ? 'bg-orange-500 text-white' :
              analysis.riskAssessment.level === 'MEDIUM' ? 'bg-amber-500 text-white' :
              'bg-emerald-500 text-white'
            }`}>
              {analysis.riskAssessment.level}
            </span>
          </div>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {analysis.riskAssessment.factors.map((factor: string, idx: number) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing Information & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            ⚠️ Missing Information
          </h4>
          <ul className="list-disc list-inside text-sm text-amber-200/70 space-y-1">
            {analysis.missingInformation.length > 0 
              ? analysis.missingInformation.map((info: string, idx: number) => <li key={idx}>{info}</li>)
              : <li>No critical missing information detected.</li>
            }
          </ul>
        </div>

        <div className="bg-slate-900 border border-indigo-900/30 rounded-lg p-4">
          <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3">Recommended Actions</h4>
          <div className="space-y-3">
            {analysis.recommendedActions.map((action: any) => (
              <div key={action.id} className="flex flex-col bg-slate-950 p-3 rounded-md border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-300">{action.type}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-1 rounded">{action.priority}</span>
                </div>
                <p className="text-sm text-slate-400">{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {analysis.status === "PENDING_APPROVAL" && (
        <HumanApprovalUI incidentId={incidentId} />
      )}
    </div>
  );
};
