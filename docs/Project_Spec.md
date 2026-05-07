
# Project Specification By Sakib _ Updated By Zemam

MVP Proposal: Medicine Information Platform (SEO-Driven)

# 1. Objective

```javascript
Build a lightweight, SEO-first medicine information platform to:
Enter the healthcare domain
Acquire initial organic traffic
Validate search-driven distribution
```

```javascript
Success = traction (users, search queries, indexed pages)
```

***

## 2. Scope (MVP)

```javascript
Core Features
```

```javascript
A.A) Medicine search: Drugs (A-Z)

✅ By brand
✅ By Class
✅ By generic name
✅ By Company
✅ Full text search
✅ Close Spelled 
- Bookmarked drugs(Redirect to F)

A.B) Medicine detail page:

Generic Name
Class Name
Price
High Resolution Photo of Box & Strip

User Reviews & Ratings By Patient & Pharmacist
Medical Detailed Review by Pharmacist

Interaction Check with Other Drugs (Redirect to B)
FAQ - What other drugs will affect "X"? Written by Pharmacist

Indications (Uses)
Warnings (Need to know before taking)
Dosage (FAQ & Answers)
Side Effects
Alternative Drugs
Compare With alternatives (Redirect to C)

FAQ and Asnwers by Phrmacist
Disclaimer
```

```javascript
B) Drug Interaction Checker (Check with Other Drugs)
FAQ written by Pharmacist
```

```javascript
C) Compare Drugs (Compare with other Drugs in class)
```

```javascript
D) AI chatbot
Drug finder
Possible Cause of Disease
Disclaimer
```

```javascript
E) News & Blogs & Research
```

```javascript
F) Favorites/Bookmarks (List of marked drugs)
```

```javascript

G) Emergency disclaimer banner (site-wide safety warning)
```

```javascript
H) Admin Panel 
Add Medicine
Update Medicine
Review FAQ answers written by Pharmacist
```

## 3. Data Strategy (Gold Standard Data Pipeline)

**Current Status**: Phase 1 ✅ Complete | Phase 2 🔄 In Progress

**Dataset Size**:
- **Drugs**: 23,106 (vs Med-Ex ~29,500; gap: -6,400 drugs)
- **Generics**: 3,325 unique molecules
- **Companies**: 341 total (331 Bangladesh, 4 JVs, 3 India, 1 UK, 1 Germany, 1 Switzerland)
- **Audit Logs**: 26,646 entries auto-captured

We will build an automated, high-fidelity pipeline to gather data for 25,000+ medicines using a three-tiered "Truth Aggregation" model:

### A) Tiered Sourcing Model
1.  **Tier 1: Local Identity (Med-Ex.com.bd)**
    *   **Purpose**: The source for Bangladesh-specific availability.
    *   **Data**: BD brand names, local manufacturers, dosage forms, strengths, and current local pricing (Unit, Strip, Box).
2.  **Tier 2: Clinical Depth & EEAT (Drugs.com)**
    *   **Purpose**: Global gold standard for medical information.
    *   **Data**: Detailed pharmacology, mechanisms of action, US-standard side effects, pregnancy/lactation warnings, and professional medical review signatures.
3.  **Tier 3: Official Verification (Manufacturer Websites)**
    *   **Purpose**: Final source of truth for prescribing info and assets.
    *   **Data**: Official Product Inserts (PI), high-resolution pack images, and official company descriptions from Square, Beximco, Incepta, etc.

### B) The "Digital Librarian" Pipeline (Automated)
1.  **Discovery Phase**: Automated crawling of Med-Ex A–Z indices to identify new generics and brands.
2.  **Multi-Source Fetching**: Concurrent fetching of data from all three tiers for every new entry.
3.  **AI Reconciliation**: Using LLM logic to synthesize data from multiple sources (e.g., merging Med-Ex local info with Drugs.com clinical depth).
4.  **Structure & Ingest**: Mapping the synthesized data into the PostgreSQL Gold Standard Schema and pushing it to Neon.
5.  **Verification Loop**: Flagging "High-Risk" data for pharmacist verification via the Admin Panel.

### C) Scalability Roadmap
- **Phase 1 (✅ COMPLETE - May 3, 2026)**: 
  - ✅ Ingested 23,106 medicines from CSV
  - ✅ Loaded 3,325 unique generics
  - ✅ Classified 341 companies by country origin
  - ✅ RLS + audit logging active (26,646 entries)
  - ✅ Country column added + indexed for filtering
- **Phase 2 (🔄 IN PROGRESS - 15 hours, May 3-5)**: 
  - Build Med-Ex scraper (~7K new drugs)
  - Company website scrapers for top 20 pharma (~1K new drugs)
  - Security hardening (CAPTCHA, rate limiting, bot detection) - 7.5 hours
  - Target: 30,000+ medicines
- **Phase 3 (Future)**: Full autonomous crawl with monthly sync to 25,000+ brand products

***

## 4. Tech Stack

