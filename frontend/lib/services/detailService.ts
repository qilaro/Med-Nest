import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export async function getDrugDetail(slug: string) {
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
      const d = result.rows[0];
      return {
        id: d.id,
        slug: d.slug,
        brandName: d.brand_name,
        genericName: d.generic_name,
        dosageForm: d.dosage_form,
        strength: d.strength,
        drugClass: d.therapeutic_class,
        company: d.company_name,
        companyName: d.company_name,
        price: d.price_unit ? `৳ ${d.price_unit}` : "N/A",
        priceStrip: d.price_strip,
        priceBox: d.price_box,
        packSize: d.pack_size,
        imageUrl: d.image_url,
        averageRating: Number(d.average_rating) || 0,
        reviewCount: d.review_count || 0,
        indications: d.indications || "Information not available.",
        sideEffects: d.side_effects || "Information not available.",
        interactions: d.interactions || "Information not available.",
        dosage: d.dosage || "As directed by physician.",
        contraindications: d.contraindications || "Information not available.",
        precautions: d.precautions || "Information not available.",
        pregnancyLactation: d.pregnancy_lactation || "Information not available.",
        storageConditions: d.storage_conditions || "Information not available.",
        overdoseEffects: d.overdose_effects || "Information not available.",
        type: 'brand',
      };
    }

    // Fallback to local files
    const possibleDirs = [
      path.join(process.cwd(), 'public/data/drug_details'),
      path.join(process.cwd(), 'frontend/public/data/drug_details'),
      path.join(process.cwd(), '.next/server/public/data/drug_details'),
      path.join(process.cwd(), 'static/data/drug_details')
    ];

    let DATA_DIR = '';
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        DATA_DIR = dir;
        break;
      }
    }

    if (DATA_DIR) {
      const filePath = path.join(DATA_DIR, `${slug}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    }

    return null;
  } catch (e) {
    console.error(`Error loading detail for ${slug}:`, e);

    // Fallback to local files on error
    try {
      const possibleDirs = [
        path.join(process.cwd(), 'public/data/drug_details'),
        path.join(process.cwd(), 'frontend/public/data/drug_details'),
      ];

      for (const dir of possibleDirs) {
        const filePath = path.join(dir, `${slug}.json`);
        if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
      }
    } catch {}

    return null;
  }
}
