# VerifAI - Official Repository Structure

> **Lead Software Architect & Engineering Manager Note:**
> This document defines the exact GitHub repository and folder structure for VerifAI. By establishing these boundaries now, we ensure that the codebase remains navigable, scalable, and modular as the team grows. This structure adheres to the previously locked Technology Decision Record (TDR) and System Architecture.

---

## 1. Repository Strategy

- **Strategy:** Monorepo (via `pnpm` workspaces / Turborepo).
- **Justification:** VerifAI relies heavily on shared data types (e.g., `VerificationRecord`) between the backend API and the frontend dashboard. A monorepo ensures that if a backend developer alters a database model, the frontend build will immediately fail if the types are incompatible. This single-source-of-truth approach drastically reduces integration bugs and is highly efficient for a solo founder MVP scaling into a larger team.

---

## 2. Root Directory Structure

```text
verifai-monorepo/
├── .github/          # GitHub Actions workflows and PR templates
├── apps/             # Contains the main deployable applications
├── packages/         # Shared code, types, and configurations
├── infrastructure/   # IaC (Infrastructure as Code) scripts
├── docker/           # Shared Docker configurations
├── docs/             # Official project documentation (PRD, TDR, etc.)
├── scripts/          # Workspace-level utility scripts
├── assets/           # Global static assets (e.g., Brand logos)
├── .env.example      # Root environment variable template
├── package.json      # Workspace configuration and global dependencies
├── pnpm-workspace.yaml # Defines the monorepo packages
└── turbo.json        # Turborepo build pipeline configuration
```

**Purpose of Root Folders:**
- **`apps/`**: Holds the independent applications (Frontend, Backend) that get deployed to production.
- **`packages/`**: Holds internal libraries (TypeScript types, ESLint configs) imported by the apps.
- **`infrastructure/`**: Holds Terraform or Pulumi scripts if used; otherwise, deployment scripts for Railway/Supabase.
- **`scripts/`**: CI/CD helpers, global database seed scripts, or monorepo cleanup scripts.
- **`assets/`**: High-res logos and design system exports that don't belong strictly to one app.

---

## 3. Backend Folder Structure (`apps/backend/`)

*Built with Node.js + Express/NestJS principles.*

```text
apps/backend/
├── src/
│   ├── api/          # Route handlers (Controllers) organized by feature
│   │   ├── auth/
│   │   ├── documents/
│   │   └── webhooks/
│   ├── core/         # Core business logic and Services
│   │   ├── ai/       # Gemini/OpenAI integration
│   │   ├── hedera/   # HCS message submission and Hashgraph SDK
│   │   └── crypto/   # SHA-256 hashing utilities
│   ├── database/     # Prisma client, migrations, and seeders
│   ├── jobs/         # Background queue workers (BullMQ)
│   ├── middleware/   # Express middleware (Auth, Rate Limiting, Error Handling)
│   ├── config/       # Environment variable validation (Zod schemas)
│   └── utils/        # Generic helper functions (e.g., date formatting)
├── tests/            # Integration and E2E tests (Vitest/Supertest)
├── Dockerfile        # Backend-specific Dockerfile
├── package.json      
└── tsconfig.json     
```

**Explanation:**
- **`api/` vs `core/`**: Controllers (`api/`) only handle HTTP requests/responses. They immediately pass data to Services (`core/`) which contain the actual business logic. This separation allows the background `jobs/` to call the same `core/` functions without needing an HTTP request.
- **`jobs/`**: Crucial for VerifAI. Handles the async queues for AI extraction and Hedera consensus waiting.

---

## 4. Frontend Folder Structure (`apps/frontend/`)

*Built with Next.js (App Router) + Tailwind CSS.*

```text
apps/frontend/
├── src/
│   ├── app/          # Next.js App Router (Pages and Layouts)
│   │   ├── (auth)/   # Route group for login/register
│   │   ├── dashboard/# Authenticated dashboard routes
│   │   └── verify/   # Public verification portal
│   ├── components/   # Reusable UI components
│   │   ├── ui/       # Dumb components (Buttons, Inputs - Component Library)
│   │   └── features/ # Smart components (UploadDropzone, VerificationTable)
│   ├── hooks/        # Custom React hooks (e.g., useHederaSync)
│   ├── lib/          # API clients, utility functions, and Tailwind config helpers
│   ├── stores/       # Global state management (Zustand context)
│   └── types/        # Frontend-specific types (UI state)
├── public/           # Static assets (favicons, generic images)
├── tests/            # Component and unit tests
├── package.json
└── tailwind.config.ts
```

