# Session State — Med-Nest

## Current State (May 17, 2026)

| Table | Rows |
|-------|------|
| `brands` | **71,389** |
| `generics` | 4,912 |
| `brands with prices` | ~47K |
| **Database** | Neon PostgreSQL in Singapore |
| **Cache** | Upstash Redis in Virginia (`us-east-1`) |
| **Functions** | Vercel Hobby, Virginia (`iad1`) |
| **Edge CDN** | Global, Mumbai serves Bangladesh (~50ms) |
| **Driver** | `neon()` HTTP (switched May 17 — eliminates 900ms WebSocket reconnect) |

## Architecture Decisions

### Database Connection
- **Driver**: `neon()` HTTP function from `@neondatabase/serverless` + `drizzle-orm/neon-http`
- **Why not Pool**: Pool uses WebSockets — after 3-5min idle, WebSocket drops, reconnecting costs ~900ms. HTTP has no persistent connection, each call is independent (~5ms overhead)
- **URL handling**: Strip `-pooler` from hostname + strip all query params (`.split('?')[0]`)
- **Env var priority**: `MEDNEST_DATABASE_URL` → `DATABASE_URL` → `POSTGRES_URL` → etc.

### Caching (3-tier)
| Tier | Where | Read time | Scope |
|---|---|---|---|
| **Redis** | Upstash REST API (Virginia) | ~10-15ms | Shared across ALL containers |
| **In-memory** | Per-function container | <1ms | Single container only |
| **CDN (Vercel)** | Global edge (Mumbai for BD) | ~29ms (log) / ~160ms (real) | Same URL across all users |

- **Redis API**: Raw `fetch()` calls to Upstash REST endpoint — no SDK (@upstash/redis had version issues)
- **Env vars**: `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (fallback: `KV_REST_API_*`)
- **Critical detail**: Upstash stores values as JSON strings — `redisGet()` must `JSON.parse()` before returning
- **TTL**: 300s (5 min)
- **Cache keys**: `{endpoint}:{searchParams.toString()}`

### Performance on Hobby
| Scenario | Source | Time |
|---|---|---|
| **CDN HIT** (same URL re-visited) | Mumbai edge | **29-62ms** |
| **CDN MISS + Redis HIT** (new filter, someone cached it) | Function → Redis | **~200ms** |
| **First ever call** (cold container + no cache) | Vercel boot + Neon Singapore | **~1.6s** (937ms function + CDN overhead) |

The 937ms function time is **863ms network round trip Virginia → Singapore** (Vercel Hobby forces Virginia). On Pro (Singapore functions), this drops to ~20ms.

### Optimistic UI Status
- **Search suggestions** ✅ — Local Map cache, shows instantly while refreshing in background
- **Filter changes** ✅ — Old cards stay visible, no spinner, new data swaps in smoothly
- **First load** ✅ — Shows 6 skeleton cards (animate-pulse) while data loads
- **Progressive loading (6 cards then 14)** ❌ — Not built. Planned for after Pro upgrade

### Cron (Hobby Workaround)
- **cron-job.org** (free) hitting `https://mednest-frontend.vercel.app/api/cron` every 5 min
- Pings: drugs default, drugs pharma, generics pharma, popular, napa search
- **Set to 2 min** after sessions to keep container warm (Hobby idle timeout ~3-5 min)
- UA override `MedNestCron/1.0` to bypass middleware bot detection

---

## 🔴 VERCEL PRO CHECKLIST (Execute in order when subscribing)

### After upgrading to Pro ($20/mo):

1. **Vercel → Project → Settings → Functions → Default Function Region → `Singapore (ap-southeast-1)`**
   - This alone cuts all function times from ~900ms → ~20ms
   - Functions run next to Neon DB

2. **Delete + Recreate Upstash Redis in Singapore**
   - Vercel → Storage → mednest-redis → Settings → Danger Zone → Delete
   - Create new → pick `Singapore (ap-southeast-1)`
   - Env vars auto-update, no code changes needed
   - Redis read times drop from ~200ms → ~5ms

3. **Enable Vercel Cron (remove cron-job.org)**
   - `frontend/vercel.json` cron schedule activates automatically
   - `*/5 * * * *` runs reliably — delete cron-job.org job
   - Container stays warm 24/7

4. **Switch Pool back (Optional — Not Recommended)**
   - If you switch to Pool, update `lib/db/index.ts`:
   - `import { Pool } from '@neondatabase/serverless' + drizzle-orm/neon-serverless`
   - **Recommendation**: Keep `neon()` HTTP — simpler, zero connection management, same speed in Singapore

### Expected performance on Pro:
| Scenario | Time |
|---|---|
| First ever call (cold) | **~150ms** (Singapore function → Singapore Neon) |
| Cached (Redis) | **~50ms** (Singapore function → Singapore Redis) |
| CDN edge (Mumbai → BD) | **~50ms** (unchanged) |
| Real user feel (Bangladesh) | **~100-200ms** every call |

### Remaining feature work (no Pro needed):
- [ ] Progressive loading (6 cards instantly, then 14)
- [ ] Drug detail page prices + medical info
- [ ] Type badge (Herbal/Vet) in search suggestions
- [ ] Interactions page
- [ ] Compare page
- [ ] AI Assistant
- [ ] Square/Beximco/ACME/Renata scrapers

---

## 🔄 Next Session
1. Verify neon() HTTP driver is stable (test after deploy)
2. Update cron-job.org to every 2 min
3. Begin any feature from "remaining work" above

## 📖 Key Docs
- `docs/SOURCE_OF_TRUTH.md` — Read FIRST in every session
- `docs/SECURITY.md` — Security hardening details
- `docs/DATABASE_SCHEMA.md` — Full schema
- `docs/SCRAPING.md` — How to run scrapers
