import React from "react";
import { useMissions } from "../api/mission.api";

export function ProgressDashboard() {
  const { data: missions } = useMissions();

  const totalMissions = missions?.length || 0;
  const completedMissions = missions?.filter(m => m.status === "COMPLETED").length || 0;
  const activeMissions = missions?.filter(m => m.status === "ACTIVE").length || 0;

  const totalTasks = missions?.reduce((acc, m) => acc + m.tasks.length, 0) || 0;
  const completedTasks = missions?.reduce((acc, m) => acc + m.tasks.filter(t => t.status === "COMPLETED").length, 0) || 0;
  const inProgressTasks = missions?.reduce((acc, m) => acc + m.tasks.filter(t => t.status === "IN_PROGRESS").length, 0) || 0;
  const blockedTasks = missions?.reduce((acc, m) => acc + m.tasks.filter(t => t.status === "BLOCKED").length, 0) || 0;

  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Missions</span>
        <span className="text-3xl font-black text-white mt-2">{totalMissions}</span>
        <div className="text-[10px] text-slate-500 mt-1">
          {activeMissions} Active / {completedMissions} Completed
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task Completion</span>
        <span className="text-3xl font-black text-sky-400 mt-2">{taskProgress}%</span>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-sky-500 h-1.5" style={{ width: `${taskProgress}%` }} />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Pipeline</span>
        <span className="text-3xl font-black text-indigo-400 mt-2">{inProgressTasks}</span>
        <div className="text-[10px] text-slate-500 mt-1">
          Tasks currently in execution
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between border-l-red-950 border-l-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Blocked Tasks</span>
        <span className="text-3xl font-black text-red-500 mt-2">{blockedTasks}</span>
        <div className="text-[10px] text-slate-500 mt-1">
          Requires commander intervention
        </div>
      </div>
    </div>
  );
}
