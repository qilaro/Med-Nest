import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { withCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const medicineType = searchParams.get('medicine_type') || '';

    const cacheKey = `dosage-forms:${medicineType}`;

    const data = await withCache(cacheKey, 300, async () => {
      let query = sql`
        SELECT 
          b.dosage_form as name,
          COUNT(*)::int as count
        FROM brands b
        WHERE b.dosage_form IS NOT NULL AND b.dosage_form != ''
      `;

      if (medicineType) {
        query = sql`${query}${sql` AND b.medicine_type ILIKE ${medicineType}`}`;
      }

      query = sql`${query}${sql` GROUP BY b.dosage_form ORDER BY count DESC`}`;

      const result = await db.execute(query);
      return result.rows;
    });

    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' } });
  } catch (error) {
    console.error('Dosage forms error:', error);
    return NextResponse.json({ error: 'Failed to fetch dosage forms' }, { status: 500 });
  }
}
