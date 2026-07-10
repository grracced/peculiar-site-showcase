# VerifAI Testing Strategy

This document defines the automated testing standards for the VerifAI platform. Adhering to these principles is mandatory before any PR can be merged.

## The Testing Pyramid
VerifAI follows a strict Testing Pyramid to balance execution speed, isolation, and confidence:
1. **Unit Tests (80% of volume):** Tests individual functions, hooks, and utilities in complete isolation.
2. **Integration Tests (15% of volume):** Tests the interaction between the application and the database (Prisma) or between multiple services.
3. **End-to-End Tests (5% of volume):** Tests the critical user journeys (e.g., Upload -> Verify -> Dashboard) via an automated browser.

## Testing Frameworks
- **Unit & Integration:** `Vitest` (Chosen over Jest for its speed and native ESM/TypeScript support).
- **Frontend DOM Testing:** `@testing-library/react` (Focuses on testing user behavior, not implementation details).
- **End-to-End (E2E):** `Playwright` (Cross-browser automation).

## Folder Structure & Naming Conventions
- Tests should live adjacent to the code they are testing, using the `.test.ts` or `.test.tsx` suffix.
  - Example: `src/utils/hash.ts` -> `src/utils/hash.test.ts`
- E2E tests live in the root `/tests/e2e` directory.
- Test fixtures (sample documents, mock API responses) live in `tests/fixtures/`.
- Global mocks live in `tests/mocks/`.

## Mocking Strategy
The golden rule: **Never make real network requests to third-party APIs during automated tests.**
- **OpenAI / Gemini:** Mock the API response to return deterministic JSON using Vitest's `vi.mock()`.
- **Hedera Hashgraph:** Do NOT hit the Hedera Testnet in Unit/Integration tests. Mock the `@hashgraph/sdk` to return a static transaction ID and receipt.
- **Supabase Auth:** Mock the JWT session payload.

## Test Environment Isolation
Development data must never be accidentally wiped by tests. 
- Vitest automatically loads the `.env.test` file.
- The `DATABASE_URL` in `.env.test` explicitly points to a different logical database (`verifai_test`).
- **Cleanup Strategy:** Every database integration test MUST rollback its transaction at the end of the test, or the test runner must truncate the tables before the suite begins.

## CI Integration
GitHub Actions (`ci.yml`) automatically runs:
1. `pnpm run type-check`
2. `pnpm run test` (Vitest Unit/Integration)
*(Note: Playwright E2E tests are currently reserved for later deployment staging checks).*

## Minimum Coverage Requirements
- **Lines, Functions, Branches, Statements:** Minimum 80% coverage for backend logic and 70% for frontend UI components.
- Run `pnpm run test:coverage` to generate the HTML report locally.