**Explanation:**
- **`components/ui/` vs `components/features/`**: The `ui/` folder strictly contains the basic components defined in the Design Spec (Buttons, Cards). They have no business logic. The `features/` folder contains complex components that fetch data or manage state (e.g., the complex Upload Dropzone).
- **`(auth)/`**: Using Next.js route groups `()` allows us to share a layout for Auth pages without adding `/auth/` to the URL.

---

## 5. Shared Package Structure (`packages/`)

```text
packages/
├── shared-types/     # Shared TS interfaces (e.g., VerificationRecord, AIOutput)
│   ├── package.json
│   └── index.ts
├── eslint-config/    # Monorepo-wide ESLint rules
│   ├── package.json
│   └── index.js
├── tsconfig/         # Base TS configurations (Next.js base, Node base)
│   ├── package.json
│   ├── nextjs.json
│   └── node.json
└── ui-tokens/        # Shared design tokens (Colors, Spacing constants)
    ├── package.json
    └── index.ts
```

**Explanation:**
By keeping types and configs in `packages/`, the `frontend` and `backend` simply import them via `"@verifai/shared-types": "workspace:*"`. This guarantees the API and the Client are always speaking the exact same language.

---

## 6. Configuration Files

Required at the workspace root or inside specific apps:
- **`turbo.json`**: Defines the build pipeline (e.g., ensuring `shared-types` builds before `frontend`).
- **`.prettierrc`**: Enforces strict code formatting (tabs vs spaces, line length) across all files.
- **`.eslintrc.js`**: Enforces code quality and catches errors before committing.
- **`.nvmrc`**: Locks the required Node.js version (e.g., `v20.11.0`).
- **`schema.prisma`** (in `apps/backend/`): The single source of truth for the database schema.

---

## 7. Environment Files

Environment variables are never committed to Git. We use distinct files for different environments:

- **`.env.example`**: Committed to Git. Contains all required keys but with dummy values (e.g., `OPENAI_API_KEY=sk-your-key-here`). Developers copy this to create their local `.env`.
- **`.env.local`**: Ignored by Git. Used exclusively for local development overrides (e.g., pointing to `localhost:5432` for the database).
- **`.env.development`**: Used by CI/CD when building the staging/test environment. Points to Hedera Testnet.
- **`.env.production`**: Injected directly into Vercel and Railway via their secrets managers. Never exists as a file on a developer's machine. Points to Hedera Mainnet.

---

## 8. Docker Structure

```text
docker/
├── docker-compose.yml    # Runs local Redis and Postgres for development
├── redis.conf            # Custom Redis configuration if needed
└── init.sql              # Initial database scaffolding script
```
**Explanation:** 
While the frontend is deployed to Vercel (serverless), the backend API and worker processes will be containerized. The `docker-compose.yml` file allows a new developer to run `docker compose up` and instantly have a local database and message queue running without installing Postgres manually.

---

## 9. Documentation Structure (`docs/`)

```text
docs/
├── 01_PRD.md
├── 02_Architecture.md
├── 03_TDR.md
├── 04_UI_UX_Spec.md
├── 05_Database_Design.md
└── 06_API_Spec.md (Future)
```
**Explanation:**
All the approved strategy documents live here. When an engineer asks "Why are we using BullMQ?", they are directed to `03_TDR.md`. This is the project's brain.

---

## 10. Repository Best Practices & Long-Term Scalability

1. **Strict Boundary Enforcement:** By physically separating the `frontend` and `backend` into different folders inside `apps/`, we prevent "spaghetti code" where frontend components accidentally import backend database libraries.
2. **Horizontal Scalability:** The backend structure separates HTTP endpoints (`api/`) from background tasks (`jobs/`). If the system scales to 100,000 users, we can easily deploy the `apps/backend/` container twice—once configured to only process API requests, and once configured to only process background Hedera queues.
3. **Instant Onboarding:** A new developer clones the repo, runs `nvm use`, `pnpm install`, and `docker compose up`. Because of the monorepo and shared configs, their local environment perfectly mirrors production in under 5 minutes.
