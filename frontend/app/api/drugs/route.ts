import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { drugsQuerySchema } from '@/lib/validators';
import { withCache } from '@/lib/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = drugsQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });

  const { drug_class: drugClass, medicine_type: medicineType, letter, search: searchQuery, company, generic, dosage_form: dosageForm, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  try {
    const cacheKey = `drugs:${searchParams.toString()}`;

    const responseData = await withCache(cacheKey, 300, async () => {
      let query = sql`
        SELECT 
          b.id::text as id, b.slug, b.brand_name as "brandName", b.generic_name as "genericName",
          b.dosage_form as "dosageForm", b.strength, b.therapeutic_class as "drugClass",
          b.company_name as "companyName", b.company_name as "company", b.price_unit as price,
          b.image_url as "imageUrl", b.average_rating::float as "averageRating",
          b.review_count as "reviewCount", b.medicine_type as "medicineType",
          false as "brandVerified", false as "priceVerified", false as "genericVerified",
          'brand' as type, COUNT(*) OVER() as total_count
        FROM brands b WHERE 1=1
      `;

      if (drugClass) query = sql`${query}${sql` AND b.therapeutic_class ILIKE ${drugClass}`}`;
      if (medicineType) query = sql`${query}${sql` AND b.medicine_type ILIKE ${medicineType}`}`;
      if (letter === '0-9') query = sql`${query}${sql` AND b.brand_name ~ '^[0-9]'`}`;
      else if (letter) query = sql`${query}${sql` AND b.brand_name ILIKE ${letter + '%'}`}`;
      if (searchQuery) {
        const like = '%' + searchQuery + '%';
        query = sql`${query}${sql` AND (b.brand_name ILIKE ${like} OR b.generic_name ILIKE ${like} OR b.company_name ILIKE ${like})`}`;
      }
      if (company) query = sql`${query}${sql` AND b.company_name ILIKE ${company}`}`;
      if (generic) query = sql`${query}${sql` AND b.generic_name ILIKE ${generic}`}`;
      if (dosageForm) query = sql`${query}${sql` AND b.dosage_form ILIKE ${dosageForm}`}`;

      if (searchQuery) {
        const like = '%' + searchQuery + '%', prefix = searchQuery + '%';
        query = sql`${query} ORDER BY 
          CASE WHEN LOWER(b.brand_name) = LOWER(${searchQuery}) THEN 0 WHEN LOWER(b.brand_name) LIKE LOWER(${prefix}) THEN 1 WHEN b.brand_name ILIKE ${like} THEN 2 WHEN b.generic_name ILIKE ${like} THEN 3 WHEN b.company_name ILIKE ${like} THEN 4 ELSE 5 END,
          b.brand_name ASC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        query = sql`${query} ORDER BY b.brand_name ASC LIMIT ${limit} OFFSET ${offset}`;
      }

      const dataResult = await db.execute(query);
      const rows = dataResult.rows;
      const total = Number(rows[0]?.total_count) || 0;

      return {
        drugs: rows, total, page, limit, totalPages: Math.ceil(total / limit),
      };
    });

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' }
    });
  } catch (error) {
    console.error('Drugs list error:', error);
    return NextResponse.json({ error: 'Failed to fetch drugs' }, { status: 500 });
  }
}
