# Session State — Med-Nest

## Database State (May 9, 2026)

| Table | Rows |
|-------|------|
| `brands` | **41,271** |
| `generics` | 2,737 |
| `companies` | 443 |
| `brands with prices` | 25,393 (61.5%) |

### Brands by Type
| Type | Count |
|------|-------|
| Allopathic | 41,185 |
| Veterinary | 32 |
| Herbal | 22 |
| Vaccine (Human) | 19 |
| Veterinary Vaccine | 13 |

## ✅ Completed

### Data Pipeline
- **DGDA**: Rebuilt brands from official BD govt pricing database
- **Brand names cleaned**: Removed strength/dosage form duplication
- **Duplicates removed**: 256 exact duplicates deleted
- **OpenFDA**: 484 generics matched with US drug labels
- **Incepta Pharma scraped**: 772 products (385 new brands) with type labels
- **Incepta Vaccines**: 32 vaccines scraped (19 human + 13 animal)

### Security
- CSP headers, HSTS, XSS, nosniff
- Permissions policy (camera/mic/geolocation disabled)
- Rate limiting (60 req/min)
- Bot detection (40+ patterns)
- Right-click, copy, F12, DevTools blocked
- Zod validation on all 8 API routes
- RLS on all DB tables
- Clerk auth middleware

### Infrastructure
- Neon PostgreSQL + Drizzle ORM
- Lazy DB connection (Vercel-safe)
- 8 API routes with Zod + rate limiting
- Loading states, error boundaries, 404 pages
- GIN indexes for search, pg_trgm for fuzzy matching

## 🔄 Next Session
1. Scrape Square Pharma, Beximco, ACME, Renata etc.
2. Show prices + medical info on drug detail page  
3. Type badge (Herbal/Vet/Vaccine) in search
4. Unify pages under `/drugs?filter=X`

## Pro Migration Notes
- **Move Upstash Redis**: Delete → recreate in Singapore (`ap-southeast-1`)
- **Vercel functions**: Auto-detect nearest region to Redis/Neon
- **Neon**: Already in Singapore — no change needed
- **Edge CDN**: Mumbai → Bangladesh at ~50ms (no change)
- **Result**: All three layers (function, Redis, DB) in Singapore — everything sub-5ms
- **Vercel Cron**: `vercel.json` cron schedules work (Hobby ignores <24h intervals)
- **Fix vercel.json location**: Must be in `frontend/` (project root directory)

### External Cron (Hobby Plan)
- Use **cron-job.org** (free, no account)
- Create one job: `https://<preview-url>.vercel.app/api/cron` every 5 minutes
- Endpoint pings: drugs default, drugs pharma, generics pharma, popular, search napa
- Keeps Redis warm despite Vercel Hobby cron limitations

## Architecture Decisions (May 16, 2026)

### Database Connection
- **Driver**: `Pool` from `@neondatabase/serverless` with `drizzle-orm/neon-serverless`
- **URL**: Strip `-pooler` from hostname + strip all query params (Pool handles TLS natively)
- **Env var priority**: `MEDNEST_DATABASE_URL` → `DATABASE_URL` → `POSTGRES_URL` → etc.
- **Note**: Don't use `neon()` HTTP driver — Pool is more reliable for complex queries

### Caching Strategy
- **Redis (Upstash)**: Direct REST API via `fetch()` — no SDK (`@upstash/redis` had version/compat issues)
- **Env vars**: `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (fallback: `KV_REST_API_*`)
- **JSON.parse critical**: Upstash REST API stores values as JSON strings — must parse on read
- **TTL**: 300s (5 min)
- **In-memory fallback**: Per-container Map cache with same TTL
- **Cache keys**: `{endpoint}:{searchParams.toString()}` e.g. `drugs:page=1&limit=20&medicine_type=allopathic`

### First-Call Speed (Vercel Hobby limitation)
- **2s first call**: 1s cold start + 200ms Neon Singapore query + response time
- **Fix on Hobby**: cron-job.org every 2 min keeps container warm
- **Fix on Pro**: Vercel functions in Singapore + proper cron support — expect <200ms first call

### Optimistic UI
- **Search suggestions**: Local `searchCache` Map — shows cached results instantly while refreshing in background (drugs, generics, homepage)
- **Filter changes**: Don't clear current data — keep showing old results while new loads. Only first load shows skeletons
- **Progressive loading (not implemented)**: Show first 6 cards instantly, load rest in background. Only needed if Redis + cron can't bring first call under 300ms

### Cron (Hobby Plan)
- **Vercel vercel.json**: Stored at `frontend/vercel.json` (project root directory). Hobby ignores schedules <24h
- **External**: cron-job.org → `https://mednest-frontend.vercel.app/api/cron` every 5 min
- **Endpoints pinged**: drugs default, drugs pharma, generics pharma, popular, search napa
- **UA override**: `MedNestCron/1.0` to bypass middleware bot detection

### Pro Migration (when ready)
- Move Upstash Redis to Singapore (`ap-southeast-1`)
- Vercel functions auto-detect Singapore region
- Neon already in Singapore
- vercel.json cron schedules activate (<24h allowed)
- Expected first-call time: <100ms (functions + Redis + Neon all in Singapore)
- Can implement progressive loading after Pro for even faster perception

## 🔄 Next Session
1. Scrape Square Pharma, Beximco, ACME, Renata etc.
2. Show prices + medical info on drug detail page  
3. Type badge (Herbal/Vet/Vaccine) in search
4. Unify pages under `/drugs?filter=X`

## Pro Migration Notes
- **Move Upstash Redis**: Delete → recreate in Singapore (`ap-southeast-1`)
