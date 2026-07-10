# VerifAI - System Architecture Document

> **Chief Software Architect Note:** 
> This document translates the Product Requirements Document (PRD) into a scalable, production-ready technical architecture. It is designed to be executable by a solo founder building the MVP, while possessing the structural integrity to scale to 100,000+ users and support a growing engineering team in the future.

---

## 1. Overall System Architecture

### High-Level Architecture Diagram
*Textual Representation:*
1. **Client Layer:** User browsers and external API consumers.
2. **Edge/CDN Layer:** Cloudflare or Vercel Edge for static assets, WAF (Web Application Firewall), and DDoS protection.
3. **Frontend Application:** React-based SPA/SSR handling UI and client-side logic.
4. **API Gateway / Load Balancer:** Routes incoming traffic to the backend services.
5. **Backend Application (Monolith for MVP):** A modular Node.js API that processes requests.
6. **External Integrations:**
   - **Database & Auth Layer:** PostgreSQL database and identity provider.
   - **File Storage Layer:** S3-compatible object storage for temporary files.
   - **AI Layer:** External AI providers (Gemini / OpenAI).
   - **Hedera Network:** Hedera Consensus Service (HCS) via RPC nodes and Mirror Nodes.

### Data Flow (Verification Process)
1. **Upload:** Client uploads a file directly to temporary Cloud Storage via pre-signed URL, or through the Backend.
2. **Trigger:** Client notifies Backend that the file is ready.
3. **AI Processing:** Backend fetches the file and sends it to the AI Provider for processing/extraction.
4. **Hashing:** Backend generates a SHA-256 hash of the original file and the AI-generated metadata.
5. **Anchoring:** Backend submits the hash to the Hedera network via a Hedera RPC Node (HCS topic).
6. **Confirmation:** Backend saves the Transaction ID and AI results to the Database.
7. **Response:** Client is notified of success and can view the Verification Report.

---

## 2. Technical Stack Recommendation

### Frontend: Next.js (React) + Tailwind CSS
- **Why:** Industry standard for modern web apps. Offers great Developer Experience (DX), built-in routing, and SEO capabilities.
- **Alternatives:** Vite + React (SPA only), SvelteKit.
- **Pros:** Vercel deployment is seamless; massive ecosystem.
- **Cons:** Can be overkill for simple SPAs, slightly higher learning curve for SSR.

### Backend: Node.js with TypeScript + Express (or NestJS)
- **Why:** Keeps the entire stack in TypeScript, allowing code sharing between frontend and backend. NestJS offers strict architectural boundaries out-of-the-box, but Express is faster for a solo founder MVP. 
- **Alternatives:** Python (FastAPI), Go.
- **Pros:** Massive ecosystem, excellent support for Hedera SDK (`@hashgraph/sdk`).
- **Cons:** Node is single-threaded (requires clustering/horizontal scaling under heavy load).

### Database & Authentication: Supabase (PostgreSQL + Auth)
- **Why:** Provides an instant, scalable Postgres database, built-in Auth (JWT), and Row Level Security (RLS). Perfect for solo founders who don't want to manage DB infrastructure.
- **Alternatives:** AWS RDS + Auth0, MongoDB.
- **Pros:** Consolidates DB, Auth, and basic Storage. SQL is mature and standard.
- **Cons:** Vendor lock-in to Supabase-specific features (though underlying DB is standard Postgres).

### File Storage: Supabase Storage or Cloudflare R2
- **Why:** Supabase Storage is convenient if using Supabase DB. Cloudflare R2 has zero egress fees, crucial if handling many file downloads.
- **Alternatives:** AWS S3.
- **Pros:** R2 is significantly cheaper for egress than S3.

### AI Integration: OpenAI API (GPT-4o) or Google Gemini (1.5 Pro)
- **Why:** Both offer state-of-the-art multi-modal capabilities (can process text, images, and standard documents natively).
- **Alternatives:** Anthropic Claude, Local LLMs (Llama 3).

