# Production Deployment & Infrastructure Strategy — MARG v2

## Document Metadata
- **Document Title**: DEPLOYMENT.md
- **System**: MARG v2 Infrastructure
- **Status**: Production Deployment Architecture

---

## 1. Monorepo Production Deployment Strategy

MARG v2 supports two deployment topologies:
1. **Serverless Monorepo (Vercel Preferred)**: Unified deployment of React SPA static CDN, Node serverless functions (`/api/*`), and Python serverless functions (`/simulate/*`).
2. **Containerized Microservices (Docker & Cloud Run / K8s)**: Dedicated containers for high-throughput enterprise emergency operations centers.

```mermaid
graph TD
    subgraph Vercel_Platform ["Vercel Unified Monorepo Platform"]
        CDN["Vercel Global Edge CDN (React SPA)"]
        NodeLambda["Node.js Serverless Function (/api/*)"]
        PythonLambda["Python Serverless Function (/simulate/*)"]
    end

    subgraph External_Cloud ["Managed Cloud Resources"]
        FirebaseRTDB[("Firebase Realtime DB")]
        RedisCloud[("Redis Cloud Cache")]
        NeonPostgres[("Neon Managed Postgres")]
    end

    CDN -- "Client State Sync" <==> FirebaseRTDB
    NodeLambda -- "State Writes" --> FirebaseRTDB
    NodeLambda -- "Internal HTTP" --> PythonLambda
    PythonLambda --> RedisCloud
    PythonLambda --> NeonPostgres
```

---

## 2. Serverless Function Adapters (`vercel.json`)

To run Node Express and Python FastAPI on Vercel without continuous daemon processes:

### Root `vercel.json` Specification
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend-node/api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "backend-python/api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend-node/api/index.js" },
    { "src": "/simulate/(.*)", "dest": "backend-python/api/index.py" },
    { "src": "/(.*)", "dest": "frontend/$1" }
  ]
}
```

---

## 3. Environment Variables & Secret Key Management

| Environment Variable | Service Layer | Description | Security Level |
| :--- | :--- | :--- | :--- |
| `VITE_NODE_BASE_URL` | Frontend | URL of Node Gateway API | Public Client |
| `VITE_GOOGLE_MAPS_KEY` | Frontend | Google Maps JavaScript API Key | Public Client (Domain Restricted) |
| `VITE_FIREBASE_*` | Frontend | Firebase Public Web SDK Config | Public Client |
| `FIREBASE_DATABASE_URL`| Node Gateway | Firebase RTDB Realtime URL | Secret Server |
| `FIREBASE_SERVICE_ACCOUNT_JSON`| Node Gateway | Stringified Service Account JSON (`\n` formatted) | Critical Secret |
| `PYTHON_BASE_URL` | Node Gateway | Internal URL of Python Engine | Secret Server |
| `GEMINI_API_KEY` | Python Engine | Comma-separated Gemini API keys for rotation | Critical Secret |
| `GROQ_API_KEY` | Python Engine | Secondary LLM provider API key | Critical Secret |
| `DATABASE_URL` | Python Engine | Postgres Connection String | Critical Secret |
| `REDIS_URL` | Python Engine | Redis Cache Connection String | Critical Secret |

---

## 4. CI/CD Automated Build & Test Pipeline

```
  Git Push (main) ──► GitHub Actions Workflow
                             │
                             ├─► 1. Run Node & Python Unit Tests
                             ├─► 2. Validate Zod & Pydantic Schemas
                             ├─► 3. Execute Physics Gate Mock Test
                             │
                             ▼
                    [ Vercel Auto Deploy ]
```

---

## 5. Document Cross-References
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for architecture layout.
- See [TESTING.md](TESTING.md) for CI/CD test verification.
