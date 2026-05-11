# Med-Nest — Session Source of Truth

**Last Updated**: May 11, 2026 | **Branch**: feature/az-navigation

## Database State

| Table | Rows | Notes |
|-------|------|-------|
| `brands` | **75,736** | Cleaned, deduped, labeled |
| `generics` | 4,912 | 2,097 with medical data (43%) |
| `companies` | 1,029 | |

### Brands by Type

| Type | Count | Priced | Verified |
|------|-------|--------|---------|
| Allopathic | **50,628** | 45,747 (90%) | 100% |
| Unani | 8,540 | 87 | 100% |
| Ayurvedic | 5,254 | 63 | 100% |
| Homeopathic | 3,719 | 6 | 100% |
| Herbal | 1,692 | 310 | 98% |
| Veterinary | 1,006 | 977 | 70% |
| Supplement | 317 | 7 | 100% |
| Device | 137 | 25 | 96% |
| PersonalCare | 86 | 1 | 100% |
| Vaccine | 11 | 11 | 100% |
| **TOTAL** | **75,736** | **47,234** | **99.5%** |

### Generics Data Sources
| Source | Count | Notes |
|--------|-------|-------|
| OpenFDA + MedEx Archive | ~2,089 | With medical info |
| Empty | 2,815 | Need scraping (745 allopathic + rest traditional) |

## API Routes (8)
- `GET /api/drugs` / `[slug]` / `az` / `companies`
- `GET /api/drug-classes` / `dosage-forms`
- `GET /api/search` (pg_trgm fuzzy) / `search/generics` / `search/log`
- `GET /api/stats` / `popular`

## Pre-Launch Checklist

### 🔴 Must Fix Before Launch

- [ ] **Redis rate limiter** — Replace in-memory Map with `@upstash/ratelimit`. Requires `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` env vars. Code ready at `lib/rate-limit.ts` (commented out).
- [ ] **Google Search Console** — Replace `YOUR_GOOGLE_SEARCH_CONSOLE_ID` in `app/layout.tsx` with real verification code
- [ ] **Set production domain** — Replace `mednest.com.bd` references in sitemap/robots/OG with actual domain

### 🟡 Important

- [ ] **Wildcard DoS protection** — Escape `%` and `_` in user input before ILIKE queries
- [ ] **CSRF protection** — For write endpoints (reviews, FAQs)
- [ ] **Error logging sanitization** — Strip sensitive data from console.error in production
- [ ] **Request timeout limits** — Configure `maxDuration` on API routes

### 🟢 Nice to Have

- [ ] **Script safeguards** — Dry-run flags for ingestion scripts
- [ ] **Structured logger** — Replace console.error with pino/winston
- [ ] **Bangla hreflang** — Add when Bangla version is ready
- [ ] **FAQ Schema** — JSON-LD for FAQ sections
- [ ] **Multi-region deployment**

## Data Sources
| Source | Brands | Medical Info | Prices |
|--------|--------|-------------|--------|
| DGDA (govt) | ~29K | No | Yes |
| MedEx brand listing | ~24K | No | No |
| ePharma scraper | ~1.2K | No | Yes |
| MedEx generic scrape | ~530 | Yes | Yes |
| MedsBD (pending) | ~780 brands | Yes (indications, dose, SE) | Yes |

## Security
- CSP headers (full policy, Clerk domains allowed)
- Bot detection (user-agent, 40+ patterns)
- Rate limiting (in-memory, 30 req/10s — replace with Redis)
- HSTS, X-Frame-Options, X-Content-Type-Options
- Permissions Policy (all disabled)
- Right-click, copy, F12, DevTools blocked
- Zod validation on all API routes
- SQL injection prevented (parameterized queries only, sql.raw removed)
- Path traversal prevented (slug regex + guard)
- Error leakage prevented (no zod.flatten() in 400 responses)

## Known Issues
- Pagination on MedsBD brand pages is broken (same data every page)
- Some company names lowercased in companies table
- Company name normalization pending (merge Square subsidiaries)
- 745 allopathic generics still need medical data

## Common Patterns
- **DB**: Drizzle ORM + Neon PostgreSQL (serverless)
- **Auth**: Clerk middleware in proxy.ts
- **Rate limit**: In-memory → planned Redis migration
- **Search**: pg_trgm similarity + ILIKE + weighted ranking
- **Caching**: Cache-Control headers on static endpoints
- **Slugs**: Human-readable pattern (readable for SEO)
