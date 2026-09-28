# Security review notes

Two separate things are recorded here: (1) how the security claims in this showcase were checked against the private repository, and (2) the privacy checks run on this public repository before publishing.

## 1. How the security claims were verified

Claims in [security and data integrity](../docs/security-and-data-integrity.md) were taken from three kinds of source in the private repository and cross-checked where possible:

| Source | Used for |
|---|---|
| Design documents (security architecture, database design, RBAC, audit, backup) | Intent and rules |
| Code inspection of the relevant modules | Confirming the mechanism exists (for example CSRF verification with audited rejection, no-store headers, temp-file removal, restricted PDF options, hashed one-time codes, secure cookie parameters) |
| Test programs | Confirming the invariant is asserted (audit logging, security hardening, maker-checker, class-teacher rule, PO-9 regression) |

Not verified in this review: behaviour against a live production system, database-trigger behaviour on a live database (the MySQL rehearsal checks were skipped in the run recorded in [testing.md](testing.md)), and any penetration-style testing. Those gaps are why the showcase describes design and evidence rather than claiming assurance.

The private repository also documents a dependency advisory review and states that no external audit or certification exists. None is claimed here.

## 2. Pre-publication privacy checks on this repository

Performed on 28 Sep 2026 before the first commit.

| Check | Result |
|---|---|
| File inventory (`git ls-files`, untracked files) | Only Markdown, SVG and PNG files; no PHP, SQL, shell, config, key, dump, archive or log files |
| Keyword scan for `password`, `secret`, `token`, `api_key`, `private_key`, `BEGIN … PRIVATE KEY`, `.env`, `ssh`, production hostnames, IP prefixes, storage provider and email provider names, personal email domains, real names, institution name, real identifier formats | Matches were prose only ("passwords are excluded from audit metadata", "SSH deploy", "CSRF token") and SVG namespace URIs; no values, hostnames, addresses or names |
| Screenshots | Generated from mock HTML with synthetic names ("Demo Student NN"), synthetic admission numbers (`DEMO/…`), synthetic scores, amounts and receipts; each carries an on-image "representative mock-up" label. No production capture was used |
| Diagrams | Conceptual only; no addresses, hostnames, users, key names, bucket names or ports |
| Code and schema | No source, SQL, migrations, table or column definitions, or route implementations. A few route names (for example the canonical export route) and generic concepts are named because the case studies need them |
| Private repository | Cloned read-only for inspection; nothing was written to it or pushed to it |
| Secret scanning | Repository content scanned by pattern as above; no findings |

## Intentionally excluded

Production source; SQL schema and migrations; environment files and variable names; hostnames, IP addresses and network layout; server usernames, deploy and sudo configuration details; backup storage names and locations; real institution, staff, student and parent names or identifiers; real scores and financial records; exact internal file paths and function names; infrastructure runbooks.
