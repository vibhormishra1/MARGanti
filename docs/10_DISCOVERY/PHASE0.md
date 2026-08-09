# MARG v2 — Phase 0: Discovery & Systems Research Document

## Document Metadata
- **Document Title**: PHASE0.md (Phase 0 Discovery & Foundation)
- **Project Name**: MARG v2 (Multi-Agent Routing and Guidance)
- **Role**: Principal Systems Architect, Technical Product Manager, Technical Research Lead & Staff Software Engineer
- **Status**: Discovery Phase — Single Source of Truth
- **Constraint Checklist**: 
  - [x] Zero code written or generated
  - [x] Zero system architecture designed
  - [x] Zero premature optimizations
  - [x] All missing information explicitly recorded with tradeoffs & confidence levels

---

# 1. Executive Summary

**M.A.R.G. (Multi-Agent Routing and Guidance)** is undergoing a fundamental paradigm shift: transitioning from a hackathon prototype into a production-grade **Emergency Operating System (EOS)**.

In conventional emergency management, software systems are built top-down for government agencies and operations centers. When severe disaster strikes—such as urban flash floods, cyclones, or earthquakes—centralized infrastructure (cellular networks, power grids, cloud servers) is often the first thing to fail. Existing solutions leave citizens isolated in the critical first hours when survival odds are decided.

**MARG v2** flips this paradigm. It is a **Citizen-First Emergency Operating System** designed to protect civilians on the ground *before* coordinating institutional emergency responders. 

MARG v2 operates as a **neurosymbolic hybrid**: combining neural AI models (for situational awareness, dynamic search grounding, and multi-agent negotiation) with deterministic symbolic algorithms (for physics validation, road network routing, asset capacity limits, and offline safety checks). Crucially, MARG v2 is engineered with an **offline-first philosophy**—ensuring that even if all cloud connectivity collapses, citizens and local responders retain interactive maps, routing capabilities, and verified emergency guidance.

---

# 2. Mission, Vision & Core Constitution

## 2.1 Mission
To safeguard human life during disasters by providing citizens and emergency organizations with instant, offline-capable, physically validated routing, resource allocation, and actionable emergency intelligence.

## 2.2 Vision
To build the world's most resilient open-source Emergency Operating System (EOS)—operating seamlessly from an individual citizen's offline smartphone to state and national Emergency Operations Centers (EOCs) across India and globally.

## 2.3 User Roster
- **Primary User**: **Citizen** (Individuals, families, and local community members trapped in or evacuating disaster zones).
- **Secondary Users**:
  1. Hospitals & Emergency Medical Services (ICU coordinators, cold-chain logistics leads).
  2. Non-Governmental Organizations (NGOs) & Relief Teams (Red Cross, local volunteer squads).
  3. Search & Rescue (NDRF, SDRF, local rescue dive/boat teams).
  4. Police Departments (Traffic enforcement, evacuation corridor management).
  5. Fire & Rescue Services (Hazard containment, structural rescue).
  6. Government Authorities (State/District Disaster Management Authorities, EOC Directors).

## 2.4 Definition of Success
1. **Zero Unvalidated Recommendations**: $0\%$ of AI-generated routes or instructions presented to citizens or commanders violate physical constraints, flooded boundaries, or asset limits.
2. **First-Class Offline Survival**: Citizens can launch the application, view local vector maps, and calculate safe evacuation routes even in a 100% cellular and cloud blackout.
3. **Sub-Second Real-Time Synchronization**: When network connectivity is present, state synchronization between field units and command centers occurs in $< 200\text{ms}$.
4. **Explainable Emergency Intelligence**: Every recommendation is accompanied by transparent, audit-ready reasoning explaining *why* a route or action was selected over alternatives.

## 2.5 Project Constitution (Non-Negotiable Principles)
1. **Citizen safety always has highest priority.**
2. **Human life is more important than system optimization.**
3. **Offline capability is a first-class requirement.**
4. **Cloud services are enhancements, never single points of failure.**
5. **Every AI recommendation must be explainable.**
6. **Every recommendation must be validated before presentation.**
7. **Maps are the primary operating surface.**
8. **The system must degrade gracefully.**
9. **The architecture must remain model-agnostic.**
10. **Production quality is more important than hackathon speed.**
11. **Every architectural decision must support future scalability without overengineering the MVP.**
12. **Simplicity is preferred unless additional complexity provides significant value.**

---

# 3. Current State Audit (Hackathon Prototype)

The existing repository represents a proof-of-concept prototype built during a hackathon. The current implementation MUST NOT dictate future architecture unless it is objectively proven to be the optimal solution.

