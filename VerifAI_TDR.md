# VerifAI - Technology Decision Record (TDR)

> **Chief Technology Officer Note:** 
> This document locks in every major technical decision, standard, and convention for VerifAI before any code is written. It acts as the single source of truth for all current and future developers joining the project, eliminating ambiguity and ensuring we build a scalable, secure, and production-ready SaaS application.

---

## 1. Technology Stack (Locked)

| Category | Selected Technology | Justification |
| :--- | :--- | :--- |
| **Programming Language** | **TypeScript (Strict Mode)** | Chosen for both Frontend and Backend to enable type-sharing in a monorepo. Reduces runtime errors and improves DX over plain JS. |
| **Frontend Framework** | **Next.js (React)** | Industry standard for SSR/SPA. Vast ecosystem. Better SEO out-of-the-box compared to Vite. Excellent Vercel integration. |
| **Backend Framework** | **Node.js + Express** | High velocity for MVP while allowing for modular separation. Vast ecosystem and native support for the Hedera SDK. |
| **Database** | **PostgreSQL** | Mature, ACID-compliant, standard relational DB. Supabase provides an excellent managed instance. |
| **ORM** | **Prisma** | Best-in-class TypeScript ORM. Generates types directly from the schema, significantly speeding up database interactions. |
| **Authentication** | **Supabase Auth** | Native integration with PostgreSQL. Supports JWTs, social logins, and Row Level Security (RLS) without extra infrastructure. |
| **Authorization** | **Role-Based Access Control (RBAC) via DB** | Custom middleware utilizing user roles stored in the Postgres database. |
| **File Storage** | **Supabase Storage** | S3-compatible, seamlessly integrates with Supabase Auth for secure file access. |
| **AI Provider** | **OpenAI (GPT-4o)** | Leading multi-modal capabilities. Excellent for extracting structured JSON from raw documents. |
| **AI SDK** | **`openai` (Node.js SDK)** | Official SDK, well-maintained, easy retry configurations. |
| **Hedera SDK** | **`@hashgraph/sdk`** | Official SDK required for all interactions with the Hedera Consensus Service. |
| **Mirror Node** | **Arkhia** | Enterprise-grade RPC. More reliable than public nodes and prevents rate-limit bans during traffic spikes. |
| **Hashing Library** | **Node.js native `crypto`** | Using native `crypto.createHash('sha256')` avoids third-party dependencies for critical security tasks. |
| **Background Queue** | **BullMQ + Redis** | Robust, Redis-based queue for handling asynchronous Hedera submissions and AI processing to prevent HTTP timeouts. |
| **Caching** | **Redis (Upstash)** | Serverless Redis instance for rate-limiting, session caching, and BullMQ data. |
| **Logging** | **Pino** | Ultra-fast JSON logger. Essential for parsing logs in production tools like Datadog or BetterStack. |
| **Monitoring** | **Sentry** | Automatically catches unhandled exceptions in both React and Node.js with stack traces. |
| **Testing Framework** | **Vitest + Supertest** | Vitest is incredibly fast, native to ESM, and compatible with Jest APIs. Supertest for API endpoint testing. |
| **CI/CD** | **GitHub Actions** | Native to the code repository. Easily configured to run linting, tests, and trigger Vercel/Railway deployments. |
| **Package Manager** | **pnpm** | Extremely fast and disk-efficient due to hard links. Excellent native support for monorepo workspaces. |
| **Containerization** | **Docker** | Used to containerize the backend API for consistent deployment across environments (Railway). |
| **Hosting (Frontend)** | **Vercel** | Zero-config Next.js deployments, global edge CDN. |
| **Hosting (Backend)** | **Railway** | Developer-friendly PaaS. Builds Docker containers directly from GitHub. Easy to scale horizontally. |
| **DNS** | **Cloudflare** | Industry-standard DNS. Provides free DDoS protection, WAF, and proxy capabilities. |
| **Email Provider** | **Resend** | Developer-first email API with excellent React-email integration. |
| **Analytics** | **PostHog** | Open-source product analytics. Tracks user journeys without the heavy privacy invasions of Google Analytics. |
| **Documentation** | **Mintlify or Docusaurus** | For generating the future public-facing Verification API documentation. |

---

## 2. Project Standards

