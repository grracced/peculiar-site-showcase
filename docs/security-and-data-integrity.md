# Case study 4 — Security and data integrity

This page lists concrete decisions in the form **Problem → Design → Result**. It describes design intent and the evidence for it. It is not a security certification, and no claim of being "secure" in an absolute sense is made; see [evidence/security-review.md](../evidence/security-review.md) for how the claims were checked and what was not verified.

## Authentication and sessions

| Problem | Design | Result |
|---|---|---|
| A student session must never authenticate a staff surface | Separate hosts, separately named host-only cookies, per-surface login rules (students by admission number, parents by email, staff by staff email), rate-limit keys namespaced per surface | Sessions are not portable between surfaces |
| Login errors leak which accounts exist | Generic failure responses; login identity is stored only as a normalized fingerprint in audit | No account enumeration through the login form |
| Brute-force attempts | Database-backed rate limiting | Repeated failures are throttled |
| Highest-privilege infrastructure account should not be a normal user | Separate technical account with no institutional roles, dedicated login surface, mandatory single-use email code (10-minute life, attempt lock, resend throttle, hashed at rest) | Infrastructure access is isolated from school administration |

## Authorization

| Problem | Design | Result |
|---|---|---|
| Teachers seeing or editing classes they are not responsible for | Assignment-derived, session-scoped authority ([details](authorization-and-rbac.md)) | View/export and manage are decided separately |
| Insecure direct object references (guessing another record's id) | Server-side authorization on every identifier; opaque identifiers for people profiles; ownership checks before lookup; forged class/category values rejected against actual enrollment | A valid id is not enough — the actor's authority over that record is checked |
| Historical-scope escalation (using a past or future context to reach data) | Every result read validates the explicit session/term/class/category; active context is never a fallback | Scope cannot be widened by changing a parameter |
| One person both preparing and approving a decision | Central separation-of-duties guard on canonical user identity, run inside the transaction against locked history | Multiple roles or admin status cannot bypass maker-checker |

## Input, output and documents

| Problem | Design | Result |
|---|---|---|
| Cross-site request forgery | Per-session CSRF token on state-changing requests; invalid tokens are rejected and audited on review workflows | Forged posts are refused |
| Cross-site scripting | Prepared statements for data access; output escaping at render, including audit viewer values; PDF renderer with remote resources disabled | User-supplied text is inert in pages and PDFs |
| CSV formula injection | Free-text export fields neutralized; numeric columns left numeric | Spreadsheet applications do not execute cell content |
| Report cards and exports leaking through caches | Private, no-store responses; PDFs generated in memory on request | No stored copies to retrieve later |
| Temporary ZIP files left on disk | Archive built in a temp file removed on success and on failure; sanitized deterministic entry names | No residue, no path tricks in names |
| Untrusted uploads | Image uploads (school logo) are checked by decoded type, dimensions and size before decoding, stored under random names with canonical extensions, and served by Nginx as static files only (direct `.php` requests are refused); limits are re-enforced when documents are generated | An uploaded file cannot become executable code or a decompression bomb in a PDF |

## Financial and audit integrity

| Problem | Design | Result |
|---|---|---|
| Payments could be edited or deleted after the fact | Payment records are append-only; database triggers reject update and delete; a reversal keeps the original receipt and cancels its balance effect with a recorded reason | History is preserved even against application bugs |
| Fee changes rewriting what students owe | Fee structures use draft → review → approved states; charges keep snapshots of structure, context, item names and amounts; money stored as integer minor units | Later changes cannot silently rewrite past obligations; no floating-point money |
| Fee approval by the same person who prepared it | Maker-checker review workflow with returned/pending states | Independent check is enforced server-side |
| Audit log could be edited or bloated with secrets | One central writer; per-event allow-listed metadata; passwords, tokens, sessions, answer keys, report PDFs and stack traces prohibited; IPs one-way fingerprinted; append-only triggers; viewer restricted to the highest administrative role | Audit trail is trustworthy and does not become a data leak |
| Result changes after approval | Approved sets immutable for ordinary teachers; amendments restricted to senior roles and logged as a distinct audit event; workflow history append-only | Every post-approval change is attributable |

## Privileged operations

- Destructive technical operations (system reset, factory reset) run through a separate privileged runtime and executor rather than the web process, and are guarded by dedicated tests.
- Database triggers that protect invariants run under a locked security-definer contract, and backup accounts are kept least-privilege (dumps exclude routines rather than widening grants).
- Break-glass recovery is short-lived, requires re-authentication with a fresh email code and a reason, and is audited.

## What is not claimed

- No penetration test report exists in the repository and none is claimed.
- No compliance certification is claimed.
- Some security behaviour is covered by source-contract tests rather than by end-to-end exploitation attempts; see [testing and QA](testing-and-qa.md).
