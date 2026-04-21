```javascript
Project Specification By Sakib _ Updated By Zemam
MVP Proposal: Medicine Information Platform (SEO-Driven)

```

**&#32;1. Objective**

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

**2. Scope (MVP)**

```javascript
Core Features
```

```javascript
A.A) Medicine search: Drugs (A-Z)

By brand
By Class
By generic name
By Company
Full text search
Close Spelled 
Bookmarked drugs(Redirect to F)

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

**3. Data Strategy**

```javascript
A) Initial dataset: 50–100 medicines (manual curation)
B) Gradual expansion to 300–500 medicines post-launch
```

***

**4. Tech Stack**

```javascript
Frontend : Next.js + Typescript
Styling : Tailwind CSS + shadcn/ui

Backend : FastAPI + Python (AI, Logic, Chatbot, Search APIs)
Optional : Next.js Server Actions + API Routes(Auth/simple calls)

Database : PostgreSQL (with optional pgvector for AI search and embeddings)
ORM : SQLAlchemy(Python)

Authentication : Clerk (Frontend auth)  
JWT/session validation in FastAPI backend

File Storage : Cloudflare R2
Hosting : Vercel (Next.js frontend) + Railway (FastAPI backend)
Analytics : Google Analytics + PostHog
AI : Google Gemini API (primary) 
RAG over your curated PostgreSQL (pgvector) drug database
Search : PostgreSQL Full text Search first,later upgrade to Meilisearch 

```

***

**5. SEO Strategy (Primary Distribution)**

```javascript
TBD
```

***

**6. Metrics (Traction-Focused)**

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

**7. Timeline**

```javascript
TBD
```

***

**8. Future Leverage**

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

**9. Summary**

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