import React, { useState } from "react";
import { IncidentPriority } from "@marg/domain";
import { useIncidentStore } from "../store/incident.store";
import { useReportIncident } from "../api/incident.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth";

export function IncidentForm() {
  const [draftId] = useState(() => crypto.randomUUID());
  const { user } = useAuth();
  const { drafts, saveDraft, deleteDraft } = useIncidentStore();
  const reportMutation = useReportIncident();
  
  const currentDraft = drafts[draftId] || {
    title: "",
    description: "",
    priority: IncidentPriority.MEDIUM,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    saveDraft(draftId, { [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default location for now (would come from Map/GPS)
    const payload = {
      title: currentDraft.title,
      description: currentDraft.description,
      priority: currentDraft.priority,
      latitude: 28.6139,
      longitude: 77.2090,
      reporter_id: user?.user_id || "fallback-id",
    };

    reportMutation.mutate(payload, {
      onSuccess: () => {
        deleteDraft(draftId);
        // Redirect to list
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold">Report Incident</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input 
          name="title" 
          value={currentDraft.title} 
          onChange={handleChange} 
          placeholder="Brief description of the crisis..."
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea 
          name="description" 
          value={currentDraft.description} 
          onChange={handleChange} 
          placeholder="Provide detailed information..."
          rows={4}
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select 
          name="priority" 
          value={currentDraft.priority} 
          onChange={handleChange}
          className="w-full border rounded-md p-2 text-sm"
        >
          {Object.values(IncidentPriority).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={reportMutation.isPending} className="w-full">
        {reportMutation.isPending ? "Submitting..." : "Report Incident"}
      </Button>

      {reportMutation.isError && (
        <p className="text-red-500 text-sm mt-2">Failed to submit. Will retry when online.</p>
      )}
    </form>
  );
}
