import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { withCache } from '@/lib/cache';

const ITEMS_PER_PAGE = 20;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheKey = `generics:${searchParams.toString()}`;

    const responseData = await withCache(cacheKey, 60, async () => {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const search = searchParams.get('search') || '';
    const typeFilter = searchParams.get('medicine_type') || '';
    const classFilter = searchParams.get('drug_class') || '';
    const ratingFilter = searchParams.get('rating') || '';
    const letterFilter = searchParams.get('letter') || '';

    const offset = (page - 1) * ITEMS_PER_PAGE;
    const hasFilter = !!(search || typeFilter || classFilter || ratingFilter || letterFilter);

    const data = await db.execute(sql`
      WITH bstats AS (
        SELECT generic_id,
          COUNT(*)::int as brand_count,
          ROUND(AVG(average_rating)::numeric, 1)::text as avg_rating,
          MIN(price_unit)::text as min_price,
          MAX(price_unit)::text as max_price
        FROM brands WHERE price_unit > 0 OR average_rating > 0
        GROUP BY generic_id
      )
      SELECT
        g.id::text, g.name, g.slug, g.therapeutic_class, g.medicine_type,
        COALESCE(bstats.brand_count, 0)::int as brand_count,
        bstats.avg_rating, bstats.min_price, bstats.max_price,
        (g.indications IS NOT NULL AND g.indications != '') as has_medical_info,
        COUNT(*) OVER() as total_count
      FROM generics g
      LEFT JOIN bstats ON bstats.generic_id = g.id
      WHERE 1=1
        AND (${search} = '' OR g.name ILIKE ${search + '%'})
        AND (${typeFilter} = '' OR g.medicine_type ILIKE ${typeFilter})
        AND (${classFilter} = '' OR g.therapeutic_class = ${classFilter})
        AND (${ratingFilter} = '' OR EXISTS (SELECT 1 FROM brands WHERE generic_id = g.id AND average_rating >= CAST(NULLIF(${ratingFilter}, '') AS numeric)))
        AND (${letterFilter} = '' OR g.name ILIKE ${letterFilter + '%'})
      ORDER BY ${hasFilter ? sql`g.name ASC` : sql`COALESCE(bstats.brand_count, 0) DESC, g.name ASC`}
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `);

    const rows = data.rows as any[];
    const total = Number(rows[0]?.total_count || 0);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const generics = rows.map(d => ({
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

    return {
      generics, total, page, totalPages,
    };
    });

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' }
    });
  } catch (error) {
    console.error('Error fetching generics:', error);
    return NextResponse.json({ error: 'Failed to fetch generics' }, { status: 500 });
  }
}
