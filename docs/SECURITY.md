# Security Standard: Med-Nest

**Status**: Phase 1 ✅ | Phase 2 ✅ | Audit ✅ | Production hardening pending

## 1. Authentication
- **Provider**: Clerk
- **Middleware**: `clerkMiddleware()` in proxy.ts
- **Current**: NOT enforced on public API routes (search, drug listing are public)
- **Pre-launch**: Enable `auth.protect()` on admin/write endpoints only

## 2. API Security ✅ IMPLEMENTED

| Protection | Method | Status |
|------------|--------|--------|
| Rate limiting | 60 req/min per IP in middleware | ✅ In-memory (⚡ needs Redis before prod) |
| Bot detection | User-agent blacklist (40+ patterns) | ✅ |
| Input validation | Zod schemas on all 8 API routes | ✅ |
| SQL injection | Parameterized queries only | ✅ (sql.raw() removed 2026-05-10) |
| Path traversal | Slug regex + `..`/`/`/`\` guard | ✅ (fixed 2026-05-10) |
| Error leakage | Zod flatten() removed from responses | ✅ (fixed 2026-05-10) |
| CSP | Full policy: default-src, script, style, img, font, connect | ✅ (hardened 2026-05-10) |
| X-XSS header | REMOVED (deprecated, superseded by CSP) | ✅ (removed 2026-05-10) |
| Lazy DB connection | Only initializes on first query | ✅ |

## 3. Frontend Protection ✅

| Protection | Method |
|------------|--------|
| Right-click disabled | `contextmenu` event prevented |
| Copy protection | `copy` event prevented |
| Drag protection | `dragstart` event prevented |
| F12 blocked | DevTools key shortcuts intercepted |
| DevTools detection | `debugger` timer at 5s interval |
| CSP headers | Full policy — see above |
| HSTS | `max-age=63072000; includeSubDomains; preload` |
| X-Content-Type-Options | `nosniff` |
| Permissions Policy | Camera, mic, geolocation, etc. disabled |

## 4. Pre-Launch Checklist (Not Done Yet)

### High Priority
- [ ] **Rate limiter → Redis** — In-memory Map leaks memory, doesn't work across instances. Use `@upstash/ratelimit` or similar
- [ ] **Wildcard DoS** — `ILIKE %query%` with `%%%%` can trigger expensive regex scans. Escape `%` and `_` in user input before ILIKE
- [ ] **CSRF protection** — Required before adding POST/PUT/DELETE endpoints (reviews, FAQ submission). Use Clerk's built-in or `next-csrf`

### Medium Priority
- [ ] **Script safeguards** — Ingestion scripts connect to prod DB directly. Add `--dry-run` flags and confirmation prompts before destructive ops
- [ ] **Error logging** — Raw error objects in `console.error`. Sanitize in production (log only code + sanitized message)
- [ ] **Request size/timeout limits** — Configure `maxDuration` on API routes, `bodyParser.sizeLimit`

### Low Priority
- [ ] **Non-null assertion** — `drizzle.config.ts` uses `process.env.DATABASE_URL!` — replace with guard clause
- [ ] **DB singleton proxy** — Fragile Proxy pattern in `lib/db/index.ts:16-20`
- [ ] **Structured logging** — Replace `console.error` with `pino`/`winston` in production

## 5. API Routes (8 total)
All server-side, validated via Zod:
- `GET /api/drugs` — paginated with filters
- `GET /api/drugs/[slug]` — drug detail (path traversal fixed)
- `GET /api/drugs/az` — A-Z grouping (sql.raw fixed)
- `GET /api/drugs/companies` — company list
- `GET /api/drug-classes` — classes with counts
- `GET /api/dosage-forms` — dosage forms with counts
- `GET /api/search` — ILIKE brand + generic search
- `GET /api/search/generics` — generic search

## 6. Database
- **Encryption**: TLS 1.3 in-transit, AES-256 at-rest (Neon managed)
- **RLS**: Not implemented (Neon PostgreSQL, not Supabase). Use application-level auth via Clerk
- **Secrets**: DATABASE_URL in `.env.local` — rotate key before production deployment

## 7. Audit History

| Date | Finding | Action |
|------|---------|--------|
| 2026-05-10 | SQL injection via `sql.raw()` in az/route.ts | Fixed — parameterized query |
| 2026-05-10 | Path traversal via file slug in detailService.ts | Fixed — guard + regex validation |
| 2026-05-10 | Zod `flatten()` leaking in 400 responses | Fixed — removed |
| 2026-05-10 | Weak CSP (only frame-ancestors) | Fixed — full policy |
| 2026-05-10 | Deprecated X-XSS-Protection header | Removed |
