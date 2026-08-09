import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Incident, IncidentStatus, IncidentPriority } from "@marg/domain";
// Assuming an HTTP client is configured to hit the FastAPI backend
// In reality, this would use the generated @marg/api-sdk
import { httpClient } from "@/lib/http-client"; 

export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (filters: string) => [...incidentKeys.lists(), { filters }] as const,
  details: () => [...incidentKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
};

// API Fetchers
const fetchIncidents = async (): Promise<Incident[]> => {
  const { data } = await httpClient.get<Incident[]>("/api/v1/incidents");
  return data;
};

const fetchIncident = async (id: string): Promise<Incident> => {
  const { data } = await httpClient.get<Incident>(`/api/v1/incidents/${id}`);
  return data;
};

const createIncident = async (payload: any): Promise<Incident> => {
  const { data } = await httpClient.post<Incident>("/api/v1/incidents", payload);
  return data;
};

// React Query Hooks
export function useIncidents() {
  return useQuery({
    queryKey: incidentKeys.lists(),
    queryFn: fetchIncidents,
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => fetchIncident(id),
    enabled: !!id,
  });
}

export function useReportIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIncident,
    onSuccess: (newIncident) => {
      // Optimistic update or invalidation
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}
