import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      WITH ranked AS (
        SELECT 
          id::text, slug, brand_name, generic_name, dosage_form, strength,
          therapeutic_class, company_name, price_unit, image_url, average_rating,
          review_count, medicine_type,
          LEFT(brand_name, 1) as letter,
          ROW_NUMBER() OVER (PARTITION BY LEFT(brand_name, 1) ORDER BY brand_name) as rn
        FROM brands
        WHERE brand_name ~ '^[A-Za-z]'
      )
      SELECT 
        id, slug, brand_name as "brandName", generic_name as "genericName",
        dosage_form as "dosageForm", strength, therapeutic_class as "drugClass",
        company_name as "companyName", company_name as "company",
        price_unit as price, image_url as "imageUrl",
        average_rating::float as "averageRating", review_count as "reviewCount",
        medicine_type as "medicineType", letter, 'brand' as type
      FROM ranked
      WHERE rn <= 10
      ORDER BY letter, brand_name
    `);

    // Group by letter
    const groupsMap = new Map<string, any[]>();
    for (const row of result.rows) {
      const r = row as any;
      if (!groupsMap.has(r.letter)) groupsMap.set(r.letter, []);
      groupsMap.get(r.letter)!.push(r);
    }

    const groups = Array.from(groupsMap.entries()).map(([letter, drugs]) => ({ letter, drugs }));

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Drugs AZ error:', error);
    return NextResponse.json({ error: 'Failed to fetch A-Z drugs' }, { status: 500 });
  }
}
