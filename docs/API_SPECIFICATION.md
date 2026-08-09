# API Specification & Technical Contracts — MARG v2

## Document Metadata
- **Document Title**: API_SPECIFICATION.md
- **Version**: 2.0.0
- **Base URL**: `/api/v2/simulation`
- **Protocol**: HTTP/1.1 REST + WebSockets (Firebase RTDB)

---

## 1. Gateway API Specification (`backend-node`)

### 1.1 `POST /api/v2/simulation/initialize`
Initializes a new dynamic national crisis session. Performs web-grounded research via Python engine and writes initial seed state to Firebase RTDB.

#### Request Headers
- `Content-Type: application/json`

#### Request Payload
```json
{
  "state": "Assam",
  "city": "Guwahati",
  "crisis": "Brahmaputra river overflowed after cloudburst. Grid sub-station flooded."
}
```

#### Response Payload (201 Created)
```json
{
  "session_id": "c9a4b2e8-5f12-4d3a-9e11-8f2a4b6c8d10",
  "status": "initialized",
  "nodes_seeded": 4,
  "hazards_seeded": 1
}
```

#### Error Responses
- `400 Bad Request`: Invalid state/city/crisis parameters.
- `500 Internal Server Error`: Seeding or database initialization failure.

---

### 1.2 `POST /api/v2/simulation/run-round`
Executes one multi-agent negotiation round for an active session.

#### Request Payload
```json
{
  "session_id": "c9a4b2e8-5f12-4d3a-9e11-8f2a4b6c8d10"
}
```

#### Response Payload (200 OK)
```json
{
  "status": "ok",
  "round": 1,
  "sim_status": "running"
}
```

#### Error Responses
- `404 Not Found`: Session ID does not exist in database.
- `400 Bad Request`: Simulation already completed.
- `409 Conflict`: A round is currently executing for this session.
- `502 Bad Gateway`: Python AI engine returned invalid or unparseable state shape.

---

### 1.3 `GET /api/v2/simulation/state/:id`
Fetches current global simulation state for a given session.

#### Response Payload (200 OK)
```json
{
  "session_id": "c9a4b2e8-5f12-4d3a-9e11-8f2a4b6c8d10",
  "round_number": 1,
  "status": "running",
  "crisis": { ... },
  "shared_history": [ ... ]
}
```

---

### 1.4 `DELETE /api/v2/simulation/:id`
Deletes an active or finished crisis session from Firebase RTDB and clears session tracking.

#### Response Payload (200 OK)
```json
{
  "deleted": true,
  "session_id": "c9a4b2e8-5f12-4d3a-9e11-8f2a4b6c8d10"
}
```

---

## 2. Internal Python Engine API (`backend-python`)

### 2.1 `POST /simulate/scout`
Executes initial web search grounding round to discover regional infrastructure and hazard boundaries.

#### Request Payload
```json
{
  "state": "Assam",
  "city": "Guwahati",
  "crisis": "Brahmaputra river overflowed after cloudburst."
}
```

#### Response Payload (200 OK)
```json
{
  "region_bounds": {
    "center": { "lat": 26.1445, "lng": 91.7362 },
    "zoom": 12
  },
  "nodes": [
    {
      "id": "GMCH_HOSPITAL",
      "name": "Gauhati Medical College Hospital",
      "type": "hospital",
      "coords": { "lat": 26.1426, "lng": 91.7610 },
      "capacity_units": 5000,
      "status": "critical"
    }
  ],
  "hazards": [ ... ],
  "time_to_spoilage_minutes": 180
}
```

---

### 2.2 `POST /simulate/round`
Runs sequential multi-agent execution loop with physics validation.

#### Request Payload
```json
{
  "state": { ...global state dictionary... }
}
```

#### Response Payload (200 OK)
Returns mutated global state dictionary for Node orchestrator to write to Firebase RTDB.

---

## 3. Realtime WebSocket Push Contract (Firebase RTDB)

Client subscribes to `/sessions/{session_id}/state` via Firebase Client SDK `onValue()` listener.

```
                  WEBSOCKET EVENT PUSH SCHEMA
                  
Event Trigger: Firebase RTDB .set() update
Push Channel:  WebSocket Connection
Payload:       Full Global State Object (sub-200ms latency)
```

---

## 4. Document Cross-References
- See [DATA_MODEL.md](DATA_MODEL.md) for data schemas.
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for execution topology.
