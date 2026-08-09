import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Responder, Team } from "@marg/domain";
import { httpClient } from "@/lib/http-client";

export const workforceKeys = {
  all: ["workforce"] as const,
  responders: (orgId: string) => [...workforceKeys.all, "responders", orgId] as const,
  teams: () => [...workforceKeys.all, "teams"] as const,
};

const fetchResponders = async (orgId: string): Promise<Responder[]> => {
  const { data } = await httpClient.get<Responder[]>(`/api/v1/workforce/responders?organization_id=${orgId}`);
  return data;
};

const createTeam = async (payload: any): Promise<Team> => {
  const { data } = await httpClient.post<Team>("/api/v1/workforce/teams", payload);
  return data;
};

export function useResponders(orgId: string) {
  return useQuery({
    queryKey: workforceKeys.responders(orgId),
    queryFn: () => fetchResponders(orgId),
    enabled: !!orgId,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workforceKeys.teams() });
    },
  });
}
