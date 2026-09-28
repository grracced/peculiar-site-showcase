# Project evolution

Peculiar Site was not written once and left alone. Over roughly two months of recorded history (27 Jul – 28 Sep 2026; 810 commits on 35 active days) the same system was extended, hardened, split and restructured while in use. Dates below come from the private repository's commit history and status documents.

```text
Foundation ── Identity & RBAC ── Portal split ── Finance ── Omega governance
                                                                │
   Post-Orbit ◄── Orbit result system ◄── Academic structure & progression
```

## Phases

| Period (2026) | Phase | What changed |
|---|---|---|
| 27 Jul – 14 Aug | **Foundation** | Repository start; public site; PHP/MySQL data access; authentication; staff portal; academic setup, teacher assignments; attendance and timetable; result entry and approval; report cards and PDF; student portal; production host architecture |
| 15 Aug | **CBT, settings, hardening** | CBT authoring, runtime and grading; system settings; notifications; audit logging; security hardening; first full QA pass |
| 24 Aug | **Identity and RBAC** | Phase 1 identity architecture: normalized roles and permissions, portal/staff boundaries |
| 25 Aug | **Split-database cutover and finance** | Prepared production database cutover with upgraded split backups; school fees finance module |
| 31 Aug – 2 Sep | **Finance governance, progression** | Proprietor finance visibility and documented concessions; student progression engine and execution authority; communications worker fixes |
| 4 – 10 Sep | **Omega programme** | Identity classification, protected administrator, technical root account with email one-time code, multi-role RBAC, maker-checker foundation, technical isolation, break-glass recovery, leadership succession, results/CBT governance redistribution, dedicated examination surface, admissions maker-checker, fee-structure and finance governance, audit and identifier governance, operational-independence verification, final governance release |
| 13 – 18 Sep | **Post-Omega** | Bookstore (inventory, sales, pre-orders, receipts); class curriculum and academic-context attendance; admissions experience; finance credits; audit/roles/connectivity governance; emergency stability fixes |
| 25 Sep | **Academic structure and progression overhaul** | Class curriculum, category-aware applicability, subject workspace, student placement, academic progression, SS3 graduation |
| 26 Sep | **Orbit result system (phases A–J)** | Result data model, configuration and permissions, workspace and entry, authoritative calculations, PDF and document settings, academic-context and lifecycle revision, character and conduct, report cards and class ZIP, approval workflow and amendments, security/audit hardening |
| 27 Sep | **Report-card and individual-PDF refinement** | Report cards auto-populate on approval; redesigned PDFs; per-student PDF from the teacher view |
| 27 – 28 Sep | **Post-Orbit result stage (PO-1 – PO-9)** | Result Explorer, full Student Result, subject/class unification, class consolidated view, Student Result PDF, unified export engine, report-card export integration, class-teacher access rule, compatibility cleanup, full regression |

## The Result/Orbit/Post-Orbit story

```text
Existing system  (result entry, approval, basic report cards, August)
      ↓
Identify architectural limitations
      (active-context coupling, several readers of the same data, export sprawl)
      ↓
Orbit: incremental result redesign  (phases A–J)
      one calculation service, configuration locking, lifecycle, conduct, report cards
      ↓
Post-Orbit: authoritative read models and Result Explorer
      three perspectives over the same data, historical viewing
      ↓
PDF and export unification
      Student Result PDF → one export route and dispatcher
      ↓
Report-card export integration + class-teacher access rule
      ↓
Compatibility cleanup  (legacy routes become wrappers, registries verified)
      ↓
Regression + visual QA  (cross-cutting invariants asserted, PDF layout fixes)
```

The point of this history is the shape of the work: each step preserved live behaviour and history, was specified in writing before implementation, shipped with its own check program, and left an audit trail of decisions. That is closer to maintaining a real system than to building a demo.

## Working method

- **Specification first.** Each programme (Omega, Orbit, Post-Orbit) has a written specification with phase status, non-negotiable rules and known limitations; the repository documents record what was verified versus assumed.
- **Small phases with a test each.** Nearly every phase adds a `*-check` program (see [evidence/milestones.md](../evidence/milestones.md)).
- **Assisted development, disclosed.** Commit authorship in the private repository is 779 of 810 commits by the repository owner and 31 by an AI coding assistant, and several feature branches carry assistant-style names. Specifications, architecture decisions, review, merging and acceptance are recorded under the owner's account. This is stated so the history is read accurately.
- **Honest status.** Status ledgers separate "implemented", "merged", "deployed" and "operator-accepted". Several documents explicitly record "not deployed" or "awaiting review" states.

## Historical or retired

- Pre-Orbit report-card code was retired in Orbit Phase H in favour of the read-model-based implementation.
- The legacy single `ca_max` result configuration was removed in Orbit Phase J.
- The forward-only active-context restriction was replaced by bidirectional selection with re-authentication (Orbit Phase F).
- A legacy `admin` role is kept only for compatibility.