## 3.1 Prototype Technical Inventory
- **Frontend**: React 19 SPA built with Vite, Tailwind CSS, `@react-google-maps/api`, and `@firebase/database`.
- **Node Gateway**: Express.js server providing session initialization, rate limiting, and Zod request validation.
- **Python Engine**: FastAPI service running an agent negotiation loop via `google-generativeai` (Gemini 2.0 Flash) and a static physics script.
- **Database**: Firebase Realtime Database (RTDB) for live client updates.
- **Geographic Data**: Static 5-node slice in Coastal Maharashtra (`HOSPITAL_A`, `DEPOT_B`, `WAYPOINT_C`, `COLD_STORAGE_D`, `NGO_BASE_E`) with hardcoded lat/lng coordinates and a static flood polygon.

## 3.2 Objective Evaluation

| Aspect | Strengths | Weaknesses & Vulnerabilities |
| :--- | :--- | :--- |
| **Neurosymbolic Gate** | Successfully demonstrates combining LLM outputs with deterministic Python checks (`physics_engine.py`). | Distance matrix (`NODE_DISTANCES`) is completely hardcoded to 14 static node pairs. Rejects any unlisted node with `PHYSICS_UNKNOWN_ROUTE`. |
| **Realtime Sync** | Firebase RTDB `onValue` listener provides smooth, sub-second UI updates to the browser. | Requires an active, stable internet connection to Firebase servers. Zero offline capabilities. |
| **CoT Inspection** | Expandable UI component renders `internal_reasoning` traces for transparency. | Context slicing uses a brittle hardcoded 6-item window (`history[-6:]`) without semantic relevance filtering. |
| **Provider Coupling** | Uses a lazy initializer for Gemini 2.0 Flash. | Bound directly to Google Gemini API. Cannot fail over to local models or alternative cloud vendors. |
| **User Focus** | Clean tactical UI for command center demo. | Focuses exclusively on top-down agency coordination. Completely lacks citizen-facing workflows or offline emergency tools. |

## 3.3 Prototype Assumptions to Challenge
- **Assumption 1**: High-speed internet is always available during a disaster. *(FALSE in real emergencies)*.
- **Assumption 2**: Google Maps API endpoints are accessible via cloud HTTP calls. *(FALSE during cellular outages)*.
- **Assumption 3**: Emergency logistics start with hospital demands rather than citizen survival signals. *(FALSE: Civilian safety is Primary)*.

---

# 4. Problem Statement

## 4.1 Real-World Crisis Realities
During major disasters (such as urban flash flooding in Chennai/Guwahati, cyclones in Odisha, or landslides in Uttarakhand):
1. **Critical Infrastructure Fails First**: Power sub-stations flood, cell towers lose backup battery after 2–4 hours, and optical fiber cables snap.
2. **Civilian Isolation**: Citizens are trapped in micro-locations without situational awareness, clear evacuation routes, or direct contact with emergency services.
3. **Agency Chaos**: Hospitals, NGOs, Fire, and Rescue teams operate in isolated silos with outdated, unverified ground intelligence.
4. **AI Hallucination Hazards**: Generic consumer AI applications give hazardous advice—suggesting flooded roads, destroyed bridges, or non-existent aid shelters.

## 4.2 Why Current Solutions Are Insufficient
- **Government Portals**: Depend on heavy web portals that fail under traffic spikes or network outages.
- **Consumer Navigation Apps**: Standard GPS apps route traffic onto major highways that may already be underwater or reserved for emergency response fleets.
- **Social Media Feeds**: Unstructured, unverified, and unvalidated information spreads panic without actionable spatial guidance.

## 4.3 Why MARG Must Exist
MARG v2 bridges the gap between chaotic ground realities and actionable, physically safe emergency response. It provides an **offline-first, verified operating surface** that guides citizens to safety while providing emergency agencies with a single, explainable ground-truth map.

---

# 5. User Personas

## 5.1 Persona 1: Citizen (Primary User)
- **Name**: Ananya Sharma (Resident trapped in flood zone)
- **Context**: Located in a suburban neighborhood experiencing rapid water rise; mobile data signal is flickering and 2G-only.
- **Goals**: Find the safest immediate pedestrian evacuation route to higher ground or a relief shelter; transmit an offline SOS beacon to nearby responders.
- **Pain Points**: Main roads flooded; zero visibility into which bridges are safe; phone battery draining rapidly; panic and conflicting rumors.
- **Expected System Interactions**:
  1. Opens lightweight MARG web app / PWA on mobile device.
  2. App loads local offline vector map instantly without network data.
  3. Views clear visual overlays of flooded hazard zones and safe relief shelters.
  4. Receives deterministic, verified step-by-step walking guidance avoiding active hazards.

## 5.2 Persona 2: Hospital Emergency Coordinator
- **Name**: Dr. Rajesh Kumar (Medical Superintendent, District Hospital)
- **Context**: Managing a 300-bed hospital operating on backup diesel generators; cold-chain blood bank temperature rising.
- **Goals**: Request urgent delivery of dry ice packs or reefer transport before 5,000 units of blood spoil; evacuate critical ICU patients.
- **Pain Points**: Phone lines jammed; unable to contact municipal logistics officers; unaware of which transport routes are open.
- **Expected System Interactions**:
  1. Taps "Request Emergency Cold-Chain Evacuation" on command interface.
  2. Interacts with Hospital Agent to declare precise supply deficits and spoilage countdown.
  3. Monitors AI swarm negotiation in real-time as Transport and NGO agents allocate drone waves.
  4. Inspects verified ETA and approves final logistics plan.