- **Folder naming:** `kebab-case` (e.g., `user-profile`, `auth-service`).
- **File naming:** `kebab-case.ts` (e.g., `verify-document.ts`). React components use `PascalCase.tsx` (e.g., `UploadButton.tsx`).
- **Function naming:** `camelCase` (e.g., `hashDocument()`, `submitToHedera()`).
- **Class naming:** `PascalCase` (e.g., `HederaService`, `DatabaseConnection`).
- **Variable naming:** `camelCase` (e.g., `transactionId`, `fileBuffer`). Constants use `UPPER_SNAKE_CASE` (e.g., `MAX_UPLOAD_SIZE`).
- **Component naming:** `PascalCase` (e.g., `VerificationDashboard`).
- **Database naming:** Tables: `snake_case` (plural), e.g., `users`, `verification_records`. Columns: `snake_case`, e.g., `created_at`, `transaction_id`.
- **API naming:** RESTful endpoints using `kebab-case`, plural nouns (e.g., `GET /api/v1/verifications`, `POST /api/v1/users`).
- **Environment variable naming:** `UPPER_SNAKE_CASE` (e.g., `HEDERA_PRIVATE_KEY`, `OPENAI_API_KEY`).
- **Git branch naming:** `type/kebab-case-description` (Types: `feat`, `fix`, `chore`, `docs`). Example: `feat/hedera-hcs-integration`.
- **Commit message convention:** Conventional Commits (e.g., `feat(api): implement SHA-256 hashing`).
- **Versioning strategy:** Semantic Versioning (SemVer: `MAJOR.MINOR.PATCH`).
- **Code documentation standard:** JSDoc blocks for public functions and classes.
- **README standard:** Must include: Project description, setup instructions, environment variables list, and architecture overview.

---

## 3. Development Environment

- **Operating System:** macOS or Linux (Windows via WSL2).
- **IDE:** Visual Studio Code (VS Code) or Cursor.
- **Required extensions:** ESLint, Prettier, Prisma, Tailwind CSS IntelliSense, Error Lens.
- **Node version:** Node.js v20 LTS (Enforced via `.nvmrc`).
- **Package manager:** `pnpm` v9.x.
- **Git version:** `git` >= 2.30.
- **Docker version:** Docker Desktop (latest) for running local Redis and testing isolated containers.
- **Database version:** PostgreSQL 15+.
- **Terminal setup:** zsh or bash.
- **Linting:** ESLint with strict TypeScript rules.
- **Formatting:** Prettier (run on save).
- **Git Hooks:** Husky. Enforces Prettier formatting and ESLint rules on `pre-commit`.

---

## 4. Environment Variables

*A secure `.env.example` file will be maintained in the repo. Actual `.env` files are ignored by git.*

| Variable | Description | Environments |
| :--- | :--- | :--- |
| `PORT` | API execution port (default 3001) | Dev, Prod |
| `NODE_ENV` | Execution context (`development`, `test`, `production`) | All |
| `FRONTEND_URL` | Used for CORS and email links | All |
| `DATABASE_URL` | Prisma Postgres connection string | All |
| `SUPABASE_URL` | Supabase API URL for Auth/Storage | All |
| `SUPABASE_ANON_KEY` | Public key for client-side Auth | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key for backend admin operations | Dev, Prod |
| `OPENAI_API_KEY` | Secret key for AI processing | Dev, Prod |
| `HEDERA_NETWORK` | Target network (`testnet` vs `mainnet`) | Dev, Prod |
| `HEDERA_ACCOUNT_ID` | Operator Treasury Account ID | Dev, Prod |
| `HEDERA_PRIVATE_KEY` | Operator Treasury Private Key | Dev, Prod |
| `REDIS_URL` | Upstash Redis connection string for BullMQ | Dev, Prod |
| `RESEND_API_KEY` | API Key for email sending | Dev, Prod |
| `JWT_SECRET` | Backend session JWT secret | Dev, Prod |

- **Development:** Variables point to local DB/Redis instances or Testnet accounts.
- **Testing:** Ephemeral database connections and mocked API keys.
- **Production:** Injected securely via Railway / Vercel secrets manager. Uses Mainnet.

---

## 5. Third-Party Services

| Service | Provider | Pricing / Free Tier | Scalability |
| :--- | :--- | :--- | :--- |
| **Database & Auth** | Supabase | Free tier available. Pro is $25/mo. | Massive (built on AWS Postgres). |
| **File Storage** | Supabase Storage | Included in Pro tier (100GB). | Seamless horizontal scale. |
| **Monitoring** | Sentry | Free developer tier (5k errors). Pro $29/mo. | Enterprise scale. |
| **Logging** | BetterStack (Logtail) | 1GB/mo free. Paid starts ~$24/mo. | High throughput JSON parsing. |
| **Email** | Resend | 3,000/mo free. Paid $20/mo (50k). | Very high deliverability. |
| **Analytics** | PostHog | 1M events free. | Industry standard for SaaS. |
| **AI Provider** | OpenAI | Pay-as-you-go based on tokens. | High, subject to API rate limits. |
| **Cloud Hosting** | Railway / Vercel | Vercel Free. Railway ~$5/mo minimum. | Auto-scaling built-in. |
| **Cache / Queue** | Upstash (Redis) | 10k commands/day free. | Serverless, scales to 0. |

---

## 6. Security Standards

