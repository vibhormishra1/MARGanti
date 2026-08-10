"use client";

import React, { useEffect, useState } from "react";
import { useMapEngine } from "../../context/MapContext";

const MOCK_RESOURCES: any[] = [];

export const ResourceLayer: React.FC = () => {
  const { engine } = useMapEngine();
  const [resources, setResources] = useState(MOCK_RESOURCES);

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
