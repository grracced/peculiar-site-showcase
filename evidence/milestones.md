# Milestones

Dates and short commit identifiers come from the private repository's history and status documents. Short identifiers are given only so claims can be checked by the author; they do not link to the private repository.

| Date (2026) | Milestone | Reference |
|---|---|---|
| 27 Jul | Repository created | initial commit |
| 14 Aug | Initial platform: staff portal, academic setup, attendance/timetable, results and approval, report cards and PDF, student portal, production host architecture | `13a0443` … `1ec4a7f` |
| 15 Aug | CBT authoring, runtime and grading; settings; notifications; audit logging; security hardening; core-workflow QA | `706514c`, `e300732`, `c5cca9a` |
| 24 Aug | Phase 1 identity and RBAC foundation | `7633f84` |
| 25 Aug | Split-database production cutover preparation; school fees finance module | `616ca05`, `0adc595` |
| 31 Aug | Proprietor finance visibility and documented concessions | `3f326cb` |
| 2 Sep | Student progression engine and execution authority | `a8a4708` |
| 4 Sep | Omega programme begins: architecture authority; identity classification | `8b99a74`, `76e1625` |
| 5 Sep | Protected administrator conversion; technical root account and email one-time code login (recorded live) | status ledger |
| 6 Sep | Results/CBT assessment governance; dedicated examination host and runtime boundary | `12b2369`, `25f5a0c` |
| 7 Sep | Admissions maker-checker workflow | `033d6f8` |
| 10 Sep | Omega final production governance phase recorded | `999fcaf` |
| 13 Sep | Bookstore schema and role | `da7faa6` |
| 25 Sep | Academic structure and progression overhaul recorded | `4b46f25` |
| 26 Sep | **Orbit A – J**: result data model → configuration → workspace → calculations → PDF → lifecycle → conduct → report cards/ZIP → approval and amendments → security/audit hardening | `ee22f93` … `c90b204` |
| 27 Sep | Report card auto-population and PDF redesign; per-student result PDF; report-card layout fixes | `44f4abd`, `64fe1b0`, `1aaf70b` |
| 27 Sep | **PO-1** Result Explorer foundation | `ca60d14` |
| 28 Sep | **PO-2** Full Student Result | `893d0a6` |
| 28 Sep | **PO-3** Subject/Class Result unification | `9e79862` |
| 28 Sep | **PO-4** Class Consolidated Result | `7d21399` |
| 28 Sep | **PO-5** Standardized Student Result PDF | `a9c3533` |
| 28 Sep | **PO-6** Unified result export engine | `ddb6add` |
| 28 Sep | **PO-7** Report-card export integration | `0aeb66f` |
| 28 Sep | Class-teacher class-wide view/export rule | `6cf1b54` |
| 28 Sep | **PO-8** Compatibility cleanup | `7ef329e` |
| 28 Sep | **PO-9** Full regression and visual QA; merged to `main` | `453ee4f` |

## Reading this table

- "Recorded live" means the repository's status ledger says the phase was released to production; it does not describe usage.
- The Post-Orbit phases (PO-1 – PO-9) were merged to `main` on 28 Sep 2026. At the time this showcase was written the repository did not yet record production acceptance for them, so they are described here as *implemented and tested*, not as *deployed*.
