import React, { useState } from "react";
import { useCreateMission } from "../api/mission.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MissionCreationProps {
  incidentId: string;
  onSuccess?: () => void;
}

export function MissionCreation({ incidentId, onSuccess }: MissionCreationProps) {
  const createMutation = useCreateMission();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [criteriaInput, setCriteriaInput] = useState("");
  const [successCriteria, setSuccessCriteria] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");

  const handleAddCriteria = () => {
    if (criteriaInput.trim()) {
      setSuccessCriteria([...successCriteria, criteriaInput.trim()]);
      setCriteriaInput("");
    }
  };

  const handleRemoveCriteria = (index: number) => {
    setSuccessCriteria(successCriteria.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (successCriteria.length === 0) {
      alert("At least one success criterion is required.");
      return;
    }

    createMutation.mutate(
      {
        title,
        incidentId,
        commanderId: "user-123", // From Context
        priority,
        objective: {
          description,
          successCriteria,
        },
        deadline: deadline || undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setSuccessCriteria([]);
          setDeadline("");
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-xl max-w-lg mx-auto">
      <h3 className="text-xl font-bold text-sky-400">Create New Mission</h3>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Title</label>
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Mission title..."
          className="bg-slate-950 border-slate-800 text-white placeholder-slate-500"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Objective Description</label>
        <Textarea
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          placeholder="Objective description..."
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

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Success Criteria</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={criteriaInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteriaInput(e.target.value)}
            placeholder="Add success criterion..."
            className="bg-slate-950 border-slate-800 text-white placeholder-slate-500"
          />
          <Button type="button" onClick={handleAddCriteria} className="bg-sky-600 hover:bg-sky-500">
            Add
          </Button>
        </div>

        <ul className="space-y-1">
          {successCriteria.map((c, index) => (
            <li key={index} className="flex justify-between items-center text-sm bg-slate-950 border border-slate-800 px-3 py-1.5 rounded">
              <span>{c}</span>
              <button
                type="button"
                onClick={() => handleRemoveCriteria(index)}
                className="text-red-400 hover:text-red-300 text-xs font-semibold"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold"
      >
        {createMutation.isPending ? "Creating..." : "Create Mission"}
      </Button>
    </form>
  );
}
