# UI/UX & Tactical Command Dashboard Architecture — MARG v2

## Document Metadata
- **Document Title**: UI_UX.md
- **System**: MARG v2 Client Interface
- **Status**: Production UI/UX Specification

---

## 1. Tactical Command Dashboard Wireframes

### Screen 1: Regional Crisis Initialization Screen
```
+-------------------------------------------------------------------------+
|                        M.A.R.G. COMMAND CENTER                          |
|                 National Crisis Intelligence Platform                   |
+-------------------------------------------------------------------------+
|                                                                         |
| 1. Select State:              [ Select State (e.g., Assam)            v]|
|                                                                         |
| 2. Select District / City:    [ Select City  (e.g., Guwahati)         v]|
|                                                                         |
| 3. Crisis Description:        +---------------------------------------+ |
|                               | Brahmaputra river overflowed after    | |
|                               | cloudburst. Cold-chain storage at     | |
|                               | Khanapara on backup power (2h left).  | |
|                               +---------------------------------------+ |
|                                                                         |
| [ ⚡ INITIALIZE NATIONAL CRISIS COORDINATION ]                          |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Screen 2: Tactical Multi-Agent Swarm Dashboard
```
+-------------------------------------------------------------------------+
| M.A.R.G. | Multi-Agent Routing & Guidance        Time Left: [ 02:59:00 ]|
+-----------------------------------++------------------------------------+
| SWARM COMMAND                     || GUWAHATI, ASSAM - SATELLITE MAP    |
| [ ▶ Run Next Agent Round ]        ||                                    |
| [ ↺ Reset Simulation     ]        ||      (H) GMCH Hospital             |
|                                   ||       |                            |
| SWARM INTEL FEED                  ||       +--- [Polyline Drone Route]  |
| 🏥 HOSPITAL COORDINATOR   (R1)    ||       |                            |
| Critical spoilage in 180 mins.    ||      (D) Khanapara Depot           |
| [▼ AI Reasoning]                  ||                                    |
| --------------------------------- || [ Hazard Polygon: Brahmaputra Flood] |
| 🚚 TRANSPORT AGENT        (R1)    |+------------------------------------+
| Trucks delayed by 15km/h floods.  || CONSENSUS PLAN                     |
| --------------------------------- || 🚁 DRONE: Depot -> Hospital        |
| 👁 SWARM DIRECTOR          (R3)    ||    100 units · ETA 11m             |
| Executive Plan: Evacuate via drone|| [ 🧑‍✈️ Review & Approve Plan ]       |
+-----------------------------------++------------------------------------+
```

---

## 2. React Component Hierarchy

```
App.jsx (Master Layout & Firebase RTDB WebSocket Subscriber)
 ├── Header.jsx (App Branding & CountdownTimer)
 │    └── CountdownTimer.jsx (HH:MM:SS Visual Urgency Display)
 ├── LeftSidebar.jsx (Control & Intel Panel Container)
 │    ├── ControlPanel.jsx (State/City Select, Trigger & Reset Controls)
 │    └── AgentChat.jsx (Color-Coded Message Feed & CoT Trays)
 │         └── AgentMessage.jsx (Individual Message Card with Debug Toggle)
 └── RightMain.jsx (Map & Consensus Panel Container)
      ├── MapView.jsx (Google Maps Canvas, Markers, Polygons, Polylines)
      └── DecisionPanel.jsx (Consensus Transport Steps & Human Approval Gate)
```

---

## 3. Visual Color-Coding System

| Agent / Component | Color Palette | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Hospital Coordinator** | Deep Crimson | `#C62828` | Urgency, medical demands, critical needs |
| **Transport Agent** | Safety Amber | `#E65100` | Logistics, truck routing, fleet status |
| **NGO Response** | Forest Green | `#2E7D32` | Relief supplies, drone waves, dry ice |
| **Swarm Director** | Tactical Blue | `#1565C0` | Executive synthesis, consensus plans |
| **Hazard Overlay** | Pulse Red | `#FF1744` | Flooded zones, active fires, bridge blocks |
| **Aerial Drone Line** | Electric Blue | `#2196F3` | Active & final drone transport routes |
| **Ground Truck Line** | Vivid Orange | `#E65100` | Active & final truck transport routes |

---

## 4. Document Cross-References
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for frontend component layout.
- See [MAP_ENGINE.md](MAP_ENGINE.md) for Google Maps layer rendering.
