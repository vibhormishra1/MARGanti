"use client";

import React, { useState } from "react";
import { useAuditEvents } from "../hooks/useAudit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const AuditLog = () => {
  const [resourceId, setResourceId] = useState("");
  const [actorId, setActorId] = useState("");
  
  const { data, isLoading, isError, error } = useAuditEvents(
    resourceId || undefined, 
    actorId || undefined
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Immutable record of operational and security events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filter by Resource ID</label>
              <Input 
                placeholder="e.g. inc-12345" 
                value={resourceId} 
                onChange={(e) => setResourceId(e.target.value)} 
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filter by Actor ID</label>
              <Input 
                placeholder="e.g. usr-987" 
                value={actorId} 
                onChange={(e) => setActorId(e.target.value)} 
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center p-4">
              Failed to load audit events.
            </div>
          ) : data && data.length > 0 ? (
            <div className="border border-slate-800 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 bg-slate-900 border-b border-slate-800 uppercase">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Resource</th>
                      <th className="px-4 py-3">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((event) => (
                      <tr key={event.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(event.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-200">
                          {event.action}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-300">{event.actor_id}</div>
                          {event.actor_role && (
                            <div className="text-xs text-slate-500">{event.actor_role}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-300">{event.resource_type}</div>
                          <div className="text-xs text-slate-500">{event.resource_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.result === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {event.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 p-8 border border-dashed border-slate-800 rounded-md">
              No audit events found matching the criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
