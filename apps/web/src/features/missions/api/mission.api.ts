import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/http-client";
import { Mission, Task } from "../types";

export const missionKeys = {
  all: ["missions"] as const,
  lists: () => [...missionKeys.all, "list"] as const,
  list: (incidentId?: string) => [...missionKeys.lists(), { incidentId }] as const,
  details: () => [...missionKeys.all, "detail"] as const,
  detail: (id: string) => [...missionKeys.details(), id] as const,
};

export function useMissions(incidentId?: string) {
  return useQuery({
    queryKey: missionKeys.list(incidentId),
    queryFn: async (): Promise<Mission[]> => {
      const url = incidentId ? `/api/v1/missions?incident_id=${incidentId}` : "/api/v1/missions";
      const { data } = await httpClient.get<Mission[]>(url);
      return data;
    },
  });
}

export function useMission(id: string) {
  return useQuery({
    queryKey: missionKeys.detail(id),
    queryFn: async (): Promise<Mission> => {
      const { data } = await httpClient.get<Mission>(`/api/v1/missions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      incidentId: string;
      commanderId: string;
      priority: string;
      objective: { description: string; successCriteria: string[] };
      deadline?: string;
    }): Promise<Mission> => {
      // Map objective schema format to match python API command input format
      const { data } = await httpClient.post<Mission>("/api/v1/missions/", {
        title: payload.title,
        incident_id: payload.incidentId,
        commander_id: payload.commanderId,
        priority: payload.priority,
        objective_description: payload.objective.description,
        success_criteria: payload.objective.successCriteria,
        deadline: payload.deadline,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
    },
  });
}

export function usePublishMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Mission> => {
      const { data } = await httpClient.post<Mission>(`/api/v1/missions/${id}/publish`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(data.id) });
    },
  });
}

export function useCreateTask(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      priority: string;
      deadline?: string;
    }): Promise<Task> => {
      const { data } = await httpClient.post<Task>(`/api/v1/missions/${missionId}/tasks`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
    },
  });
}

export function useAssignTask(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      responderId?: string;
      teamId?: string;
    }): Promise<Task> => {
      const { data } = await httpClient.post<Task>(`/api/v1/missions/${missionId}/tasks/${payload.taskId}/assign`, {
        responder_id: payload.responderId,
        team_id: payload.teamId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
    },
  });
}

export function useAddDependency(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      dependsOnTaskId: string;
      isHardDependency?: boolean;
    }): Promise<Mission> => {
      const { data } = await httpClient.post<Mission>(`/api/v1/missions/${missionId}/tasks/${payload.taskId}/dependencies`, {
        depends_on_task_id: payload.dependsOnTaskId,
        is_hard_dependency: payload.isHardDependency ?? true,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
    },
  });
}

export function useStartTask(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string): Promise<Task> => {
      const { data } = await httpClient.post<Task>(`/api/v1/missions/${missionId}/tasks/${taskId}/start`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
    },
  });
}

export function useCompleteTask(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string): Promise<Task> => {
      const { data } = await httpClient.post<Task>(`/api/v1/missions/${missionId}/tasks/${taskId}/complete`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
    },
  });
}

export function useAddChecklistItem(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { taskId: string; description: string }): Promise<Task> => {
      const { data } = await httpClient.post<Task>(`/api/v1/missions/${missionId}/tasks/${payload.taskId}/checklist`, {
        description: payload.description,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
    },
  });
}

export function useUpdateChecklistItem(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      itemId: string;
      isCompleted: boolean;
      responderId: string;
    }): Promise<Task> => {
      const { data } = await httpClient.put<Task>(`/api/v1/missions/${missionId}/tasks/${payload.taskId}/checklist/${payload.itemId}`, {
        is_completed: payload.isCompleted,
        responder_id: payload.responderId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
    },
  });
}
