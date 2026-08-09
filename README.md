# MARG v2 (Multi-Agent Routing and Guidance)

Citizen-First Emergency Operating System.

## Architecture
- **Tier 0**: Offline Core (Local storage, offline maps)
- **Tier 1**: Synchronization (Mesh/Cloud sync)
- **Tier 2**: Cloud Services (Supabase, Auth)

## Tech Stack
- Monorepo: pnpm workspaces, Turborepo
- Frontend: Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui
- Backend: FastAPI, Python 3.13, uv
- Database: IndexedDB (local), Supabase (cloud)
- Maps: MapLibre GL JS

## Bootstrapping the Workspace

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Python >= 3.13
- uv >= 0.1.0

### Setup Instructions

1. Install JavaScript workspace dependencies:
   ```bash
   pnpm install
   ```

2. Generate API SDK schemas (if applicable):
   ```bash
   pnpm codegen
   ```

3. Start all development servers:
   ```bash
   pnpm dev
   ```

### Repository Structure
- `apps/web`: Next.js frontend application
- `apps/api`: FastAPI backend service
- `packages/domain`: Shared business rules (TypeScript)
- `packages/ui`: Shared React components
- `packages/api-sdk`: Generated OpenAPI TypeScript SDK
- `packages/storage-local`: Tier 0 offline storage
- `packages/map-offline`: Tier 0 offline maps
- `packages/cloud-adapter`: Tier 2 cloud services
- `packages/config-*`: Shared configurations (TS, Python, Tailwind)
