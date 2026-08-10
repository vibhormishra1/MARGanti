import { httpClient } from "@/lib/http-client";

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_role?: string;
  organization_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  result: string;
  metadata_payload: Record<string, any>;
}

export const getAuditEvents = async (
  resourceId?: string,
  actorId?: string,
  limit: number = 100
): Promise<AuditEvent[]> => {
  let url = `/api/v1/audit/events?limit=${limit}`;
  if (resourceId) url += `&resource_id=${resourceId}`;
  if (actorId) url += `&actor_id=${actorId}`;
  
  const { data } = await httpClient.get<AuditEvent[]>(url);
  return data;
};
