import React from "react";
import { Mission, Task } from "../types";

interface MissionTimelineProps {
  mission: Mission;
}

export function MissionTimeline({ mission }: MissionTimelineProps) {
  // Simple topological sorting for the DAG
  const getSortedTasks = (): Task[] => {
    const visited = new Set<string>();
    const sorted: Task[] = [];

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      // Visit dependencies first
      const deps = mission.taskDependencies[taskId] || [];
      deps.forEach((dep) => {
        visit(dep.dependsOnTaskId);
      });

      const task = mission.tasks.find((t) => t.id === taskId);
      if (task) sorted.push(task);
    };

    mission.tasks.forEach((t) => visit(t.id));
    return sorted;
  };

  const sortedTasks = getSortedTasks();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-white">
      <h5 className="font-bold text-lg text-sky-400 mb-6 flex items-center gap-2">
        <span>⏱️</span> Mission Execution Path (Topologically Sorted DAG)
      </h5>

      <div className="relative border-l border-slate-800 ml-4 space-y-6">
        {sortedTasks.map((task, index) => {
          const deps = mission.taskDependencies[task.id] || [];
          return (
            <div key={task.id} className="relative pl-6">
              {/* Bullet node indicator */}
              <div className={`absolute -left-2 top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 ${
                task.status === "COMPLETED" ? "bg-emerald-500 shadow-emerald-500/50 shadow" :
                task.status === "IN_PROGRESS" ? "bg-sky-500 animate-pulse shadow-sky-500/50 shadow" :
                task.status === "BLOCKED" ? "bg-red-500 shadow-red-500/50 shadow" :
                "bg-slate-700"
              }`} />

              <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">Step {index + 1}</span>
                    <h6 className="font-semibold text-sm">{task.title}</h6>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    task.status === "COMPLETED" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                    task.status === "IN_PROGRESS" ? "bg-sky-950 text-sky-400 border border-sky-900" :
                    task.status === "BLOCKED" ? "bg-red-950 text-red-400 border border-red-900" :
                    "bg-slate-850 text-slate-400 border border-slate-800"
                  }`}>
                    {task.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{task.description}</p>

                {deps.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-900 text-[11px] text-slate-500">
                    <span>Prerequisites:</span>
                    {deps.map((d) => (
                      <span key={d.dependsOnTaskId} className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-400">
                        {d.dependsOnTaskId} {d.isHardDependency ? "⚠️" : "ℹ️"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