## 5.3 Persona 3: NGO Relief Lead
- **Name**: Sunita Deshmukh (Regional Director, Disaster Relief Foundation)
- **Context**: Operating a warehouse with 10 medical supply drones and 500 dry ice packs.
- **Goals**: Efficiently deploy supply drones and volunteer trucks to high-priority medical nodes without risking vehicle loss.
- **Pain Points**: Overwhelmed by duplicate relief requests; lack of visibility into real road conditions and drone payload limits.
- **Expected System Interactions**:
  1. Views centralized tactical map showing verified supply requests prioritized by urgency.
  2. Receives AI swarm proposals offering drone wave handoffs at intermediate relay waypoints.
  3. Validates payload capacity and approves automated dispatch instructions.

## 5.4 Persona 4: Police Department Traffic Lead
- **Name**: Inspector Vikram Singh (Traffic Command Unit)
- **Context**: Responsible for maintaining clear emergency corridors and blocking flooded arterial roads.
- **Goals**: Identify critical logistics routes chosen by response swarms and enforce green corridors for emergency trucks.
- **Pain Points**: Unaware of where emergency transport trucks are heading; static barricades block legitimate aid vehicles.
- **Expected System Interactions**:
  1. Views active green corridor polylines generated by the swarm plan.
  2. Inputs real-time road closure markers ("Bridge A-4 structurally compromised") directly onto the spatial canvas.

## 5.5 Persona 5: Fire & Rescue Service Lead
- **Name**: Chief Officer Arjun Nair (Fire & Hazard Response)
- **Context**: Responding to a chemical leak resulting from industrial inundation.
- **Goals**: Establish a 2km hazard isolation boundary and coordinate evacuation vectors with Search & Rescue.
- **Pain Points**: Difficulty broadcasting exclusion zones to civilians and other response agencies simultaneously.
- **Expected System Interactions**:
  1. Draws geofenced hazard isolation polygons on the map interface.
  2. System automatically recalculates citizen evacuation vectors around the newly designated hazard zone.

## 5.6 Persona 6: Government Authority / EOC Director
- **Name**: Lakshmi Prasanna (IAS, District Collector & EOC Lead)
- **Context**: Overall commander responsible for executive disaster response decisions and public safety briefings.
- **Goals**: Maintain situational awareness, identify systemic bottlenecks, and approve authoritative response master plans.
- **Pain Points**: Fragmented data feeds; fear of approving AI recommendations that could cause accidental casualties.
- **Expected System Interactions**:
  1. Reviews executive summary briefs generated by the Swarm Director.
  2. Inspects risk flags and physics validation reports.
  3. Executes single-click formal plan approval ("Review & Approve Plan").

## 5.7 Persona 7: Search & Rescue (NDRF / SDRF Team Lead)
- **Name**: Commander Sandeep Rane (NDRF Battalion Lead)
- **Context**: Field boat squad operating in deep flood waters.
- **Goals**: Receive precise GPS coordinates of civilian distress signals prioritized by water level rise rate.
- **Pain Points**: Wasting fuel and time navigating unverified distress calls; zero cellular connectivity in flooded river basins.
- **Expected System Interactions**:
  1. Uses offline-synced tablet to view clustered citizen distress beacons.
  2. Receives boat navigation vectors avoiding submerged power lines and debris.

---

# 6. Functional Requirements (MoSCoW Prioritization)

```
                       FUNCTIONAL REQUIREMENTS MOSCOW
                       
┌───────────────────────────────────┐    ┌───────────────────────────────────┐
│             MUST HAVE             │    │            SHOULD HAVE            │
│ • Offline Map & Guidance Engine   │    │ • Dynamic Web Research Scouting   │
│ • Citizen SOS & Location Beacon   │    │ • Multi-Provider LLM Fallbacks    │
│ • Symbolic Physics Validation     │    │ • Real-time WebSocket Sync        │
│ • Human Approval Control Gate     │    │ • CoT Reasoning Traces            │
└───────────────────────────────────┘    └───────────────────────────────────┘
┌───────────────────────────────────┐    ┌───────────────────────────────────┐
│            COULD HAVE             │    │           FUTURE IDEAS            │
│ • Crowdsourced Hazard Reporting   │    │ • Satellite Imagery Analysis      │
│ • P2P Bluetooth/Wi-Fi Mesh Sync   │    │ • Autonomous Drone Telemetry      │
│ • Automated Weather Ingestion     │    │ • Edge AI Hardware Transceivers   │
└───────────────────────────────────┘    └───────────────────────────────────┘
```

