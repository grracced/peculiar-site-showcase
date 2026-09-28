# Testing and QA

## Approach

The project uses one lightweight PHP harness rather than a test framework. A runner discovers `*-check.php` programs, executes each in its own process, and reports pass, fail and skip totals. Three kinds of check coexist:

| Kind | What it proves | Needs a database |
|---|---|---|
| **Static contract checks** | Source-level invariants: a route is registered once, a renderer contains no calculation, an export layer contains no write statements, a function delegates where it must | No |
| **Behavioural checks** | Pure functions and workflows run against fakes or fixtures (ranking, sanitization, workflow transitions, PDF generation in memory) | No |
| **MySQL integration and rehearsal checks** | Migrations on an empty database, idempotent re-runs, foreign keys and uniqueness, triggers, workflows end to end, migration rehearsals on a disposable database | Yes (opt-in) |

Integration tests refuse to run unless the environment is explicitly a test environment and the database name ends in `_test`, so they cannot be pointed at production data by accident.

Deploy tooling has its own shell tests (controlled orchestrator, forward-only migration behaviour, release classification, reliability, self-test).

## Regression strategy

- **Every phase ships a check.** The Orbit phases (A–J) and Post-Orbit phases (PO-1 – PO-9) each have a matching program.
- **A final cross-cutting regression (PO-9)** encodes the invariants of the finished result system: all nine export types reachable through one dispatcher and no second dispatcher; the class-teacher rule intact; report-card permissions separate; result/export file set read-only; route registries consistent; the two missing-value conventions used only where established; no duplicate calculation engine; mature renderers untouched.
- **CI on every change**: PHP syntax over the whole codebase, JavaScript syntax, GD/WebP runtime capability, migration safety/history/classification, and a real MySQL migrate-and-rerun.
- **Defects become tests.** Real defects found along the way (for example a readiness check that blocked submissions, a route that re-included a module, a query binding bug) were reproduced, fixed at the source and covered.

## Visual QA

Report-card and result PDFs were checked visually during Post-Orbit and the preceding refinement pass: page-overflow fixes so a report card fits one page, a fixed-height subjects table for consistent layout, column alignment, and removal of a stray disclaimer. Record-keeping honesty: the repository documents that rendered device, keyboard and contrast checks were **manual operator acceptance** where no browser tooling was available, and that no automated browser suite or stored screenshot evidence is claimed.

## Known limitations (stated in the repository)

- Many result and export checks are static contract tests; end-to-end HTTP behaviour of every export type against a live database and PDF engine was not exercised in the development environment used for Post-Orbit, and the repository records that as a known limitation.
- Two environment-dependent checks (composer dependencies, PDF engine) failed in one assisted session for environmental reasons and passed once dependencies were present.
- Manual browser acceptance is recorded for some production releases but is not automated.

Latest run and lint results: [evidence/testing.md](../evidence/testing.md).
