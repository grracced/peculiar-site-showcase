# Case study 2 — Scoped teacher authorization

![Authorization flow](../diagrams/authorization-flow.svg)

## The problem

"Is this user a teacher?" is the wrong question in a school. The same person may lead one class, teach one subject in a different class, and have taught something else last year. A role check alone either over-grants (every teacher sees every class) or under-grants (a class teacher cannot see the results of the class they are responsible for).

Two requirements pulled in opposite directions:

- A **class teacher** is accountable for the whole class and must be able to *see and export* every subject's results for that class — even subjects they do not teach.
- That same teacher must **not** gain the ability to *change* those subjects' scores.

## Design

Authorization is layered:

1. **Role and permission layer.** Staff hold one or more active institutional roles; permissions are the union of active roles. Roles express organization-wide capability (for example configuring results, approving them, managing finance).
2. **Academic authority layer.** Teaching authority comes from per-session assignments: class teacher, assistant class teacher, and subject teacher. Assignments are data, dated by session, and are the only source of academic scope.
3. **Historical scope layer.** Every academic decision receives the explicit scope of the request: session, term, class, category and (when relevant) subject. An assignment in one session grants nothing in another.
4. **Two separate questions.** *View/export* authority and *manage* authority are decided by different rules.

| Actor | View and export | Enter / submit / manage |
|---|---|---|
| Subject teacher | Their assigned subjects | Their assigned subjects |
| Class teacher / assistant | Every subject in the class they lead, for that session | Only subjects they are separately assigned |
| Approver roles (Principal, Vice Principal, Proprietor) | Per role permissions | Approve or return; amend after approval with audit. Approval authority alone does not make someone a score editor |
| Configuration managers (for example Examinations Officer, Academic Administrator) | Broad | Result configuration, per role permissions |
| Student / parent | Own or linked child's *published* results only | None |

### Worked example

Teacher A is Class Teacher of JSS 1 and Subject Teacher of SS 1 Mathematics.

| Resource | View | Export | Edit / manage |
|---|---|---|---|
| JSS 1 English | ✓ | ✓ | ✗ |
| JSS 1 Mathematics | ✓ | ✓ | ✗ |
| SS 1 Mathematics | ✓ | ✓ | ✓ |
| SS 1 English (no assignment) | ✗ | ✗ | ✗ |

(Synthetic example.)

## Key decisions

- **Read authority is added to the view decision, not to the manage decision.** Class leadership feeds only the functions that decide viewing and exporting. The single function that decides management authority is untouched, so no route that edits scores can be reached through class leadership by accident.
- **One source of assignment truth.** Class leadership uses the same class-staff assignment source already used for attendance and academic class authority, rather than a parallel table.
- **Exports do not get their own shortcut.** Export authorization delegates to the same view functions as the Explorer. Anything a user cannot see, they cannot export.
- **Report cards keep their own permission domain.** Report-card viewing and management permissions are separate from result view authority, so holding one never silently grants the other.
- **Server-side, fail-closed.** Hiding a button is a courtesy; the server denies. Unknown or forged identifiers resolve as not found or forbidden, and denials are audited.
- **Separation of duties.** A shared guard compares the actor who prepared a decision with the actor who would approve it by canonical user identity — not by role, name or email — inside the transaction and against row-locked history. Holding multiple roles, being an administrator, or being protected does not bypass it.

## Protected and technical accounts

A protected institutional administrator cannot be demoted or modified through ordinary paths, enforced by database constraints and triggers. A separate *technical* account exists for infrastructure work; it has no staff record or institutional roles, is excluded from every staff, academic and reporting list by classification (not by name), and authenticates through a dedicated surface with a mandatory email one-time code. Break-glass recovery requires a fresh password, a fresh one-time code and a recorded reason.

## Outcome

- The class-teacher rule is encoded in a dedicated contract test, and the final Post-Orbit regression re-asserts it: class-wide view/export via class leadership, management through subject assignment only.
- Authority is explainable: for any denied request one can state which layer (role, assignment, scope) failed.

## Trade-offs

- Assignment data has to be maintained accurately each session; the platform therefore provides admin tooling for assignments and audits changes to them.
- Many small authority functions are harder to read than a single role table, but each has a narrow, testable meaning.

## Evidence

`class-teacher-result-access`, `phase3-subject-teacher-authority`, `omega-d-multi-role-rbac`, `omega-e-maker-checker-foundation` and the Post-Orbit regression programs. See [evidence/testing.md](../evidence/testing.md).
