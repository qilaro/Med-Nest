import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function fallbackFromFile(slug: string): Promise<Record<string, unknown> | null> {
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

export interface DrugDetailResult {
  id: string;
  slug: string;
  brandName: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  drugClass: string | null;
  company: string | null;
  companyName: string | null;
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
        b.price_unit,
        b.price_strip,
        b.price_box,
        b.pack_size as pack_size,
        b.image_url as image_url,
        b.average_rating,
        b.review_count,
        b.indications,
        g.side_effects,
        g.interactions,
        g.contraindications,
        g.dosage,
        g.precautions,
        g.pregnancy_lactation,
        g.storage_conditions,
        g.overdose_effects
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
        type: 'brand',
      };
    }

    return await fallbackFromFile(slug) as unknown as DrugDetailResult | null;
  } catch (e) {
    console.error(`Error loading detail for ${slug}:`, e);
    return await fallbackFromFile(slug) as unknown as DrugDetailResult | null;
  }
}
