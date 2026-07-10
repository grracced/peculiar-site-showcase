# VerifAI - MVP Implementation Roadmap

> **Technical Project Manager Note:**
> This document breaks down the VerifAI MVP into 15 strict, sequential development milestones. Each milestone is designed to be fully self-contained, reviewable, and testable before moving to the next. By following this roadmap, a solo founder or small engineering team can predictably build the platform from an empty repository to a production-ready Web3 SaaS.

---

## M1: Repository & Monorepo Scaffolding
- **Objective:** Establish the foundation of the codebase using `pnpm` workspaces and initialize the core apps.
- **Features Included:** Monorepo setup, ESLint/Prettier configuration, GitHub Actions baseline.
- **Dependencies:** None.
- **Deliverables:** `apps/frontend` (Next.js), `apps/backend` (Express), `packages/shared-types`.
- **Acceptance Criteria:** Both apps run locally via a single command (e.g., `pnpm dev`). Types can be successfully imported from the shared package.
- **Estimated Complexity:** Low
- **Estimated Time:** 1 Day
- **Testing Requirements:** Verify linting and build commands execute without errors.
- **Definition of Done (DoD):** Initial PR merged to `main`. `README.md` updated with local setup instructions.

## M2: Database & Backend Core Configuration
- **Objective:** Connect the backend to the Supabase PostgreSQL database and configure the ORM.
- **Features Included:** Prisma ORM setup, initial schema definition, database migration scripts, Docker Compose for local dev.
- **Dependencies:** M1.
- **Deliverables:** `schema.prisma`, initial migration files, `docker-compose.yml`.
- **Acceptance Criteria:** Developer can spin up local DB via Docker and successfully run `prisma migrate dev`.
- **Estimated Complexity:** Medium
- **Estimated Time:** 2 Days
- **Testing Requirements:** Write a script to seed the database with a test user; verify successful insertion.
- **DoD:** Database schema reflects the approved Database Design document. Code merged.

## M3: Authentication & User Management (Backend)
- **Objective:** Implement secure user registration, login, and session management via Supabase Auth.
- **Features Included:** JWT validation middleware, user profile creation triggers, `/api/auth` endpoints.
- **Dependencies:** M2.
- **Deliverables:** Auth controllers, Supabase admin client setup, RBAC middleware.
- **Acceptance Criteria:** API correctly rejects unauthenticated requests and returns a valid user profile for authenticated requests.
- **Estimated Complexity:** Medium
- **Estimated Time:** 2 Days
- **Testing Requirements:** Supertest integration tests for login, register, and protected route access.
- **DoD:** 90% test coverage on Auth routes. Code merged.

## M4: Frontend Foundation & Auth UI
- **Objective:** Translate the UI Design Spec into React components and build the authentication flow.
- **Features Included:** Tailwind CSS config (Design Tokens), Component Library scaffolding (Buttons, Inputs), Login/Register screens.
- **Dependencies:** M3.
- **Deliverables:** `VerifAI_Component_Library`, `/login`, `/register` pages, API client configuration (Axios/Fetch).
- **Acceptance Criteria:** User can register an account via the UI, log in, and be redirected to a blank `/dashboard`.
- **Estimated Complexity:** Medium
- **Estimated Time:** 3 Days
- **Testing Requirements:** Vitest component tests for Form validation.
- **DoD:** UI perfectly matches design specifications. Authentication flow is end-to-end operational.

## M5: Document Upload & Storage Service (Backend)
- **Objective:** Allow users to securely upload files to temporary storage for processing.
- **Features Included:** File validation middleware (MIME type, size limits), Supabase Storage integration, `Documents` table insertion.
- **Dependencies:** M2, M3.
- **Deliverables:** `/api/upload` endpoint, FileStorageService.
- **Acceptance Criteria:** Files >10MB or invalid types are rejected. Valid files are saved to storage and a DB row is created with `status: UPLOADING`.
- **Estimated Complexity:** Medium
- **Estimated Time:** 2 Days
- **Testing Requirements:** Integration tests mimicking file uploads using mock buffers.
- **DoD:** Storage buckets configured with proper RLS policies. Code merged.

## M6: AI Processing Service Integration
- **Objective:** Integrate OpenAI/Gemini to extract metadata from uploaded documents.
- **Features Included:** AI prompt engineering, token limit handling, `AI Analysis` table insertion.
- **Dependencies:** M5.
- **Deliverables:** `AIService`, JSON schema validation for AI outputs.
- **Acceptance Criteria:** System successfully extracts structured JSON from a PDF/TXT file and saves it to the database.
- **Estimated Complexity:** High
- **Estimated Time:** 3 Days
- **Testing Requirements:** Mock AI API responses to test successful parsing and error handling (rate limits).
- **DoD:** AI extraction pipeline is functional and heavily error-handled.

## M7: Cryptography & Hashing Engine
- **Objective:** Generate a deterministic, immutable SHA-256 hash of the document and AI metadata.
- **Features Included:** Native Node.js `crypto` implementation, `VerificationRecords` table insertion.
- **Dependencies:** M5, M6.
- **Deliverables:** `CryptoService`, Hash generation logic.
- **Acceptance Criteria:** Uploading the exact same file twice produces the exact same hash.
- **Estimated Complexity:** Low
- **Estimated Time:** 1 Day
- **Testing Requirements:** Unit tests validating SHA-256 outputs against known strings.
- **DoD:** Hashes are generated securely and contain no plain-text PII.

