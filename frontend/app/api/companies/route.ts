import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { withCache } from '@/lib/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const medicineType = searchParams.get('medicine_type') || '';
  const searchQuery = searchParams.get('search') || '';
  const letter = searchParams.get('letter') || '';

  try {
    const cacheKey = `companies:${searchParams.toString()}`;

    const data = await withCache(cacheKey, 300, async () => {
      let query = sql`
        SELECT 
          b.company_name as name,
          COUNT(*)::int as brand_count
        FROM brands b
        WHERE b.company_name IS NOT NULL AND b.company_name != ''
      `;

      if (medicineType) {
        query = sql`${query}${sql` AND b.medicine_type ILIKE ${medicineType}`}`;
      }
      if (searchQuery) {
        const like = '%' + searchQuery + '%';
        query = sql`${query}${sql` AND b.company_name ILIKE ${like}`}`;
      }
      if (letter) {
        if (letter === '0-9') {
          query = sql`${query}${sql` AND b.company_name ~ '^[0-9]'`}`;
        } else {
          query = sql`${query}${sql` AND b.company_name ILIKE ${letter + '%'}`}`;
        }
      }

      query = sql`${query}${sql` GROUP BY b.company_name ORDER BY brand_count DESC`}`;

      const result = await db.execute(query);
      return result.rows;
    });

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' }
    });
  } catch (error) {
    console.error('Companies error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
