import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT 
        g.therapeutic_class as name,
        COUNT(DISTINCT g.id)::int as count
      FROM generics g
      WHERE g.therapeutic_class IS NOT NULL AND g.therapeutic_class != ''
      GROUP BY g.therapeutic_class
      ORDER BY g.therapeutic_class ASC
    `);

    return NextResponse.json(result.rows, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('Drug classes error:', error);
    return NextResponse.json({ error: 'Failed to fetch drug classes' }, { status: 500 });
  }
}
