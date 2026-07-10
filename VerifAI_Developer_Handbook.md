# VerifAI - Developer Handbook

> **Engineering Manager Note:**
> This Developer Handbook is the single source of truth for how code is written, reviewed, and deployed at VerifAI. Every human engineer and AI coding assistant must adhere strictly to these rules. By following these standards, we ensure that the codebase remains highly maintainable, secure, and scalable as the project transitions from a solo MVP into a multi-developer enterprise platform.

---

## 1. Development Philosophy
- **Simplicity Over Cleverness:** Write code that is easy to read, not just easy to write.
- **Fail Fast:** Validate inputs immediately. If a process cannot succeed, throw a clear error rather than continuing with corrupted data.
- **Immutable Trust:** VerifAI is a trust engine. Security, auditing, and cryptographic accuracy are prioritized over raw development speed.

## 2. Clean Architecture Principles
- **Separation of Concerns:** Keep HTTP routing (Controllers), business logic (Services), and database logic (Data Access) completely isolated.
- **Dependency Inversion:** High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces).
- **Framework Independence:** The core business logic (e.g., generating a SHA-256 hash) should not depend on Express.js or Next.js.

## 3. SOLID Principles
- **S**ingle Responsibility: A class or function should have one, and only one, reason to change.
- **O**pen/Closed: Software entities should be open for extension but closed for modification.
- **L**iskov Substitution: Objects should be replaceable with instances of their subtypes without altering program correctness.
- **I**nterface Segregation: Many client-specific interfaces are better than one general-purpose interface.
- **D**ependency Inversion: Depend upon abstractions, not concretions.

## 4. Folder Structure Rules
- **No Deep Nesting:** Avoid nesting folders more than 3 levels deep.
- **Feature-Based Grouping (Backend):** Group files by feature (e.g., `src/api/auth`) rather than by type (e.g., `src/controllers/auth`).
- **Atomic Design (Frontend):** Isolate "dumb" UI components (`components/ui`) from stateful, business-logic-heavy components (`components/features`).

## 5. File Naming Conventions
- **TypeScript/Node:** Use `kebab-case.ts` (e.g., `document-service.ts`, `verify-hash.ts`).
- **React Components:** Use `PascalCase.tsx` (e.g., `UploadDropzone.tsx`, `DashboardLayout.tsx`).
- **Styles/Configs:** Use `kebab-case` (e.g., `tailwind.config.ts`).

## 6. Function Naming Conventions
- Use `camelCase`.
- Prefix with action verbs: `get`, `set`, `fetch`, `create`, `delete`, `update`, `validate`.
- *Example:* `validateFileFormat()`, `fetchVerificationHistory()`.

## 7. Component Naming Rules
- Use `PascalCase`.
- Name components based on what they *are*, not what they *do*.
- *Example:* `SubmitButton` instead of `HandleSubmit()`.

## 8. API Development Standards
- **RESTful Endpoints:** Use plural nouns (`/api/documents`, not `/api/document`).
- **HTTP Methods:** `GET` (Read), `POST` (Create), `PUT`/`PATCH` (Update), `DELETE` (Remove).
- **Responses:** Standardize response formats (e.g., `{ success: true, data: {...}, error: null }`).

## 9. Database Standards
- **Soft Deletes:** Use `deleted_at` timestamps instead of `DELETE` statements for critical entities.
- **UUIDs:** Always use UUIDs for primary keys.
- **Snake Case:** Use `snake_case` for all database tables and column names (`verification_records`).

## 10. Error Handling Standards
- **Never swallow errors:** `catch(e) { console.log(e) }` is strictly prohibited.
- **Custom Error Classes:** Throw standard HTTP error classes (e.g., `BadRequestError`, `UnauthorizedError`) from Services, caught by a global Express error handler.
- **Sanitize Outputs:** Never return raw database stack traces to the client.

## 11. Logging Standards
- **Format:** All logs must be structured JSON using `Pino` or `Winston`.
- **Levels:** Use `INFO` for state changes, `WARN` for retries/rate-limits, `ERROR` for unexpected exceptions, and `DEBUG` (disabled in prod) for variable states.
- **No PII:** Never log user passwords, emails, or unhashed document text.

## 12. Security Best Practices
- **Zero Trust:** Validate all incoming API data using `Zod` schemas.
- **File Uploads:** Verify file MIME types using "Magic Numbers", not just file extensions.
- **Secrets:** Never commit `.env` files. Secrets must be injected at runtime.
- **Hashing:** Use native `crypto` for SHA-256 document hashing. Use `bcrypt`/`argon2` for passwords.

