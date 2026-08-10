import React, { useState } from "react";
import { Mission, Task, TaskStatus } from "../types";
import { useStartTask, useCompleteTask, useUpdateChecklistItem, useAddChecklistItem } from "../api/mission.api";
import { AssignmentInterface } from "./AssignmentInterface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth";

interface TaskBoardProps {
  mission: Mission;
}

export function TaskBoard({ mission }: TaskBoardProps) {
  const { user } = useAuth();
  const startTaskMutation = useStartTask(mission.id);
  const completeTaskMutation = useCompleteTask(mission.id);
  const addChecklistItemMutation = useAddChecklistItem(mission.id);
  const updateChecklistItemMutation = useUpdateChecklistItem(mission.id);

  const [activeAssignTaskId, setActiveAssignTaskId] = useState<string | null>(null);
  const [activeChecklistTaskId, setActiveChecklistTaskId] = useState<string | null>(null);
  const [checklistInput, setChecklistInput] = useState("");

  const handleStartTask = (taskId: string) => {
    startTaskMutation.mutate(taskId);
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleAddChecklistItem = (taskId: string) => {
    if (checklistInput.trim()) {
      addChecklistItemMutation.mutate({
        taskId,
        description: checklistInput.trim(),
      }, {
        onSuccess: () => {
          setChecklistInput("");
        }
      });
    }
  };

  const handleToggleChecklist = (taskId: string, itemId: string, currentStatus: boolean) => {
    updateChecklistItemMutation.mutate({
      taskId,
      itemId,
      isCompleted: !currentStatus,
      responderId: user?.user_id || "system",
    });
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return mission.tasks.filter((t) => t.status === status);
  };

  const statuses: TaskStatus[] = ["PENDING", "IN_PROGRESS", "BLOCKED", "COMPLETED"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <div key={status} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[600px] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-sm tracking-wider uppercase text-slate-400">{status}</h5>
              <span className="bg-slate-800 text-xs text-sky-400 font-bold px-2 py-0.5 rounded-full">
                {getTasksByStatus(status).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {getTasksByStatus(status).map((task) => (
                <div key={task.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition space-y-2">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      task.priority === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-900" :
                      task.priority === "HIGH" ? "bg-orange-950 text-orange-400 border border-orange-900" :
                      task.priority === "MEDIUM" ? "bg-sky-950 text-sky-400 border border-sky-900" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{task.id}</span>
                  </div>

                  <h6 className="font-semibold text-white text-sm">{task.title}</h6>
                  <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>

                  {/* Assignee display */}
                  <div className="text-[11px] text-slate-500 flex justify-between items-center">
                    <span>
                      Assignee: {task.assignedResponderId ? `👤 ${task.assignedResponderId}` : task.assignedTeamId ? `👥 ${task.assignedTeamId}` : "Unassigned"}
                    </span>
                    <button
                      onClick={() => setActiveAssignTaskId(activeAssignTaskId === task.id ? null : task.id)}
                      className="text-sky-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  {activeAssignTaskId === task.id && (
                    <div className="mt-2">
                      <AssignmentInterface
                        missionId={mission.id}
                        taskId={task.id}
                        currentResponderId={task.assignedResponderId}
                        currentTeamId={task.assignedTeamId}
                        onSuccess={() => setActiveAssignTaskId(null)}
                      />
                    </div>
                  )}

                  {/* Checklist Summary */}
                  <div className="border-t border-slate-900 pt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setActiveChecklistTaskId(activeChecklistTaskId === task.id ? null : task.id)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        Checklist ({task.checklist.filter(c => c.isCompleted).length}/{task.checklist.length})
                      </button>
                    </div>

                    {activeChecklistTaskId === task.id && (
                      <div className="space-y-2 mt-2 bg-slate-900 p-2 rounded border border-slate-800">
                        {task.checklist.map((item) => (
                          <label key={item.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              onChange={() => handleToggleChecklist(task.id, item.id, item.isCompleted)}
                              className="rounded border-slate-700 bg-slate-950 text-sky-500"
                            />
                            <span className={item.isCompleted ? "line-through text-slate-600" : ""}>
                              {item.description}
                            </span>
                          </label>
                        ))}
                        <div className="flex gap-1 mt-2">
                          <Input
                            placeholder="Add item..."
                            value={checklistInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChecklistInput(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-xs h-7 text-white"
                          />
                          <Button
                            onClick={() => handleAddChecklistItem(task.id)}
                            className="h-7 text-xs px-2"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-850">
                    {task.status === "PENDING" && (
                      <Button
                        onClick={() => handleStartTask(task.id)}
                        className="w-full text-xs h-7 bg-sky-700 hover:bg-sky-600"
                      >
                        Start
                      </Button>
                    )}
                    {task.status === "IN_PROGRESS" && (
                      <Button
                        onClick={() => handleCompleteTask(task.id)}
                        className="w-full text-xs h-7 bg-emerald-700 hover:bg-emerald-600"
                        disabled={task.checklist.some(c => !c.isCompleted)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
