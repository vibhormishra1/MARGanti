"use client";

import React from "react";
import { useDashboardAnalytics } from "../hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertTriangle, Users, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AnalyticsDashboard = () => {
  const { data, isLoading, isError, error } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Failed to load operational intelligence.</p>
        <p className="text-sm opacity-80">{String(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operational Intelligence</h2>
          <p className="text-slate-500">Real-time overview of emergency response activities.</p>
        </div>
        {data.is_offline_degraded && (
          <Badge variant="destructive" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            Offline / Degraded Mode - Showing Cached Intelligence
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.incidents.active_incidents}</div>
            <p className="text-xs text-slate-500">out of {data.incidents.total_incidents} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <Map className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.missions.active_missions}</div>
            <p className="text-xs text-slate-500">out of {data.missions.total_missions} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed Responders</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.responders.active_responders}</div>
            <p className="text-xs text-slate-500">out of {data.responders.total_responders} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Activity</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Stable</div>
            <p className="text-xs text-slate-500">Last updated: {new Date(data.generated_at).toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Incident Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Severity Distribution</CardTitle>
            <CardDescription>Breakdown by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.incidents.by_priority.map((item) => (
                <div key={item.priority} className="flex items-center">
                  <div className="w-24 text-sm font-medium">{item.priority}</div>
                  <div className="flex-1 ml-4">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.priority === "CRITICAL" ? "bg-rose-500" :
                          item.priority === "HIGH" ? "bg-amber-500" :
                          "bg-blue-500"
                        }`}
                        style={{ width: `${Math.max(5, (item.count / Math.max(1, data.incidents.total_incidents)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 w-8 text-right text-sm text-slate-500">{item.count}</div>
                </div>
              ))}
              {data.incidents.by_priority.length === 0 && (
                <div className="text-sm text-slate-500 italic">No priority data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responder Status */}
        <Card>
          <CardHeader>
            <CardTitle>Responder Workload Status</CardTitle>
            <CardDescription>Current disposition of personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.responders.by_status.map((item) => (
                <div key={item.status} className="flex items-center">
                  <div className="w-28 text-sm font-medium truncate">{item.status.replace("_", " ")}</div>
                  <div className="flex-1 ml-4">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.status === "DEPLOYED" ? "bg-indigo-500" :
                          item.status === "ON_DUTY" ? "bg-emerald-500" :
                          item.status === "FATIGUED" ? "bg-amber-500" :
                          "bg-slate-400"
                        }`}
                        style={{ width: `${Math.max(5, (item.count / Math.max(1, data.responders.total_responders)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 w-8 text-right text-sm text-slate-500">{item.count}</div>
                </div>
              ))}
              {data.responders.by_status.length === 0 && (
                <div className="text-sm text-slate-500 italic">No responder status data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
