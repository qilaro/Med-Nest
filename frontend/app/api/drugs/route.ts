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

    // Fetch filter options in parallel with count
    const [countResult, classesRows, companiesRows, formsRows] = await Promise.all([
      db.execute(countQuery),
      db.execute(sql`SELECT DISTINCT therapeutic_class as name FROM brands WHERE therapeutic_class IS NOT NULL AND therapeutic_class != '' ORDER BY therapeutic_class`),
      db.execute(sql`SELECT DISTINCT company_name as name FROM brands WHERE company_name IS NOT NULL AND company_name != '' ORDER BY company_name`),
      db.execute(sql`SELECT DISTINCT dosage_form as name FROM brands WHERE dosage_form IS NOT NULL AND dosage_form != '' ORDER BY dosage_form`),
    ]);
    const total = Number(countResult.rows[0]?.total) || 0;

    // Add ordering, limit, offset and execute
    if (searchQuery) {
      const like = '%' + searchQuery + '%';
      const prefix = searchQuery + '%';
      dataQuery = sql`${dataQuery} ORDER BY 
        CASE
          WHEN LOWER(b.brand_name) = LOWER(${searchQuery}) THEN 0
          WHEN LOWER(b.brand_name) LIKE LOWER(${prefix}) THEN 1
          WHEN b.brand_name ILIKE ${like} THEN 2
          WHEN b.generic_name ILIKE ${like} THEN 3
          WHEN b.company_name ILIKE ${like} THEN 4
          ELSE 5
        END, b.brand_name ASC
        LIMIT ${limit} OFFSET ${offset}`;
    } else {
      dataQuery = sql`${dataQuery} ORDER BY 
        b.review_count DESC NULLS LAST, b.brand_name ASC 
        LIMIT ${limit} OFFSET ${offset}`;
    }
    const dataResult = await db.execute(dataQuery);
    const rows = dataResult.rows;

    return NextResponse.json({
      drugs: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      classes: classesRows.rows.map((r: any) => ({ name: r.name, count: 0 })),
      companies: companiesRows.rows.map((r: any) => r.name),
      dosageForms: formsRows.rows.map((r: any) => ({ name: r.name, count: 0 })),
    });
  } catch (error) {
    console.error('Drugs list error:', error);
    return NextResponse.json({ error: 'Failed to fetch drugs' }, { status: 500 });
  }
}
