# Business Requirements Document (BRD) — MARG v2

## Document Metadata
- **Project Name**: MARG v2: National Crisis Intelligence Engine
- **Document Version**: 2.0.0
- **Status**: Approved Architectural Directive
- **Target Audience**: Executive Stakeholders, Government Agencies, Open-Source Lead Architects

---

## 1. Executive Summary & Vision

Emergency logistics coordination in India during major climate disasters (cyclones, urban floods, flash flooding, landslides) suffers from critical delays, fragmented communication, and manual decision-making bottlenecks.

**MARG v2 (Multi-Agent Routing and Guidance)** transforms emergency management by introducing an autonomous, neurosymbolic AI coordinator. By fusing neural web research with symbolic physics verification, MARG v2 delivers zero-hallucination, physically executable crisis logistics plans within seconds.

```
                      STAKEHOLDER ENGAGEMENT MODEL
                      
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│   NATIONAL / STATE      │     │    FIRST RESPONDERS     │     │    OPEN-SOURCE AI       │
│   DISASTER AUTHORITIES  │     │   & NGO LOGISTICS       │     │    COMMUNITY            │
│   (NDMA / SDMA EOCs)    │     │   (Red Cross, NDRF)     │     │    (Developers, Res.)   │
└────────────┬────────────┘     └────────────┬────────────┘     └────────────┬────────────┘
             │                               │                               │
             └───────────────────────┬───────┴───────────────────────────────┘
                                     ▼
                      ┌──────────────────────────────┐
                      │    MARG v2 PLATFORM CORE     │
                      └──────────────────────────────┘
```

---

## 2. Key Stakeholders & Target Audience

1. **National & State Disaster Management Authorities (NDMA / SDMA)**: Emergency Operations Center (EOC) directors requiring top-level crisis visibility, risk identification, and human approval controls.
2. **First Responder Agencies (NDRF / SDRF)**: Ground tactical teams requiring accurate road navigation, bridge safety status, and waypoint ETA tracking.
3. **Non-Governmental Organizations (NGOs & International Aid)**: Relief teams deploying auxiliary medical supplies, dry ice, solar power packs, and drone waves.
4. **Open-Source Developer & AI Research Community**: Global contributors extending MARG's model-agnostic provider interface and dynamic spatial physics gates.

---

## 3. Core Business Objectives

| Objective ID | Business Objective | Target Metric | Business Impact |
| :--- | :--- | :--- | :--- |
| **OBJ-01** | Rapid Response Seeding | $< 10$ seconds | Replaces hours of manual disaster mapping with instant web-grounded infrastructure seeding. |
| **OBJ-02** | Zero Logistics Hallucinations | $100\%$ Symbolic Accuracy | Prevents dispatching supply vehicles to blocked roads or non-existent routes. |
| **OBJ-03** | Cost-Efficient AI Operations | $< \$0.05$ per session | Leverages model-agnostic routing to run lightweight LLMs (Groq / Ollama) alongside flagship APIs (Gemini / OpenAI). |
| **OBJ-04** | Sub-Second Real-Time Sync | $< 200\text{ms}$ UI latency | Keeps field units continuously synchronized with command center updates. |

---

## 4. Scope Boundaries

```
┌──────────────────────────────────────────────┐
│                  IN SCOPE                    │
├──────────────────────────────────────────────┤
│ • Dynamic State/City Crisis Seeding (India)  │
│ • Web Grounded Infrastructure Scouting       │
│ • Multi-Agent CoT Negotiation                │
│ • Real Road Graph Physics Verification       │
│ • Firebase Realtime Database UI Push         │
│ • Human-in-the-Loop Approval Dashboard       │
└──────────────────────────────────────────────┘
                       ▲
                       │
┌──────────────────────┴───────────────────────┐
│                 OUT OF SCOPE                 │
├──────────────────────────────────────────────┤
│ • Autonomous Vehicle Dispatch Control        │
│ • Direct Patient Medical Triage Software     │
│ • Classified Military Defense Networks       │
│ • Physical Hardware Sensor Manufacturing     │
└──────────────────────────────────────────────┘
```

---

## 5. Operational Constraints & Risk Management

### Operational Constraints
- **Intermittent Connectivity**: Regional disasters often damage cellular towers; local edge nodes (Ollama) must be supported for offline operations.
- **API Rate Limits**: High-frequency LLM calls during emergencies risk hitting rate limits; multi-key rotation and multi-provider failovers are mandatory.

### Risk & Mitigation Matrix

| Risk Factor | Threat Level | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **LLM Provider Outage** | High | System stalling during active crisis | Automatic failover to secondary provider (e.g. Gemini $\rightarrow$ Groq $\rightarrow$ Ollama local). |
| **Google Maps API Quota** | Medium | Loss of real-time polyline validation | Fallback to local Haversine distance engine with spatial hazard penalty buffers. |
| **Stale Web Search Data** | Medium | Incorrect infrastructure status | Require explicit time-bound queries and dynamic validation by Physics Gate. |

---

## 6. Key Performance Indicators (KPIs)

- **Time-to-Plan Convergence**: Average time required to reach validated multi-agent consensus ($< 45\text{s}$).
- **Human Approval Rate**: Percentage of AI-generated consensus plans approved by commanders without manual modifications ($> 85\%$).
- **API Cost per Disaster Session**: Total LLM token and mapping API cost per complete simulation ($< \$0.05$).

---

## 7. Future Deployment & Commercial Opportunities
- **Government SaaS & On-Premises EOC Deployments**: Custom air-gapped deployments for State Disaster Management Authorities.
- **Enterprise Supply Chain Resiliency**: Extending MARG's neurosymbolic routing engine to commercial cold-chain logistics and pharmaceutical supply chains.

---

## 8. Document Cross-References
- See [PROJECT_VISION.md](PROJECT_VISION.md) for long-term project vision.
- See [PRD.md](PRD.md) for product feature breakdowns.
- See [DEPLOYMENT.md](DEPLOYMENT.md) for infrastructure and hosting models.
