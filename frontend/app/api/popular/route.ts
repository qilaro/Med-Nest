import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Stable, schema-safe popular fallback for production.
    const fallback = await db.execute(sql`
      SELECT 
        b.brand_name as "brandName",
        b.generic_name as "genericName",
        b.dosage_form as "dosageForm",
        b.strength as strength,
        b.company_name as "companyName",
        b.company_name as "company",
        b.medicine_type as "medicineType",
        MIN(b.slug) as slug,
        'brand' as type
      FROM brands b
      WHERE b.medicine_type = 'Allopathic' AND b.price_unit IS NOT NULL
      GROUP BY b.brand_name, b.generic_name, b.dosage_form, b.strength, b.company_name, b.medicine_type
      ORDER BY SUM(b.review_count) DESC, b.brand_name ASC
      LIMIT 8
    `);
    return NextResponse.json(
      { results: fallback.rows },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
    );
  } catch (e) {
    console.error('Popular fetch error:', e);
    return NextResponse.json({ results: [] });
  }
}
