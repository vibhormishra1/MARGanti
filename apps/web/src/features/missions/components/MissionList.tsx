import React from "react";
import { useMissions } from "../api/mission.api";
import { Mission } from "../types";

interface MissionListProps {
  incidentId?: string;
  onSelectMission: (id: string) => void;
}

export function MissionList({ incidentId, onSelectMission }: MissionListProps) {
  const { data: missions, isLoading, error } = useMissions(incidentId);

  if (isLoading) return <div className="text-white">Loading missions list...</div>;
  if (error) return <div className="text-red-400">Error loading missions.</div>;

  const calculateProgress = (mission: Mission): number => {
    if (mission.tasks.length === 0) return 0;
    const completedTasks = mission.tasks.filter((t) => t.status === "COMPLETED").length;
    return Math.round((completedTasks / mission.tasks.length) * 100);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-sky-400 mb-2">Active Missions</h3>

      {(!missions || missions.length === 0) && (
        <div className="text-sm text-slate-500 bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          No missions established for this operational sector.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {missions?.map((mission) => {
          const progress = calculateProgress(mission);
          return (
            <div
              key={mission.id}
              onClick={() => onSelectMission(mission.id)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500 cursor-pointer rounded-xl p-4 transition shadow-md flex justify-between items-center text-white"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">{mission.title}</h4>
                <p className="text-xs text-slate-400 max-w-md line-clamp-1">{mission.objective.description}</p>
                <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                  <span>Incident: {mission.incidentId}</span>
                  <span>•</span>
                  <span>Tasks: {mission.tasks.length}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  mission.status === "DRAFT" ? "bg-amber-950 text-amber-400 border border-amber-900" :
                  mission.status === "ACTIVE" ? "bg-sky-950 text-sky-400 border border-sky-900" :
                  mission.status === "COMPLETED" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                  "bg-red-950 text-red-400 border border-red-900"
                }`}>
                  {mission.status}
                </span>

                <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-500 h-1.5" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
