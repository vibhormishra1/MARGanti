"use client";

import React, { useEffect } from "react";
import { useMapEngine } from "../../context/MapContext";

export interface PublicResource { id: string; name: string; type: string; lat: number; lng: number; status: string; }

export const ResourceLayer: React.FC<{ resources?: PublicResource[] }> = ({ resources = [] }) => {
  const { engine } = useMapEngine();
  useEffect(() => {
    if (!engine || !resources.length) return;
    const sourceId = "resources-source"; const layerId = "resources-layer";
    engine.addSource(sourceId, { type: "geojson", data: { type: "FeatureCollection", features: resources.map((res) => ({ type: "Feature", geometry: { type: "Point", coordinates: [res.lng, res.lat] }, properties: res })) } });
    engine.addLayer({ id: layerId, type: "circle", source: sourceId, paint: { "circle-radius": 7, "circle-color": "#38bdf8", "circle-stroke-width": 2, "circle-stroke-color": "#fff" } });
    return () => { engine.removeLayer(layerId); engine.removeSource(sourceId); };
  }, [engine, resources]);
  return null;
};
