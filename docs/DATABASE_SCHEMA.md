# Database Schema: Med-Nest (PostgreSQL) - Gold Standard

This schema is designed to support 25,000+ drugs with high-fidelity medical information, satisfying EEAT standards (Experience, Expertise, Authoritativeness, and Trustworthiness) by combining data structures from Drugs.com, Med-Ex.com, and official manufacturer sources.

## 1. `generics` Table
Stores deep medical information common to all brands of a specific generic molecule.

*   `id`: UUID (Primary Key)
*   `name`: VARCHAR(255) (e.g., "Paracetamol")
*   `slug`: VARCHAR(255) (Unique, for SEO URLs)
*   **Medical Content (Long Form)**:
    *   `indications`: TEXT (Indications & Usage)
    *   `pharmacology`: TEXT (Mechanism of Action)
    *   `dosage`: TEXT (Dosage & Administration)
    *   `interactions`: TEXT (Drug Interactions)
    *   `contraindications`: TEXT (When NOT to use)
    *   `side_effects`: TEXT (Common & Serious Side Effects)
    *   `pregnancy_lactation`: TEXT (Use in Pregnancy & Breastfeeding)
    *   `precautions`: TEXT (Precautions & Warnings)
    *   `special_populations`: TEXT (Pediatric, Geriatric, Renal/Hepatic Impairment)
    *   `overdose_effects`: TEXT (Symptoms & Treatment of Overdose)
*   **Classification & Specs**:
    *   `therapeutic_class`: VARCHAR(255) (e.g., "Non-Opioid Analgesics")
    *   `storage_conditions`: TEXT (Keep in a dry place...)
    *   `chemical_structure`: TEXT (Formula/Description)
    *   `structure_image_url`: TEXT (URL to chemical structure diagram)
*   **EEAT Metadata**:
    *   `medical_reviewer`: VARCHAR(255) (e.g., "Carmen Pope, B. Pharm")
    *   `last_updated`: TIMESTAMP
    *   `created_at`: TIMESTAMP

## 2. `companies` Table
*   `id`: UUID (Primary Key)
*   `name`: VARCHAR(255) (e.g., "Beximco Pharmaceuticals Ltd.")
*   `slug`: VARCHAR(255) (Unique)
*   `description`: TEXT
*   `logo_url`: TEXT
*   `country`: VARCHAR(255) (Default: "Bangladesh"; format: "Country1, Country2" for joint ventures; e.g., "Japan, Bangladesh")
*   **Index**: Created on `country` field for efficient filtering by country

## 3. `drugs` Table
The core table for specific brand products, focused on physical form and pricing.

*   `id`: UUID (Primary Key)
*   `brand_name`: VARCHAR(255) (e.g., "Napa One")
*   `slug`: VARCHAR(255) (Unique, e.g., "napa-one-1000")
*   `generic_id`: UUID (Foreign Key -> `generics.id`)
*   `company_id`: UUID (Foreign Key -> `companies.id`)
*   **Physical Specs**:
    *   `dosage_form`: VARCHAR(100) (e.g., "Tablet", "Syrup", "Prefilled Syringe")
    *   `strength`: VARCHAR(100) (e.g., "1000 mg", "300 mg/2 mL")
    *   `pack_size`: VARCHAR(100) (e.g., "20 x 10", "1 x 30")
*   **Pricing (BDT)**:
    *   `price_unit`: DECIMAL(10, 2) (e.g., 2.25)
    *   `price_strip`: DECIMAL(10, 2) (e.g., 22.50)
    *   `price_box`: DECIMAL(10, 2) (e.g., 450.00)
*   **Assets & Social**:
    *   `image_url`: TEXT (High-res photo of Box/Strip)
    *   `pronunciation`: VARCHAR(100) (e.g., "DU-pix-ent")
    *   `average_rating`: DECIMAL(3, 2) (Default 0.0)
    *   `review_count`: INTEGER (Default 0)
    *   `is_featured`: BOOLEAN (Default false)
*   `created_at`: TIMESTAMP

## 4. `faqs` Table
High-value SEO content derived from "Common Questions" and "Popular FAQ" sections.

*   `id`: UUID (Primary Key)
*   `drug_id`: UUID (Foreign Key -> `drugs.id`, optional)
*   `generic_id`: UUID (Foreign Key -> `generics.id`, optional)
*   `question`: TEXT
*   `answer`: TEXT
*   `is_pharmacist_verified`: BOOLEAN (Default true)

## 5. `reviews` Table
*   `id`: UUID (Primary Key)
*   `drug_id`: UUID (Foreign Key -> `drugs.id`)
*   `user_id`: VARCHAR(255) (Clerk ID)
*   `user_name`: VARCHAR(255)
*   `rating`: INTEGER (1-5)
*   `comment`: TEXT
*   `is_pharmacist`: BOOLEAN (Verification badge)
*   `created_at`: TIMESTAMP

## 6. Gemini Proposal (Regulatory Status)
This table acts as the unified "Status Bar" component, consolidating regulatory data (DGDA approvals, status, etc.) for UI display, inspired by the Drugs.com "Drug Status" sidebar.

*   `id`: UUID (Primary Key)
*   `drug_id`: UUID (Foreign Key -> `drugs.id`)
*   **Regulatory Status Flags**:
    *   `prescription_status`: VARCHAR(50) (e.g., "Prescription only", "OTC")
    *   `csa_schedule`: VARCHAR(10) (e.g., "N/A", "Schedule I")
    *   `pregnancy_category`: VARCHAR(5) (e.g., "A", "B", "X")
*   **Regulatory Source**:
    *   `dgda_approval_id`: UUID (Foreign Key -> `dgda_approvals.id`)
*   **UI/Frontend Metadata**:
    *   `display_label`: VARCHAR(100) (User-facing status text)
    *   `status_icon`: VARCHAR(50) (Icon identifier)
*   `updated_at`: TIMESTAMP
