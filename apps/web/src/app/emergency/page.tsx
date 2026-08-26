"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TacticalMap } from "@/features/map/components/TacticalMap";
import { IncidentLayer } from "@/features/map/components/layers/IncidentLayer";
import { ResourceLayer } from "@/features/map/components/layers/ResourceLayer";
import { CollaborationSidebar } from "@/features/collaboration/components/CollaborationSidebar";

function EmergencyMapContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get("location");
  
  return (
    <>
      {location && (
        <div className="absolute top-4 left-4 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-lg border border-slate-700 shadow-lg backdrop-blur-md flex flex-col">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Active Region</span>
          <span className="text-lg font-bold">{location}</span>
        </div>
      )}
      <TacticalMap>
        <IncidentLayer />
        <ResourceLayer />
      </TacticalMap>
    </>
  );
}

export default function EmergencyPage() {
  return (
    <main className="h-screen w-full bg-slate-950 flex overflow-hidden">
      {/* Primary Map Surface */}
      <div className="flex-1 relative flex flex-col">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <span className="text-slate-400 animate-pulse">Initializing map...</span>
          </div>
        }>
          <EmergencyMapContent />
        </Suspense>
      </div>

      {/* Collaboration Sidebar (using global or default incident ID) */}
      <CollaborationSidebar contextId="global" />
    </main>
  );
}
