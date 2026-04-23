
# AGENTS.md

## Purpose
Execution rules for AI agents working on **MedQ**, aligned to `docs/Project_Spec.md`.

## Product Context
- Product: SEO-first medicine information platform (traction-first MVP)
- Motto: **Learn more. Live better.**
- Objective: validate search-driven distribution and initial organic growth

## Source of Truth
1. User instruction in current session
2. `docs/SESSION_STATE.md` (Read FIRST in every new session)
3. `docs/Project_Spec.md`
4. `docs/PRD.md`
5. `README.md`
6. This file

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

## Working Rules
1. **Zero Design Deviation**: The design in `reference/index.html` and `reference/styles.css` is the absolute source of truth. Migration to Next.js must result in a pixel-perfect match.
2. **Incremental Migration**: Changes must be small, verified, and modular. No "big bang" updates.
3. **Keep changes minimal, reversible, and scoped.**
4. Preserve Home page stability unless explicitly requested.
5. Do not remove files/folders without confirming they are unused.
6. Keep medical copy cautious and retain clear disclaimers.
7. Keep docs synchronized when behavior/scope changes.
8. Treat `docs/Project_Spec.md` as architect-owned source of truth; do not rewrite it unless explicitly asked.

## Output Expectations
- Report exact files changed.
- Report removed paths explicitly.
