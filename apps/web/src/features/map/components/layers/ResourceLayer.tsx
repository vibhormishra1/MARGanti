"use client";

import React, { useEffect } from "react";
import { NearbyResource } from "@/lib/nearby-resources";
import { useMapEngine } from "../../context/MapContext";

export type PublicResource = NearbyResource;

interface ResourceLayerProps {
  resources?: NearbyResource[];
  selectedId?: string | null;
  onSelect?: (resourceId: string) => void;
}

export const ResourceLayer: React.FC<ResourceLayerProps> = ({ resources = [], selectedId, onSelect }) => {
  const { engine } = useMapEngine();
  useEffect(() => {
    if (!engine || !resources.length) return;
    const sourceId = "resources-source"; const layerId = "resources-layer";
    engine.addSource(sourceId, { type: "geojson", data: { type: "FeatureCollection", features: resources.map((res) => ({ type: "Feature", geometry: { type: "Point", coordinates: [res.longitude, res.latitude] }, properties: { id: res.id, name: res.name, type: res.type } })) } });
    engine.addLayer({ id: layerId, type: "circle", source: sourceId, paint: { "circle-radius": ["match", ["get", "id"], selectedId || "", 11, 7], "circle-color": ["match", ["get", "type"], "HOSPITAL", "#e85d75", "SHELTER", "#d99a2b", "#198f87"], "circle-stroke-width": 3, "circle-stroke-color": "#ffffff" } });
    const handleMapClick = (event: { point: { x: number; y: number } }) => {
      const feature = engine.queryRenderedFeatures(event.point, [layerId])[0];
      const id = feature?.properties?.id;
      if (typeof id === "string") onSelect?.(id);
    };
    engine.events.on("click", handleMapClick);
    return () => { engine.events.off("click", handleMapClick); engine.removeLayer(layerId); engine.removeSource(sourceId); };
  }, [engine, resources, selectedId, onSelect]);
  return null;
};
