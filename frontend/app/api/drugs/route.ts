import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { drugsQuerySchema } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = drugsQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { drug_class: drugClass, letter, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  try {
    let countQuery = sql`SELECT COUNT(*)::int as total FROM brands b WHERE 1=1`;
    let dataQuery = sql`
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
        b.brand_verified as "brandVerified",
        b.price_verified as "priceVerified",
        b.generic_verified as "genericVerified",
        'brand' as type
      FROM brands b
      WHERE 1=1
    `;

    if (drugClass) {
      const filter = sql` AND b.therapeutic_class ILIKE ${'%' + drugClass + '%'}`;
      countQuery = sql`${countQuery}${filter}`;
      dataQuery = sql`${dataQuery}${filter}`;
    }

    if (letter) {
      if (letter === '0-9') {
        const filter = sql` AND b.brand_name ~ '^[0-9]'`;
        countQuery = sql`${countQuery}${filter}`;
        dataQuery = sql`${dataQuery}${filter}`;
      } else {
        const filter = sql` AND b.brand_name ILIKE ${letter + '%'}`;
        countQuery = sql`${countQuery}${filter}`;
        dataQuery = sql`${dataQuery}${filter}`;
      }
    }

    const countResult = await db.execute(countQuery);
    const total = Number(countResult.rows[0]?.total) || 0;

    dataQuery = sql`${dataQuery} ORDER BY 
      b.brand_verified DESC, b.price_verified DESC, b.generic_verified DESC, b.brand_name ASC 
      LIMIT ${limit} OFFSET ${offset}`;
    const result = await db.execute(dataQuery);

    return NextResponse.json({
      drugs: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Drugs list error:', error);
    return NextResponse.json({ error: 'Failed to fetch drugs' }, { status: 500 });
  }
}
