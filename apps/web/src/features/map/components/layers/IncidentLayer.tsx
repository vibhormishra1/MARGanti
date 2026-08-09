"use client";

import React, { useEffect } from "react";
import { useMapEngine } from "../../context/MapContext";
import { useIncidents } from "@/features/incidents/api/incident.api";
import { IncidentStatus } from "@marg/domain";

export const IncidentLayer: React.FC = () => {
  const { engine } = useMapEngine();
  const { data: incidents } = useIncidents();

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

  return null;
};
