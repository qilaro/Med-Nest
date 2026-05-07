# 💎 Med-Nest: The Platinum Data Pipeline

This document is the **Absolute Blueprint** for the Med-Nest data acquisition engine. It ensures total continuity across AI sessions.

## 🏗️ The 4-Stage "Data Funnel"

### 1. Stage 1: The Clinical Seed (Source: `archive.zip`) ✅ COMPLETE
*   **Goal**: Establish the base clinical knowledge for 20k+ drugs.
*   **Action**: ✅ Imported `feature_engineered_medicine_dataset_v4_TG.csv` via `frontend/scripts/ingest-data.ts`.
*   **Key Fields**: Side Effects, Pregnancy Safety, Cardiac/CNS Risks, Therapeutic Groups.
*   **Results** (May 3, 2026):
    - ✅ 23,106 drugs loaded
    - ✅ 3,325 unique generics
    - ✅ 341 companies classified by country
    - ✅ 26,646 audit logs auto-captured
    - ✅ RLS policies active on all tables
    - ✅ Country column added + indexed (migration 0003)
*   **Continuity Rule**: This is the foundation. Do not re-import once pushed to Neon.

### 2. Stage 2: The Market Sync (Source: Med-Ex.com.bd)
*   **Goal**: Align clinical data with the current Bangladesh market.
*   **Action**: Automated crawler matches CSV brand names with Med-Ex.
*   **Updates**: 
    *   **Price**: Latest Unit/Strip/Box BDT prices.
    *   **Manufacturer**: Local pharma entity (Square, Beximco, etc.).
    *   **Availability**: Mark products as "Available" or "Discontinued."

### 3. Stage 3: The Official Polish (Source: Pharma Company Sites)
*   **Goal**: Final verification and high-fidelity asset gathering.
*   **Action**: Target "Big 10" Pharma sites (Incepta, Square, etc.).
*   **Assets**: High-resolution box/strip images, official Product Inserts (PI).

### 4. Stage 4: The AI Refiner (Source: Gemini AI)
*   **Goal**: Med-Nest Originality & SEO Dominance.
*   **Action**: AI rewrites raw data into "Learn more. Live better." style.
*   **Rules**:
    *   **EEAT**: Must include Reviewer Signature and "Last Updated" date.
    *   **Readability**: Convert jargon into patient-friendly language.
    *   **Uniqueness**: 100% original text to avoid Google "Duplicate Content" penalties.

## 🚀 SEO & SECURITY MANDATES

### SEO Strategy (Search-to-Detail Flow)
*   **Dynamic Metadata**: Every drug/generic gets unique Meta Titles/Descriptions.
*   **Internal Linking**: Automatic "Compare Alternatives" and "Generic Classes" links.
*   **Schema Markup**: Professional `Product` and `FAQ` JSON-LD for rich Google snippets.

### Security Strategy (The Vault)
*   **Zero-Trust**: No API keys in code. All Neon/Vercel keys must reside in `.env`.
*   **Data Integrity**: Checksums for incoming CSV/Scraped data.
*   **Pharmacist Loop**: `is_verified` flag must be set by the Admin Panel for any new medical info.

## 🏁 Execution Status

**Phase 1 ✅ COMPLETE (May 3, 2026)**
- ✅ CSV clinical seed extracted and ingested
- ✅ "Super-Ingest" script built and executed successfully
- ✅ 23,106 drugs + 3,325 generics loaded
- ✅ RLS + audit logging active

**Phase 2 🔄 IN PROGRESS (May 3-5, ~22.5 hours)**
1. **Security Hardening** (7.5 hours):
   - Input validation (Zod schemas)
   - CAPTCHA integration (reCAPTCHA v3)
   - Rate limiting (10 req/min/IP)
   - Bot detection logic
   - Enhanced audit logging
   - CORS + security headers
   - Secure error handling

2. **Data Scraping to 30K** (15 hours):
   - Build Med-Ex scraper (~7K new drugs)
   - Company website scrapers for top 20 pharma (~1K drugs)
   - Deduplication matching (brand+generic+strength+dosage_form)
   - Data quality validation
   - Target: 30,000+ medicines total

**Phase 3 (Future)**
- Build the autonomous crawler (The Market Sync) for monthly sync
