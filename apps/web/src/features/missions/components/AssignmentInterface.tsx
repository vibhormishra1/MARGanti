import React, { useState } from "react";
import { useAssignTask } from "../api/mission.api";
import { useResponders } from "../../workforce/api/workforce.api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";

interface AssignmentInterfaceProps {
  missionId: string;
  taskId: string;
  currentResponderId?: string;
  currentTeamId?: string;
  onSuccess?: () => void;
}

export function AssignmentInterface({
  missionId,
  taskId,
  currentResponderId,
  currentTeamId,
  onSuccess,
}: AssignmentInterfaceProps) {
  const { user } = useAuth();
  const assignMutation = useAssignTask(missionId);
  const { data: responders, isLoading } = useResponders(user?.organization_id || "");

  const [selectedResponder, setSelectedResponder] = useState(currentResponderId || "");
  const [selectedTeam, setSelectedTeam] = useState(currentTeamId || "");
  const [assignType, setAssignType] = useState<"responder" | "team">("responder");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignMutation.mutate(
      {
        taskId,
        responderId: assignType === "responder" ? selectedResponder : undefined,
        teamId: assignType === "team" ? selectedTeam : undefined,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-lg text-white">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-sky-400">Assign Task</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAssignType("responder")}
            className={`text-xs px-2 py-1 rounded ${assignType === "responder" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            Responder
          </button>
          <button
            type="button"
            onClick={() => setAssignType("team")}
            className={`text-xs px-2 py-1 rounded ${assignType === "team" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            Team
          </button>
        </div>
      </div>

      {assignType === "responder" ? (
        <div>
          <label className="block text-xs text-slate-400 mb-1">Select Responder</label>
          {isLoading ? (
            <div className="text-sm text-slate-500">Loading responders...</div>
          ) : (
            <select
              value={selectedResponder}
              onChange={(e) => setSelectedResponder(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white"
            >
              <option value="">-- Unassigned --</option>
              {responders?.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name || r.id}
                </option>
              ))}
              {/* Fallback mock option if empty */}
              {(!responders || responders.length === 0) && (
                <>
                  <option value="resp-1">John Doe (Alpha Team)</option>
                  <option value="resp-2">Jane Smith (Medical Swarm)</option>
                  <option value="resp-3">Alex Patel (Logistics Pilot)</option>
                </>
              )}
            </select>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-xs text-slate-400 mb-1">Assign Team ID</label>
          <input
            type="text"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            placeholder="Enter Team ID (e.g., team-alpha)..."
            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white placeholder-slate-600"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={assignMutation.isPending}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white text-sm py-1.5"
      >
        {assignMutation.isPending ? "Assigning..." : "Apply Assignment"}
      </Button>
    </form>
  );
}
