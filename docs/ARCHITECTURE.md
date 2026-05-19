# Project Architecture

## 1. Component Organization: Atomic Design

### A. Generic UI Components (`components/ui/`)
Reusable building blocks: `button.tsx`, `card.tsx`, `input.tsx`, `StarRating.tsx`, `pagination.tsx`.

### B. Domain Components (`components/drugs/`, etc.)
Feature-specific components: `DrugCard.tsx`, `AZBrowse.tsx`, `SearchSuggestions.tsx`.

## 2. Folder Structure

| Folder | Purpose |
|--------|---------|
| `frontend/app/` | Routes & pages (App Router) |
| `frontend/app/api/` | DB-backed API routes |
| `frontend/components/ui/` | Generic UI primitives |
| `frontend/components/drugs/` | Drug-specific components |
| `frontend/lib/services/` | Data services (API-first, local fallback) |
| `frontend/lib/db/` | Drizzle ORM schema & lazy connection |
| `frontend/drizzle/` | SQL migrations |
| `frontend/types/` | TypeScript type definitions |

## 3. Data Flow

```
Browser → Next.js API Route (/api/drugs) → Drizzle ORM → Neon PostgreSQL
                                          ↕ (fallback)
                                    Local JSON files
```

- **Client components** call `drugService` which hits `/api/*` routes server-side
- **Server components** import `db` directly via Drizzle (lazy connection)
- **Fallback**: If API fails, service falls back to `public/data/drugs.json`

## 4. Database Connection Pattern (Lazy Proxy)

The DB connection uses a Proxy-based lazy initialization:
- `import { db }` does NOT connect to the database
- `db.execute()` initializes the connection on first call
- This prevents build-time crashes when `DATABASE_URL` is unavailable

## 5. Styling & Theming

- **Framework**: Tailwind CSS with CSS variables in `app/globals.css`
- **Variables**: `--primary`, `--mint`, etc. — change one value, whole site updates
- **Components**: shadcn/ui + custom MedicalIcons

## 6. Engineering Standards

1. **Zero Design Deviation**: Pixel-perfect matching with `reference/index.html`
2. **Accessibility**: Semantic HTML, aria-labels
3. **Separation**: Components don't handle DB logic — services do
4. **Build Safety**: All DB imports use lazy pattern for Vercel compatibility
