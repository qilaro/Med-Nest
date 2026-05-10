import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const groups = [];

    for (const letter of letters) {
      const result = await db.execute(sql.raw(`
        SELECT 
          b.id::text as id,
          b.slug,
          b.brand_name as "brandName",
          b.generic_name as "genericName",
          b.dosage_form as "dosageForm",
          b.strength,
        b.therapeutic_class as "drugClass",
        b.company_name as "companyName",
        b.company_name as "company",
        b.price_unit as price,
          b.image_url as "imageUrl",
          b.average_rating::float as "averageRating",
          b.review_count as "reviewCount",
          'brand' as type
        FROM brands b
        WHERE b.brand_name ILIKE ${letter + '%'}
        ORDER BY b.brand_name ASC
        LIMIT 10
      `));

      if (result.rows.length > 0) {
        groups.push({ letter, drugs: result.rows });
      }
    }

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Drugs AZ error:', error);
    return NextResponse.json({ error: 'Failed to fetch A-Z drugs' }, { status: 500 });
  }
}
