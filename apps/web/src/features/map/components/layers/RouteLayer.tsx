"use client";

import React, { useEffect } from "react";
import { RouteResult } from "@/lib/nearby-resources";
import { useMapEngine } from "../../context/MapContext";

export const RouteLayer: React.FC<{ route?: RouteResult | null }> = ({ route }) => {
  const { engine } = useMapEngine();
  useEffect(() => {
    if (!engine || !route) return;
    const sourceId = "selected-route-source"; const layerId = "selected-route-layer";
    engine.addSource(sourceId, { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: route.coordinates }, properties: {} } });
    engine.addLayer({ id: layerId, type: "line", source: sourceId, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#277f79", "line-width": 5, "line-opacity": 0.82 } });
    return () => { engine.removeLayer(layerId); engine.removeSource(sourceId); };
  }, [engine, route]);
  return null;
};
