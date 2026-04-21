
# PRD — MedQ (MVP)

## 1. Product Summary
MedQ is a lightweight, SEO-first medicine information platform for search-driven growth in healthcare information.

**Motto:** Learn more. Live better.

## 2. Problem
Users need a trustworthy, readable place to search and compare medicine information, check interactions, and understand safety signals quickly.

## 3. Goals
1. Launch an indexable, search-first medicine experience.
2. Validate organic acquisition through medicine-intent queries.
3. Build a clean base architecture for rapid feature expansion.

## 4. MVP Scope
### In Scope
- Drug directory/search (A-Z, brand, generic, class, company, full-text)
- Drug detail page (core fields + warnings + side effects + alternatives)
- Interaction checker
- Drug comparison
- AI chatbot (medicine guidance with disclaimer)
- News/blog
- Favorites/bookmarks
- Admin panel (basic medicine/review management)
- Site-wide emergency disclaimer banner

### Out of Scope (MVP)
- Full patient account ecosystem
- Appointment marketplace
- Large-scale condition/symptom platform

## 5. Users
- General users seeking medicine information
- Patients comparing options
- Pharmacist/admin operator managing content quality

## 6. Functional Requirements (MVP)
1. Search returns relevant medicine results quickly and supports close spellings.
2. Drug detail pages expose core info and safety-focused sections.
3. Users can check interactions between selected drugs.
4. Users can compare up to multiple alternatives in-class.
5. AI chatbot includes clear medical disclaimer in responses/workflow.
6. Users can save/remove favorites.
7. Admin can create/update medicine records and review entries.

## 7. Non-Functional Requirements
- SEO-first route/content structure
- Fast page rendering and mobile readability
- Accessibility-conscious UI (clear hierarchy, contrast, keyboard support)
- Explicit medical disclaimers where clinical misinterpretation risk exists

## 8. Data & Content
- Initial curated dataset: 50–100 medicines
- Expansion target: 300–500 after MVP validation
- Canonical medicine fields: brand, generic, class, company, price, indications, dosage, warnings, side effects, alternatives

## 9. Target Stack
- Frontend: Next.js + TypeScript + Tailwind + shadcn/ui
- Backend: FastAPI + Python
- Database: PostgreSQL + SQLAlchemy
- AI: Gemini

## 10. Success Metrics
- Organic search clicks and indexed page growth
- Search usage and top medicine queries
- Returning users
- Interaction checker adoption

## 11. Information Architecture (Target)
```text
mednest/
  frontend/
  backend/
  shared/
```

## 12. Acceptance Baseline
MVP is acceptable when core in-scope flows are reachable, medically cautioned, and indexable with stable frontend/backend boundaries.
