"use client";

import React, { useState } from "react";
import { ProgressDashboard } from "./ProgressDashboard";
import { MissionList } from "./MissionList";
import { MissionDetails } from "./MissionDetails";
import { MissionCreation } from "./MissionCreation";
import { Button } from "@/components/ui/button";
import { TacticalMap } from "@/features/map/components/TacticalMap";
import { IncidentLayer } from "@/features/map/components/layers/IncidentLayer";
import { ResourceLayer } from "@/features/map/components/layers/ResourceLayer";
import { RealTimeProvider } from "@/features/collaboration/context/RealTimeContext";
import { NotificationCenter } from "@/features/collaboration/components/NotificationCenter";
import { CollaborationSidebar } from "@/features/collaboration/components/CollaborationSidebar";
import { SyncProvider } from "@/features/sync/context/SyncContext";
import { SyncStatusIndicator } from "@/features/sync/components/SyncStatusIndicator";
import { PendingChangesPanel } from "@/features/sync/components/PendingChangesPanel";
import { ConflictResolutionUI } from "@/features/sync/components/ConflictResolutionUI";

function MissionDashboardInner() {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [showCreation, setShowCreation] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center pb-4 border-b border-slate-900">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Mission Command
          </h1>
          <p className="text-sm text-slate-500">
            Realtime tactical objectives and workforce routing orchestration
          </p>
        </div>
        <div className="flex items-center gap-6">
          <SyncStatusIndicator />
          <div className="w-px h-6 bg-slate-800" />
          <NotificationCenter userId="user-1" />
          <Button
            onClick={() => setShowCreation(!showCreation)}
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold"
          >
            {showCreation ? "Close Planning" : "➕ Plan Mission"}
          </Button>
        </div>
      </div>

      <ProgressDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {showCreation && (
            <div className="border border-sky-950 rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl">
              <MissionCreation
                incidentId="inc-123" // Default active incident link
                onSuccess={() => setShowCreation(false)}
              />
            </div>
          )}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <MissionList onSelectMission={(id) => setSelectedMissionId(id)} />
          </div>
        </div>

        <div className="lg:col-span-2 h-full min-h-[500px]">
          {selectedMissionId ? (
            <MissionDetails missionId={selectedMissionId} />
          ) : (
            <TacticalMap>
              <IncidentLayer />
              <ResourceLayer />
            </TacticalMap>
          )}
        </div>
      </div>
      <CollaborationSidebar contextId={selectedMissionId || "global"} />
      <PendingChangesPanel />
      <ConflictResolutionUI />
    </div>
  );
}

export function MissionDashboard() {
  return (
    <SyncProvider>
      <RealTimeProvider>
        <MissionDashboardInner />
      </RealTimeProvider>
    </SyncProvider>
  );
}