## M8: Hedera Consensus Service (HCS) Integration
- **Objective:** Anchor the generated hash to the public Hedera ledger.
- **Features Included:** `@hashgraph/sdk` setup, Topic creation, Message submission, Mirror Node querying.
- **Dependencies:** M7.
- **Deliverables:** `HederaService`, `HederaTransactions` table insertion.
- **Acceptance Criteria:** System successfully submits a hash to Hedera Testnet, pays the fee, and receives a Transaction ID.
- **Estimated Complexity:** High
- **Estimated Time:** 3 Days
- **Testing Requirements:** Integration tests hitting Hedera Testnet (bypassed in standard CI).
- **DoD:** Hedera treasury account configured securely. Hashes are permanently anchored.

## M9: Background Job Queue (BullMQ) Orchestration
- **Objective:** Connect M5, M6, M7, and M8 into a robust, asynchronous background pipeline.
- **Features Included:** BullMQ setup, Redis connection, worker processes, automatic retries.
- **Dependencies:** M5, M6, M7, M8.
- **Deliverables:** `DocumentProcessorWorker`.
- **Acceptance Criteria:** An API upload immediately returns a `202 Accepted`. The worker sequentially processes the AI, Hashing, and Hedera steps, updating the DB `status` at each step.
- **Estimated Complexity:** High
- **Estimated Time:** 4 Days
- **Testing Requirements:** E2E testing of the worker process, specifically testing simulated AI timeouts to ensure BullMQ retries the job.
- **DoD:** The core product engine is fully asynchronous and resilient to API failures.

## M10: Dashboard UI & Upload Workflow (Frontend)
- **Objective:** Build the authenticated user dashboard and the Quick Upload workflow.
- **Features Included:** Sidebar navigation, Dashboard Overview, Upload Dropzone Component, Live Progress Stepper.
- **Dependencies:** M4, M9.
- **Deliverables:** `/dashboard`, `/dashboard/upload`, WebSocket or polling implementation to track job status.
- **Acceptance Criteria:** User drags a file into the Dropzone, watches the progress stepper advance from "Uploading" to "Anchoring," and sees the success state.
- **Estimated Complexity:** High
- **Estimated Time:** 4 Days
- **Testing Requirements:** UI testing across Desktop, Tablet, and Mobile viewports.
- **DoD:** The primary user loop (Login -> Upload -> Verify) is visually complete and functional.

## M11: Document History & Detailed View (Frontend)
- **Objective:** Allow users to view their past verifications and download proof.
- **Features Included:** Verification History Table with pagination, Document Detail Page (`/dashboard/document/[id]`), PDF Certificate Generation.
- **Dependencies:** M10.
- **Deliverables:** History components, Detail layout, PDF export utility.
- **Acceptance Criteria:** User can view a list of all documents, click one, read the AI metadata, and see the Hedera Transaction ID.
- **Estimated Complexity:** Medium
- **Estimated Time:** 3 Days
- **Testing Requirements:** Verify pagination works with >50 mock records.
- **DoD:** Users can access and download proof of all historical verifications.

## M12: Public Verification Portal (Frontend)
- **Objective:** Build the unauthenticated public portal for third-party auditing.
- **Features Included:** Isolated `/verify` page, client-side SHA-256 hashing (for privacy), public API endpoint for hash lookups.
- **Dependencies:** M8.
- **Deliverables:** `/verify` route, `GET /api/public/verify/:hash` endpoint.
- **Acceptance Criteria:** A visitor uploads a file, it hashes locally, and instantly returns "Verified" if the hash exists on Hedera.
- **Estimated Complexity:** Medium
- **Estimated Time:** 2 Days
- **Testing Requirements:** Cross-browser testing for client-side hashing capabilities (Web Crypto API).
- **DoD:** Independent auditors can verify files without trusting VerifAI's backend.

## M13: Audit Logging & Activity History
- **Objective:** Implement the security and activity tracking mechanisms detailed in the Database Design.
- **Features Included:** `AuditLogService`, frontend Recent Activity widget.
- **Dependencies:** M11.
- **Deliverables:** Middleware to intercept destructive actions, dashboard widget integration.
- **Acceptance Criteria:** Every login, upload, and setting change generates an append-only row in the DB.
- **Estimated Complexity:** Low
- **Estimated Time:** 1 Day
- **Testing Requirements:** Verify audit logs cannot be modified via API.
- **DoD:** Security requirements for enterprise auditing are satisfied.

## M14: E2E Testing & Security Hardening
- **Objective:** Ensure the system is unbreakable before going live.
- **Features Included:** Playwright E2E test suite, Helmet.js configuration, CORS lockdown, Rate Limiting (Redis).
- **Dependencies:** All previous.
- **Deliverables:** Complete test suite running in GitHub Actions, WAF rules.
- **Acceptance Criteria:** GitHub Actions passes 100%. Rate limiter correctly blocks an IP after 100 rapid requests.
- **Estimated Complexity:** High
- **Estimated Time:** 3 Days
- **Testing Requirements:** Manual penetration testing of Auth and Upload endpoints.
- **DoD:** No known critical or high-level vulnerabilities exist.

## M15: Production Deployment & CI/CD Finalization
- **Objective:** Deploy the MVP to the live internet.
- **Features Included:** Vercel deployment (Frontend), Railway deployment (Backend), Supabase Production instance setup, Hedera Mainnet transition.
- **Dependencies:** M14.
- **Deliverables:** Live URLs, DNS configuration (Cloudflare), Production `.env` injected securely.
- **Acceptance Criteria:** A real user can sign up at `verifai.com`, upload a file, and see it verified on the live Hedera Mainnet.
- **Estimated Complexity:** Medium
- **Estimated Time:** 2 Days
- **Testing Requirements:** Post-deployment smoke testing on Production.
- **DoD:** VerifAI MVP is officially live. Version 1.0.0 tagged in GitHub.
