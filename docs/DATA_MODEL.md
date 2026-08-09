# Data Model & Schema Specification — MARG v2

## Document Metadata
- **Document Title**: DATA_MODEL.md
- **System**: MARG v2 National Crisis Intelligence Engine
- **Status**: Production Blueprint

---

## 1. Global Simulation State Schema

The global state dictionary represents the authoritative single source of truth for an active crisis session.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GlobalSimulationState",
  "type": "object",
  "required": [
    "session_id",
    "round_number",
    "status",
    "crisis",
    "agents",
    "shared_history",
    "validated_decisions",
    "conflicts"
  ],
  "properties": {
    "session_id": { "type": "string", "format": "uuid" },
    "round_number": { "type": "integer", "minimum": 0 },
    "status": {
      "type": "string",
      "enum": ["running", "consensus_reached", "forced_resolution", "degraded"]
    },
    "region_config": { "$ref": "#/definitions/RegionConfig" },
    "crisis": { "$ref": "#/definitions/CrisisState" },
    "agents": { "type": "object" },
    "shared_history": {
      "type": "array",
      "items": { "$ref": "#/definitions/AgentMessage" }
    },
    "validated_decisions": {
      "type": "array",
      "items": { "$ref": "#/definitions/ValidatedDecision" }
    },
    "conflicts": { "type": "array" },
    "final_consensus_plan": { "$ref": "#/definitions/ConsensusPlan" },
    "system_message": { "type": ["string", "null"] }
  },
  "definitions": {
    "RegionConfig": {
      "type": "object",
      "required": ["state", "city", "map_center", "map_zoom", "nodes", "hazards"],
      "properties": {
        "state": { "type": "string" },
        "city": { "type": "string" },
        "map_center": {
          "type": "object",
          "properties": {
            "lat": { "type": "number" },
            "lng": { "type": "number" }
          }
        },
        "map_zoom": { "type": "integer" },
        "nodes": { "type": "object" },
        "hazards": { "type": "array" }
      }
    },
    "CrisisState": {
      "type": "object",
      "required": [
        "type",
        "location",
        "severity",
        "time_remaining_minutes",
        "grid_status",
        "road_status"
      ],
      "properties": {
        "type": { "type": "string" },
        "location": { "type": "string" },
        "severity": { "type": "string" },
        "time_remaining_minutes": { "type": "integer" },
        "grid_status": { "type": "string" },
        "road_status": { "type": "string" }
      }
    },
    "AgentMessage": {
      "type": "object",
      "required": [
        "agent",
        "round",
        "action",
        "resource",
        "quantity",
        "proposed_transport",
        "internal_reasoning",
        "public_message",
        "priority",
        "consensus_reached"
      ],
      "properties": {
        "agent": { "type": "string" },
        "round": { "type": "integer" },
        "action": { "type": "string" },
        "resource": { "type": "string" },
        "quantity": { "type": "integer" },
        "proposed_transport": { "type": "string" },
        "from_node": { "type": ["string", "null"] },
        "to_node": { "type": ["string", "null"] },
        "internal_reasoning": { "type": "string" },
        "public_message": { "type": "string" },
        "priority": { "type": "string" },
        "consensus_reached": { "type": "boolean" },
        "degraded": { "type": "boolean" }
      }
    },
    "ValidatedDecision": {
      "type": "object",
      "required": ["method", "from", "to", "quantity", "eta_minutes"],
      "properties": {
        "method": { "type": "string" },
        "from": { "type": "string" },
        "to": { "type": "string" },
        "quantity": { "type": "integer" },
        "eta_minutes": { "type": "integer" }
      }
    },
    "ConsensusPlan": {
      "type": "object",
      "required": ["status", "confidence_note", "risk_flags", "route_nodes", "transport_sequence"],
      "properties": {
        "status": { "type": "string" },
        "confidence_note": { "type": "string" },
        "risk_flags": { "type": "array", "items": { "type": "string" } },
        "route_nodes": { "type": "array", "items": { "type": "string" } },
        "transport_sequence": { "type": "array" }
      }
    }
  }
}
```

---

## 2. Infrastructure Node & Hazard Polygon Schemas

### 2.1 Infrastructure Node Schema (Pydantic / Python)
```python
from pydantic import BaseModel, Field
from typing import Literal

class InfrastructureNodeModel(BaseModel):
    id: str = Field(..., description="Unique upper-case node ID, e.g. GMCH_HOSPITAL")
    label: str = Field(..., description="Human-readable name")
    type: Literal["hospital", "transport", "waypoint", "coldStorage", "ngo"]
    lat: float
    lng: float
    status: str = Field(default="operational")
```

### 2.2 Geofenced Hazard Polygon Schema
```python
from pydantic import BaseModel, Field
from typing import List, Literal

class GPSPoint(BaseModel):
    lat: float
    lng: float

class HazardPolygonModel(BaseModel):
    id: str
    label: str
    type: Literal["flooded_zone", "fire_zone", "bridge_collapse", "landslide"]
    polygon: List[GPSPoint] = Field(..., min_items=3)
    stroke_color: str = Field(default="#FF1744")
    fill_color: str = Field(default="#FF1744")
    fill_opacity: float = Field(default=0.25)
```

---

## 3. Storage Layer Mapping Matrix

| Data Entity | Primary Store | Secondary Store | Persistence Strategy |
| :--- | :--- | :--- | :--- |
| **Active Session State** | Firebase RTDB | Redis Cache | Ephemeral (Deleted on completion or 1-hr TTL) |
| **Session Metadata** | Postgres DB | Redis Cache | Permanent historical archive |
| **Agent Decision Logs** | Postgres DB | Firebase RTDB | Permanent audit log for replay evaluation |
| **Google Maps Directions Cache**| Redis Cache | Memory Cache | Key: `route:{origin}:{dest}`, TTL: 24 hours |

---

## 4. Document Cross-References
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for data flow topology.
- See [API_SPECIFICATION.md](API_SPECIFICATION.md) for API data exchange contracts.
