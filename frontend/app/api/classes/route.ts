import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { withCache } from '@/lib/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30') || 30));
  const offset = (page - 1) * limit;
  const searchQuery = searchParams.get('search') || '';
  const drugClass = searchParams.get('drug_class') || '';
  const medicineType = searchParams.get('medicine_type') || '';
  const letter = searchParams.get('letter') || '';

  try {
    const cacheKey = `classes:${searchParams.toString()}`;

    const responseData = await withCache(cacheKey, 300, async () => {
      let query = sql`
        SELECT 
          b.therapeutic_class as name,
          COUNT(*)::int as brand_count,
          COUNT(DISTINCT b.generic_name)::int as generic_count,
          ROUND(AVG(b.average_rating)::numeric, 1)::float as avg_rating,
          COUNT(*) OVER() as total_count
        FROM brands b
        WHERE b.therapeutic_class IS NOT NULL AND b.therapeutic_class != ''
      `;

      if (searchQuery) {
        const like = '%' + searchQuery + '%';
        query = sql`${query}${sql` AND b.therapeutic_class ILIKE ${like}`}`;
      }
      if (drugClass) {
        query = sql`${query}${sql` AND b.therapeutic_class ILIKE ${drugClass}`}`;
      }
      if (medicineType) {
        query = sql`${query}${sql` AND b.medicine_type ILIKE ${medicineType}`}`;
      }
      if (letter) {
        if (letter === '0-9') {
          query = sql`${query}${sql` AND b.therapeutic_class ~ '^[0-9]'`}`;
        } else {
          query = sql`${query}${sql` AND b.therapeutic_class ILIKE ${letter + '%'}`}`;
        }
      }

      query = sql`${query}${sql`
        GROUP BY b.therapeutic_class
        ORDER BY brand_count DESC
        LIMIT ${limit} OFFSET ${offset}
      `}`;

      const dataResult = await db.execute(query);
      const rows = dataResult.rows;
      const total = Number(rows[0]?.total_count) || 0;

      return {
        classes: rows.map((r: any) => ({
          name: r.name,
          brandCount: Number(r.brand_count) || 0,
          genericCount: Number(r.generic_count) || 0,
          avgRating: Number(r.avg_rating) || 0,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' }
    });
  } catch (error) {
    console.error('Classes list error:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
