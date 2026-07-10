# VerifAI Logging & Observability Strategy

This document outlines the strict logging standards for the VerifAI platform. As an enterprise trust infrastructure handling Hedera consensus and AI extraction, absolute observability is required without ever exposing sensitive data.

## Logging Strategy Overview
We use **Structured Logging** (JSON formatting) via **Pino**.
- **Why JSON?** JSON logs can be natively ingested, parsed, and searched by log aggregators (e.g., Datadog, ELK, AWS CloudWatch) without complex regex parsing.
- **Log Lifecycle:** Logs are instantly written to `stdout`. In production, a sidecar (like Promtail/Filebeat) or the cloud provider natively streams these to centralized storage.
- **Development vs Production:** In `development` (`NODE_ENV !== 'production'`), Pino uses `pino-pretty` to output human-readable, colorized logs in the terminal. In `production`, it outputs raw, uncolorized JSON strings.

## Log Levels
1. `fatal`: The application is crashing or a critical infrastructure dependency (Postgres, Hedera Testnet) is entirely unreachable. Triggers immediate PagerDuty alerts.
2. `error`: A request failed, an uncaught exception occurred, or an AI extraction failed repeatedly.
3. `warn`: Suspicious behavior (e.g., rate limit approached, invalid JWT signature, deprecated API usage).
4. `info`: Normal system events (Server started, document hash anchored to Hedera successfully).
5. `debug`: Detailed workflow steps (e.g., specific Prisma query executed, payload sizes).
6. `trace`: Highly granular function entry/exit data (used only in local dev for deep debugging).

## Standardized Format
Every log automatically includes:
- `timestamp`: (Epoch in production for indexing speed).
- `level`: The severity integer/string.
- `correlationId`: Traces a single user action across the Frontend -> Backend -> Queue -> Hedera.

## Correlation IDs
A `correlationId` is generated at the Frontend (or API Gateway) and attached as an `X-Correlation-ID` header. The Backend `requestLogger` reads this header and utilizes Node.js native `AsyncLocalStorage` to automatically inject it into *every* log that occurs during that request's lifecycle.
**Why?** You can search your log aggregator for `correlationId: "1234-5678"` and see the exact sequence of events from the API request, to the database query, to the Hedera transaction.

## Security & Redaction
Pino is configured to aggressively redact sensitive fields.
Keys such as `password`, `token`, `authorization`, `apiKey`, `secret`, and `privateKey` will be automatically replaced with `[REDACTED]` before hitting the `stdout` stream.

### Hedera Logging
- **DO LOG:** Transaction IDs, Topic IDs, Receipt Status, Consensus Timestamps.
- **NEVER LOG:** Operator Private Keys, Raw User Document byte arrays.

### AI Operation Logging
- **DO LOG:** Model versions used, processing duration (milliseconds), retry attempts, validation failures.
- **NEVER LOG:** The raw PII-sensitive text extracted from the document.

## Error Logging
Uncaught exceptions are intercepted by global Express error handlers. They must always log the `stack` trace and `correlationId`.

## Audit Logging
Application logs (`info`, `error`) are ephemeral and used for debugging.
**Audit Logs** are distinct. They track compliance events (e.g., `DOCUMENT_UPLOADED`, `VERIFICATION_CREATED`, `ADMIN_ACTION`). They are written immutably to a dedicated PostgreSQL table via the `AuditLogger` service. They are never rotated or deleted.

## Storage & Retention
- **Development:** Stored in Docker local volumes or stdout.
- **Production:** Streamed to centralized storage.
- **Retention:** Application logs kept for 30 days. Audit Logs kept indefinitely.

## Performance Monitoring
The `requestLogger` (via `pino-http`) automatically tracks `responseTime`. In future milestones, this can be combined with Prisma metrics and BullMQ queue metrics to monitor CPU/Memory bottlenecks.
