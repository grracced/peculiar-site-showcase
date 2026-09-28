# Case study 5 — Production engineering

![Deployment topology](../diagrams/deployment-topology.svg)

Infrastructure identifiers (addresses, hostnames, users, keys, storage names) are intentionally left out. Only components confirmed by the private repository's deployment configuration and documents are described.

## Environment

- One small cloud VM running Ubuntu LTS: Nginx, PHP-FPM, MySQL 8, Git, Certbot for TLS, and GitHub Actions as the deployment authority.
- A deliberately small footprint: the design documents budget for a machine with about 1 GB of RAM, so the stack avoids resident extras (no container runtime, orchestrator, load balancer, cache server, queue server or separate database host). PHP-FPM limits are to be sized from measured memory use rather than copied defaults; a swap file is part of the baseline.
- Multiple PHP-FPM pools (public/portal, staff, examination staff, examination student), each with its own environment. The portal pool has no staff database credentials.
- Configuration lives outside Git in server-side environment files; deployments must not overwrite them.

## Delivery pipeline

```text
merge to main
  → CI validation
      PHP syntax check across the codebase
      JavaScript syntax check (Node runs in CI only, never on the server)
      GD/WebP runtime capability check (PDF branding depends on it)
      deploy decision logic, migration safety / history / classification checks
      a real MySQL migrate-and-repeat (idempotency) run
  → restricted SSH deploy (one command)
  → root-owned controlled-deploy orchestrator
      classify the release
      MODE A — standard application release: backup, checkout, composer, reload, health check
      MODE B — controlled migration release: quiesce writers, coordinated backup, separate
               snapshot, validate on a disposable schema, apply migration, verify schema,
               checkout, composer, resume, health check
```

Rules that shape it:

- **Forward-only, additive migrations** are deployed automatically; unsafe or history-rewriting migrations and changes to controlled infrastructure paths fail closed and require a deliberate manual, reviewed procedure.
- **Concurrency guard.** Production deploys are serialized and never cancelled mid-run.
- **Health verification after activation**, and a tested path for the case where the database is already ahead of the code.
- The deploy tooling itself has shell tests (orchestrator, forward-only behaviour, release classification, reliability, self-test).

## Operations

| Concern | Approach |
|---|---|
| Backups | Scheduled `mysqldump` sets (single-transaction, triggers and events included) per logical database, compressed, integrity-tested, SHA-256 hashed and described by a validated manifest; taken together so staff and portal data are from the same moment |
| Retention | Local retention only runs after a new set passes local checks and is uploaded; off-server copy is managed by the storage provider's lifecycle rules |
| Restore | An isolated restore test imports the newest verified set into disposable schemas; restore procedure requires databases from the same timestamp |
| Monitoring | A lightweight health-check timer records status and logs failures; checks cover site availability, disk and memory thresholds, backup age and certificate expiry |
| Background work | A systemd timer runs a communications worker that drains a database outbox with idempotent, stable delivery keys, so a restore or crash cannot double-send |
| Privileged actions | Technical reset runs through a separate root-owned executor and timer, not the web process |

## Operational constraints and decisions

- **Single VM, single MySQL server.** Simplicity and cost were chosen over redundancy. Recovery relies on backups and a tested restore path, not failover; there is no claim of high availability.
- **Synchronous PDF/ZIP generation.** No job queue exists, so exports are bounded by request time and memory. Large class ZIPs are the known stress point.
- **Backup account least-privilege.** Dumps skip stored routines (the schema defines none) rather than widening the backup account's grants; introducing a routine becomes a reviewed backup-contract change.
- **Documented gaps.** The deployment guide records implementation gaps openly rather than hiding them.

## Outcome

The repository records controlled Mode A releases and Mode B migration releases with pre-release backups and post-release health checks. Uptime or traffic figures are not published because the repository does not contain them.
