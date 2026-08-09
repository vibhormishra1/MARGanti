"use client";

import React, { useState } from "react";
import { useMission, usePublishMission, useAddDependency } from "../api/mission.api";
import { TaskBoard } from "./TaskBoard";
import { MissionTimeline } from "./MissionTimeline";
import { TaskCreation } from "./TaskCreation";
import { Button } from "@/components/ui/button";

interface MissionDetailsProps {
  missionId: string;
}

export function MissionDetails({ missionId }: MissionDetailsProps) {
  const { data: mission, isLoading, error } = useMission(missionId);
  const publishMutation = usePublishMission();
  const addDependencyMutation = useAddDependency(missionId);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddDep, setShowAddDep] = useState(false);
  const [depTaskSource, setDepTaskSource] = useState("");
  const [depTaskTarget, setDepTaskTarget] = useState("");

  if (isLoading) return <div className="text-white p-6">Loading mission...</div>;
  if (error || !mission) return <div className="text-red-400 p-6">Error loading mission detail.</div>;

  const handlePublish = () => {
    publishMutation.mutate(mission.id);
  };

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (depTaskSource && depTaskTarget && depTaskSource !== depTaskTarget) {
      addDependencyMutation.mutate({
        taskId: depTaskSource,
        dependsOnTaskId: depTaskTarget,
        isHardDependency: true,
      }, {
        onSuccess: () => {
          setDepTaskSource("");
          setDepTaskTarget("");
          setShowAddDep(false);
        }
      });
    }
  };

  return (
    <div className="space-y-6 text-white p-6 bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
              {mission.title}
            </h2>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              mission.status === "DRAFT" ? "bg-amber-950/40 text-amber-400 border-amber-900" :
              mission.status === "ACTIVE" ? "bg-sky-950/40 text-sky-400 border-sky-900" :
              mission.status === "COMPLETED" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900" :
              "bg-red-950/40 text-red-400 border-red-900"
            }`}>
              {mission.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">ID: {mission.id} | Incident: {mission.incidentId}</p>
        </div>

        <div className="flex gap-2">
          {mission.status === "DRAFT" && (
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending || mission.tasks.length === 0}
              className="bg-sky-600 hover:bg-sky-500"
            >
              Publish Mission
            </Button>
          )}
          <Button onClick={() => setShowAddTask(!showAddTask)} className="bg-slate-800 hover:bg-slate-700">
            {showAddTask ? "Cancel Task" : "Add Task"}
          </Button>
          <Button onClick={() => setShowAddDep(!showAddDep)} className="bg-slate-800 hover:bg-slate-700">
            {showAddDep ? "Cancel Link" : "Link Dependencies"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {showAddTask && (
            <TaskCreation missionId={mission.id} onSuccess={() => setShowAddTask(false)} />
          )}

          {showAddDep && (
            <form onSubmit={handleAddDependency} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h5 className="text-sm font-bold text-sky-400">Establish Task Relationship</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1">Target Task</label>
                  <select
                    value={depTaskSource}
                    onChange={(e) => setDepTaskSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                  >
                    <option value="">-- Select --</option>
                    {mission.tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1">Depends On</label>
                  <select
                    value={depTaskTarget}
                    onChange={(e) => setDepTaskTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                  >
                    <option value="">-- Select --</option>
                    {mission.tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={addDependencyMutation.isPending} className="w-full text-xs h-8 bg-sky-600">
                {addDependencyMutation.isPending ? "Linking..." : "Establish Dependency"}
              </Button>
            </form>
          )}

          <TaskBoard mission={mission} />
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-sm tracking-wider uppercase text-slate-400">Objective</h4>
            <p className="text-sm text-slate-200">{mission.objective.description}</p>
            <h5 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pt-2">Success Criteria</h5>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {mission.objective.successCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <MissionTimeline mission={mission} />
        </div>
      </div>
    </div>
  );
}
