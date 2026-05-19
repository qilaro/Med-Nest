# Project Specification

MVP: Medicine Information Platform (SEO-Driven)

## 1. Objective

Build a lightweight, SEO-first medicine information platform to:
- Enter the healthcare domain
- Acquire initial organic traffic
- Validate search-driven distribution

## 2. Current State

### Database
- **Brands**: 40,309 products with pricing, dosage, classifications, and manufacturer info
- **Generics**: 1,757 unique active ingredients with medical information
- **Companies**: 443 pharmaceutical manufacturers
- **Reviews/FAQs**: Tables ready, awaiting content

### Frontend
- Next.js 16 App Router with Turbopack
- Tailwind CSS + shadcn/ui components
- DB-backed API routes (no external backend needed)
- Lazy database connection pattern

### Pages Delivered
| Route | Description |
|-------|-------------|
| `/drugs` | Directory with search, filters, A-Z browse |
| `/drugs/[slug]` | Full detail page with tabs, pricing, alternatives |
| `/generics` | Generic drug listing |
| `/generics/[genericSlug]` | Generic detail with medical info |
| `/class` | Browse by therapeutic class |
| `/dosage-forms` | Browse by dosage form |
| `/trade` | Browse by trade name |

### API Endpoints
| Route | Description |
|-------|-------------|
| `GET /api/drugs` | Paginated list with filters |
| `GET /api/drugs/az` | A-Z grouped listing |
| `GET /api/drugs/[slug]` | Drug detail (brands + generics join) |
| `GET /api/drugs/companies` | Company list |
| `GET /api/drug-classes` | Classes with counts |
| `GET /api/dosage-forms` | Dosage forms with counts |
| `GET /api/search?q=` | ILIKE search across brands & generics |

## 3. Tech Stack

```
Frontend : Next.js 16 + TypeScript (App Router, Turbopack)
Styling  : Tailwind CSS + shadcn/ui
Database : Neon PostgreSQL (Serverless)
ORM      : Drizzle ORM
Auth     : Clerk
Hosting  : Vercel
```

## 4. Project Structure

```
mednest/
├── frontend/        # Next.js Application & Database Layer
│   ├── app/
│   │   ├── api/     # DB-backed API routes
│   │   ├── drugs/   # Drug pages
│   │   ├── generics/ # Generic pages
│   │   ├── class/   # Class browse
│   │   ├── dosage-forms/ # Dosage form browse
│   │   └── trade/   # Trade name browse
│   ├── lib/
│   │   ├── db/      # Drizzle schema & lazy connection
│   │   └── services/ # Data services
│   ├── components/  # UI & domain components
│   ├── drizzle/     # SQL migrations
│   └── types/       # TypeScript types
├── docs/            # Documentation
├── data/            # Source CSV data
└── reference/       # UI/UX source of truth
```

## 5. Future Features
- Drug Interaction Checker
- Compare Drugs
- AI Chatbot (Gemini)
- Favorites/Bookmarks
- Admin Panel
- News & Blogs
- Data scraping pipeline
