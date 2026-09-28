# Testing evidence

A run of the private repository's own harness, performed while preparing this showcase.

## Run record

| Item | Value |
|---|---|
| Date | 28 Sep 2026 |
| Subject | Private repository `main` (merge of the final Post-Orbit regression work) |
| Environment | Fresh container, PHP 8.4 CLI (production targets PHP 8.3), `composer install` from the lockfile, extensions dom, gd, mbstring, zip, pdo_mysql present, **no MySQL server** |
| Command | `php tests/run.php --static-only` |
| Result | **208 passed, 0 failed, 27 skipped** in about 23 seconds |
| Skipped | 27 programs that need a disposable MySQL database (rehearsals for migrations, finance, bookstore, break-glass, admissions, exam sessions, and similar). They report "skipped (disposable MySQL variables are not set)" |
| Lint | `php -l` over all 436 PHP files outside `vendor/`: no syntax errors |

The skips mean database-backed behaviour was **not** re-verified in this run. Earlier database-backed results are recorded in the repository's status documents (for example an isolated MySQL 8 run of 22 test programs including 91 integration assertions, recorded 15 Aug 2026), but they were not re-run here.

## Selected results from the run

| Program | Result |
|---|---|
| Orbit phases A – J | Pass. Assertion counts printed by the programs: A 71, B 90, C 101, D 130, F 196, G 93, H 50, I 48, J 42 |
| Post-Orbit PO-1 – PO-9 (Explorer, Student Result, Subject/Class, Class Consolidated, Student Result PDF, export engine, report-card integration, compatibility cleanup, full regression) | Pass |
| Class-teacher result access rule | Pass |
| Subject-teacher authority | Pass |
| Maker-checker foundation | Pass (67 assertions) |
| Audit logging and security hardening | Pass |
| Report-card PDF (real in-memory PDF generation) | Pass |

## Coverage map (by theme, not by count)

| Theme | Examples of what is checked |
|---|---|
| Regression | Full Post-Orbit invariants; Orbit phase contracts; release regression |
| Static analysis | Whole-codebase PHP syntax in CI; JavaScript syntax; route registry consistency |
| Authorization | Class-teacher and subject-teacher rules; multi-role RBAC; protected-admin and technical-account isolation; special access governance |
| Historical context | Explicit scope on result reads; no fallback to active context; enrollment history; progression |
| Exports | Nine export types, dispatcher uniqueness, compatibility wrappers, read-only export layer |
| PDF | Report-card PDF, Student Result PDF, bookstore documents, branding/logo handling |
| ZIP / CSV | Entry naming and collisions, temp cleanup, CSV schema and injection defence |
| Data integrity | Payment allocation, append-only records, migration safety and history, backup manifest and privilege |
| Delivery | Deploy orchestrator, forward-only behaviour, release classification (shell tests) |

## What this evidence does not show

- It does not show production behaviour, traffic, uptime or performance.
- Static contract tests assert that code is structured a certain way; they are not a substitute for end-to-end tests, and the repository says so itself.
- No load, fuzz or penetration testing results are included because none are recorded.
