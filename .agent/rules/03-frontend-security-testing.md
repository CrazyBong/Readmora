# GEMINI Rules — 03: Frontend, Security & Testing

## FRONTEND STANDARDS

### Components (P1/P2)

- One component per file. All props explicitly typed.
- Aim for under 150 lines. Over 300 = split unless documented. Real rule: if it's hard to test, it's too big.
- No business logic in components — use custom hooks or services.
- Separate presentational (dumb) from container (smart) components.
- React Server Components by default. Client Components only for: `useState`, `useEffect`, browser APIs.

### State Management (P1)

- Server state: TanStack Query or SWR. Never fetch in `useEffect`.
- Global client state: Zustand or Jotai.
- Form state: React Hook Form + Zod resolver.
- URL state: query params for filterable/shareable state.
- Collocate state as low as possible. Lift only when necessary.

### Performance & Accessibility (P1)

- Measure before optimizing — React Profiler + Lighthouse.
- Hard requirements: LCP < 2.5s, FID < 100ms, CLS < 0.1.
- Code-split at route level. `next/image` for all images. Never raw `<img>` without dimensions.
- WCAG 2.1 AA minimum. All interactive elements keyboard accessible.
- Semantic HTML. Color contrast: 4.5:1 normal text, 3:1 large.
- `axe-core` or `eslint-plugin-jsx-a11y` in CI.

---

## SECURITY (P0 — No Exceptions)

### Auth & Authorization

- JWT: 15-min access tokens + 7-day refresh tokens in HttpOnly cookies. Never localStorage.
- Refresh token rotation — invalidate old token on each use.
- Every endpoint explicitly declares auth requirement. No endpoint is public by accident.
- RBAC in service layer, not just middleware. Validate resource ownership — IDOR prevention.

### Input & Transport

- Validate and sanitize everything server-side. Never trust client input.
- Parameterized queries only. String interpolation in queries = P0 violation.
- HTML-escape all user-generated content. DOMPurify for rich text.
- Rate limiting: auth 5 req/min, general API 100 req/min. CSRF on all mutating endpoints.
- Force HTTPS. HSTS enabled. CORS: explicit whitelist, never `*` in production.
- Security headers on every response: `HSTS`, `X-Content-Type-Options`, `X-Frame-Options`, `CSP`, `Referrer-Policy`.

### Secrets (P0)

- Zero secrets in code, comments, config files, or git history. Ever.
- All secrets via AWS Secrets Manager, HashiCorp Vault, or GCP Secret Manager.
- Separate secrets per environment. Never share dev/staging/prod credentials.
- `git-secrets` or `truffleHog` in pre-commit hooks and CI.

---

## TESTING STANDARDS

### Coverage by Layer

| Layer               | Type               | Minimum                 | Exception              |
| ------------------- | ------------------ | ----------------------- | ---------------------- |
| Utility functions   | Unit               | 100%                    | Never                  |
| Service layer       | Unit + Integration | 90%                     | Prototypes with ticket |
| API endpoints       | Integration        | 90%                     | Prototypes with ticket |
| UI components       | Unit (RTL)         | 70–80%                  | Trivial display-only   |
| Critical user flows | E2E Playwright     | All happy + error paths | Never                  |
| Auth & payment      | E2E                | 100%                    | Never                  |

> Coverage is a floor, not a ceiling. 100% with bad assertions is worthless. Test behavior.

### Rules

- Unit tests: Vitest preferred. One behavior per test. AAA pattern. Mock at boundary only.
- Integration tests: real DB via Docker. Test full request → response cycle including error paths.
- E2E: Playwright. Observable behavior, not implementation details. Run against staging in CI.
- No `it.skip` without a linked ticket. No `console.log` in test files.
- Unit + integration: under 60s. E2E: under 10 min. Flaky tests = bugs, fix same sprint.
- Test names are documentation. Write them as full sentences.