### Hedera Integration: `@hashgraph/sdk` + Arkhia/Hashio
- **Why:** Official SDK. Arkhia provides enterprise-grade RPC and Mirror Node access to avoid public node rate limits.
- **Alternatives:** Public testnet nodes (fine for MVP, bad for production).

### Background Jobs: Inngest or BullMQ (Redis)
- **Why:** AI processing and Hedera network submissions can be slow and fail. They MUST be processed asynchronously with automatic retries.
- **Alternatives:** AWS SQS, Celery.

### Logging & Monitoring: Winston/Pino + Sentry + UptimeRobot
- **Why:** Sentry captures backend/frontend exceptions instantly. Pino is a high-performance JSON logger.

### CI/CD & Deployment: GitHub Actions + Vercel + Railway
- **Why:** Vercel for zero-config Frontend deployment. Railway for Dockerized/Node.js backend deployment. GitHub Actions for testing before deployment.

---

## 3. Project Folder Structure

A **Monorepo** setup using **Turborepo** or npm/yarn workspaces is highly recommended. It allows you to share types and configurations between frontend and backend.

```text
verifai-monorepo/
├── apps/
│   ├── frontend/         # Next.js frontend application
│   └── backend/          # Node.js API application
├── packages/
│   ├── shared-types/     # TypeScript interfaces used by both apps (e.g., User, VerificationRecord)
│   ├── ui-components/    # Reusable UI components (Tailwind, Radix UI)
│   ├── eslint-config/    # Shared linting rules
│   └── tsconfig/         # Shared TypeScript configurations
├── infrastructure/       # Terraform/Pulumi scripts or Docker Compose files
├── docs/                 # PRD, Architecture, API Specs
├── scripts/              # Utility scripts (DB migrations, seeders)
└── package.json          # Root workspace config
```
*Purpose:* This structure prevents code duplication (like defining the `User` type twice) and ensures that when the backend API changes, the frontend fails to compile if types mismatch.

---

## 4. Core Services (Backend Modules)

While the MVP will likely be deployed as a modular monolith, logically separate these services so they can be split into microservices later if necessary.

1. **Authentication Service**
   - *Responsibilities:* Handle login, signup, token validation, password reset.
   - *Dependencies:* Supabase Auth.
2. **User Service**
   - *Responsibilities:* Manage user profiles, tier limits (freemium vs paid), API key generation for B2B users.
3. **Verification Service**
   - *Responsibilities:* The core orchestrator. Receives upload requests, calls AI Service, calls Hash/Hedera Service, saves final record.
   - *Inputs:* File buffer/URL, User ID.
   - *Outputs:* Verification Record (Hash, Transaction ID, AI Summary).
4. **AI Processing Service**
   - *Responsibilities:* Communicates with Gemini/OpenAI, handles prompt engineering, retries, and token limit parsing.
5. **Hedera Service**
   - *Responsibilities:* Generates SHA-256 hashes, formats HCS messages, pays transaction fees via platform Treasury account, and queries the Mirror Node.
6. **Notification Service**
   - *Responsibilities:* Sends emails (e.g., "Your file has been verified") using Resend or SendGrid.
7. **File Management Service**
   - *Responsibilities:* Generates secure pre-signed URLs for upload, deletes files after processing to save storage and ensure privacy.

---

## 5. Security Architecture

- **Authentication/Authorization:** Stateless JWTs issued by Supabase. Role-Based Access Control (RBAC) enforced at the API route level (Admin vs. User).
- **Encryption:** All data in transit secured via TLS 1.3. Environment variables and Hedera Treasury Private Keys must be stored in a secure vault (e.g., Doppler, Vercel Env) and never committed to source control.
- **API Security:** 
  - Helmet.js for secure HTTP headers.
  - CORS strictly limited to the production frontend domain.
- **Rate Limiting:** IP-based and User-ID-based rate limiting (e.g., via Redis) to prevent abuse and AI API billing attacks.
- **File Validation:** 
  - Never trust the file extension. Validate "Magic Numbers" (file signatures) to ensure a `.pdf` is actually a PDF.
  - Enforce strict file size limits (e.g., 10MB MVP) before the file hits memory.

