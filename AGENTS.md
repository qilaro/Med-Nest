
# AGENTS.md

## Purpose
Execution rules for AI agents working on **MedQ**.

## Product Context
- Product: SEO-first medicine information platform
- Motto: **Learn more. Live better.**
- Core scope: drug search, drug detail, interaction checker, comparison, chatbot, news, bookmarks, admin, safety disclaimer

## Target Stack
- Frontend: Next.js + TypeScript + Tailwind + shadcn/ui
- Backend: FastAPI + Python
- Database: PostgreSQL + SQLAlchemy
- AI: Gemini

## Source of Truth
1. User instruction in current session
2. `docs/PRD.md`
3. `README.md`
4. This file

## Working Rules
1. Keep changes minimal, reversible, and scoped.
2. Preserve Home page stability unless asked to change it.
3. Do not remove files/folders without confirming they are unused.
4. Do not introduce a second framework or duplicate app entrypoints.
5. Keep copy medically cautious; keep disclaimer visibility.

## AI-Friendly Engineering Standards
1. Prefer clear folder boundaries: `frontend/`, `backend/`, `shared/`.
2. Use predictable naming and simple interfaces over clever abstractions.
3. Keep docs in sync when behavior or scope changes.
4. Surface assumptions and blockers explicitly.

## Output Expectations
- Report exact files changed.
- Report removed paths explicitly.
