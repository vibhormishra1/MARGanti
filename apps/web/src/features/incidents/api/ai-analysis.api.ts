import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentAnalysis } from "@marg/domain";
// In reality, this will use the backend API which calls the AI Adapter
import { httpClient } from "@/lib/http-client";

export const aiAnalysisKeys = {
  all: ["ai-analysis"] as const,
  byIncident: (incidentId: string) => [...aiAnalysisKeys.all, incidentId] as const,
};

const fetchAnalysis = async (incidentId: string): Promise<IncidentAnalysis | null> => {
  try {
    const { data } = await httpClient.get<IncidentAnalysis>(`/api/v1/incidents/${incidentId}/analysis`);
    return data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

const requestAnalysis = async (incidentId: string): Promise<IncidentAnalysis> => {
  const { data } = await httpClient.post<IncidentAnalysis>(`/api/v1/incidents/${incidentId}/analysis`);
  return data;
};

const approveAnalysis = async ({ incidentId, notes }: { incidentId: string, notes?: string }) => {
  const { data } = await httpClient.post(`/api/v1/incidents/${incidentId}/analysis/approve`, { notes });
  return data;
};

const rejectAnalysis = async ({ incidentId, reason }: { incidentId: string, reason: string }) => {
  const { data } = await httpClient.post(`/api/v1/incidents/${incidentId}/analysis/reject`, { reason });
  return data;
};

export function useIncidentAnalysis(incidentId: string) {
  return useQuery({
    queryKey: aiAnalysisKeys.byIncident(incidentId),
    queryFn: () => fetchAnalysis(incidentId),
    enabled: !!incidentId,
  });
}

export function useRequestAnalysis(incidentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestAnalysis(incidentId),
    onSuccess: (data) => {
      queryClient.setQueryData(aiAnalysisKeys.byIncident(incidentId), data);
    },
  });
}

export function useApproveAnalysis(incidentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiAnalysisKeys.byIncident(incidentId) });
    },
  });
}

export function useRejectAnalysis(incidentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiAnalysisKeys.byIncident(incidentId) });
    },
  });
}
