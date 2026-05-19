import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function fallbackFromFile(slug: string): Promise<Record<string, unknown> | null> {
  // Prevent path traversal
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) return null;
  
  try {
    const fs = await import('fs');
    const path = await import('path');

    const dirs = [
      path.join(process.cwd(), 'public/data/drug_details'),
      path.join(process.cwd(), 'frontend/public/data/drug_details'),
      path.join(process.cwd(), '.next/server/public/data/drug_details'),
      path.join(process.cwd(), 'static/data/drug_details'),
    ];

    for (const dir of dirs) {
      const filePath = path.join(dir, `${slug}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    }
  } catch {}
  return null;
}

export interface AlternateBrandResult {
  slug: string;
  brandName: string;
  company: string | null;
  strength: string | null;
  dosageForm: string | null;
  averageRating: number;
  reviewCount: number;
}

export interface DrugDetailResult {
  id: string;
  slug: string;
  brandName: string;
  genericName: string;
  pronunciation: string | null;
  dosageForm: string;
  strength: string;
  drugClass: string | null;
  company: string | null;
  companyName: string | null;
  darNumber: string | null;
  price: string;
  priceStrip: string | null;
  priceBox: string | null;
  packSize: string | null;
  imageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  indications: string;
  sideEffects: string;
  interactions: string;
  dosage: string;
  contraindications: string;
  precautions: string;
  pregnancyLactation: string;
  storageConditions: string;
  overdoseEffects: string;
  warnings: string;
  whatIs: string;
  modeOfAction: string;
  pharmacology: string;
  alcoholWarning: string;
  monitoring: string;
  pregnancyCategory: string;
  halfLife: string;
  csaSchedule: string;
  commonQuestions: Array<{question: string; answer: string}>;
  patientTips: string[];
  type: string;
}

export async function getDrugDetail(slug: string): Promise<DrugDetailResult | null> {
  try {
    const result = await db.execute(sql`
      SELECT 
        b.id::text as id,
        b.slug,
        b.brand_name as brand_name,
        b.generic_name as generic_name,
        b.dosage_form as dosage_form,
        b.strength,
        b.therapeutic_class as therapeutic_class,
        b.company_name as company_name,
        b.dar_number as dar_number,
        g.pronunciation as pronunciation,
        b.price_unit,
        b.price_strip,
        b.price_box,
        b.pack_size as pack_size,
        b.image_url as image_url,
        b.average_rating,
        b.review_count,
        to_jsonb(g)->>'indications' as indications,
        to_jsonb(g)->>'side_effects' as side_effects,
        to_jsonb(g)->>'interactions' as interactions,
        to_jsonb(g)->>'contraindications' as contraindications,
        to_jsonb(g)->>'dosage' as dosage,
        to_jsonb(g)->>'precautions' as precautions,
        to_jsonb(g)->>'pregnancy_lactation' as pregnancy_lactation,
        to_jsonb(g)->>'storage_conditions' as storage_conditions,
        to_jsonb(g)->>'overdose_effects' as overdose_effects,
        to_jsonb(g)->>'warnings' as warnings,
        to_jsonb(g)->>'what_is' as what_is,
        to_jsonb(g)->>'mode_of_action' as mode_of_action,
        to_jsonb(g)->>'pharmacology' as pharmacology,
        to_jsonb(g)->>'alcohol_warning' as alcohol_warning,
        to_jsonb(g)->>'monitoring' as monitoring,
        to_jsonb(g)->>'pregnancy_category' as pregnancy_category,
        to_jsonb(g)->>'half_life' as half_life,
        to_jsonb(g)->>'csa_schedule' as csa_schedule,
        COALESCE(to_jsonb(g)->'common_questions', '[]'::jsonb) as common_questions,
        COALESCE(to_jsonb(g)->'patient_tips', '[]'::jsonb) as patient_tips
      FROM brands b
      LEFT JOIN generics g ON b.generic_id = g.id
      WHERE b.slug = ${slug}
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const d = result.rows[0] as Record<string, unknown>;
      return {
        id: String(d.id || ''),
        slug: String(d.slug || ''),
        brandName: String(d.brand_name || ''),
        genericName: String(d.generic_name || ''),
        dosageForm: String(d.dosage_form || ''),
        strength: String(d.strength || ''),
        drugClass: d.therapeutic_class ? String(d.therapeutic_class) : null,
        company: d.company_name ? String(d.company_name) : null,
        companyName: d.company_name ? String(d.company_name) : null,
        darNumber: d.dar_number ? String(d.dar_number) : null,
        pronunciation: d.pronunciation ? String(d.pronunciation) : null,
        price: d.price_unit ? `৳ ${d.price_unit}` : "N/A",
        priceStrip: d.price_strip ? String(d.price_strip) : null,
        priceBox: d.price_box ? String(d.price_box) : null,
        packSize: d.pack_size ? String(d.pack_size) : null,
        imageUrl: d.image_url ? String(d.image_url) : null,
        averageRating: Number(d.average_rating) || 0,
        reviewCount: Number(d.review_count) || 0,
        indications: String(d.indications || "Information not available."),
        sideEffects: String(d.side_effects || "Information not available."),
        interactions: String(d.interactions || "Information not available."),
        dosage: String(d.dosage || "As directed by physician."),
        contraindications: String(d.contraindications || "Information not available."),
        precautions: String(d.precautions || "Information not available."),
        pregnancyLactation: String(d.pregnancy_lactation || "Information not available."),
        storageConditions: String(d.storage_conditions || "Information not available."),
        overdoseEffects: String(d.overdose_effects || "Information not available."),
        warnings: String(d.warnings || "Information not available."),
        whatIs: String(d.what_is || "Information not available."),
        modeOfAction: String(d.mode_of_action || "Information not available."),
        pharmacology: String(d.pharmacology || "Information not available."),
        alcoholWarning: String(d.alcohol_warning || "Information not available."),
        monitoring: String(d.monitoring || "Information not available."),
        pregnancyCategory: String(d.pregnancy_category || "Information not available."),
        halfLife: String(d.half_life || "Information not available."),
        csaSchedule: String(d.csa_schedule || "Information not available."),
        commonQuestions: Array.isArray(d.common_questions) ? d.common_questions : [],
        patientTips: Array.isArray(d.patient_tips) ? d.patient_tips : [],
        type: 'brand',
      };
    }

    return await fallbackFromFile(slug) as unknown as DrugDetailResult | null;
  } catch (e) {
    console.error(`Error loading detail for ${slug}:`, e);
    return await fallbackFromFile(slug) as unknown as DrugDetailResult | null;
  }
}

