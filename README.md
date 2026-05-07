# Med-Nest

Med-Nest is a production-grade, SEO-first medicine information platform.
**"Learn more. Live better."**

## 🏗️ Architecture (Gold Standard)
Consolidated Next.js architecture designed for speed, SEO, and scalability.

- **Frontend**: Next.js 15+ (App Router, Server Actions)
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 📂 Project Structure
```text
mednest/
├── frontend/        # Next.js Application & Database Layer
│   ├── app/         # App Router (UI & SEO)
│   ├── lib/db/      # Drizzle Schema & Connection
│   └── drizzle/     # Generated SQL Migrations
├── docs/            # Project documentation & Roadmaps
└── reference/       # UI/UX Source of Truth
```

## 🚀 Getting Started

### Prerequisites
- Node.js & pnpm
- Neon PostgreSQL instance

### Local Development
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables in `frontend/.env`:
   ```text
   DATABASE_URL=your_neon_connection_string
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```

## 📖 Documentation
- **Session State**: `docs/SESSION_STATE.md` (Current progress)
- **Project Spec**: `docs/Project_Spec.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