- **Password policy:** Enforced by Supabase Auth (Minimum 8 chars, 1 uppercase, 1 special).
- **Authentication flow:** JWT sent via HTTP-only, Secure, SameSite cookies. No local-storage tokens to prevent XSS attacks.
- **Token expiration:** Access Token (1 hour), Refresh Token (7 days).
- **Encryption:** TLS 1.3 everywhere. PII stored in Postgres encrypted at rest (AWS default).
- **Secrets management:** Never commit `.env` files. Secrets injected at build/runtime.
- **API security:** Helmet.js on backend. Explicit CORS origins (Frontend URL only).
- **Rate limiting:** Strict IP-based limit (e.g., 100 req/min). User-ID limit on heavy endpoints (e.g., 5 AI processing reqs/min).
- **File validation:** Magic number sniffing (file signatures). Do not trust extensions.
- **Upload limits:** Max file size of 10MB enforced at the API gateway layer before it hits application memory.
- **Audit logging:** All Hedera transactions, AI queries, and admin actions logged to a separate internal audit table.

---

## 7. Cost Analysis (Monthly Estimates)

*Assumptions: $0.0001 per Hedera HCS message. ~$0.01 average AI processing cost per document.*

- **Development Phase:** **$0** (Using all free tiers, local Docker, Hedera Testnet).
- **100 Users (MVP Phase):** **$30 - $50**
  - Supabase Pro: $25
  - Railway Backend: ~$5
  - AI API Costs (1,000 docs): ~$10
  - Hedera Fees (1,000 docs): $0.10
- **1,000 Users (Early Traction):** **$100 - $150**
  - AI API Costs (10,000 docs): ~$100
  - Upstash Redis: ~$10
  - Hedera Fees: $1.00
- **10,000 Users (Scaling):** **$500 - $1,000**
  - AI API Costs (100,000 docs): ~$1,000
  - Scaled Backend instances: ~$100
  - Paid Logging/Email APIs: ~$50
  - Hedera Fees: $10.00
- **100,000 Users (Enterprise):** **$5,000+**
  - Volume discounts on AI providers kick in. Dedicated Database infrastructure required.

**Minimizing Costs:**
- Implement aggressive caching for Public Verification queries.
- Delete temporary uploaded files immediately to save on S3/Storage costs.
- Enforce hard token limits on AI prompts to prevent runaway AI billing.

---

## 8. Risk Register

| Risk Category | Specific Risk | Mitigation Strategy |
| :--- | :--- | :--- |
| **Technical** | Hedera Mirror Node Synchronization delay. | Implement a polling/WebSocket mechanism on the UI to wait for index confirmation. |
| **Operational** | OpenAI/Gemini rate limits causing verification queue backups. | Use BullMQ with exponential backoff. Implement an automatic fallback to an alternative AI provider. |
| **Security** | AI Prompt Injection causing hallucinated metadata. | Strictly structure AI outputs to JSON. Use zero-trust validation on AI responses (Zod schemas). |
| **Infrastructure** | Node.js single-thread blocking on massive file uploads. | Use streams for file handling. Offload hashing to worker threads if necessary. |
| **Vendor Lock-in** | Supabase Auth/DB dependency. | Use Prisma to keep DB queries database-agnostic. Supabase Auth is built on GoTrue, which is open-source. |

---

## 9. Decision Log

- **Decision 1: Use a Monorepo (`pnpm` workspaces)**
  - *Reason:* Total TypeScript type safety across the network boundary.
  - *Alternatives:* Separate repos.
  - *Trade-offs:* Slightly higher initial learning curve for the founder.
  - *Upgrade Path:* Easily split into multiple repos if the team grows massively.

- **Decision 2: Use BullMQ (Redis) for Async Tasks**
  - *Reason:* Synchronous API responses waiting on AI and Hedera will time out. A background queue is mandatory.
  - *Alternatives:* Serverless functions (Vercel Background jobs), AWS SQS.
  - *Trade-offs:* Requires running a Redis instance. (Solved cheaply by Upstash).

- **Decision 3: Delete files immediately post-processing**
  - *Reason:* Massive reduction in storage costs and severe reduction in legal liability (GDPR compliance) regarding user data.
  - *Alternatives:* Persistent cloud storage.
  - *Trade-offs:* Users cannot "re-download" the original file from us. We only store the Verification Record.

---

## 10. Final Technology Checklist

*All systems go. The following stack is approved for implementation.*

- [x] **Language:** TypeScript
- [x] **Frontend:** Next.js, Tailwind CSS
- [x] **Backend:** Node.js, Express
- [x] **Database:** PostgreSQL (Supabase)
- [x] **ORM:** Prisma
- [x] **Auth & Storage:** Supabase Auth & Storage
- [x] **AI:** OpenAI (Node.js SDK)
- [x] **Web3:** Hedera Hashgraph SDK (`@hashgraph/sdk`)
- [x] **Queue:** BullMQ + Upstash Redis
- [x] **Validation:** Zod
- [x] **Logging:** Pino + Sentry
- [x] **Deployment:** Vercel (Front) + Railway (Back)
- [x] **CI/CD:** GitHub Actions
- [x] **Package Manager:** `pnpm`

***End of Document. Implementation can now commence.***
