# VerifAI - GitHub Engineering Standards

> **Engineering Manager Note:**
> This document serves as the official GitHub engineering handbook for VerifAI. By standardizing our branching strategies, commit messages, and issue tracking from Day 1, we ensure that the codebase remains clean, history remains legible, and onboarding new developers (or open-source contributors) is entirely frictionless.

---

## 1. Git Branch Strategy

We utilize a structured **Git Flow** tailored for SaaS development.

- **`main`**: The single source of truth. This branch reflects the exact state of Production. Commits are never made directly to `main`.
- **`develop`**: The integration branch for the next release. Reflects the state of the Staging environment. All completed features merge here first for testing.
- **`feature/*`**: Used for developing new features (e.g., `feature/hedera-hcs-integration`). Branches off `develop` and merges back into `develop`.
- **`bugfix/*`**: Used for fixing non-critical bugs found in staging or development (e.g., `bugfix/upload-timeout`). Branches off `develop`.
- **`hotfix/*`**: Used *only* for critical production issues (e.g., `hotfix/auth-bypass`). Branches off `main` and merges directly back into `main` (and `develop`).
- **`release/*`**: Created from `develop` when preparing for a production deployment (e.g., `release/v1.0.0`). Used for final version bumping and QA before merging into `main`.

---

## 2. Commit Convention

We enforce **Conventional Commits**. This allows us to auto-generate changelogs and forces developers to think about the *intent* of their code changes.

**Format:** `type(scope): description`

**Commit Types & Examples:**
- **`feat`**: A new feature. 
  - *Example:* `feat(api): implement SHA-256 document hashing`
- **`fix`**: A bug fix. 
  - *Example:* `fix(ui): resolve overflow on mobile table view`
- **`docs`**: Documentation only changes. 
  - *Example:* `docs(readme): add environment variable setup guide`
- **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons). 
  - *Example:* `style(frontend): format components with Prettier`
- **`refactor`**: A code change that neither fixes a bug nor adds a feature. 
  - *Example:* `refactor(core): abstract Hedera SDK logic into dedicated service`
- **`perf`**: A code change that improves performance. 
  - *Example:* `perf(db): add B-Tree index to sha256_hash column`
- **`test`**: Adding missing tests or correcting existing tests. 
  - *Example:* `test(api): add unit tests for verification endpoint`
- **`chore`**: Changes to the build process or auxiliary tools. 
  - *Example:* `chore(deps): bump @hashgraph/sdk to v2.30.0`

---

## 3. Pull Request Workflow

### PR Template (`.github/pull_request_template.md`)
Every PR must include a description based on this template:
1. **Description:** What does this PR do?
2. **Issue Linked:** Fixes #123
3. **Type of Change:** [ ] Bug fix [ ] New feature [ ] Breaking change
4. **How has this been tested?:** Detail the manual or automated tests run.
5. **Screenshots:** (If UI changes were made).

### Review Checklist
Before requesting a review, the author must verify:
- [ ] Code follows the style guidelines (ESLint passes).
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code in hard-to-understand areas.
- [ ] New unit tests have been added and pass.

### Merge Policy
- **Required Reviews:** Minimum 1 approving review from a code owner.
- **Status Checks:** GitHub Actions (Linting, Tests, Build) must pass before merging.
- **Merge Method:** `Squash and merge` is enforced. This turns a messy 10-commit PR into a single, clean Conventional Commit on the `develop` branch.

---

## 4. Issue Templates (`.github/ISSUE_TEMPLATE/`)

We utilize structured Markdown templates for issue reporting:

1. **Bug Report (`bug_report.md`):**
   - Describe the bug.
   - Steps to reproduce.
   - Expected behavior vs. Actual behavior.
   - Environment (OS, Browser).
2. **Feature Request (`feature_request.md`):**
   - Is your feature request related to a problem? Describe.
   - Describe the solution you'd like.
   - Describe alternatives you've considered.
3. **Enhancement (`enhancement.md`):**
   - Proposing an improvement to existing functionality.
4. **Documentation (`documentation.md`):**
   - Point out missing, confusing, or outdated documentation.
5. **Security Issue:**
   - Redirects the user to `SECURITY.md` so vulnerabilities are *not* publicly exposed in GitHub issues.

---

## 5. GitHub Labels

We categorize labels to easily filter the project board:

**Priority:**
- `priority: high`, `priority: medium`, `priority: low`

**Status:**
- `status: in progress`, `status: pending review`, `status: blocked`

**Type:**
- `type: bug`, `type: feature`, `type: enhancement`, `type: tech debt`

**Community / Open Source:**
- `good first issue` (Perfect for beginners).
- `help wanted` (Core team needs assistance).

**Area / Scope:**
- `scope: frontend`, `scope: backend`, `scope: database`
- `scope: ai`, `scope: hedera`, `scope: ui/ux`
- `scope: docs`, `scope: testing`, `scope: security`

---

## 6. README Structure (`README.md`)

The root `README.md` is the front page of the project. It must contain:

1. **Project Overview:** High-level summary of VerifAI (AI + Hedera trust engine).
2. **Features:** Bullet points of core capabilities.
3. **Architecture:** Link to the Architecture document and brief diagram description.
4. **Folder Structure:** Brief explanation of the monorepo setup (`apps/`, `packages/`).
5. **Installation / Local Setup:** Step-by-step commands (`pnpm install`, `docker compose up`).
6. **Environment Variables:** Reference to `.env.example`.
7. **Development:** Commands for running tests, linters, and the dev server.
8. **Deployment:** High-level deployment strategy (Vercel/Railway).
9. **Contributing:** Link to `CONTRIBUTING.md`.
10. **License:** Open Source licensing declaration.

---

## 7. CONTRIBUTING.md

This file defines the rules for external contributions:
- Instructions for forking the repository and setting up the local environment.
- The requirement to follow the Git Branch Strategy and Conventional Commits.
- The requirement to link PRs to an open Issue.
- Instructions on how to run tests locally before submitting a PR.

---

## 8. CODE_OF_CONDUCT.md

We adopt the **Contributor Covenant**.
- **Purpose:** Fostering an open, welcoming, and professional environment.
- **Standards:** Using welcoming language, being respectful of differing viewpoints, gracefully accepting constructive criticism.
- **Enforcement:** Clear instructions on how to report harassment or unacceptable behavior to the project maintainers.

---

## 9. SECURITY.md

Provides responsible vulnerability reporting guidelines:
- **Policy:** "Do not open a public issue for security vulnerabilities."
- **Reporting:** Instructs researchers to email `security@verifai.com` directly.
- **Response Time:** Promises an initial acknowledgment within 48 hours and a timeline for a patch.
- **Supported Versions:** Clearly defines which older versions of the software are still receiving security patches.

---

## 10. LICENSE

**Recommendation: Apache License 2.0**
- **Why:** The Apache 2.0 license is an incredibly permissive open-source license, but crucially, it includes an explicit grant of patent rights. It allows anyone to use, modify, and distribute the software (commercially or privately).
- **Commercialization:** Unlike the GPL (which forces derivative works to also be open-source), Apache 2.0 allows you to later build proprietary, commercial enterprise features on top of this open-source foundation without legal issues. It is the gold standard for startups that want an open core but plan to monetize later.
