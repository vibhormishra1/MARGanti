import React, { useState } from "react";
import { useCreateTask } from "../api/mission.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskCreationProps {
  missionId: string;
  onSuccess?: () => void;
}

export function TaskCreation({ missionId, onSuccess }: TaskCreationProps) {
  const createTaskMutation = useCreateTask(missionId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(
      {
        title,
        description,
        priority,
        deadline: deadline || undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setDeadline("");
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-xl max-w-lg mx-auto">
      <h4 className="text-lg font-bold text-sky-400">Add New Task</h4>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Title</label>
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Task title..."
          className="bg-slate-950 border-slate-800 text-white placeholder-slate-500"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          placeholder="Task description..."
          className="bg-slate-950 border-slate-800 text-white placeholder-slate-500"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Deadline</label>
          <Input
            type="datetime-local"
            value={deadline}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
            className="bg-slate-950 border-slate-800 text-white"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={createTaskMutation.isPending}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold"
      >
        {createTaskMutation.isPending ? "Adding..." : "Add Task"}
      </Button>
    </form>
  );
}
