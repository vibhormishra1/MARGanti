import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics, DashboardAnalytics } from "../api";

export const useDashboardAnalytics = () => {
  return useQuery<DashboardAnalytics>({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardAnalytics,
    refetchInterval: 30000, // Refresh every 30 seconds for live operational intel
    staleTime: 10000,
  });
};
