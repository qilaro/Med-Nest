# PRD — Med-Nest

## 1. Objective
Build a lightweight, SEO-first medicine information platform for Bangladesh:
1. Enter the healthcare domain
2. Acquire initial organic traffic
3. Validate search-driven distribution

## 2. Current Status (May 2026)

| Metric | Value |
|--------|-------|
| Brands in DB | 40,309 |
| Unique generics | 1,757 |
| Pharmaceutical companies | 443 |
| Reviews | 0 |
| FAQs | 0 |
| API routes | 8 |
| Pages | 6 core + detail pages |

## 3. Tech Stack
- **Frontend**: Next.js 16 + TypeScript (App Router, Turbopack)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM
- **Auth**: Clerk
- **Hosting**: Vercel

## 4. MVP Features

### ✅ Done
- Drug directory with search, filters, A-Z browse
- Drug detail pages (indications, dosage, side effects, interactions, pricing, alternate brands)
- Generics directory & detail pages
- Class, dosage-form, and trade-name browsing
- Fuzzy search with Fuse.js fallback
- Server-side DB-backed API routes
- Auth middleware (Clerk)
- Emergency disclaimer banner

### 🔄 In Progress
- Vercel deployment env var configuration
- Data scraping pipeline for market pricing

### 📅 Planned
- Drug Interaction Checker
- Compare Drugs
- AI Chatbot
- Favorites/Bookmarks
- Admin Panel
- News/Blogs

## 5. Security
- Clerk authentication with middleware protection
- Row Level Security on all tables
- Lazy DB connection for build safety
- TLS 1.3 in transit, AES-256 at rest
