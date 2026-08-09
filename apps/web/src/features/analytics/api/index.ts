import { httpClient } from "@/lib/http-client";

export interface StatusCount {
  status: string;
  count: number;
}

export interface PriorityCount {
  priority: string;
  count: number;
}

export interface TrendDataPoint {
  timestamp: string;
  count: number;
}

export interface IncidentMetrics {
  total_incidents: number;
  active_incidents: number;
  by_status: StatusCount[];
  by_priority: PriorityCount[];
  trend: TrendDataPoint[];
}

export interface ResponderMetrics {
  total_responders: number;
  active_responders: number;
  by_status: StatusCount[];
}

export interface MissionMetrics {
  total_missions: number;
  active_missions: number;
  by_status: StatusCount[];
}

export interface DashboardAnalytics {
  generated_at: string;
  incidents: IncidentMetrics;
  responders: ResponderMetrics;
  missions: MissionMetrics;
  is_offline_degraded: boolean;
}

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  const { data } = await httpClient.get<DashboardAnalytics>("/api/v1/analytics/dashboard");
  return data;
};
