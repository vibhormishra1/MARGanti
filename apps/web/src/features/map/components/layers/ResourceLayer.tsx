"use client";

import React, { useEffect, useState } from "react";
import { useMapEngine } from "../../context/MapContext";

// Mock live resource tracking
const MOCK_RESOURCES = [
  { id: "res-1", name: "Alpha Squad", type: "TEAM", lng: -122.4194, lat: 37.7749 },
  { id: "res-2", name: "Medevac Heli", type: "VEHICLE", lng: -122.4094, lat: 37.7849 },
  { id: "res-3", name: "Engine 4", type: "VEHICLE", lng: -122.4294, lat: 37.7649 },
];

export const ResourceLayer: React.FC = () => {
  const { engine } = useMapEngine();
  const [resources, setResources] = useState(MOCK_RESOURCES);

  // Simulate live movement
  useEffect(() => {
    const interval = setInterval(() => {
      setResources((prev) =>
        prev.map((res) => ({
          ...res,
          lng: res.lng + (Math.random() - 0.5) * 0.001,
          lat: res.lat + (Math.random() - 0.5) * 0.001,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!engine || resources.length === 0) return;

    const sourceId = "resources-source";
    const layerId = "resources-layer";
    const labelLayerId = "resources-label-layer";

    const geojsonData = {
      type: "FeatureCollection",
      features: resources.map((res) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [res.lng, res.lat],
        },
        properties: {
          id: res.id,
          name: res.name,
          type: res.type,
        },
      })),
    };

    // Since we are mocking live updates, we need to handle updates differently
    // In maplibre, you can update a source's data by getting the source and calling setData
    // However, our IMapEngine abstraction only has addSource/removeSource.
    // So we will remove and re-add for this mock, or extend the engine.
    // We will do remove/add for simplicity in the mock.
    
    engine.addSource(sourceId, {
      type: "geojson",
      data: geojsonData,
    });

    engine.addLayer({
      id: layerId,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": 6,
        "circle-color": "#3b82f6", // Blue for resources
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
    
    engine.addLayer({
      id: labelLayerId,
      type: "symbol",
      source: sourceId,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Regular"],
        "text-offset": [0, 1.25],
        "text-anchor": "top",
        "text-size": 12,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "#000000",
        "text-halo-width": 1,
      }
    });

    return () => {
      engine.removeLayer(labelLayerId);
      engine.removeLayer(layerId);
      engine.removeSource(sourceId);
    };
  }, [engine, resources]);

  return null;
};
