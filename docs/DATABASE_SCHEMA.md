# Database Schema: Med-Nest (PostgreSQL)

Current live schema deployed via Drizzle ORM on Neon PostgreSQL.

## 1. `brands` Table (40,309 rows)
Individual branded products available in the Bangladesh market.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key, default `gen_random_uuid()` |
| `brand_name` | VARCHAR(255) | NOT NULL |
| `slug` | VARCHAR(255) | NOT NULL, UNIQUE (SEO URL) |
| `generic_id` | UUID | FK → `generics.id` |
| `company_id` | UUID | FK → `companies.id` |
| `strength` | TEXT | NOT NULL (e.g., "500 mg") |
| `dosage_form` | TEXT | NOT NULL (e.g., "Tablet") |
| `generic_name` | VARCHAR(255) | NOT NULL (denormalized for speed) |
| `company_name` | VARCHAR(255) | NOT NULL (denormalized for speed) |
| `therapeutic_class` | VARCHAR(255) | Drug classification |
| `indications` | TEXT | Searchable for indication pages |
| `dar_number` | TEXT | DGDA registration number |
| `dar_status` | VARCHAR(50) | Default 'Active' |
| `gdar` | VARCHAR(100) | Global DAR reference |
| `medicine_type` | VARCHAR(50) | Default 'Allopathic' |
| `price_unit` | DECIMAL(10,2) | Unit price in BDT |
| `price_strip` | DECIMAL(10,2) | Strip price in BDT |
| `price_box` | DECIMAL(10,2) | Box price in BDT |
| `pack_size` | VARCHAR(100) | Pack description |
| `country` | VARCHAR(50) | Default 'Bangladesh' |
| `average_rating` | DECIMAL(3,2) | Default 0.00 |
| `review_count` | INTEGER | Default 0 |
| `image_url` | TEXT | Product image URL |
| `pack_images` | JSONB | Array of {url, title} |
| `monograph_url` | TEXT | Product monograph URL |
| `created_at` | TIMESTAMP | Default now() |
| `updated_at` | TIMESTAMP | Default now() |

## 2. `generics` Table (1,757 rows)
Active ingredient medical information.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `name` | TEXT | NOT NULL, UNIQUE |
| `slug` | VARCHAR(255) | UNIQUE |
| `therapeutic_class` | VARCHAR(255) | Classification |
| `indications` | TEXT | Multi-line |
| `side_effects` | TEXT | Common & serious side effects |
| `interactions` | TEXT | Drug interactions |
| `contraindications` | TEXT | When NOT to use |
| `pregnancy_lactation` | TEXT | Pregnancy & breastfeeding |
| `precautions` | TEXT | Warnings & precautions |
| `dosage` | TEXT | Dosage & administration |
| `storage_conditions` | TEXT | Storage requirements |
| `overdose_effects` | TEXT | Overdose symptoms & treatment |
| `special_populations` | TEXT | Pediatric, geriatric, etc. |
| `mode_of_action` | TEXT | Mechanism of action |
| `administration` | TEXT | Administration details |
| `reconstitution` | TEXT | Reconstitution instructions |
| `duration_of_treatment` | TEXT | Treatment duration |
| `pediatric_uses` | TEXT | Pediatric usage info |
| `composition` | TEXT | Chemical composition |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

## 3. `companies` Table (443 rows)
Pharmaceutical manufacturers.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE |
| `slug` | VARCHAR(255) | UNIQUE |
| `address` | TEXT | Company address |
| `license_no_biological` | VARCHAR(100) | Biological license |
| `license_no_non_biological` | VARCHAR(100) | Non-biological license |
| `validity_date` | TIMESTAMP | License validity |
| `dgda_status` | VARCHAR(50) | Functional/Suspended/Cancelled/Expired |
| `country` | VARCHAR(50) | Default 'Bangladesh' |
| `corporate_type` | VARCHAR(50) | Default 'Local' |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

## 4. `reviews` Table (0 rows)
User ratings and reviews.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `brand_id` | UUID | FK → `brands.id` |
| `generic_id` | UUID | FK → `generics.id` |
| `rating` | INTEGER | NOT NULL |
| `title` | VARCHAR(255) | Review title |
| `comment` | TEXT | Review body |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

## 5. `faqs` Table (0 rows)
Pharmacist-verified Q&A.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `brand_id` | UUID | FK → `brands.id` |
| `generic_id` | UUID | FK → `generics.id` |
| `question` | VARCHAR(500) | NOT NULL |
| `answer` | TEXT | NOT NULL |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

## 6. `audit_logs` Table (0 rows)
Database change tracking.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `entity_type` | VARCHAR(50) | Table name |
| `entity_id` | UUID | Affected row ID |
| `action` | VARCHAR(50) | INSERT/UPDATE/DELETE |
| `old_values` | JSONB | Previous state |
| `new_values` | JSONB | New state |
| `user_id` | UUID | Actor |
| `ip_address` | VARCHAR(45) | Client IP |
| `created_at` | TIMESTAMP | |

## Migration Workflow

Schema changes go through `frontend/lib/db/schema.ts`. Sync the database:

```bash
cd frontend
npx drizzle-kit push
```

Always verify changes in the Neon Dashboard after pushing.
