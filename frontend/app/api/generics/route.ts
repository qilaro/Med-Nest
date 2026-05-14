import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const ITEMS_PER_PAGE = 20;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const search = searchParams.get('search') || '';
    const typeFilter = searchParams.get('medicine_type') || '';
    const classFilter = searchParams.get('drug_class') || '';
    const formFilter = searchParams.get('dosage_form') || '';
    const ratingFilter = searchParams.get('rating') || '';
    const letterFilter = searchParams.get('letter') || '';

    const offset = (page - 1) * ITEMS_PER_PAGE;
    const hasFilter = !!(search || typeFilter || classFilter || formFilter || ratingFilter || letterFilter);

    const data = await db.execute(sql`
      SELECT
        g.id::text,
        g.name,
        g.slug,
        g.therapeutic_class,
        NULL::text as medicine_type,
        (SELECT COUNT(*) FROM brands WHERE generic_id = g.id)::int as brand_count,
        (SELECT ROUND(AVG(average_rating)::numeric, 1) FROM brands WHERE generic_id = g.id AND average_rating > 0)::text as avg_rating,
        (SELECT MIN(price_unit) FROM brands WHERE generic_id = g.id AND price_unit > 0)::text as min_price,
        (SELECT MAX(price_unit) FROM brands WHERE generic_id = g.id AND price_unit > 0)::text as max_price,
        (g.indications IS NOT NULL AND g.indications != '') as has_medical_info
      FROM generics g
      WHERE 1=1
        AND (${search} = '' OR g.name ILIKE ${search + '%'})
        AND (${typeFilter} = '' OR EXISTS (SELECT 1 FROM brands WHERE generic_id = g.id AND medicine_type ILIKE ${'%' + typeFilter + '%'}))
        AND (${classFilter} = '' OR g.therapeutic_class = ${classFilter})
        AND (${formFilter} = '' OR EXISTS (SELECT 1 FROM brands WHERE generic_id = g.id AND dosage_form = ${formFilter}))
        AND (${ratingFilter} = '' OR EXISTS (SELECT 1 FROM brands WHERE generic_id = g.id AND average_rating >= CAST(NULLIF(${ratingFilter}, '') AS numeric)))
        AND (${letterFilter} = '' OR g.name ILIKE ${letterFilter + '%'})
      ORDER BY ${hasFilter ? sql`g.name ASC` : sql`brand_count DESC, g.name ASC`}
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset}
    `);

    const totalResult = await db.execute(sql`
      SELECT COUNT(*)::int as total
      FROM generics g
      WHERE 1=1
        AND (${search} = '' OR g.name ILIKE ${search + '%'})
        AND (${typeFilter} = '' OR EXISTS (SELECT 1 FROM brands WHERE generic_id = g.id AND medicine_type ILIKE ${'%' + typeFilter + '%'}))
        AND (${classFilter} = '' OR g.therapeutic_class = ${classFilter})
        AND (${formFilter} = '' OR EXISTS (SELECT 1 FROM brands WHERE generic_id = g.id AND dosage_form = ${formFilter}))
        AND (${ratingFilter} = '' OR EXISTS (SELECT 1 FROM brands WHERE generic_id = g.id AND average_rating >= CAST(NULLIF(${ratingFilter}, '') AS numeric)))
        AND (${letterFilter} = '' OR g.name ILIKE ${letterFilter + '%'})
    `);

    const total = Number(totalResult.rows[0]?.total || 0);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const generics = (data.rows as any[]).map(d => ({
      id: String(d.id || ''),
      name: String(d.name || ''),
      slug: String(d.slug || ''),
      therapeuticClass: d.therapeutic_class ? String(d.therapeutic_class) : null,
      brandCount: Number(d.brand_count) || 0,
      avgRating: d.avg_rating ? Number(d.avg_rating) : 0,
      minPrice: d.min_price ? Number(d.min_price) : null,
      maxPrice: d.max_price ? Number(d.max_price) : null,
      hasMedicalInfo: !!d.has_medical_info,
      medicineType: d.medicine_type ? String(d.medicine_type) : null,
    }));

    return NextResponse.json({
      generics,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching generics:', error);
    return NextResponse.json({ error: 'Failed to fetch generics' }, { status: 500 });
  }
}
