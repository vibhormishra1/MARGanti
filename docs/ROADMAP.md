# Product & Technical Roadmap — MARG v2

## Document Metadata
- **Document Title**: ROADMAP.md
- **System**: MARG v2 Product Lifecycle
- **Status**: Strategic Blueprint

---

## 1. Development Phase Timeline

```
       MARG v1.0                     MARG v2.0                     MARG v3.0
  Hackathon Prototype          National Crisis Platform       Autonomous Disaster Mesh
  (Maharashtra Only)           (Any City in India)            (Offline Edge Mesh)
  ───────┬─────────────────────────────┬─────────────────────────────┬───────
         │                             │                             │
    [ Q3 2026 ]                   [ Q4 2026 ]                   [ Q2 2027 ]
```

---

## 2. Phase Release Matrix

| Version | Phase | Key Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **v1.0** | **Prototype Base** | Single hardcoded Maharashtra cyclone scenario, static 14-pair physics matrix, fixed React map canvas, step-by-step UI buttons. | **Completed** |
| **v2.0** | **National Platform** | Dynamic Indian State/City dropdowns, Google Search Grounding scouting, Google Maps Directions API polylines, model-agnostic LLM interface, Vercel monorepo deployment. | **Active Target** |
| **v3.0** | **Disaster Mesh** | Air-gapped edge deployments (Ollama), real-time Internet of Things (IoT) sensor feeds, drone fleet telemetry, multi-district crisis coordination swarms. | **Future Design** |

---

## 3. Milestones & Deliverables Breakdown

### Milestone 1: Dynamic Seeding & Spatial Verification (Q4 2026)
- [x] Complete reverse-engineering architecture documentation (`docs/`).
- [ ] Implement `POST /api/v2/simulation/initialize` with Google Search Grounding.
- [ ] Integrate Google Maps Directions API for dynamic polyline generation.

### Milestone 2: Model-Agnostic Engine & Provider Fallbacks (Q1 2027)
- [ ] Implement `LLMProviderInterface` supporting Gemini, Groq, OpenAI, and Anthropic.
- [ ] Deploy multi-key rotation and automatic HTTP 429 failovers.

### Milestone 3: Production Storage & Command Center UI (Q2 2027)
- [ ] Migrate rate limiting and session caching to Redis Cloud.
- [ ] Integrate Postgres relational archive for simulation replay benchmarking.
- [ ] Deploy full Command Center UI to Vercel production environment.

---

## 4. Document Cross-References
- See [PROJECT_VISION.md](PROJECT_VISION.md) for long-term vision.
- See [PRD.md](PRD.md) for feature specifications.
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment models.
