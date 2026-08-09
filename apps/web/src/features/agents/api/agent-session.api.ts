import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentSession } from "@marg/domain";
import { httpClient } from "@/lib/http-client";

export const agentSessionKeys = {
  all: ["agent-sessions"] as const,
  byIncident: (incidentId: string) => [...agentSessionKeys.all, incidentId] as const,
};

// Start a session
const startSession = async (incidentId: string): Promise<AgentSession> => {
  const { data } = await httpClient.post<AgentSession>(`/api/v1/incidents/${incidentId}/agent-sessions`);
  return data;
};

// Fetch current session
const fetchSession = async (incidentId: string): Promise<AgentSession | null> => {
  try {
    const { data } = await httpClient.get<AgentSession>(`/api/v1/incidents/${incidentId}/agent-sessions`);
    return data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

export function useStartAgentSession(incidentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startSession(incidentId),
    onSuccess: (data) => {
      queryClient.setQueryData(agentSessionKeys.byIncident(incidentId), data);
    },
  });
}

export function useAgentSession(incidentId: string) {
  return useQuery({
    queryKey: agentSessionKeys.byIncident(incidentId),
    queryFn: () => fetchSession(incidentId),
    enabled: !!incidentId,
  });
}
