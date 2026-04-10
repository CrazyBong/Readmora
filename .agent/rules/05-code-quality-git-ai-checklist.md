# GEMINI Rules — 05: Code Quality, Git, AI Standards & Checklist

## CODE QUALITY (P2 — Guidelines with Intent)

### Naming

- Variables/functions: `camelCase`, full words, no abbreviations
- Types/Interfaces/Classes: `PascalCase`
- Files: `kebab-case` (`user-service.ts`)
- Database: `snake_case` for tables and columns
- Booleans: `is`, `has`, `should`, `can` prefix
- Constants: `SCREAMING_SNAKE_CASE`

### Functions

- One responsibility. If you say "and" to describe it, split it.
- Aim for under 30 lines. Over 50 = refactor signal. Real limit: hard to test = too long.
- Aim for under 3 params. Over 4 = use a parameter object.
- Guard clauses over nested conditionals. Return early.
- No side effects in pure utilities. No boolean function parameters.

### Comments & Dependencies

- Comments explain WHY, not WHAT. Code explains what.
- `// TODO(PROJ-1234): reason` — never a bare TODO.
- Never commit commented-out code. Git history exists.
- JSDoc for all exported functions, public APIs, and shared types.
- Weekly `npm audit`. Dependabot/Renovate for automated updates.
- Before adding a package: can this be done in < 20 lines? If yes, write it.
- Pin exact versions in production. Strict `dependencies` vs `devDependencies`.

---

## GIT WORKFLOW (P1)

### Commits (Conventional Commits — enforced by commitlint)

```
feat(auth): add refresh token rotation
fix(api): handle null user in profile endpoint
test(users): add integration tests for user creation
refactor(db): extract repository pattern for orders
perf(query): add index on orders.user_id
chore(deps): update Zod to 3.22.4
```

### Branches

```
feature/PROJ-123-add-oauth-login
fix/PROJ-456-null-pointer-checkout
hotfix/PROJ-789-payment-timeout
release/v2.4.0
```

### PRs

- One concern per PR. Description: What, Why, How to test, Screenshots for UI.
- Min 1 senior engineer approval. All CI gates green. Squash on merge. Delete branch after.
- Aim for under 400 changed lines. Over 800 with no justification = request a split.

---

## AI-ASSISTED DEVELOPMENT STANDARDS

### Trust Levels by Output Type

| AI Output                      | Trust    | Required Action                             |
| ------------------------------ | -------- | ------------------------------------------- |
| Boilerplate / CRUD scaffolding | High     | Spot check types and edge cases             |
| Business logic                 | Medium   | Full review + test coverage                 |
| Security-related code          | Low      | Senior human review required                |
| Auth / encryption / payments   | Very Low | Treat as untrusted — rewrite if unclear     |
| DB migrations                  | Very Low | Human reviews every line before running     |
| Infrastructure / IAM           | Very Low | Human reviews every resource and permission |

### Code Review Rules for AI Output (P0/P1)

- AI-generated code meets the exact same standards as human-written code. No exceptions.
- Do not merge code you cannot fully explain. If you can't explain it, you don't own it.
- Add `// AI-generated — reviewed by [name] on [date]` on non-trivial AI blocks.
- Tests for AI-generated code must be written or verified by a human.
- AI never makes final decisions on: security model, data schema, API contracts, infra topology.

### Security Risks from AI (P0)

- AI hallucinates package names. Verify every suggested package on npm before installing.
- AI produces subtly insecure code that looks correct. Security code = mandatory senior review.
- Never paste real credentials, API keys, PII, or business secrets into AI prompts.
- AI provider prompts are logged. Treat all prompt content as potentially visible externally.

### Effective Prompting for This Codebase

```
1. Context:     "We are in /apps/api/src/users/"
2. Constraint:  "Follow the repository pattern in this codebase"
3. Requirement: "Add a method to soft-delete a user by ID"
4. Format:      "Return only the TypeScript function, no explanation"
5. Safety:      "No hardcoded values or mock data"
```

- Always provide relevant existing code as context — AI cannot infer your patterns.
- Ask AI to explain security assumptions on any auth or data-handling code.
- For complex logic: ask AI to write tests first, then implementation.

### What AI Does Well Here

- Typed Zod schemas from a description
- CRUD scaffolding following established patterns
- Unit tests for a given function
- JSDoc for existing functions
- Index suggestions after reviewing a slow query

### What AI Should Not Do Autonomously

- Design data model or schema
- Choose auth strategy or security architecture
- Write E2E tests without human-defined scenarios
- Modify CI/CD pipelines without review
- Generate payment or PII-handling code without senior review

---

## ABSOLUTE PROHIBITIONS (P0 — No Exceptions, No Approval Path)

| Prohibited                                     | Why                                               |
| ---------------------------------------------- | ------------------------------------------------- |
| `any` at API boundaries or shared packages     | Destroys type safety where it matters most        |
| Raw SQL string concatenation                   | SQL injection — immediate security failure        |
| Secrets in code, comments, or git history      | Permanent security catastrophe                    |
| Silent error catching                          | Silent failures are the worst production failures |
| Deploying to prod without staging verification | Avoidable catastrophic risk                       |
| Directly mutating production DB                | No rollback, no audit trail                       |
| `eval()` or `new Function()` with user input   | Remote code execution                             |
| `git push --force` on main                     | Destroys history, breaks teammates                |
| HTTP in production without TLS                 | Data in transit is unencrypted                    |
| Merging AI security code without senior review | AI makes subtle errors that look correct          |
| Pasting real credentials into AI prompts       | Logged by AI provider infrastructure              |

---

## STARTUP vs. SCALE MODE

### Startup (1–5 engineers, pre-PMF) — Keep P0, Defer P1/P2

**Must keep:** auth/secrets security, basic error handling + logging, type safety at API boundaries, integration tests on critical paths, staging before prod.

**Can defer with a written plan:** full observability stack, strict coverage thresholds, complete CI gates, Terraform (manual infra OK early — codify within 6 months).

**The rule:** defer consciously. Write down what and when. Undocumented shortcuts become permanent invisible debt.

### Scale Mode (5+ engineers, production traffic)

All P0 and P1 enforced fully. P2 are team defaults with documented exceptions.

---

## PRE-SHIP CHECKLIST

### P0 — Must not ship without

- [ ] TypeScript compiles, zero errors, zero `any` at boundaries
- [ ] Input validation on all new endpoints
- [ ] Auth and ownership checks on all new endpoints
- [ ] No secrets, tokens, or PII in logs or responses
- [ ] Error paths handled — no silent failures
- [ ] Integration tests cover new endpoints
- [ ] E2E tests cover new critical user flows
- [ ] DB migrations are backward-compatible
- [ ] Staging verified before production

### P1 — Document if skipping

- [ ] ESLint zero warnings
- [ ] Unit coverage threshold met
- [ ] Structured logging for significant operations
- [ ] No N+1 queries introduced
- [ ] Feature flag if rolling out gradually

### P2 — Best effort

- [ ] PR description complete
- [ ] Docs updated (README, API docs, ADR if architectural)
- [ ] Lighthouse score checked for UI changes
- [ ] AI-generated code annotated and reviewed
