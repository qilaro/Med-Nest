# Med-Nest — Session Source of Truth

**Last Updated**: May 9, 2026 | **Branch**: feature/az-navigation

## Database State

| Table | Rows | Notes |
|-------|------|-------|
| `brands` | **41,271** | Rebuilt from DGDA, cleaned, deduped |
| `generics` | 2,737 | 2,144 with medical data (78%) |
| `companies` | 443 | |

### Brands by Type

| Type | Count |
|------|-------|
| Allopathic | 41,185 |
| Veterinary | 32 |
| Herbal | 22 |
| Vaccine (Human) | 19 |
| Veterinary Vaccine | 13 |
| **With prices** | **25,393** (61.5%) |

### Generics Data Sources
| Source | Matched | Notes |
|--------|---------|-------|
| CSV clinical dataset | ~1,660 | Original import |
| OpenFDA (US FDA) | 484 | US drug labels |
| Med-Ex scraped | 266 | From Tampermonkey |

## API Routes (8 total)
All validated with Zod, server-side, rate-limited (60/min):
- `GET /api/drugs` — list with filters
- `GET /api/drugs/[slug]` — detail
- `GET /api/drugs/az` — A-Z
- `GET /api/drugs/companies` — companies
- `GET /api/drug-classes` — classes
- `GET /api/dosage-forms` — forms
- `GET /api/search` — ILIKE search
- `GET /api/search/generics` — generic search

## Security
- Rate limiting (60 req/min)
- Bot detection (40+ patterns)
- CSP headers (HSTS, XSS, nosniff)
- Permissions policy (camera/mic disabled)
- Right-click, copy, F12, DevTools blocked
- Zod validation on all API routes
- RLS on all DB tables

## What's Next
### Data Pipeline
- [ ] Scrape Square Pharma (iterate PID 1-1059 directly)
- [ ] Scrape Beximco Pharma
- [ ] Scrape ACME Laboratories
- [ ] Scrape Renata PLC
- [ ] Scrape Healthcare Pharmaceuticals
- [ ] Scrape Beacon Pharmaceuticals

### Square Scraper Fix
- Don't use listing pages (only 530 found)
- Iterate PID 1-1059 directly, check `<h3>` for valid product
- Grab PDF (`pdoc` link) + image URL from each page
- Update all brand variants in DB

### Frontend
- [ ] Show prices on drug detail page
- [ ] No price → "Price Updating, Contact Pharmacy"
- [ ] Verified brand → Green tick + "Medically verified by MedNest from {company}"
- [ ] Show medical info from generics join
- [ ] Unify generics/class/trade pages under `/drugs?filter=X`
- [ ] Type badge (Herbal/Vet/Vaccine/Allopathic) in search suggestions

## Common Patterns
- **DB connection**: `lib/db/index.ts` (lazy proxy pattern)
- **API routes**: `app/api/[route]/route.ts` (server-side, Zod validated)
- **Scraper pattern**: Python + urllib + ssl bypass for BD pharma sites
- **Auth**: Clerk middleware in `proxy.ts`

## Important Files
| File | Purpose |
|------|---------|
| `proxy.ts` | Auth + security middleware |
| `lib/db/schema.ts` | Drizzle ORM schema |
| `lib/services/drugService.ts` | Drug listing service |
| `lib/services/detailService.ts` | Drug detail service |
| `lib/validators.ts` | Zod schemas |
| `lib/rate-limit.ts` | Rate limiter |
