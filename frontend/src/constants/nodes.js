// THE ONLY place GPS coordinates exist in this project.
// Python engine outputs node IDs like "HOSPITAL_A".
// React maps them here. LLM never generates lat/lng.

export const MAP_CENTER = { lat: 17.05, lng: 73.53 };
export const MAP_ZOOM   = 11;

export const NODE_COORDS = {
  HOSPITAL_A:     { lat: 17.0234, lng: 73.4891, label: "City Hospital",       type: "hospital"    },
  DEPOT_B:        { lat: 17.1567, lng: 73.6023, label: "Transport Depot B",   type: "transport"   },
  WAYPOINT_C:     { lat: 17.0890, lng: 73.5234, label: "Relay Waypoint C",    type: "waypoint"    },
  COLD_STORAGE_D: { lat: 17.1120, lng: 73.4210, label: "Cold Storage D",      type: "coldStorage" },
  NGO_BASE_E:     { lat: 16.9780, lng: 73.5780, label: "NGO Drone Base E",    type: "ngo"         },
};

// Static flooded zone polygon — never changes based on AI output (REQ-M1-12)
export const FLOOD_ZONE = [
  { lat: 17.040, lng: 73.510 },
  { lat: 17.060, lng: 73.540 },
  { lat: 17.080, lng: 73.525 },
  { lat: 17.055, lng: 73.495 },
];

export const NODE_COLORS = {
  hospital:    "#C62828",
  transport:   "#E65100",
  waypoint:    "#607D8B",
  coldStorage: "#1565C0",
  ngo:         "#2E7D32",
};
