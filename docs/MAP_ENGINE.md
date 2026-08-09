# Map Engine & Spatial Integration Architecture — MARG v2

## Document Metadata
- **Document Title**: MAP_ENGINE.md
- **System**: MARG v2 Spatial Engine
- **Status**: Production Specification

---

## 1. Spatial Engine Overview

The Spatial Engine provides dynamic geographic visualization, infrastructure discovery, hazard polygon geofencing, and real road graph routing across India.

```
                           MAP ENGINE PIPELINE
                           
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  Google Places API      │     │  Google Directions API  │     │  Google Maps JS API     │
│  Infrastructure Node    │     │  Real Road Polyline     │     │  Tactical Map Canvas    │
│  Discovery (Hospitals,  │     │  Distance & Travel Time │     │  Node Markers & Polyline│
│  Depots, Shelters)      │     │  Calculation            │     │  Overlays               │
└────────────┬────────────┘     └────────────┬────────────┘     └────────────┬────────────┘
             │                               │                               │
             └───────────────────────┬───────┴───────────────────────────────┘
                                     ▼
                      ┌──────────────────────────────┐
                      │    MARG v2 SPATIAL CORE      │
                      └──────────────────────────────┘
```

---

## 2. Dynamic Infrastructure Node Discovery (Places API)

When a city (e.g. *Guwahati, Assam*) is selected, the Research Engine queries the **Google Places API (Text Search)** to dynamically discover operational infrastructure hubs:

1. **Hospitals**: `query: "major government hospital in Guwahati"` $\rightarrow$ Lat/Lng, Name, Place ID.
2. **Supply Depots**: `query: "cold storage logistics depot in Guwahati"`.
3. **Emergency Relief Hubs**: `query: "sports stadium or convention center in Guwahati"`.

Discovered hubs are assigned structured uppercase node IDs (e.g. `GMCH_HOSPITAL`, `KHANAPARA_DEPOT`) and injected into the dynamic `region_config.nodes` dictionary.

---

## 3. Real Road Polyline & Distance Computation (Directions API)

Instead of straight-line (Euclidean) vectors or static hardcoded distance matrices, MARG v2 queries the **Google Maps Directions API**:

```python
import httpx

async def get_real_road_distance_and_polyline(origin_coords: dict, dest_coords: dict, api_key: str):
    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": f"{origin_coords['lat']},{origin_coords['lng']}",
        "destination": f"{dest_coords['lat']},{dest_coords['lng']}",
        "mode": "driving",
        "key": api_key
    }
    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        data = res.json()
        
    route = data["routes"][0]["legs"][0]
    distance_km = route["distance"]["value"] / 1000.0
    duration_min = route["duration"]["value"] / 60.0
    polyline_points = data["routes"][0]["overview_polyline"]["points"]
    
    return {
        "distance_km": distance_km,
        "duration_min": duration_min,
        "polyline": polyline_points
    }
```

---

## 4. Geofenced Hazard Overlays & Topological Intersection

Hazard zones (e.g., flooded river basins, structurally damaged bridges) are represented as geofenced polygons.

```
                  HAZARD POLYGON INTERSECTION ENGINE
                  
  Route Polyline Points: P1 ──► P2 ──► P3 ──► P4 ──► P5
                                      │
                               (Intersection Test)
                                      ▼
                        ┌──────────────────────────┐
                        │ Hazard Polygon Boundary  │
                        │ (Brahmaputra Flood Zone) │
                        └─────────────┬────────────┘
                                      │
                                      ▼
                   [ Apply Speed Penalty / Block Route ]
```

### Polygon Point-in-Polygon Algorithm (Ray-Casting)
```python
def is_point_in_polygon(lat: float, lng: float, polygon: list) -> bool:
    n = len(polygon)
    inside = False
    p1x, p1y = polygon[0]["lng"], polygon[0]["lat"]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]["lng"], polygon[i % n]["lat"]
        if lat > min(p1y, p2y):
            if lat <= max(p1y, p2y):
                if lng <= max(p1x, p2x):
                    if p1y != p2y:
                        xints = (lat - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or lng <= xints:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside
```

If a proposed truck route intersects a `flooded_zone` polygon, the Physics Validator either:
1. Applies a **speed multiplier penalty** ($v_{\text{effective}} = 15\text{ km/h}$).
2. Rejects the route with `PHYSICS_ETA_VIOLATION` if travel time exceeds spoilage limits.

---

## 5. React Client Map Visualization Engine (`MapView.jsx`)

The client map component dynamically renders four distinct visual layers:
1. **Satellite Canvas**: Styled with dark tactical map themes (`disableDefaultUI: true`).
2. **Geofenced Polygon Layer**: Renders active hazards with semi-transparent red fills (`Polygon`).
3. **Dynamic Node Markers**: Displays color-coded SVG markers scaled for hospital urgency (`Marker`).
4. **Negotiation & Final Route Lines**:
   - **Active Negotiation Lines**: Dashed animated polyline showing latest proposed agent route (`Polyline`).
   - **Approved Consensus Plan Lines**: Solid polylines (Blue for aerial drones, Orange for ground reefer trucks).

---

## 6. Document Cross-References
- See [PHYSICS_ENGINE.md](PHYSICS_ENGINE.md) for symbolic validation rules.
- See [DATA_MODEL.md](DATA_MODEL.md) for hazard polygon schemas.