## 6.1 Must Have (P0 — Non-Negotiable for MVP)
- **FR-01**: **Offline Vector Map Rendering**: The system MUST render interactive maps, node markers, and hazard overlays without an active internet connection.
- **FR-02**: **Citizen Safety Guidance**: The system MUST provide citizens with pedestrian evacuation routing away from designated hazard polygons.
- **FR-03**: **Deterministic Physics Validation**: 100% of proposed routes, asset quantities, and travel times MUST be validated by a deterministic symbolic engine prior to user presentation.
- **FR-04**: **Model-Agnostic LLM Execution**: The cognitive engine MUST support swapping LLM providers (Cloud API vs Local Edge Model) via a unified interface.
- **FR-05**: **Human Approval Control Gate**: The system MUST require explicit human commander authorization before marking any multi-agent logistics plan as approved.
- **FR-06**: **Dynamic Region Selection**: The system MUST support selecting any state, district, or city across India rather than relying on hardcoded coordinates.

## 6.2 Should Have (P1 — High Value for Production)
- **FR-07**: **Web Search Scouting Seeding**: Automated discovery of regional infrastructure hubs (hospitals, shelters, depots) via web research APIs during initialization.
- **FR-08**: **Real-Time Database Synchronization**: Sub-200ms WebSocket updates pushing map polylines and agent logs across active client dashboards when online.
- **FR-09**: **Explainable Reasoning Traces**: Expandable UI components rendering step-by-step Chain-of-Thought (`internal_reasoning`) logs for transparency.
- **FR-10**: **Multi-Key API Rotation**: Automatic rotation across backup keys or alternative LLM vendors upon encountering HTTP 429 quota exhaustion.

## 6.3 Could Have (P2 — Desirable Enhancements)
- **FR-11**: **Crowdsourced Hazard Submissions**: Capability for citizens or field officers to mark localized hazards (e.g., fallen trees, waterlogged roads) directly on the operating surface.
- **FR-12**: **Automated Weather Advisory Ingestion**: Ingestion of active weather alerts (e.g. IMD flood warnings) to automatically adjust hazard polygon boundaries.
- **FR-13**: **Peer-to-Peer Mesh Sync**: Peer-to-peer data sync between local mobile devices via WebRTC / Bluetooth when cellular networks fail.

## 6.4 Future Ideas (P3 — Long-Term Research Vision)
- **FR-14**: **Satellite Imagery Pipeline**: Automatic ingestion of real-time synthetic aperture radar (SAR) satellite imagery to map flood boundaries.
- **FR-15**: **Direct Drone Telemetry Ingestion**: Automated flight pathing and battery telemetry sync with physical rescue drones.

---

# 7. Non-Functional Requirements (NFRs)

## 7.1 Availability
- **NFR-AVAIL-01**: Client-side offline capabilities MUST guarantee 100% availability for map viewing and local routing regardless of cloud status.
- **NFR-AVAIL-02**: Cloud gateway services MUST achieve 99.9% uptime when network infrastructure is operational.

## 7.2 Offline Capability
- **NFR-OFF-01**: Map tiles, vector road graphs, and core routing algorithms for a selected region MUST be cacheable locally for offline use.
- **NFR-OFF-02**: The application MUST detect network loss instantly and transition gracefully to local storage without crashing or clearing current state.

## 7.3 Reliability & Resilience
- **NFR-REL-01**: Single points of failure (e.g., a specific cloud LLM API outage) MUST NOT halt system operation; automated fallback mechanisms must activate within $< 500\text{ms}$.
- **NFR-REL-02**: Data writes to local or remote storage MUST be atomic to prevent state corruption during sudden device shutdowns.

## 7.4 Explainability
- **NFR-EXP-01**: All AI agent outputs MUST include explicit human-readable narrative explanations (`public_message`) and logical reasoning traces (`internal_reasoning`).
- **NFR-EXP-02**: Every rejected proposal MUST record an explicit, audit-ready error code detailing the exact rule violated (e.g., `PHYSICS_ETA_VIOLATION`).

## 7.5 Security
- **NFR-SEC-01**: Client bundles MUST contain zero private administrative keys, database credentials, or secret API tokens.
- **NFR-SEC-02**: Inbound API requests MUST be strictly validated via schema engines (Zod / Pydantic) to prevent payload injection attacks.

## 7.6 Performance
- **NFR-PERF-01**: Local offline routing calculation MUST return valid paths in $< 1.0$ second.
- **NFR-PERF-02**: Online real-time state synchronization via WebSockets MUST deliver UI updates within $< 200\text{ms}$ globally.

## 7.7 Scalability
- **NFR-SCA-01**: Client-side rendering MUST maintain 60 FPS performance when displaying up to 500 node markers and 50 hazard polygons simultaneously.
- **NFR-SCA-02**: Gateway architecture MUST scale horizontally across serverless instances to handle sudden regional traffic spikes.

