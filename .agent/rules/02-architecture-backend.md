# GEMINI Rules — 02: Architecture & Backend

## ARCHITECTURE (P1)

- Controllers = routing only. Services = business logic only. Repositories = data access only. Never mix.
- No business logic in route handlers. No direct DB calls from frontend.
- Feature-based folder structure — group by feature, not file type.
- Dependency direction: UI → Service → Repository → DB. Never reverse.
- Ports and adapters for all external integrations — must be swappable and mockable.
- Circular dependencies are bugs. Refactor immediately.
- Document significant decisions in `/docs/adr/` as Architecture Decision Records.

---

## TYPESCRIPT (P0 at boundaries, P1 internally)

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true,
  "noUncheckedIndexedAccess": true
}
```

- **P0:** Zero `any` at API boundaries, DB layer, shared packages. Use `unknown` + narrow.
- **P1:** Zero `any` in service code.
- **P2 exception:** Feature branch prototypes — `// TODO(PROJ-XXX): type this` allowed, resolved before merge.
- Never `as X` to escape errors — fix the types.
- Zod for all API request/response shapes (runtime validation + inferred types).
- Shared types in `/packages/shared-types` — frontend and backend import from there, never drift.
- `satisfies` operator over type assertions. Utility types over duplicated shapes.

---

## BACKEND STANDARDS

### API Design (P1)

- RESTful. Correct HTTP verbs. Version from day one: `/api/v1/...`
- Consistent envelope:
  - Success: `{ success: true, data: T, meta?: PaginationMeta }`
  - Error: `{ success: false, error: { code, message, details? } }`
- HTTP 422 for validation, 409 for conflicts, 404 for not found, 500 for unexpected only.
- Pagination mandatory on list endpoints. Cursor-based for large datasets.

### Validation (P0)

- Validate every request body, query param, and path param before business logic.
- Zod `.strict()` — reject unknown fields. Never pass raw bodies to DB queries.

### Database (P0 integrity, P1 patterns)

- No raw SQL strings. Use Prisma, Drizzle, or Knex.
- All DB access through repository layer. Services never import DB client directly.
- Every table: `id` (UUID v7), `created_at`, `updated_at`, `deleted_at` (soft delete).
- Soft delete user/financial/audit data. Hard delete = conscious documented decision.
- Transactions for any multi-table operation.
- Index every FK and every WHERE/ORDER BY column. Run EXPLAIN ANALYZE on slow queries.
- Connection pooling always. Never a new connection per request.
- One command to run the app fully locally with seed data.

### Error Handling (P0)

```typescript
// Never — silent failure is the worst failure
catch (e) { console.log(e); }

// Always — fail loudly with context
catch (error) {
  logger.error('Operation failed', { error, context: { userId, operationId } });
  throw new AppError('OPERATION_FAILED', 'Could not complete the operation', 500, { cause: error });
}
```

- Typed `AppError` class: `code`, `message`, `statusCode`, optional `details`.
- Catch unhandled rejections at process level — log before crash.
- Never expose stack traces or internals to API consumers in production.
