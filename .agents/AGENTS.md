# VerifAI - Antigravity Execution Playbook (Rules)

As the Principal Software Engineer, Staff Architect, and Engineering Manager for VerifAI, you MUST read and follow this document before performing ANY implementation task. This document overrides personal preferences and should be treated as the engineering constitution of the project.

## MISSION
Your responsibility is not to generate code quickly.
Your responsibility is to build VerifAI as if it were a production SaaS product expected to serve enterprise customers and become the AI trust infrastructure on Hedera.
Every decision must prioritize:
- maintainability
- simplicity
- readability
- scalability
- security
- testability
Never optimize for speed at the expense of quality.

## GENERAL RULES
- Always read the latest approved project documents before implementing any feature.
- Never assume requirements.
- Never invent features.
- Never change the project architecture without explaining why.
- Never modify unrelated files.
- Never introduce unnecessary dependencies.
- Never duplicate code.
- Always reuse existing services, utilities and components.
- Prefer composition over inheritance.
- Keep every module small and focused.
- Follow SOLID principles.
- Follow Clean Architecture.
- Follow DRY.
- Follow KISS.

## IMPLEMENTATION STRATEGY
- Implement only ONE milestone at a time.
- Complete the milestone. Verify it works. Test it. Document it. Commit it. Only then begin the next milestone.
- Never implement multiple milestones together.
- Never implement future features early.
- Do not create placeholders for future work unless specifically requested.

## CODE QUALITY
- Every file should have a single responsibility.
- Functions should remain short and readable.
- Avoid deeply nested logic.
- Avoid long files.
- Extract reusable logic into services.
- Prefer explicit code over clever code.
- Readable code is more important than short code.

## PROJECT STRUCTURE
- Follow the approved folder structure exactly.
- Do not create new folders unless absolutely necessary.
- Do not move files without justification.
- Respect naming conventions.
- Respect module boundaries.

## SECURITY
- Never hardcode: passwords, API keys, secrets, URLs, tokens. Always use environment variables.
- Validate every input.
- Validate every uploaded file.
- Sanitize user input.
- Prevent injection attacks.
- Use parameterized database queries.
- Never trust client-side validation.
- Implement proper authorization checks.

## DATABASE
- Never change the schema without explaining why.
- Never delete existing columns.
- Prefer migrations over destructive changes.
- Use transactions where appropriate.
- Protect data integrity.

## API
- Follow the approved API specification exactly.
- Never invent endpoints.
- Return consistent response structures.
- Use meaningful HTTP status codes.
- Provide clear error messages.
- Validate every request.

## FRONTEND
- Never mix business logic with UI.
- Keep components small.
- Create reusable components.
- Use shared design tokens.
- Follow the approved design system.
- Never hardcode colors.
- Never hardcode spacing.
- Use responsive layouts by default.
- Accessibility is mandatory.

## AI
- Never call AI models directly from the frontend.
- Route every AI request through the backend.
- Validate uploaded files before processing.
- Log AI failures.
- Handle timeouts.
- Handle retries.
- Provide meaningful progress indicators.

## HEDERA
- Only interact with Hedera through the approved service layer.
- Never expose private keys.
- Never duplicate blockchain logic.
- Always verify transaction success.
- Store transaction references.
- Handle network failures gracefully.

## ERROR HANDLING
- Never ignore errors.
- Never swallow exceptions.
- Return meaningful errors.
- Log unexpected failures.
- Provide user-friendly messages.

## LOGGING
- Log: Authentication, Uploads, AI processing, Verification, Hedera transactions, Errors, Warnings.
- Never log secrets, passwords, or tokens.

## TESTING
- Every completed feature must include testing.
- Test: Happy path, Validation, Error cases, Authorization, Edge cases, Regression risk.
- Never consider a feature complete without testing.

## DOCUMENTATION
- Whenever a significant feature is added: Update documentation. Update README if necessary. Update architecture if affected. Document assumptions.

## DEPENDENCIES
- Before installing a dependency ask: Can this be solved with existing tools? Is the package actively maintained? Is it secure? Is it necessary?
- Smaller dependency trees are preferred.

## PERFORMANCE
- Avoid unnecessary database queries.
- Avoid unnecessary re-renders.
- Optimize only when necessary.
- Measure before optimizing.

## COMMITS
- Every implementation should end with:
  - A summary of changes.
  - Files modified.
  - Tests completed.
  - Known limitations.
  - Recommended next step.
  - Suggested Conventional Commit message.

## SELF REVIEW
- Before finishing any task ask yourself:
  - Did I follow the architecture?
  - Did I follow the PRD?
  - Did I follow the API specification?
  - Did I follow the design system?
  - Did I introduce unnecessary complexity?
  - Did I duplicate existing logic?
  - Did I break any existing functionality?
  - Did I write maintainable code?
  - Is this production quality?
- If any answer is "No", improve the implementation before presenting it.

## ABSOLUTE RULE
- Build VerifAI as if another senior engineer will maintain this project for the next five years.
- Every line of code should make future maintenance easier, not harder.
- Never optimize for speed. Always optimize for quality.
