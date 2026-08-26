"use client";

import React, { useEffect } from "react";
import { useMapEngine } from "../../context/MapContext";
import { useIncidents } from "@/features/incidents/api/incident.api";
import { IncidentStatus } from "@marg/domain";

export const IncidentLayer: React.FC<{ incidents?: Array<{ id: string; title: string; latitude: number; longitude: number; status: string; priority: string }> }> = ({ incidents: publicIncidents }) => {
  const { engine } = useMapEngine();
  const { data: incidents } = useIncidents({ enabled: !publicIncidents });

  useEffect(() => {
    if (!engine || !incidents) return;

    // Convert incidents to GeoJSON
    const features = incidents
      .filter((inc) => inc.location)
      .map((inc) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [inc.location.longitude, inc.location.latitude],
        },
        properties: {
          id: inc.id,
          title: inc.title,
          status: inc.status,
          priority: inc.priority,
        },
      }));

    const geojsonData = {
      type: "FeatureCollection",
      features,
    };

    const sourceId = "incidents-source";
    const layerId = "incidents-layer";

    engine.addSource(sourceId, {
      type: "geojson",
      data: geojsonData,
    });

    engine.addLayer({
      id: layerId,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": 8,
        "circle-color": [
          "match",
          ["get", "status"],
          IncidentStatus.REPORTED, "#f59e0b",
          IncidentStatus.ACTIVE, "#ef4444",
          IncidentStatus.RESOLVED, "#10b981",
          "#3b82f6"
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    return () => {
      engine.removeLayer(layerId);
      engine.removeSource(sourceId);
    };
  }, [engine, incidents]);

  useEffect(() => {
    if (!engine || !publicIncidents) return;
    const sourceId = "incidents-source"; const layerId = "incidents-layer";
    engine.addSource(sourceId, { type: "geojson", data: { type: "FeatureCollection", features: publicIncidents.map((inc) => ({ type: "Feature", geometry: { type: "Point", coordinates: [inc.longitude, inc.latitude] }, properties: inc })) } });
    engine.addLayer({ id: layerId, type: "circle", source: sourceId, paint: { "circle-radius": 8, "circle-color": "#ef4444", "circle-stroke-width": 2, "circle-stroke-color": "#fff" } });
    return () => { engine.removeLayer(layerId); engine.removeSource(sourceId); };
  }, [engine, publicIncidents]);

  return null;
};
