"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapLibreAdapter, IMapEngine } from "@marg/map-offline";
import { MapProvider } from "../context/MapContext";
import "maplibre-gl/dist/maplibre-gl.css";

const LIGHT_MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
} as const;

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
          style: LIGHT_MAP_STYLE,
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

  useEffect(() => {
    if (!engine || (center[0] === 0 && center[1] === 0)) return;
    const sourceId = "marg-user-location";
    const layerId = "marg-user-location-layer";
    engine.addSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Point", coordinates: center }, properties: {} }] },
    });
    engine.addLayer({
      id: layerId,
      type: "circle",
      source: sourceId,
      paint: { "circle-radius": 9, "circle-color": "#0f766e", "circle-stroke-width": 4, "circle-stroke-color": "#ffffff" },
    });
    return () => { engine.removeLayer(layerId); engine.removeSource(sourceId); };
  }, [engine, center]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-slate-850">
      <div className="absolute inset-0 overflow-hidden bg-[#e9eff0]" aria-label="Interactive area map">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(24deg,transparent_48%,#9cb9b5_49%,transparent_50%),linear-gradient(112deg,transparent_48%,#b7c9c7_49%,transparent_50%)] [background-size:180px_140px,220px_190px]" />
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
      {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f8f7]/90 z-10">
          <div className="max-w-sm rounded-xl border border-amber-200 bg-white p-5 text-center text-slate-700 shadow-lg">
            {error}
          </div>
        </div>
      )}
      {!engine && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f8f7]/85 z-10">
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-md"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-teal-500" />Loading your area…</div>
        </div>
      )}
      {engine && <MapProvider engine={engine}>{children}</MapProvider>}
    </div>
  );
};
