"use client";

import React, { useState } from "react";
import { useApproveAnalysis, useRejectAnalysis } from "../../api/ai-analysis.api";
import { Button } from "@/components/ui/button";

interface HumanApprovalUIProps {
  incidentId: string;
}

export const HumanApprovalUI: React.FC<HumanApprovalUIProps> = ({ incidentId }) => {
  const approveMutation = useApproveAnalysis(incidentId);
  const rejectMutation = useRejectAnalysis(incidentId);
  const [notes, setNotes] = useState("");

  const handleApprove = () => {
    approveMutation.mutate({ incidentId, notes });
  };

  const handleReject = () => {
    if (!notes) {
      alert("Must provide a reason for rejecting the analysis.");
      return;
    }
    rejectMutation.mutate({ incidentId, reason: notes });
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mt-4 shadow-lg">
      <h4 className="text-lg font-bold text-white mb-2">Human Review Required</h4>
      <p className="text-sm text-slate-400 mb-4">
        Review the AI recommended actions and priority changes. You can approve them to apply them to the incident, or reject them.
      </p>
      
      <textarea
        className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 mb-4"
        placeholder="Optional notes or rejection reason..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
      
      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={approveMutation.isPending || rejectMutation.isPending}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
        >
          {approveMutation.isPending ? "Approving..." : "Approve & Apply"}
        </Button>
        <Button
          onClick={handleReject}
          disabled={approveMutation.isPending || rejectMutation.isPending}
          className="bg-red-900/80 hover:bg-red-800 text-red-100 font-semibold border border-red-700"
        >
          {rejectMutation.isPending ? "Rejecting..." : "Reject AI Advice"}
        </Button>
      </div>
    </div>
  );
};
