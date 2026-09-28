# Engineering decisions

Each entry follows **Context → Decision → Reason → Trade-off → Outcome**. Reasons are reconstructed from the implementation, design documents and commit history of the private repository. They are documented rationale, not quotations from the time of writing.

## 1. Native PHP and MySQL, no framework

- **Context:** A school platform with modest traffic, a small team, and hosting on a small VM.
- **Decision:** PHP 8 with PDO and MySQL 8; server-rendered pages; a few Composer libraries (Dompdf, OpenSpout).
- **Reason:** Low operational footprint, straightforward hosting, few moving parts to learn or secure, and the ability to keep dependencies small and auditable.
- **Trade-off:** Conventions a framework would provide (routing, validation, CSRF, ORM) are hand-built and must be kept consistent; the project mitigates this with shared helpers and contract tests.
- **Outcome:** ~106 modules share one bootstrap, one authorization layer and one audit service.

## 2. Single-VM deployment with controlled releases

- **Context:** Cost and simplicity matter; downtime tolerance is that of a school, not a payment processor.
- **Decision:** One VM (Nginx, PHP-FPM, MySQL) with GitHub Actions and a root-owned deploy orchestrator; no containers or orchestration.
- **Reason:** Fewer components, easier recovery reasoning, low cost.
- **Trade-off:** No redundancy; recovery is backup-and-restore.
- **Outcome:** Releases are classified, backed up and health-checked; see [deployment](deployment.md).

## 3. Server-rendered architecture

- **Context:** Mostly forms, tables and printable documents used on varied devices, including modest phones.
- **Decision:** Render HTML on the server; use small, framework-free JavaScript for filters and confirmations.
- **Reason:** Authorization and escaping happen in one place, pages work with little JavaScript, and PDFs can share data-building code with screens.
- **Trade-off:** Full-page requests for filter changes; less interactive than a single-page app.
- **Outcome:** Filters are GET-driven and shareable; the same read models feed pages and documents.

## 4. Database-backed RBAC plus academic authority

- **Context:** Many staff types with overlapping duties; teachers have class- and subject-level responsibilities that change every session.
- **Decision:** Many-to-many roles with unioned permissions, combined with per-session academic assignments for teaching scope ([details](authorization-and-rbac.md)).
- **Reason:** Roles describe organization-wide duties; assignments describe academic responsibility. Neither can express the other.
- **Trade-off:** More concepts to understand and maintain.
- **Outcome:** View/export and manage authority differ cleanly; role changes do not require code changes.

## 5. Historical academic context

- **Context:** Results, enrollments and fees must remain correct for past sessions after classes are promoted and staff change.
- **Decision:** Treat Session + Term + Class + Category + Subject as an explicit scope key on reads; store enrollment history; snapshot charges.
- **Reason:** Deriving "the past" from "the present" produces wrong answers after the first promotion.
- **Trade-off:** Every function takes more parameters; no shortcuts through "current session" helpers.
- **Outcome:** Older terms can be viewed without altering the active context ([architecture](architecture.md#historical-context)).

## 6. Authoritative read models

- **Context:** Several outputs (screens, PDFs, CSV, ZIP, report cards) must agree.
- **Decision:** One calculation service and a small set of read models; renderers do layout only.
- **Reason:** Two calculations eventually disagree.
- **Trade-off:** Read models need to be general enough for all consumers.
- **Outcome:** A regression test guards against a second calculation path ([results system](results-system.md)).

## 7. Separate Student Result and Report Card

- **Context:** Both show a student's scores.
- **Decision:** Keep them distinct documents over the same model. The Student Result is an analytic view/export of scores; the report card is the official document with conduct, remarks, grading key and next-term date.
- **Reason:** Different audiences and permissions (report cards have their own permission domain), different completeness rules.
- **Trade-off:** Two renderers to keep visually consistent.
- **Outcome:** The mature report-card renderer was reused rather than rewritten.

## 8. Unified export orchestration

- **Context:** Several routes each doing their own parsing, authorization and audit.
- **Decision:** One route, one dispatcher, nine closed export types ([export architecture](export-architecture.md)).
- **Reason:** One place to secure and audit.
- **Trade-off:** A central component that must be well tested.
- **Outcome:** Legacy routes became thin wrappers with tests against duplication.

## 9. Retain compatibility routes during migration

- **Context:** Staff may have bookmarks or printed links to old export URLs.
- **Decision:** Keep old routes as wrappers that delegate in-process; migrate internal links; classify each route (canonical, wrapper, distinct feature, dead) and remove only when justified.
- **Reason:** Avoid breaking users while consolidating.
- **Trade-off:** Temporary duplicate surface.
- **Outcome:** No route was classified dead at the final audit; wrappers are documented.

## 10. Append-only records for money and audit

- **Context:** Financial and accountability records must survive bugs and mistakes.
- **Decision:** Append-only tables enforced by database triggers; reversals instead of edits; integer minor units.
- **Reason:** Application-level rules can be bypassed by a bug; database-level rules cannot be bypassed by ordinary application code.
- **Trade-off:** Corrections require explicit reversal workflows and more UI.
- **Outcome:** See [security and data integrity](security-and-data-integrity.md).

## 11. Split staff and portal data domains

- **Context:** Students and parents should never share credentials or blast radius with staff RBAC data.
- **Decision:** Separate logical databases and PHP-FPM pools with distinct credentials, introduced through a compatibility period during which the original database stayed authoritative.
- **Reason:** Reduce the impact of a compromise of the public-facing surface.
- **Trade-off:** Cross-domain reads need explicit snapshots (a non-secret staff projection in the portal domain) and migration ledgers on each schema.
- **Outcome:** Recorded cutovers with coordinated backups; see [project evolution](project-evolution.md).

## 12. A custom test harness

- **Context:** Small team, mixed static and database-backed checks, and a need to run the same checks locally and in CI.
- **Decision:** A lightweight PHP runner that discovers `*-check.php` programs, with a separate opt-in disposable-MySQL mode.
- **Reason:** No framework dependency; contract checks fit the project's "prove the invariant" style.
- **Trade-off:** Many checks read source rather than run flows, which is weaker than end-to-end testing. This is acknowledged in [testing and QA](testing-and-qa.md).
- **Outcome:** Every phase ships with its own check program.
