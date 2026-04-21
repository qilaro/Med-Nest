
# AGENTS.md

## Purpose
Execution rules for AI agents working on **MedQ**, aligned to `docs/Project_Spec.md`.

## Product Context
- Product: SEO-first medicine information platform (traction-first MVP)
- Motto: **Learn more. Live better.**
- Objective: validate search-driven distribution and initial organic growth

## Source of Truth
1. User instruction in current session
2. `docs/Project_Spec.md`
3. `docs/PRD.md`
4. `README.md`
5. This file

## MVP Scope Guardrails
In-scope product surface (must stay aligned with Project Spec):
- Drug search (A-Z, brand, class, generic, company, full-text, close-spell support)
- Drug detail page (core fields, warnings, dosage, side effects, alternatives, FAQ, disclaimer)
- Drug interaction checker
- Drug comparison
- AI chatbot (drug finder + possible-cause guidance with disclaimer)
- News/Blogs/Research
- Favorites/Bookmarks
- Site-wide emergency disclaimer banner
- Admin panel (add/update medicine, FAQ/review workflow)

Out of scope by default:
- Full patient account ecosystem
- Appointment marketplace
- Large-scale condition/symptom platform

## Target Stack
- Frontend: Next.js + TypeScript + Tailwind + shadcn/ui
- Backend: FastAPI + Python
- Database: PostgreSQL (+ optional pgvector later)
- ORM: SQLAlchemy
- AI: Google Gemini

Planned integrations from Project Spec:
- Auth: Clerk (frontend auth) + backend JWT/session validation
- File storage: Cloudflare R2
- Hosting: Vercel (frontend) + Railway (backend)
- Analytics: Google Analytics + PostHog

## Architecture Convention
Preferred target structure:
- `frontend/` for Next.js app/router UI and SEO pages
- `backend/` for FastAPI API/services/models
- `shared/` for shared types/constants/validators
- optional infra files/folders (`docker/`, compose, env files)

Do not introduce duplicate app entrypoints or competing frameworks.

## Working Rules
1. Keep changes minimal, reversible, and scoped.
2. Preserve Home page stability unless explicitly requested.
3. Do not remove files/folders without confirming they are unused.
4. Keep medical copy cautious and retain clear disclaimers.
5. Keep docs synchronized when behavior/scope changes.
6. Treat `docs/Project_Spec.md` as architect-owned source of truth; do not rewrite it unless explicitly asked.

## Output Expectations
- Report exact files changed.
- Report removed paths explicitly.