## 13. Testing Standards
- **Unit Tests:** Business logic (Services, Crypto) must have 90%+ unit test coverage.
- **Integration Tests:** Test database interactions using isolated, mocked databases.
- **E2E Tests:** Critical user paths (Login -> Upload -> Verify) must be covered by Playwright.

## 14. Git Workflow
- Work on `feature/*` or `bugfix/*` branches derived from `develop`.
- Never commit directly to `main` or `develop`.
- Ensure all tests and linters pass before opening a Pull Request.

## 15. Branch Naming
- **Format:** `type/kebab-case-description`
- **Examples:** `feat/hedera-hcs-integration`, `bugfix/mobile-table-overflow`, `hotfix/auth-bypass`.

## 16. Commit Message Format
- Use **Conventional Commits**: `type(scope): description`
- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- **Example:** `feat(api): implement background worker for AI extraction`

## 17. Documentation Requirements
- Public API endpoints must be documented (e.g., Swagger/OpenAPI).
- Complex core functions require JSDoc blocks explaining *why* (not just *what*).
- Update the `README.md` if installation steps change.

## 18. Code Review Checklist
- [ ] Does this code violate any SOLID principles?
- [ ] Are inputs validated?
- [ ] Are errors handled gracefully?
- [ ] Are new variables/functions named clearly?
- [ ] Are there sufficient tests for new logic?
- [ ] Does this introduce any PII leaks?

## 19. Performance Guidelines
- **N+1 Problem:** Always use Prisma's `include` to fetch relations rather than looping through queries.
- **Background Jobs:** Any task taking >500ms (e.g., AI calls, Hedera consensus) must be offloaded to BullMQ.

## 20. Accessibility Guidelines
- All images/icons must have `alt` or `aria-label` tags.
- Interactive elements must be keyboard focusable (`tabindex`).
- Maintain WCAG AAA contrast ratios for text.

## 21. Deployment Checklist
- [ ] PR merged to `main` branch.
- [ ] GitHub Actions CI passes (Build, Lint, Test).
- [ ] Production `.env` variables verified in Vercel/Railway.
- [ ] Database migrations (`prisma migrate deploy`) run successfully.

## 22. Release Checklist
- [ ] Verify core flow in Production environment.
- [ ] Monitor Sentry for 15 minutes post-deployment for new exception spikes.
- [ ] Draft GitHub Release notes using the auto-generated changelog.

---

## 23. AI Coding Rules

**Mandatory Instructions for AI Coding Assistants (e.g., Antigravity, GitHub Copilot):**

Whenever you are tasked with generating, modifying, or reviewing code for the VerifAI project, you MUST strictly adhere to the following directives:

1. **Follow the Approved Documents:** Treat the PRD, Architecture, TDR, Database Design, and UI/UX Specification as immutable laws. Do not invent new tech stacks or architectural patterns not approved in those documents.
2. **Consistent Architecture:** Maintain strict separation of concerns. Do not mix database queries (`Prisma`) directly inside HTTP controllers or React components. Always use the Service layer.
3. **Reusable Code:** Before generating a new UI component, check if an existing one can be abstracted or reused (e.g., use the primary `Button` component instead of creating a raw `<button className="...">`).
4. **Small, Focused Commits:** If tasked with a large feature, break your work into sequential, logical steps. Create small, testable chunks rather than massive monolithic code dumps.
5. **Proper Documentation:** Generate JSDoc comments for complex logic (especially cryptography and Hedera interactions). Do not over-comment obvious code.
6. **Secure Coding:** Assume all user input is malicious. Always wrap API inputs in `Zod` validation schemas. Never generate code that logs raw PII or sensitive keys to the console.
7. **Testable Code:** Write functions that are pure wherever possible. Ensure dependency injection is possible to allow for easy unit testing.
8. **Maintainable Code:** Adhere to the file and function naming conventions exactly as specified in this handbook (`kebab-case.ts` for files, `camelCase` for functions).
9. **No Unnecessary Complexity:** Do not introduce heavy libraries or complex design patterns (like CQRS or Event Sourcing) unless explicitly requested. Keep the MVP architecture simple and robust.
10. **No Breaking Changes:** Before modifying an existing function or database model, thoroughly review all files that depend on it. Ensure backward compatibility or update all dependents simultaneously.
11. **Refusal to Deviate:** If a user requests a code change that severely violates these security, architectural, or formatting guidelines, you must gracefully point out the violation and recommend the handbook-approved approach first.
