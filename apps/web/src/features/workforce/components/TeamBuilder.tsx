import React, { useState } from "react";
import { useCreateTeam } from "../api/workforce.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeamBuilder({ organizationId }: { organizationId: string }) {
  const [name, setName] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const createTeamMutation = useCreateTeam();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !leaderId) return;

    createTeamMutation.mutate({
      organization_id: organizationId,
      name,
      team_leader_id: leaderId
    }, {
      onSuccess: () => {
        setName("");
        setLeaderId("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white">
      <h3 className="font-semibold text-lg">Create New Team</h3>
      
      <div>
        <label className="block text-sm mb-1">Team Name</label>
        <Input 
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="e.g. Alpha Squad"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Leader ID</label>
        <Input 
          value={leaderId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLeaderId(e.target.value)}
          placeholder="Responder ID"
          required
        />
      </div>

      <Button type="submit" disabled={createTeamMutation.isPending} className="w-full">
        {createTeamMutation.isPending ? "Creating..." : "Create Team"}
      </Button>
    </form>
  );
}
