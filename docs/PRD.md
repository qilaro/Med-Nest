
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

**Current Status** (May 3, 2026):
- ✅ **23,106 medicines** ingested from clinical dataset (vs initial plan of 50-100)
- ✅ **3,325 unique generics** loaded
- ✅ **341 pharmaceutical companies** classified by country origin
- 🔄 **Phase 2 (In Progress)**: Scraping Med-Ex + company websites to reach **30,000+ medicines**

**Dataset Expansion Plan**:
- Initial dataset: ✅ Completed (23,106 medicines)
- Post-launch expansion: Phase 2 (15 hours) will add 6,900+ medicines to reach 30K+

## 4. Tech Stack
- Frontend: Next.js + TypeScript (App Router + Server Actions)
- Styling: Tailwind CSS + shadcn/ui
- Database: PostgreSQL + pgvector
- ORM: Drizzle ORM (TypeScript)
- Authentication: Clerk (Frontend auth)
- File storage: Cloudflare R2
- Hosting: Vercel (Next.js)
- Analytics: Google Analytics + PostHog
- AI: Google Gemini API (primary), RAG over curated PostgreSQL dataset
- Search: PostgreSQL full-text search first, optional Meilisearch later

### Future Scalability Path (Post-Traction)
If we hit our traction metrics, we will migrate the intensive AI and Business Logic into a dedicated FastAPI microservice:
- Backend Migration: FastAPI + Python (for advanced AI/ML pipelines)
- Inter-service Auth: JWT-based verification between Next.js and FastAPI
- Infrastructure: Deployment on Railway/Render for the Python service

## 5. Security & Compliance (2026 Gold Standard)

### A) Zero-Trust Database Architecture ✅ Active
- **Row Level Security (RLS)**: All 6 tables protected with default-deny policies
- **Audit Logging**: Database triggers auto-capture all INSERT/UPDATE/DELETE operations
- **Authentication**: Clerk integration with middleware protection
- **User Ownership**: Reviews linked to user_id; read-only for other users

### B) Application Security (Phase 2 - In Progress)
- Input validation (Zod schema validation for all API inputs)
- CAPTCHA protection (reCAPTCHA v3 on signup/login)
- Rate limiting (10 requests/minute per IP address)
- Bot/scraper detection (User-Agent validation + behavioral analysis)
- Enhanced audit logging for security events
- CORS configuration with strict origin allowlist
- Secure error handling (generic messages, no system info leakage)

### C) Infrastructure Security (External Setup - User Responsibility)
- Cloudflare DDoS protection (optional, recommended)
- AWS WAF for advanced filtering (optional, recommended)
- Professional penetration testing (recommended post-launch)

## 6. SEO Strategy
TBD (primary distribution channel remains SEO).

## 7. Metrics (Traction-Focused)
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
