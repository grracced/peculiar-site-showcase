# AI_CONTEXT.md

> **Notice to AI Coding Assistants:** This document contains the absolute truth regarding the architecture, vision, and constraints of VerifAI. You must read and align your behavior with this context before making any code modifications.

---

## VerifAI Overview
VerifAI is a trust-infrastructure platform designed to securely anchor document metadata to the Hedera public ledger. As deepfakes and AI-generated misinformation proliferate, proving the origin, timeline, and authenticity of documents is becoming increasingly difficult. VerifAI solves this by providing cryptographic, immutable proof of digital assets.

The platform exists to bridge the gap between complex Web3 infrastructure and Web2 enterprise usability. It utilizes AI (OpenAI/Gemini) to automatically extract rich context from uploaded files, hashes the combined data using SHA-256, and submits it to the Hedera Consensus Service (HCS). 

The long-term vision is to become the default "Trust Layer" of the internet—an enterprise SaaS tool where legal, medical, and corporate entities instantly verify digital records with zero friction.

---

## Mission
To restore absolute trust to digital documents by seamlessly integrating AI-driven metadata extraction with the cryptographic immutability of the Hedera network, packaged within a frictionless enterprise user experience.

---

## Core Principles
- **Trust First:** Cryptographic integrity cannot be compromised.
- **Security First:** Soft deletes, encrypted secrets, and stringent input validation.
- **Simplicity Over Complexity:** Minimalist UI, strict Monorepo boundaries.
- **Enterprise-Ready Architecture:** Designed to scale linearly using Postgres, Redis, and BullMQ.
- **Reusable Components:** Strictly utilize the defined UI Component Library.
- **Test-Driven Mindset:** No feature is complete without passing tests.
- **Privacy by Design:** Hashes are public; Personally Identifiable Information (PII) is not.

---

## Product Scope
**Included in MVP:**
- Secure User Authentication & Registration (Supabase).
- Document Uploads with Temporary Cloud Storage.
- AI Metadata Extraction Pipeline.
- SHA-256 Hashing Engine.
- Hedera HCS Anchoring (Custodial Wallet managed by VerifAI).
- Background Job Queueing (BullMQ) for async processing.
- Authenticated Dashboard with Verification History.
- Public Verification Portal via exact-match hashing.

**NOT Included in MVP:**
- Third-party API Access (B2B Keys).
- Subscription Billing (Stripe).
- Multi-signature / Non-custodial wallets (Users do not need HBAR to use the MVP).
- Organization/Team accounts.

---

## Target Users
- **Solo Founders & Auditors:** Need to quickly prove the timestamp and origin of a specific file.
- **Legal/Compliance Officers:** Require immutable audit trails for sensitive documents.
- They use VerifAI because it removes the friction of managing Web3 wallets while providing cryptographic guarantees that traditional Web2 databases cannot offer.

---

## Technology Stack
- **Frontend:** Next.js (App Router), Tailwind CSS.
- **Backend:** Node.js, Express.
- **Database:** PostgreSQL (via Supabase), Prisma ORM.
- **Authentication:** Supabase Auth.
- **AI:** OpenAI SDK (Fallback to Gemini).
- **Hedera:** Hashgraph SDK (`@hashgraph/sdk`).
- **Background Jobs:** BullMQ + Redis.
- **Storage:** Supabase Storage.
- **Deployment:** Vercel (Frontend), Railway (Backend/Redis/Worker).
- **Testing:** Vitest (Unit), Playwright (E2E).
- **Documentation:** Markdown (GitHub).

---

## Architecture Summary
VerifAI operates as a modular monolith within a `pnpm` workspace. The Next.js frontend and Express backend share TypeScript types to guarantee data consistency.

When a user uploads a document, the frontend passes it to the backend API, which immediately returns a `202 Accepted` response. The heavy lifting is offloaded to a BullMQ worker queue. The worker sequentially asks the AI to extract data, hashes the payload, submits the transaction to the Hedera Consensus Service, and updates the PostgreSQL database at each step. The frontend polls (or uses WebSockets) to update the UI dynamically without blocking HTTP threads.

---

