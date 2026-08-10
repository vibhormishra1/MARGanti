import { useQuery } from "@tanstack/react-query";
import { getAuditEvents, AuditEvent } from "../api";

export const useAuditEvents = (resourceId?: string, actorId?: string, limit: number = 100) => {
  return useQuery<AuditEvent[]>({
    queryKey: ["audit", "events", resourceId, actorId, limit],
    queryFn: () => getAuditEvents(resourceId, actorId, limit),
  });
};
