import React from "react";
import { TacticalMap } from "@/features/map/components/TacticalMap";
import { IncidentLayer } from "@/features/map/components/layers/IncidentLayer";
import { ResourceLayer } from "@/features/map/components/layers/ResourceLayer";
import { CollaborationSidebar } from "@/features/collaboration/components/CollaborationSidebar";

export default function Home() {
  return (
    <main className="h-screen w-full bg-slate-950 flex overflow-hidden">
      {/* Primary Map Surface */}
      <div className="flex-1 relative">
        <TacticalMap>
          <IncidentLayer />
          <ResourceLayer />
        </TacticalMap>
      </div>

      {/* Collaboration Sidebar (using global or default incident ID) */}
      <CollaborationSidebar contextId="global" />
    </main>
  );
}
