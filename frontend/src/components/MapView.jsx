import { useCallback, useRef } from "react";
import { GoogleMap, Marker, Polygon, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { MAP_CENTER, MAP_ZOOM, NODE_COORDS, NODE_COLORS, FLOOD_ZONE } from "../constants/nodes";

// Build solid lines for the FINAL approved plan
function buildFinalPolylines(transportSequence) {
  if (!transportSequence) return [];
  return transportSequence
    .map(seg => ({
      path:  [NODE_COORDS[seg.from], NODE_COORDS[seg.to]].filter(Boolean),
      color: seg.method === "drone" ? "#2196F3" : "#E65100", // Blue for drone, Orange for truck
    }))
    .filter(p => p.path.length === 2);
}

// Build dashed lines for ONGOING agent negotiations
function buildActiveCalculationLines(history) {
  if (!history || history.length === 0) return [];
  
  // Find the most recent message that proposed a route
  const recentProposals = history.filter(msg => msg.from_node && msg.to_node);
  if (recentProposals.length === 0) return [];

  const active = recentProposals[recentProposals.length - 1]; // Get the latest one
  const path = [NODE_COORDS[active.from_node], NODE_COORDS[active.to_node]].filter(Boolean);
  
  if (path.length !== 2) return [];

  return [{
    path,
    // If it was blocked/rejected by physics, flash it red. Otherwise, flash it cyan (calculating)
    color: active.action === "reject" || (active.public_message && active.public_message.includes("blocked")) ? "#FF1744" : "#00E5FF",
    agent: active.agent
  }];
}

function markerIcon(type, isCritical) {
  const color = encodeURIComponent(NODE_COLORS[type] || "#607D8B");
  // Make the hospital larger and bolder to show urgency
  const scale = isCritical && type === "hospital" ? 20 : 15;
  const stroke = isCritical && type === "hospital" ? "red" : "white";
  
  return {
    url: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='${scale}' fill='${color}' stroke='${stroke}' stroke-width='3'/></svg>`,
    scaledSize: { width: 40, height: 40 },
  };
}

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];

export default function MapView({ finalPlan, history, simStatus }) {
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const onLoad = useCallback(map => { mapRef.current = map; }, []);
  const onUnmount = useCallback(() => { mapRef.current = null; }, []);

  const finalPolylines = buildFinalPolylines(finalPlan?.transport_sequence);
  
  // Only show the active calculation lines if the simulation is still running
  const activeLines = simStatus === "running" ? buildActiveCalculationLines(history) : [];

  if (loadError) return <div className="flex-1 flex items-center justify-center text-red-400">Map API Key Error</div>;
  if (!isLoaded) return <div className="flex-1 flex items-center justify-center text-gray-500">Loading tactical map...</div>;

  return (
    <div className="flex-1 relative" style={{ minHeight: "300px" }}>
      <div className="absolute top-3 left-3 z-10 bg-black/70 px-3 py-1.5 rounded text-xs text-blue-400 font-mono border border-blue-900">
        COASTAL MAHARASHTRA — LIVE SATELLITE
      </div>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{ styles: DARK_MAP_STYLES, disableDefaultUI: true, zoomControl: true }}
      >
        {/* The Jammed/Flooded Path (Always visible so judges know what the AI is avoiding) */}
        <Polygon
          paths={FLOOD_ZONE}
          options={{ fillColor: "#FF1744", fillOpacity: 0.25, strokeColor: "#FF1744", strokeWeight: 2 }}
        />

        {/* Dynamic Nodes */}
        {Object.entries(NODE_COORDS).map(([id, node]) => (
          <Marker
            key={id}
            position={{ lat: node.lat, lng: node.lng }}
            icon={markerIcon(node.type, simStatus === "running")}
            title={`${id}: ${node.label}`}
          />
        ))}

        {/* 1. ONGOING CALCULATION LINES (Dashed) */}
        {activeLines.map((pl, i) => (
          <Polyline
            key={`active-${i}`}
            path={pl.path}
            options={{
              strokeColor: pl.color,
              strokeOpacity: 0,
              strokeWeight: 4,
              icons: [{
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                offset: '0',
                repeat: '20px'
              }],
            }}
          />
        ))}

        {/* 2. FINAL APPROVED PLAN LINES (Solid) */}
        {finalPolylines.map((pl, i) => (
          <Polyline
            key={`final-${i}`}
            path={pl.path}
            options={{ strokeColor: pl.color, strokeOpacity: 1, strokeWeight: 5, geodesic: true }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
