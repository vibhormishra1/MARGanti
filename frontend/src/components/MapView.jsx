// REQ-M1-09: hardcoded centre + zoom
// REQ-M1-10: 5 hardcoded node markers — coords from constants only
// REQ-M1-11: polylines from final_consensus_plan.transport_sequence
// REQ-M1-12: static red flood zone polygon

import { useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  MAP_CENTER,
  MAP_ZOOM,
  NODE_COORDS,
  NODE_COLORS,
  FLOOD_ZONE,
} from "../constants/nodes";

// Build polyline paths from transport_sequence in final plan.
// SRS Section 5.4 schema uses transport_sequence with {from, to, method} per segment.
function buildPolylines(transportSequence) {
  if (!transportSequence) return [];
  return transportSequence
    .map((seg) => ({
      path: [NODE_COORDS[seg.from], NODE_COORDS[seg.to]].filter(Boolean),
      color: seg.method === "drone" ? "#2196F3" : "#E65100",
    }))
    .filter((p) => p.path.length === 2);
}

// SVG circle icon — no external assets needed
function markerIcon(type) {
  const color = encodeURIComponent(NODE_COLORS[type] || "#607D8B");
  return {
    url: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34'><circle cx='17' cy='17' r='15' fill='${color}' stroke='white' stroke-width='2'/></svg>`,
    scaledSize: { width: 34, height: 34 },
  };
}

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#255d8a" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6d8f" }],
  },
];

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// Empty array constant prevents useJsApiLoader from re-rendering on every render
const LIBRARIES = [];

export default function MapView({ finalPlan }) {
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
    libraries: LIBRARIES,
  });

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const polylines = buildPolylines(finalPlan?.transport_sequence);

  if (loadError) {
    return (
      <div
        id="map-error"
        className="flex-1 flex items-center justify-center text-red-400 text-sm"
      >
        Map failed to load — check VITE_GOOGLE_MAPS_KEY in .env
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-marg-blue border-t-transparent rounded-full animate-spin" />
          Loading tactical map...
        </div>
      </div>
    );
  }

  return (
    <div id="map-view" className="flex-1 relative">
      {/* Map overlay label */}
      <div className="absolute top-3 left-3 z-10 bg-black/70 px-3 py-1.5 rounded text-xs text-blue-400 font-mono border border-blue-900 backdrop-blur-sm">
        COASTAL MAHARASHTRA — CRISIS ZONE
      </div>

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: DARK_MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {/* Static flood polygon — REQ-M1-12 */}
        <Polygon
          paths={FLOOD_ZONE}
          options={{
            fillColor: "#FF1744",
            fillOpacity: 0.25,
            strokeColor: "#FF1744",
            strokeWeight: 2,
          }}
        />

        {/* Hardcoded node markers — REQ-M1-10 */}
        {Object.entries(NODE_COORDS).map(([id, node]) => (
          <Marker
            key={id}
            position={{ lat: node.lat, lng: node.lng }}
            icon={markerIcon(node.type)}
            title={`${id}: ${node.label}`}
          />
        ))}

        {/* Route polylines — appear only when final plan arrives — REQ-M1-11 */}
        {polylines.map((pl, i) => (
          <Polyline
            key={i}
            path={pl.path}
            options={{
              strokeColor: pl.color,
              strokeOpacity: 0.9,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