## 7.8 Accessibility
- **NFR-ACC-01**: UI components MUST comply with WCAG 2.1 Level AA standards, featuring high-contrast tactical color modes for outdoor sunlight visibility.
- **NFR-ACC-02**: Touch targets on mobile interfaces MUST measure at least $48\times48\text{px}$ for ease of use by emergency responders wearing gloves.

## 7.9 Maintainability & Observability
- **NFR-MAINT-01**: Codebase architecture MUST adhere to clean monorepo separation (`frontend`, `backend-node`, `backend-python`) with modular subsystem interfaces.
- **NFR-OBS-01**: All system services MUST emit structured JSON logs (timestamp, log level, session ID, trace ID) for post-crisis analysis.

## 7.10 Privacy
- **NFR-PRIV-01**: Citizen SOS beacons MUST record minimal necessary location data and MUST NOT track user movements outside active emergency sessions.

---

# 8. Technology Research & Evaluation Matrix

In accordance with Phase 0 rules, technologies are NOT silently selected. Each domain evaluates multiple industry options across key criteria to establish objective tradeoffs.

---

## 8.1 Mapping & Spatial Engine Research

```
                          MAPPING TECHNOLOGY TRADE-OFFS
                          
┌───────────────────────────┐     ┌───────────────────────────┐     ┌───────────────────────────┐
│       GOOGLE MAPS         │     │       MAPLIBRE GL         │     │      OPENSTREETMAP        │
│ • Excellent online data   │     │ • Native vector tiles     │     │ • Open data ecosystem     │
│ • Zero offline capability │     │ • 100% Offline (PMTiles)  │     │ • Self-hostable routing   │
│ • Expensive commercial    │     │ • High performance WebGL  │     │ • Variable global detail  │
└───────────────────────────┘     └───────────────────────────┘     └───────────────────────────┘
```

### Option A: Google Maps Platform (JS API / Directions / Places)
- **Description**: Proprietary commercial mapping platform offering global imagery, geocoding, and routing APIs.
- **Pros**: Unmatched POI accuracy in India; turn-by-turn routing; high familiarity for users.
- **Cons**: Completely closed source; zero native offline caching; high API usage costs; vendor lock-in.
- **Cost**: High (\$2.00 to \$10.00+ per 1,000 API requests).
- **Offline Support**: **None** (Fails completely without internet).
- **Complexity**: Low (Simple JS SDK integration).
- **Scalability**: High (Handled by Google cloud infrastructure).
- **Suitability for MARG**: Moderate for online command centers; **Unsuitable** for offline citizen survival.
- **Recommendation**: Retain strictly as an optional online enhancement overlay.
- **Confidence**: High.

### Option B: MapLibre GL JS + PMTiles (Vector Tiles)
- **Description**: Open-source fork of Mapbox GL JS using WebGL, combined with PMTiles (single-file cloudless vector tile archive).
- **Pros**: 100% open source; native offline vector tile rendering from local storage or IndexedDB; customizable tactical dark themes; zero API costs.
- **Cons**: Requires pre-packaging regional tile archives for offline use; initial setup complexity.
- **Cost**: Zero (Free open-source).
- **Offline Support**: **Excellent** (Designed for serverless and offline vector rendering).
- **Complexity**: Medium.
- **Scalability**: Infinite (Client-side WebGL rendering).
- **Suitability for MARG**: **Exceptional** — aligns 100% with MARG Constitution Principle #3 (Offline capability).
- **Recommendation**: **Primary Recommendation for Client Operating Surface**.
- **Confidence**: High.

### Option C: OSRM (Open Source Routing Machine) / Valhalla
- **Description**: High-performance C++ open-source routing engines running over OpenStreetMap road network data.
- **Pros**: Fully self-hostable; fast pathfinding; can run locally via WebAssembly (Wasm) inside the browser or on local edge gateways.
- **Cons**: Requires hosting and memory allocation for regional road graph files.
- **Cost**: Zero (Self-hosted).
- **Offline Support**: **Excellent** (Can execute inside client browser via Wasm or local node).
- **Complexity**: High.
- **Scalability**: High.
- **Suitability for MARG**: **Exceptional** for offline, deterministic road graph routing.
- **Recommendation**: **Primary Recommendation for Offline Routing Gate**.
- **Confidence**: High.

---

## 8.2 Realtime Synchronization & Messaging Research

### Option A: Firebase Realtime Database (RTDB)
- **Description**: Managed cloud NoSQL database providing real-time WebSocket JSON synchronization.
- **Pros**: Extremely fast setup; battle-tested `onValue` subscription model; low latency ($< 200\text{ms}$).
- **Cons**: Closed cloud service; single point of failure if Google services collapse; no local multi-device sync without cloud.
- **Cost**: Low to Medium (Tiered usage).
- **Offline Support**: Partial (Client SDK caches recent reads, but cannot sync between local devices offline).
- **Complexity**: Low.
- **Scalability**: High.
- **Suitability for MARG**: Good for online command center sync; inadequate for blackout situations.
- **Recommendation**: Use as online cloud sync layer; require offline fallback.
- **Confidence**: High.

