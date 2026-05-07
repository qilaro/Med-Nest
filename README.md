# Med-Nest

Med-Nest is a production-grade, SEO-first medicine information platform for Bangladesh's pharmaceutical market.
**"Learn more. Live better."**

## Tech Stack

| Layer            | Technology                              |
|------------------|----------------------------------------|
| **Frontend**     | Next.js 16 (App Router, Turbopack)      |
| **Styling**      | Tailwind CSS + shadcn/ui                |
| **Database**     | Neon PostgreSQL (Serverless)            |
| **ORM**          | Drizzle ORM                             |
| **Auth**         | Clerk                                   |
| **Hosting**      | Vercel                                  |

## Project Structure

```
mednest/
├── frontend/         # Next.js Application & Database Layer
│   ├── app/          # App Router (UI, SEO, API routes)
│   │   ├── api/      # DB-backed API routes
│   │   ├── drugs/    # Drug directory & detail pages
│   │   ├── generics/ # Generic drug pages
│   │   ├── class/    # Drug class browse
│   │   ├── trade/    # Trade name browse
│   │   └── ...       # Other routes
│   ├── lib/
│   │   ├── db/       # Drizzle schema & lazy connection
│   │   └── services/ # Data services (DB-first, local fallback)
│   ├── components/   # UI & domain components
│   ├── drizzle/      # SQL migration files
│   └── types/        # TypeScript types
├── docs/             # Project documentation
├── data/             # Source CSV data for ingestion
└── reference/        # UI/UX source of truth
```

## Database

| Table       | Rows  |
|-------------|-------|
| `brands`    | 40,309 |
| `generics`  | 1,757  |
| `companies` | 443    |
| `reviews`   | 0      |
| `faqs`      | 0      |
| `audit_logs`| 0      |

## Getting Started

### Prerequisites
- Node.js & pnpm
- Neon PostgreSQL instance

### Local Development
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables in `frontend/.env.local`:
   ```text
   DATABASE_URL=your_neon_connection_string
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```

### Vercel Deployment
Ensure these environment variables are set in your Vercel project and listed in `turbo.json`:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Documentation
- **Session State**: `docs/SESSION_STATE.md`
- **Project Spec**: `docs/Project_Spec.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Data Pipeline**: `docs/DATA_PIPELINE.md`
- **Security**: `docs/SECURITY.md`
