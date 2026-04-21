
# PRD — MedQ (MVP, aligned to Project Spec)

## 1. Objective
Build a lightweight, SEO-first medicine information platform to:
1. Enter the healthcare domain
2. Acquire initial organic traffic
3. Validate search-driven distribution

**Success signal:** traction through users, search queries, and indexed pages.

## 2. Scope (MVP)

### A) Medicine Search (Drugs A–Z)
- Search by brand
- Search by class
- Search by generic name
- Search by company
- Full-text search
- Close-spell matching
- Entry to bookmarked drugs list

### B) Medicine Detail Page
- Generic name, class name, price
- High-resolution photo of box/strip
- User reviews and ratings (patient/pharmacist)
- Pharmacist-written detailed review
- Interaction check entry point
- Pharmacist-written FAQ (including what interacts with drug X)
- Indications (uses)
- Warnings (before taking)
- Dosage FAQ
- Side effects
- Alternative drugs
- Compare-with-alternatives entry point
- Disclaimer

### C) Drug Interaction Checker
- Check interaction with other drugs
- FAQ written by pharmacist

### D) Compare Drugs
- Compare drugs within class

### E) AI Chatbot
- Drug finder
- Possible cause guidance
- Clear disclaimer

### F) News, Blogs, and Research

### G) Favorites / Bookmarks
- List of marked drugs

### H) Emergency Disclaimer Banner
- Site-wide safety warning

### I) Admin Panel
- Add medicine
- Update medicine
- Review FAQ answers written by pharmacist

## 3. Data Strategy
- Initial dataset: 50–100 medicines (manual curation)
- Gradual expansion: 300–500 medicines post-launch

## 4. Tech Stack
- Frontend: Next.js + TypeScript
- Styling: Tailwind CSS + shadcn/ui
- Backend: FastAPI + Python
- Optional backend edge calls: Next.js Server Actions / API Routes (for simple auth/calls)
- Database: PostgreSQL (optional pgvector for AI search/embeddings)
- ORM: SQLAlchemy
- Authentication: Clerk (frontend auth), JWT/session validation in FastAPI
- File storage: Cloudflare R2
- Hosting: Vercel (frontend) + Railway (backend)
- Analytics: Google Analytics + PostHog
- AI: Google Gemini API (primary), RAG over curated PostgreSQL dataset
- Search: PostgreSQL full-text first, optional Meilisearch later

## 5. SEO Strategy
TBD (primary distribution channel remains SEO).

## 6. Metrics (Traction-Focused)
- Search click rate
- Returning users (retention)
- Interaction checker usage
- Search queries
- Page views
- Bounce rate
- Top medicines searched

## 7. Future Leverage (Post-Traction)
- Expand dataset to 1k+ medicines
- Search by condition
- Condition detail pages
- Symptom checker
- Possible causes with disclaimer
- Primary treatment guidance (doctor-reviewed)
- Doctor appointment redirect to healthcare platform
- Expanded user auth/profile and AI-personalized learning from prescriptions

## 8. Information Architecture (Target)
```text
mednest/
  frontend/   # Next.js (UI + SEO)
  backend/    # FastAPI (AI + logic + APIs)
  shared/     # shared types/schemas (optional)
  docker/     # deployment configs (optional)
  .env
  docker-compose.yml
  README.md
```

## 9. Acceptance Baseline
MVP is acceptable when in-scope core flows are reachable, medically cautioned, and indexable, with stable frontend/backend boundaries aligned to the target structure.
