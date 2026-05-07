# Session State — Med-Nest

## Current Database State (May 2026)

| Table       | Rows    |
|-------------|---------|
| `brands`    | 40,309  |
| `generics`  | 1,757   |
| `companies` | 443     |
| `reviews`   | 0       |
| `faqs`      | 0       |
| `audit_logs`| 0       |

## ✅ Completed

### Infrastructure
- Neon PostgreSQL + Drizzle ORM configured
- Lazy DB connection pattern (safe for Vercel build)
- Turbo repo monorepo with env var passthrough

### API Routes (DB-backed)
- `GET /api/drugs` — paginated list with drug_class & letter filters
- `GET /api/drugs/az` — A-Z grouped drug listing
- `GET /api/drugs/[slug]` — drug detail (joins brands + generics)
- `GET /api/drugs/companies` — company list
- `GET /api/drug-classes` — drug classes with counts
- `GET /api/dosage-forms` — dosage forms with counts
- `GET /api/search?q=` — search brands and generics via ILIKE

### Pages
- Drug directory (`/drugs`) — search, filters, A-Z browse, drug cards
- Drug detail (`/drugs/[slug]`) — all info tabs, pricing, alternate brands
- Generics directory (`/generics`)
- Generic detail (`/generics/[genericSlug]`)
- Class browse (`/class`)
- Dosage forms browse (`/dosage-forms`)
- Trade name browse (`/trade`)

### Services
- `drugService.ts` — client-side, calls `/api/*` routes with local JSON fallback
- `detailService.ts` — server-side, queries DB via Drizzle with local file fallback

### Build
- `pnpm build` passes (TypeScript + Turbopack)
- Vercel deploy requires `DATABASE_URL` in project env vars + `turbo.json`

## 🔄 In Progress
- Vercel deployment env var configuration
- Data scraping pipeline (Med-Ex + company sites)

## 📅 Planned
- Security hardening (Zod validation, rate limiting, CAPTCHA)
- AI chatbot integration
- Compare drugs feature
- Interaction checker
- Favorites/bookmarks
- Admin panel