---

## 6. Deployment Architecture

### Environments
1. **Development:** Local environments running via `docker-compose` (Local Postgres, Redis) + Hedera Testnet.
2. **Staging:** Exact replica of Production. Deployed automatically via GitHub Actions on push to `main` branch. Uses Hedera Testnet.
3. **Production:** Deployed manually upon tagging a release. Uses Hedera Mainnet.

### Hosting Providers (Cost-Optimized)
- **Frontend:** Vercel (Free/Pro Tier).
- **Backend:** Railway or Render (Starts at ~$5-10/month, scales automatically).
- **Database:** Supabase (Pro Tier ~$25/month for automated backups).
- **Cache/Queue:** Upstash (Serverless Redis, pay-per-request).

---

## 7. Scalability Strategy

- **10 to 100 Users (MVP):** 
  - Single backend Node.js instance on Railway. Synchronous processing is acceptable for very small files, but basic async queues (BullMQ) should be used from day one to handle AI latency.
- **1,000 to 10,000 Users:**
  - Scale backend horizontally (run 3-5 instances).
  - Increase Postgres connection pooling (PgBouncer).
  - Introduce CDN caching for public Verification portals.
- **100,000+ Users:**
  - Database read replicas (e.g., routing read-only verification queries to a replica).
  - Split the "Worker" processes (handling AI and Hedera) from the "API" processes (handling web requests) so heavy AI processing doesn't block web traffic.

---

## 8. Development Standards

- **Coding Standards:** ESLint + Prettier automated via Husky pre-commit hooks. Strict TypeScript (`"strict": true`).
- **Git Workflow:** GitHub Flow. Main branch is always deployable. Feature branches (`feat/auth`, `fix/upload-bug`) merged via Pull Request.
- **Commit Conventions:** Conventional Commits (e.g., `feat(api): add Hedera HCS integration`).
- **Code Review:** Even as a solo founder, review your own PRs against the Architecture Document before merging. Once the team grows, require 1 approving review.

---

## 9. Risks & Mitigation

1. **Hedera Node Latency / Synchronization:**
   - *Risk:* Mirror Nodes can be slightly delayed. If a user tries to verify a file the exact second it's anchored, it might return "Not Found."
   - *Mitigation:* Implement WebSockets or long-polling on the frontend to wait for the Mirror Node to index the transaction.
2. **AI Provider Outages / Rate Limits:**
   - *Risk:* OpenAI or Gemini goes down, halting the verification process.
   - *Mitigation:* Abstract the AI layer. If OpenAI fails, automatically fallback to Gemini. Use asynchronous queues so requests aren't lost during downtime.
3. **Storage Cost Blowout:**
   - *Risk:* Users upload thousands of large videos, driving up AWS/R2 costs.
   - *Mitigation:* Hard size limits. Implement a cron job to automatically delete raw files 24 hours after processing. 

---

## 10. Architecture Decisions & Trade-offs

1. **Decision: Separate Frontend/Backend vs. Full-Stack Next.js**
   - *Why:* We plan to offer a Public Verification API (V2). A dedicated Node.js backend makes it vastly easier to document, version, and scale a REST API for B2B customers compared to Next.js API routes.
   - *Trade-off:* Slightly more complex deployment (Vercel + Railway instead of just Vercel).
2. **Decision: Custodial Hedera Treasury (Web2.5)**
   - *Why:* Target users (Legal, Creators) may not have crypto wallets. The platform paying the $0.0001 fee removes massive friction.
   - *Trade-off:* VerifAI absorbs the transaction cost. Mitigation: Cover this cost in the SaaS pricing tier.
3. **Decision: Monorepo**
   - *Why:* Sharing the `VerificationRecord` TypeScript interface between frontend and backend prevents bugs where the API returns data the frontend isn't expecting.
   - *Trade-off:* Initial setup takes a couple of hours. (Well worth it).