### Option B: Conflict-Free Replicated Data Types (CRDTs — Yjs / Automerge)
- **Description**: Data structures that allow distributed local states to be updated independently and merged deterministically without a central server.
- **Pros**: 100% offline-compatible; syncs seamlessly over any transport (WebRTC, Bluetooth, Local Wi-Fi, WebSockets); zero merge conflicts.
- **Cons**: Higher conceptual complexity; state size can grow if history is unpruned.
- **Cost**: Zero.
- **Offline Support**: **Exceptional** (Native peer-to-peer sync).
- **Complexity**: High.
- **Scalability**: High for distributed mesh networks.
- **Suitability for MARG**: Ideal for offline citizen-to-citizen and responder-to-responder mesh sync.
- **Recommendation**: Primary target for Phase 2 offline mesh synchronization.
- **Confidence**: Medium.

---

## 8.3 Offline Storage Engine Research

### Option A: IndexedDB + Dexie.js
- **Description**: Low-level browser key-value database wrapped in a clean, promise-based API (Dexie.js).
- **Pros**: Supported natively in 99.9% of browsers; stores gigabytes of vector tiles, offline map packages, and local crisis state.
- **Cons**: Single-origin storage boundary; requires careful schema migration handling.
- **Cost**: Zero.
- **Offline Support**: **Native / Excellent**.
- **Complexity**: Low to Medium.
- **Scalability**: High (Client-side browser storage).
- **Suitability for MARG**: **Exceptional** for browser-based offline data persistence.
- **Recommendation**: **Primary Recommendation for Web Client Local Storage**.
- **Confidence**: High.

### Option B: SQLite (Wasm / Native)
- **Description**: Embedded relational database running natively in mobile apps or compiled to WebAssembly (Wasm) for browsers.
- **Pros**: Full SQL query capabilities; robust transaction safety; portable single-file database.
- **Cons**: Higher WASM bundle size overhead in web browsers.
- **Cost**: Zero.
- **Offline Support**: **Native / Excellent**.
- **Complexity**: Medium.
- **Scalability**: High.
- **Suitability for MARG**: Ideal for native mobile apps or edge gateway servers.
- **Recommendation**: Recommended for native mobile and edge deployments.
- **Confidence**: High.

---

## 8.4 Cognitive LLM & AI Engine Research

```
                          LLM ENGINE LANDSCAPE
                          
┌───────────────────────────┐     ┌───────────────────────────┐     ┌───────────────────────────┐
│    CLOUD LLM (GEMINI)     │     │     GROQ (LLAMA-3.3)      │     │    OLLAMA / WEBLLM        │
│ • State-of-the-art reasoning│ • Sub-second generation   │ • 100% Offline execution  │
│ • Search grounding tools  │ • Open model ecosystem    │ • Zero API costs          │
│ • Requires cloud internet │ • Requires cloud internet │ • Hardware dependent      │
└───────────────────────────┘     └───────────────────────────┘     └───────────────────────────┘
```

### Option A: Google Gemini 2.0 Flash / Pro
- **Description**: Flagship multimodal cloud LLM API with native web search grounding tools.
- **Pros**: State-of-the-art reasoning; native Search Grounding for dynamic research seeding; fast token generation.
- **Cons**: Cloud dependency; API rate limits (HTTP 429); recurring usage cost.
- **Cost**: Medium.
- **Offline Support**: **None**.
- **Complexity**: Low.
- **Scalability**: High.
- **Suitability for MARG**: Excellent for online research scouting and command center synthesis.
- **Recommendation**: Retain as primary cloud neural model for online mode.
- **Confidence**: High.

### Option B: Groq API (Llama-3.3 70B / Mixtral)
- **Description**: High-speed LPU inference engine providing sub-second open-weights LLM generation.
- **Pros**: Extreme token speed ($> 500\text{ tokens/sec}$); low latency; cost-effective.
- **Cons**: Cloud dependency; lacks built-in search grounding tools.
- **Cost**: Very Low.
- **Offline Support**: **None**.
- **Complexity**: Low.
- **Scalability**: High.
- **Suitability for MARG**: Excellent for fast multi-agent round negotiations.
- **Recommendation**: Primary cloud fallback for rapid agent negotiations.
- **Confidence**: High.

### Option C: Ollama / llama.cpp / WebLLM (Local Edge Inference)
- **Description**: Local LLM execution engines running models (e.g. Llama-3 8B, Qwen-2.5 7B) directly on edge servers or local client hardware via WebGPU.
- **Pros**: **100% Offline execution**; zero API cost; total data privacy; zero vulnerability to cloud collapse.
- **Cons**: Requires modern GPU / Apple Silicon hardware on local device for optimal speed; higher initial download bundle size.
- **Cost**: Zero.
- **Offline Support**: **Exceptional / Native**.
- **Complexity**: Medium to High.
- **Scalability**: Distributed client-side scaling.
- **Suitability for MARG**: **Essential** for Principle #3 (Offline Capability) in blackout scenarios.
- **Recommendation**: **Primary Recommendation for Offline Local AI Reasoning**.
- **Confidence**: High.

