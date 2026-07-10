# GitHub Workflows & Templates

This directory governs the Continuous Integration and Continuous Deployment (CI/CD) pipelines and community contribution templates for VerifAI.

## CI/CD Architecture Overview

VerifAI uses GitHub Actions to automate code quality checks, preventing broken code from entering the protected `develop` and `main` branches.

### Workflows Explained
1. **`ci.yml` (Continuous Integration):**
   - **Trigger:** Pull Requests to `main` and `develop`.
   - **Purpose:** Caches `node_modules` via `pnpm/action-setup`, strictly enforces formatting (`prettier --check`), runs `eslint`, executes `tsc --noEmit` across all packages, and verifies that both the Next.js and Express apps build successfully. If this workflow fails, the PR cannot be merged.
2. **`cd.yml` (Continuous Deployment):**
   - **Trigger:** Merges to `main` or Manual Dispatch.
   - **Purpose:** Currently an architectural placeholder. In later phases, this will read secure tokens (`VERCEL_TOKEN`, `RAILWAY_TOKEN`) from GitHub Secrets to securely orchestrate cloud deployments without exposing keys.
3. **`release.yml`:**
   - **Trigger:** Pushing a semantic version tag (e.g., `v1.0.0`).
   - **Purpose:** Automatically drafts a GitHub Release and generates a changelog based on the Conventional Commits found in the PR history.

## Branch Protection Recommendations

To enforce this pipeline, the repository administrator **MUST** configure the following branch protection rules in the GitHub Repository Settings for both the `main` and `develop` branches:

1. **Require a pull request before merging.**
   - Require approvals: Minimum 1.
2. **Require status checks to pass before merging.**
   - Require branches to be up to date before merging.
   - Add `Code Quality & Tests` and `Build Verification` (from `ci.yml`) as Required Status Checks.
3. **Do NOT allow bypassing the above settings.**
4. **Restrict who can push to matching branches.** (Prevent direct pushes to `main`).
5. **Allow force pushes: OFF.** (Never force push to protected branches).
