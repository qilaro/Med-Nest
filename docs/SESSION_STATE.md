# 🚀 Med-Nest: Industrial Production Roadmap (2-Week Sprint)

## 🏗️ Sprint Strategy: DevSecOps & Mobile-First
**Goal**: Deliver a production-grade, high-security medical platform by May 14, 2026.

---

## 📅 Sprint 1: Infrastructure, Data & Security (Days 1-4)

### 1.1 The "Platinum" Data Pipeline (See `docs/DATA_PIPELINE.md`)
- [x] **Database Initialization**: Neon PostgreSQL + Drizzle ORM configured.
- [x] **Gold Standard Schema**: 20+ medical fields implemented in `schema.ts`.
- [x] **Clinical Seed Acquired**: `source_dataset.csv` (12MB) extracted and ready.
- [ ] **Step 1 (Ingest)**: 
    - [ ] Install `csv-parse`.
    - [ ] Build and execute `frontend/scripts/ingest-data.ts`.
- [ ] **Step 2 (Market Sync)**: Build automated crawler for Med-Ex BD sync.
- [ ] **Step 3 (Official Verification)**: Targeted company site scraping for PI & Assets.
- [ ] **Step 4 (AI Synthesis)**: LLM logic to rewrite into original Med-Nest voice.

### 1.2 Security & Compliance (2026 Standards)
- [ ] **Zero-Trust Implementation**: Configure secrets management.
- [ ] **Audit Logging**: DB-level triggers for medical data integrity.
- [ ] **Authentication**: Secure Clerk integration.

---

## 📅 Sprint 2: Core Engineering & Mobile UX (Days 5-10)
... (Pending)

## 📈 Enrichment Progress Log

### Completed Generic Drug Enrichments
- [x] **Metronidazole** (Done) - Includes "What is" description.
- [x] **Cefixime** (Done) - Includes "What is" description.
- [x] **Esomeprazole** (Done) - Includes "What is" description.

### Enrichment Data Integrity
- All enrichments include the "What is..." section extracted from sources for better drug context.

---

## 🔒 SECURITY HARDENING PLAN (May 3, 2026)

### Phase: Sprint 1 Extension (Post Data Ingestion)

**Goal:** Enterprise-grade security + 30K drugs

### What I Can Deliver (✅)
- Input validation & sanitization
- CAPTCHA on auth routes
- Rate limiting (10 req/min per IP)
- Bot/scraper detection
- Enhanced audit logging
- CORS + security headers
- Role-based access control

### What Requires External Setup (⚠️)
- Cloudflare DDoS protection
- AWS WAF
- Professional penetration testing

### Timeline
- **Security:** 7.5 hours
- **Scraping (to 30K):** 15 hours
- **Total:** ~22.5 hours (3 days)

### Data Target
- Current: 23,106 drugs
- Target: 30,000+ drugs
- Source: Med-Ex + 20 company websites
- Deduplication: Automatic matching by brand+generic+strength

---

