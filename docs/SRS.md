# Software Requirements Specification (SRS) — MARG v2

## Standard Compliance: IEEE Std 830-1998 Format
- **Document Title**: Software Requirements Specification for MARG v2 Platform
- **Revision**: 2.0.0
- **Date**: July 2026

---

## 1. Introduction

### 1.1 Purpose
This document defines the formal software requirements for **MARG v2: National Crisis Intelligence Platform**. It specifies functional, non-functional, interface, and symbolic validation requirements for developers, system integrators, and open-source contributors.

### 1.2 Scope
MARG v2 is a neurosymbolic multi-agent software system comprising:
1. **Frontend Layer**: React 19 + Vite SPA with Google Maps API and Firebase Web SDK integration.
2. **Gateway Layer**: Node.js Express / Vercel Serverless Orchestrator managing session lifecycle, rate limiting, and Zod input validation.
3. **Cognitive & Neural Layer**: Python FastAPI engine orchestrating web search grounding (Gemini 2.0 Flash) and multi-agent negotiation swarms.
4. **Symbolic Physics Layer**: Python deterministic engine validating road polylines, vehicle capacities, and spoilage ETAs via Google Maps Directions API.
5. **Realtime Persistence Layer**: Firebase Realtime Database (RTDB) for sub-200ms client synchronization.

---

## 2. Overall Description

### 2.1 Product Perspective

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MARG v2 SYSTEM BOUNDARY                        │
│                                                                         │
│  [ React SPA Client ] ──HTTP/WS──► [ Node Gateway ] ──HTTP──► [ Python Engine ] │
│         │                                                          │    │
│         │ (Web SDK)                                 (Admin SDK)    │    │ (gRPC)
│         ▼                                                ▼         │    ▼
│  [ Firebase RTDB ] ◄─────────────────────────────────────┘         │ [ Gemini API ]
│         ▲                                                          │
│         └──────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- **UI-01**: Must render interactive Google Maps centered dynamically on selected regional crisis centroid with custom dark-mode styling.
- **UI-02**: Must display color-coded agent message cards with an expandable CoT (`internal_reasoning`) debug tray.
- **UI-03**: Must display a formatted `HH:MM:SS` spoilage countdown timer updating strictly on database push events.

### 3.2 Hardware Interfaces
- No dedicated hardware required. Client runs in any modern WebGL-capable browser. Backend deploys on standard x86_64 / ARM64 cloud instances or serverless platforms.

### 3.3 Software & API Interfaces
- **API-01**: **Google Maps JS API & Directions API** for polyline rendering and road graph routing.
- **API-02**: **Google Gemini API / Provider Interface** for neural search grounding and structured JSON generation.
- **API-03**: **Firebase Realtime Database REST/WebSocket API** for state synchronization.

---

## 4. System Functional Requirements

### 4.1 Input & Session Management
- **REQ-SYS-01**: The system shall accept a regional initialization payload containing `state` (string), `city` (string), and `crisis` (narrative text).
- **REQ-SYS-02**: The Gateway shall generate a unique UUID v4 `session_id` for each crisis initialization and store the seed state in Firebase RTDB `/sessions/{session_id}/state`.

### 4.2 Web-Grounded Scouting Round
- **REQ-SYS-03**: Upon initialization, the Python engine shall execute an automated scouting round querying Google Search Grounding to extract at least 3 infrastructure hubs (hospitals, depots, shelters) and at least 1 geofenced hazard polygon.
- **REQ-SYS-04**: The discovered infrastructure coordinates must be parsed into a strict Pydantic model (`ScoutEnvironmentSeed`) before updating global state.

### 4.3 Swarm Agent Negotiation Loop
- **REQ-SYS-05**: Active working agents shall execute sequentially in designated order (`hospital` $\rightarrow$ `transport` $\rightarrow$ `ngo`).
- **REQ-SYS-06**: Each agent prompt shall contain only the last 6 messages from `shared_history` to enforce context compression.
- **REQ-SYS-07**: Working agents shall output structured JSON strictly matching `AgentResponse` schema.

### 4.4 Deterministic Physics Validation Gate
- **REQ-SYS-08**: Every agent proposal containing movement actions (`offer`, `request`, `resolve`) must pass through the deterministic physics gate prior to state commit.
- **REQ-SYS-09**: Proposals generating coordinate strings (`latitude`/`longitude`), violating drone payload limits ($> 100$ units), attempting solar fridge operation under offline grid, or calculating travel ETAs exceeding time remaining shall be rejected with an explicit error code.
- **REQ-SYS-10**: Rejected proposals shall trigger up to 1 retry attempt per agent turn, injecting the physics error string into the LLM system context.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance Requirements
- **NFR-PERF-01**: Node Gateway response latency for `/api/simulation/start` shall be $< 500\text{ms}$.
- **NFR-PERF-02**: Python agent turn execution shall complete within $< 15.0\text{s}$ per turn.
- **NFR-PERF-03**: Real-time Firebase UI sync latency shall be $< 200\text{ms}$ globally.

### 5.2 Security & Safety Requirements
- **NFR-SEC-01**: No administrative credentials or LLM API keys shall be exposed to the client bundle.
- **NFR-SEC-02**: Node Gateway shall enforce CORS allowlist validation on all inbound HTTP requests.
- **NFR-SEC-03**: Strict input sanitization via Zod schemas shall prevent command injection or malformed state writes.

---

## 6. Document Cross-References
- See [PRD.md](PRD.md) for product context.
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for architecture details.
- See [DATA_MODEL.md](DATA_MODEL.md) for schema specifications.
