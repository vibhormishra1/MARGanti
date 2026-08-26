"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapLibreAdapter, IMapEngine } from "@marg/map-offline";
import { MapProvider } from "../context/MapContext";
import "maplibre-gl/dist/maplibre-gl.css";

interface TacticalMapProps {
  children?: React.ReactNode;
  center?: [number, number];
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ children, center = [0, 0] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<IMapEngine | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    let currentEngine: IMapEngine | null = null;

    const initMap = async () => {
      try {
        const adapter = new MapLibreAdapter();
        await adapter.initialize({
          container: mapContainer.current!,
          style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json", // Dark tactical base map
          center,
          zoom: center[0] === 0 && center[1] === 0 ? 2 : 11,
        });

        currentEngine = adapter;
        setEngine(adapter);
      } catch (err: any) {
        console.error("Failed to initialize map:", err);
        setError(err.message || "Failed to initialize tactical map");
      }
    };

    initMap();

    return () => {
      if (currentEngine) {
        currentEngine.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-slate-850">
      <div ref={mapContainer} className="absolute inset-0" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="text-red-500 font-bold p-4 bg-red-950/50 rounded-lg border border-red-900/50">
            {error}
          </div>
        </div>
      )}
      {!engine && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="text-sky-500 animate-pulse font-medium">Initializing Tactical Map...</div>
        </div>
      )}
      {engine && <MapProvider engine={engine}>{children}</MapProvider>}
    </div>
  );
};
