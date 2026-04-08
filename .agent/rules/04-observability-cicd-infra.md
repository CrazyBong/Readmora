# GEMINI Rules — 04: Observability, CI/CD & Infrastructure

## OBSERVABILITY

### Logging (P0 in production)
- Structured JSON everywhere. No `console.log` in production code. Use Pino or equivalent.
- Every log entry: `timestamp`, `level`, `message`, `requestId`, `userId`, `environment`.
- `error` = system broken. `warn` = unexpected but handled. `info` = business events. `debug` = off in prod.
- Never log PII, passwords, tokens, or card numbers. Mask or omit.
- Ship logs to Datadog, CloudWatch, or GCP Logging with alerting.

### Metrics & Tracing (P1)
- Track: request rate, error rate, p50/p95/p99 latency, DB query time, external API latency.
- Alerts: error rate > 1%, p99 > 2s, DB pool > 80%, any 5xx spike.
- Track business metrics too: signups, conversions, retention.
- OpenTelemetry for distributed tracing. Propagate `trace-id` and `span-id` across boundaries.
- Include `requestId` in every log line and `X-Request-Id` response header.

### Health Checks (P0)
```
GET /health       → { status: 'ok', timestamp }              // shallow — load balancer
GET /health/ready → { status: 'ok', db: 'ok', cache: 'ok' } // deep — K8s readiness
```

---

## CI/CD — Required Gates, All Must Pass (P0)

```
1. tsc --noEmit          → zero type errors
2. ESLint                → zero warnings (warnings = errors in CI)
3. Prettier              → format check
4. Unit tests            → coverage threshold enforced
5. Integration tests
6. npm audit             → --audit-level=high
7. Secret scan           → truffleHog or git-secrets
8. Build                 → clean success
9. Docker build          → image builds
10. E2E tests            → against staging post-deploy
```

> Startup mode (1–3 engineers): gates 1–5 are P0. Gates 6–10 phase in within 3 months.

---

## DEPLOYMENT (P0/P1)

- Never deploy directly to production. Staging always first.
- Blue/green or canary — never big-bang deploys.
- Feature flags for significant rollouts. Ship code, then enable.
- Every production deploy rollback-capable in under 2 minutes.
- DB migrations separate from app deploys. Always backward-compatible.
- Smoke tests pass before shifting traffic.
- Immutable infrastructure. No manual changes to prod servers. Everything is code.

### Environments
| Environment | Purpose | Trigger |
|---|---|---|
| local | Dev | Manual |
| dev | Integration | Push to `develop` |
| staging | Pre-production | PR merge to `main` |
| production | Live traffic | Manual gate after staging |

---

## DATABASE MIGRATIONS (P0)

- All schema changes via migration files. Never alter tables manually.
- Every migration has a `down` rollback function. Migration files are immutable after merge.
- Expand/contract for backward compatibility:
  1. Deploy 1: Add nullable column
  2. Deploy 2: Migrate data, update code
  3. Deploy 3: Remove old column
- Test migrations against a production data copy first.

---

## DOCKER & INFRASTRUCTURE (P1)

```dockerfile
FROM node:20.11.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20.11.0-alpine AS runner
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
USER appuser
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

- Multi-stage builds. Non-root user. Pinned base image versions.
- `.dockerignore`: `node_modules`, `.git`, `*.test.ts`, `.env*`, `coverage/`.
- All infra in Terraform. Remote state with locking. Separate state per environment.
- Least privilege IAM. All resources tagged: `environment`, `team`, `project`, `managed-by`.

---

## INCIDENT RESPONSE (P0)

- Every production incident → blameless post-mortem within 48 hours.
- Post-mortem = at least one actionable output (test, alert, runbook, or fix).
- Runbooks for: DB down, cache storm, deployment rollback, auth failure.
- P0 incidents: fix first, process second. Ship patch, write postmortem after.
