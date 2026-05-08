# Security Standard: Med-Nest

**Status**: Phase 1 ✅ Complete | Phase 2 ✅ Complete

## 1. Authentication ✅ CLERK INTEGRATED
- **Provider**: Clerk (production-grade)
- **Middleware**: `clerkMiddleware()` validates tokens on all routes
- **Components**: SignInButton, SignUpButton, UserButton integrated in Header

## 2. API Security ✅ IMPLEMENTED

| Protection | Method | Status |
|------------|--------|--------|
| Rate limiting | 60 req/min per IP in middleware | ✅ |
| Bot detection | User-agent blacklist (40+ patterns) | ✅ |
| Input validation | Zod schemas on all 5 API routes | ✅ |
| Lazy DB connection | Only initializes on first query | ✅ |
| Env secrets | All keys in Vercel Encrypted Secrets | ✅ |

## 3. Frontend Protection ✅ IMPLEMENTED

| Protection | Method |
|------------|--------|
| Right-click disabled | `contextmenu` event prevented |
| Copy protection | `copy` event prevented |
| Drag protection | `dragstart` event prevented |
| F12 blocked | DevTools key shortcuts intercepted |
| DevTools detection | `debugger` timer at 5s interval |
| CSP headers | `frame-ancestors 'self'`, XSS protection |
| HSTS | `max-age=63072000; includeSubDomains; preload` |
| X-Content-Type-Options | `nosniff` |
| Permissions Policy | Camera, mic, geolocation, etc. disabled |

## 4. Database Security ✅ ACTIVE

### A) Row Level Security (RLS)
- Public `SELECT` on `brands`, `generics`, `faqs`, `companies`
- Admin restricted for `INSERT/UPDATE/DELETE`
- Users can only see their own reviews

### B) Encryption
- **In-Transit**: TLS 1.3 for all connections
- **At-Rest**: AES-256 encryption

## 5. API Routes (8 total)
All server-side, authenticated via Clerk, validated via Zod:
- `GET /api/drugs` — paginated with filters
- `GET /api/drugs/[slug]` — drug detail
- `GET /api/drugs/az` — A-Z grouping
- `GET /api/drugs/companies` — company list
- `GET /api/drug-classes` — classes with counts
- `GET /api/dosage-forms` — dosage forms with counts
- `GET /api/search` — ILIKE brand + generic search
- `GET /api/search/generics` — generic search