---

## 8.5 Summary Recommendation Matrix

| Domain | Online Production Recommendation | Offline / Blackout Recommendation | Confidence |
| :--- | :--- | :--- | :--- |
| **Map Rendering** | MapLibre GL JS + Vector Tiles | MapLibre GL + Local PMTiles Package | **High** |
| **Routing Gate** | OSRM / Valhalla + Google Maps API | OSRM (Wasm / Edge Container) | **High** |
| **Realtime Sync** | Firebase RTDB / WebSockets | CRDTs (Yjs) over P2P / Local Network | **Medium** |
| **Offline Storage** | Dexie.js (IndexedDB) | Dexie.js (IndexedDB) + Local Filesystem | **High** |
| **LLM Inference** | Gemini 2.0 Flash + Groq | Ollama / llama.cpp (Local Edge) | **High** |

---

# 9. Comprehensive Risk Registry

```
                                 RISK MATRIX
                                 
       High │  [R-OFF] Offline Blackout   [R-API] Cloud API Outage
            │  [R-ETH] Citizen Harm Risk  [R-LLM] Hallucinated Guidance
    IMPACT  │
            │  [R-DEP] Vercel Serverless  [R-DAT] Stale Web Research
        Low │  [R-PER] Mobile Performance
            └──────────────────────────────────────────────────
               Low                       High
                               LIKELIHOOD
```

## 9.1 Technical Risks
- **R-TECH-01: Network Blackout Stalling System**: Complete collapse of regional cell towers prevents cloud API access.
  - *Mitigation*: Architect client with local vector tiles, local IndexedDB storage, and Wasm/Ollama offline routing.
- **R-TECH-02: LLM API Rate Limiting (HTTP 429)**: Cloud LLM providers block API calls during high-concurrency crisis events.
  - *Mitigation*: Deploy multi-key rotation and multi-provider failover cascades (Gemini $\rightarrow$ Groq $\rightarrow$ Ollama).

## 9.2 Product & Operational Risks
- **R-PROD-01: Low Adoption by Citizens During Panic**: Complex UI deters citizens in high-stress situations.
  - *Mitigation*: Design ultra-simple, high-contrast, one-tap citizen evacuation screens.
- **R-OPS-01: Stale Ground Research**: Research Agent ingests outdated news articles leading to incorrect hazard mapping.
  - *Mitigation*: Mandatory validation of all research data by the deterministic physics engine prior to state commit.

## 9.3 Ethical & AI Safety Risks
- **R-ETH-01: Misrouting Into Active Hazard**: AI agent hallucinates an open road that is actually flooded, risking civilian lives.
  - *Mitigation*: Strict enforcement of Principle #6—no route is ever presented without passing through the deterministic road polyline and hazard intersection gate.
- **R-ETH-02: Resource Favoritism**: Multi-agent negotiation prioritizes wealthy districts over vulnerable communities.
  - *Mitigation*: Hardcode objective medical urgency and time-to-spoilage metrics into agent reward functions, prohibiting non-verified priority overrides.

---

# 10. Open Questions & Architectural Ambiguities

In accordance with Phase 0 rules, unresolved architectural decisions are explicitly recorded with options, tradeoffs, preliminary recommendations, and confidence ratings. **DO NOT GUESS OR INVENT FINAL ANSWERS PREMATURELY.**

---

## Question 1: How should offline vector map tiles be distributed to citizens before/during a blackout?
- **Why It Matters**: MapLibre GL requires vector tile archives (PMTiles) to render maps offline. If a citizen opens the app *after* cellular networks have failed, they cannot download a 50MB map package.
- **Options**:
  - *Option 1*: Progressive PWA background caching that pre-downloads low-zoom state maps upon initial web installation.
  - *Option 2*: Micro-regional tile packages (single district, $< 10\text{MB}$) generated dynamically during early disaster warnings.
  - *Option 3*: Relying on native browser cache and fallback simple vector schematics when tiles are missing.
- **Tradeoffs**: Option 1 uses more storage upfront; Option 2 requires predictive disaster alerting; Option 3 sacrifices visual map quality.
- **Preliminary Recommendation**: **Option 1 + Option 2 hybrid** (PWA pre-caches state-level overview; micro-district package downloads on emergency initialization).
- **Confidence Rating**: **Medium**.

---

