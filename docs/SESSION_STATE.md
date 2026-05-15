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
- **Vercel functions**: Auto-detect nearest region to Redis/NeoN
- **Neon**: Already in Singapore — no change needed
- **Edge CDN**: Mumbai → Bangladesh at ~50ms (no change)
- **Result**: All three layers (function, Redis, DB) in Singapore — everything sub-5ms

## 📖 Key Docs
- `docs/SOURCE_OF_TRUTH.md` — Read FIRST in every session
- `docs/SECURITY.md` — Security hardening details
- `docs/DATABASE_SCHEMA.md` — Full schema
- `docs/SCRAPING.md` — How to run scrapers
