import { useQuery } from "@tanstack/react-query";
import { Thread, AppNotification } from "@marg/domain";
import { httpClient } from "@/lib/http-client";

export const communicationKeys = {
  all: ["communication"] as const,
  thread: (incidentId: string) => [...communicationKeys.all, "thread", incidentId] as const,
  notifications: (userId: string) => [...communicationKeys.all, "notifications", userId] as const,
};

const fetchThread = async (incidentId: string): Promise<Thread | null> => {
  try {
    const { data } = await httpClient.get<Thread>(`/api/v1/incidents/${incidentId}/threads`);
    return data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

const fetchNotifications = async (userId: string): Promise<AppNotification[]> => {
  const { data } = await httpClient.get<AppNotification[]>(`/api/v1/incidents/users/${userId}/notifications`);
  return data;
};

export function useThread(incidentId: string) {
  return useQuery({
    queryKey: communicationKeys.thread(incidentId),
    queryFn: () => fetchThread(incidentId),
    enabled: !!incidentId,
  });
}

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: communicationKeys.notifications(userId),
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
  });
}
