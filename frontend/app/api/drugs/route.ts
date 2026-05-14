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

  const { drug_class: drugClass, medicine_type: medicineType, letter, search: searchQuery, company, generic, dosage_form: dosageForm, page, limit } = parsed.data;
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
        b.medicine_type as "medicineType",
        false as "brandVerified",
        false as "priceVerified",
        false as "genericVerified",
        'brand' as type
      FROM brands b
      WHERE 1=1
    `;

    if (drugClass) {
      const filter = sql` AND b.therapeutic_class ILIKE ${'%' + drugClass + '%'}`;
      countQuery = sql`${countQuery}${filter}`;
      dataQuery = sql`${dataQuery}${filter}`;
    }

    if (medicineType) {
      const filter = sql` AND b.medicine_type ILIKE ${'%' + medicineType + '%'}`;
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

    if (searchQuery) {
      const like = '%' + searchQuery + '%';
      const filter = sql` AND (b.brand_name ILIKE ${like} OR b.generic_name ILIKE ${like} OR b.company_name ILIKE ${like})`;
      countQuery = sql`${countQuery}${filter}`;
      dataQuery = sql`${dataQuery}${filter}`;
    }

    if (company) {
      const filter = sql` AND b.company_name ILIKE ${company}`;
      countQuery = sql`${countQuery}${filter}`;
      dataQuery = sql`${dataQuery}${filter}`;
    }

    if (generic) {
      const filter = sql` AND b.generic_name ILIKE ${generic}`;
      countQuery = sql`${countQuery}${filter}`;
      dataQuery = sql`${dataQuery}${filter}`;
    }

    if (dosageForm) {
      const filter = sql` AND b.dosage_form ILIKE ${dosageForm}`;
      countQuery = sql`${countQuery}${filter}`;
      dataQuery = sql`${dataQuery}${filter}`;
    }

    const countResult = await db.execute(countQuery);
    const total = Number(countResult.rows[0]?.total) || 0;

    if (searchQuery) {
      const like = '%' + searchQuery + '%';
      const prefix = searchQuery + '%';
      dataQuery = sql`SELECT * FROM (${dataQuery}) sub ORDER BY 
        CASE
          WHEN LOWER(sub."brandName") = LOWER(${searchQuery}) THEN 0
          WHEN LOWER(sub."brandName") LIKE LOWER(${prefix}) THEN 1
          WHEN sub."brandName" ILIKE ${like} THEN 2
          WHEN sub."genericName" ILIKE ${like} THEN 3
          WHEN sub."companyName" ILIKE ${like} THEN 4
          ELSE 5
        END, sub."brandName" ASC
        LIMIT ${limit} OFFSET ${offset}`;
    } else {
      dataQuery = sql`${dataQuery} ORDER BY 
        b.review_count DESC NULLS LAST, b.brand_name ASC 
        LIMIT ${limit} OFFSET ${offset}`;
    }
    const result = await db.execute(dataQuery);
    let rows = result.rows;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows.sort((a: any, b: any) => {
        const aName = (a.brandName || '').toLowerCase();
        const bName = (b.brandName || '').toLowerCase();
        const aGen = (a.genericName || '').toLowerCase();
        const bGen = (b.genericName || '').toLowerCase();
        const aCo = (a.company || '').toLowerCase();
        const bCo = (b.company || '').toLowerCase();

        const rankA = aName === q ? 0 : aName.startsWith(q) ? 1 : aName.includes(q) ? 2 : aGen.includes(q) ? 3 : aCo.includes(q) ? 4 : 5;
        const rankB = bName === q ? 0 : bName.startsWith(q) ? 1 : bName.includes(q) ? 2 : bGen.includes(q) ? 3 : bCo.includes(q) ? 4 : 5;
        if (rankA !== rankB) return rankA - rankB;
        return aName.localeCompare(bName);
      });
    }

    return NextResponse.json({
      drugs: rows,
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
