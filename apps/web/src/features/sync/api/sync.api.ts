import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SyncOperation, SyncConflict } from "@marg/domain";
import { httpClient } from "@/lib/http-client";

export const syncKeys = {
  all: ["sync"] as const,
  queue: () => [...syncKeys.all, "queue"] as const,
  conflicts: () => [...syncKeys.all, "conflicts"] as const,
};

// We don't really have a backend queue, it's local in IndexedDB, but we use React Query to manage state for UI.
// For the sake of this mock UI, the backend endpoints just return success, and the SyncContext handles the local repo.

export function usePushSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (operations: SyncOperation[]) => {
      const { data } = await httpClient.post<{ status: string, conflicts: SyncConflict[] }>('/api/v1/incidents/sync/push', { operations });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncKeys.all });
    }
  });
}
