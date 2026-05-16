import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.execute(sql`
      SELECT 
        brand_name as "brandName",
        generic_name as "genericName",
        dosage_form as "dosageForm",
        strength,
        company_name as "companyName",
        company_name as "company",
        medicine_type as "medicineType",
        slug,
        'brand' as type
      FROM brands
      WHERE medicine_type = 'Allopathic'
        AND price_unit IS NOT NULL
        AND price_unit > 0
        AND brand_name IS NOT NULL
        AND slug IS NOT NULL
      ORDER BY price_unit DESC NULLS LAST, brand_name ASC
      LIMIT 8
    `);
    return NextResponse.json(
      { results: data.rows },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
    );
  } catch (e) {
    console.error('Popular fetch error:', e);
    return NextResponse.json({ results: [] });
  }
}
