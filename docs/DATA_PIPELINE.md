# Data Pipeline

## Current Database State

| Table       | Rows    |
|-------------|---------|
| `brands`    | 40,309  |
| `generics`  | 1,757   |
| `companies` | 443     |
| `reviews`   | 0       |
| `faqs`      | 0       |
| `audit_logs`| 0       |

## Data Source

The initial dataset was ingested from CSV files in `data/archive/`:
- `medicine.csv` — Brand/product data with pricing
- `generic.csv` — Generic/active ingredient data
- `manufacturer.csv` — Pharmaceutical company data
- `drug_class.csv` — Drug classification data
- `dosage_form.csv` — Dosage form data
- `indication.csv` — Indication mapping data

## Ingestion Pipeline

The main ingestion script is at `frontend/scripts/ingest-data.ts`. It reads `data/archive/medicine.csv` and inserts into the `brands` table via Drizzle ORM.

## Future Pipeline Stages

1. **Market Sync** — Automated Med-Ex.com.bd crawling for current BD pricing & availability
2. **Official Verification** — Company website scraping for product inserts & pack images
3. **AI Refinement** — Gemini API rewriting for SEO-optimized, patient-friendly content