```javascript
Frontend : Next.js + Typescript (App Router + Server Actions)
Styling : Tailwind CSS + shadcn/ui

Database : Neon PostgreSQL (serverless, instant branching, native pgvector support)
ORM : Drizzle ORM (TypeScript)

Authentication : Clerk (Frontend auth)
File Storage : Cloudflare R2
Hosting : Vercel (Next.js)
Analytics : Google Analytics + PostHog
AI : Google Gemini API (via RAG over pgvector)

---
### Future Scalability Path (Post-MVP)
If we hit our traction metrics, we will migrate the intensive AI and Business Logic into a dedicated FastAPI microservice:
- Backend Migration : FastAPI + Python (for advanced AI/ML pipelines)
- Inter-service Auth : JWT-based verification between Next.js and FastAPI
- Infrastructure : Deployment on Railway/Render for the Python service
```

***

## 5. SEO Strategy (Primary Distribution)

```javascript
TBD
```

***

## 6. Metrics (Traction-Focused)

```javascript
Search (Click Rate)
```

```javascript
Returning Users (Retention)
```

```javascript
Interaction Checker usage (Feature adoption)
```

```javascript
Track
```

```javascript
Search queries
```

```javascript
Page views
```

```javascript
Bounce rate
```

```javascript
Top medicines searched
```

***

## 7. Timeline

```javascript
TBD
```

***

## 8. Future Leverage

```javascript
Once traction is achieved:
```

```javascript
Expand dataset (1k+ medicines)
```

```javascript
Search by Condition
Condition detail page
Symptom checker 
Possible Causes with disclaimer
Possible primary treatment(Reviewd by Doctor) 
Doctor Appointment (Redirect to Doctor Appointment Page of Helathcare platform)
```

```javascript
User Authentication (SignUp/Login system)
AI driven profile (Learned by Prescription)
Drug Interaction
Side Effects
Warnings
```

***

## 9. Summary

```javascript
This MVP is a traction-first, execution-focused entry point into healthcare, leveraging:
```

```javascript
Proven demand (search behavior)
SEO-driven distribution
Fast iteration cycles
```

***

```javascript
Goal: Build a Modern Healthcare system and add this as a product!
```

***

***

**Structure&#32;**

```javascript
mednest/
│
├── frontend/        # Next.js (UI + SEO)
├── backend/         # FastAPI (AI + logic + APIs)
├── shared/          # shared types / schemas (optional)
├── docker/          # deployment configs (optional)
├── .env
├── docker-compose.yml
└── README.md
```

```javascript
frontend/
│
├── app/                     # App Router (SEO-first structure)
│   ├── page.tsx             # Home (search page)
│   ├── layout.tsx
│   │
│   ├── drug/
│   │   └── [slug]/          # Medicine detail page
│   │       └── page.tsx
│   │
│   ├── search/
│   │   └── page.tsx
│   │
│   ├── compare/
│   │   └── page.tsx
│   │
│   ├── interaction/
│   │   └── page.tsx
│   │
│   ├── chatbot/
│   │   └── page.tsx
│   │
│   ├── favorites/
│   │   └── page.tsx
│   │
│   └── admin/
│       ├── page.tsx
│       ├── add-medicine/
│       └── edit-medicine/
│
├── components/
│   ├── ui/                  # shadcn components
│   ├── search-bar.tsx
│   ├── medicine-card.tsx
│   ├── disclaimer.tsx
│   └── navbar.tsx
│
├── lib/
│   ├── api.ts               # API calls to FastAPI
│   ├── utils.ts
│   └── constants.ts
│
├── hooks/
├── styles/
├── types/
├── public/
└── next.config.js
```

```javascript
backend/
│
├── app/
│   ├── main.py              # entry point
│   ├── core/
│   │   ├── config.py        # env + settings
│   │   ├── database.py      # DB connection
│   │   └── security.py      # auth/JWT
│   │
│   ├── models/              # SQLAlchemy models
│   │   ├── medicine.py
│   │   ├── user.py
│   │   ├── review.py
│   │   ├── faq.py
│   │   └── interaction.py
│   │
│   ├── schemas/             # Pydantic schemas
│   │   ├── medicine.py
│   │   ├── user.py
│   │   └── ai.py
│   │
│   ├── api/
│   │   ├── routes/
│   │   │   ├── medicines.py
│   │   │   ├── search.py
│   │   │   ├── chatbot.py
│   │   │   ├── interaction.py
│   │   │   ├── compare.py
│   │   │   ├── favorites.py
│   │   │   └── admin.py
│   │   │
│   │   └── router.py
│   │
│   ├── services/
│   │   ├── gemini_service.py
│   │   ├── search_service.py
│   │   ├── ai_rag_service.py
│   │   └── medicine_service.py
│   │
│   ├── db/
│   │   ├── session.py
│   │   └── base.py
│   │
│   └── utils/
│
├── tests/
├── requirements.txt
└── .env
```

```javascript
shared/
│
├── types/
│   ├── medicine.ts
│   ├── user.ts
│
├── constants/
│   ├── routes.ts
│
└── validators/
```