export async function getAlternateBrands(genericName: string, currentSlug: string, dosageForm?: string, companyName?: string, excludeCompany?: string): Promise<AlternateBrandResult[]> {
  try {
    const conditions = [sql`b.generic_name = ${genericName}`, sql`b.slug != ${currentSlug}`];
    if (dosageForm) conditions.push(sql`b.dosage_form ILIKE ${dosageForm}`);

    let query;
    if (companyName) {
      // Alternate Versions: same company, same generic, same dosage form — different strengths
      conditions.push(sql`b.company_name ILIKE ${companyName}`);
      query = sql`
        SELECT b.slug, b.brand_name, b.company_name, b.strength, b.dosage_form, b.average_rating, b.review_count
        FROM brands b
        WHERE ${sql.join(conditions, sql` AND `)}
        ORDER BY b.strength ASC
        LIMIT 50
      `;
    } else {
      // Alternate Brands: different companies, same generic, same dosage form
      if (excludeCompany) conditions.push(sql`b.company_name NOT ILIKE ${excludeCompany}`);
      query = sql`
        SELECT b.slug, b.brand_name, b.company_name, b.strength, b.dosage_form, b.average_rating, b.review_count
        FROM brands b
        WHERE ${sql.join(conditions, sql` AND `)}
        ORDER BY b.average_rating DESC NULLS LAST
        LIMIT 50
      `;
    }

    const result = await db.execute(query);
    return (result.rows as any[]).map(d => ({
      slug: String(d.slug || ''),
      brandName: String(d.brand_name || ''),
      company: d.company_name ? String(d.company_name) : null,
      strength: d.strength ? String(d.strength) : null,
      dosageForm: d.dosage_form ? String(d.dosage_form) : null,
      averageRating: Number(d.average_rating) || 0,
      reviewCount: Number(d.review_count) || 0,
    }));
  } catch (e) {
    console.error(`Error loading alternate brands for ${genericName}:`, e);
    return [];
  }
}