## Question 2: Should local offline AI models run directly in the browser (WebGPU/WebLLM) or on local edge gateway hardware (Ollama)?
- **Why It Matters**: Running LLMs inside mobile browser WebGPU saves hardware costs but drains phone batteries rapidly and fails on older smartphones. Edge gateway hardware (e.g. laptop/Raspberry Pi at a local relief shelter) provides higher performance but requires proximity.
- **Options**:
  - *Option 1*: In-browser WebLLM (Client WebGPU execution).
  - *Option 2*: Edge Gateway Ollama instance broadcasting over local shelter Wi-Fi.
  - *Option 3*: Deterministic rule-based fallback without LLM inference when offline.
- **Tradeoffs**: Option 1 gives client autonomy but suffers hardware constraints; Option 2 offers performance but requires shelter connectivity; Option 3 guarantees 100% execution speed but loses natural agent negotiation capabilities.
- **Preliminary Recommendation**: **Option 2 (Edge Gateway) + Option 3 (Deterministic Rules) fallback**.
- **Confidence Rating**: **Medium**.

---

## Question 3: What is the authoritative open routing engine for offline physics validation?
- **Why It Matters**: Replacing static `NODE_DISTANCES` requires an offline-capable routing engine that can run both in cloud containers and local environments.
- **Options**:
  - *Option 1*: OSRM (Open Source Routing Machine) hosted in Docker container / WebAssembly.
  - *Option 2*: Valhalla (Flexible routing engine with dynamic hazard costing).
  - *Option 3*: Custom lightweight Haversine path segmenter with spatial hazard penalty bounds.
- **Tradeoffs**: Valhalla supports dynamic edge weighting (flooded road speed penalties) natively, but has a higher memory footprint than OSRM.
- **Preliminary Recommendation**: **Valhalla for backend/edge deployments** due to native dynamic hazard penalty costing.
- **Confidence Rating**: **High**.

---

## Question 4: How should citizen distress signals (SOS) be prioritized when emergency services are overwhelmed?
- **Why It Matters**: If 10,000 citizens send SOS signals simultaneously, responders need objective triage without human bias or AI hallucination.
- **Options**:
  - *Option 1*: Medical & Water Level Triage Matrix (Inputs: reported water depth, medical vulnerability, battery level).
  - *Option 2*: First-In-First-Out (FIFO) queue.
  - *Option 3*: Geographic density clustering (prioritizing groups over isolated individuals).
- **Tradeoffs**: Option 1 optimizes survival rates but requires accurate input data; Option 3 maximizes rescue velocity.
- **Preliminary Recommendation**: **Option 1 + Option 3 hybrid** (Clustered medical urgency scoring).
- **Confidence Rating**: **High**.

---

# 11. Recommended Next Steps (Phase 1 Decision Roadmap)

To proceed from Discovery (Phase 0) to Systems Architecture (Phase 1), the lead architecture team should resolve open questions in the following strict sequential order:

```
                          PHASE 1 DECISION ROADMAP
                          
[Step 1: Map Tile Strategy] ──► [Step 2: Routing Engine Selection]
                                               │
                                               ▼
[Step 4: Offline Client Architecture] ◄── [Step 3: LLM Provider Interfaces]
```

1. **Decision Step 1: Offline Map Tile Packaging Strategy**: Finalize PMTiles storage format, district tile boundary sizing, and PWA caching budgets.
2. **Decision Step 2: Routing Engine Selection & Benchmark**: Benchmark Valhalla vs OSRM for dynamic hazard penalty routing and WebAssembly compilation viability.
3. **Decision Step 3: Provider-Agnostic LLM Interface Specs**: Finalize the abstract interface design (`LLMProviderInterface`) for seamless switching between Gemini, Groq, and local Ollama nodes.
4. **Decision Step 4: Citizen UI/UX & Offline Client Architecture**: Draft wireframes for the Citizen Evacuation Screen and offline state persistence layer using MapLibre GL and Dexie.js.

---

# 12. Phase 0 Sign-Off Summary

## 12.1 What Is Now Known & Established
- **Core Mission**: MARG v2 is a **Citizen-First Emergency Operating System** prioritizing civilian survival before institutional coordination.
- **Non-Negotiable Constitution**: 12 fundamental principles established, highlighting citizen safety, offline capability, model-agnosticism, and zero-hallucination symbolic verification.
- **Prototype Status**: The existing hackathon codebase is audited and acknowledged as an online proof-of-concept; its static limitations will not restrict MARG v2's production architecture.
- **Technology Strategy**: Evaluated clear candidates for Maps (MapLibre GL + PMTiles), Offline Storage (Dexie.js), Routing (Valhalla/OSRM), Realtime (Firebase / CRDTs), and LLMs (Gemini / Groq / Ollama).

## 12.2 What Remains Unknown & Intentionally Postponed
- Exact WebAssembly compilation performance of Valhalla routing in browser environments.
- Peer-to-peer mesh sync protocol details (WebRTC vs Bluetooth Low Energy) for zero-infrastructure offline communication.
- Final satellite imagery ingestion formats for automated flood boundary detection.

---
*End of Phase 0 Discovery Document (`docs/10_DISCOVERY/PHASE0.md`). No software architecture designed or code generated.*