## Folder Structure Summary
- `/apps/frontend`: Next.js application, React components, Dashboard UI.
- `/apps/backend`: Express API, core business logic, BullMQ workers.
- `/packages/shared-types`: Types shared identically between frontend and backend.
- `/docs`: All planning documents (PRD, Architecture, DB Design).
- `/.agents`: Custom instructions and execution playbooks for AI assistants.

---

## Coding Standards
- **SOLID:** Strictly adhered to.
- **DRY:** Never duplicate logic; abstract into `/packages` or backend `/core` services.
- **KISS:** Avoid over-engineering. Do not implement CQRS or Microservices for the MVP.
- **Clean Architecture:** Separate HTTP Controllers from Service Logic.
- **Naming Conventions:** `kebab-case.ts` for files, `PascalCase.tsx` for React components, `camelCase` for functions.
- **Modular Design:** Utilize "Atomic Design" for frontend UI components.

---

## AI Development Rules
- Never invent features outside the MVP scope.
- Never modify unrelated files just to satisfy a linter.
- Never break the Monorepo boundary architecture.
- Implement exactly one milestone at a time.
- Keep commits small, focused, and testable using Conventional Commits.
- Write maintainable, readable code over hyper-optimized short code.
- Always use the predefined UI components before building a raw HTML element.
- Never hardcode secrets. Always use `process.env`.
- Update `walkthrough.md` or related docs when architecture changes.

---

## Security Principles
- **Zero Trust:** Wrap all incoming API data in `Zod` schemas.
- **PII Protection:** Never send raw text containing PII to the Hedera ledger—only send the SHA-256 hash.
- **Immutable Ledger:** Protect the internal database from hard deletes. Use `deleted_at` timestamps to preserve referential integrity for audit logs.

---

## Testing Philosophy
A feature does not exist if it is not tested. Write Unit tests for all business logic (Hashing, AI parsing). Write Integration tests for Database/Prisma operations. Ensure critical user paths (Upload -> Verify) are covered by E2E testing before marking a milestone complete.

---

## Current Project Status
- ✅ PRD completed
- ✅ Architecture completed
- ✅ UI/UX Specification completed
- ✅ Component Library defined
- ✅ Database designed
- ✅ GitHub Engineering Standards established
- ✅ Implementation Roadmap established
- ⏳ **Current Implementation Milestone:** M1: Repository & Monorepo Scaffolding (Empty Repo).

---

## Development Workflow
1. **Plan:** Read documentation and confirm dependencies.
2. **Implement:** Write the code adhering to standards.
3. **Test:** Validate happy paths and edge cases.
4. **Review:** Self-audit against the "AI Development Rules."
5. **Document:** Ensure inline JSDoc and markdown updates are applied.
6. **Commit:** Use `type(scope): description`.
7. **Deploy:** Rely on CI/CD pipelines.

---

## Things Never To Do
- Never bypass authentication checks on API routes.
- Never expose `OPENAI_API_KEY` or Hedera Private Keys to the frontend.
- Never duplicate database queries inside React components.
- Never skip testing a completed milestone.
- Never ignore or swallow `try/catch` errors silently.
- Never violate the defined Tailwind monochromatic design system.

---

## Future Roadmap
- **V2:** Organization/Team Accounts, Role-Based Access Control (RBAC).
- **V3:** Stripe API integration for metered SaaS billing.
- **V4:** Developer API Keys allowing B2B platforms to bypass the UI entirely.

---

## Glossary
- **Verification Record:** The internal database row tracking a specific document's hash.
- **AI Analysis:** The JSON metadata extracted from the document by OpenAI/Gemini.
- **Hedera Consensus Service (HCS):** The Web3 ledger used to anchor the hash with a timestamp.
- **Verification Engine:** The BullMQ backend worker handling the async pipeline.
- **Audit Log:** An append-only table tracking sensitive actions within the application.
- **Public Verification:** The unauthenticated portal allowing third parties to verify a hash.

---

## Quick Startup Checklist
Before writing code for VerifAI, verify the following:
- [ ] Read PRD & Architecture docs.
- [ ] Read this `AI_CONTEXT.md` file.
- [ ] Confirm current active milestone.
- [ ] Confirm task dependencies are met.
- [ ] Implement ONLY the assigned feature.
- [ ] Run automated tests.
- [ ] Suggest a Conventional Commit message.
