import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT 
        b.dosage_form as name,
        COUNT(*)::int as count
      FROM brands b
      WHERE b.dosage_form IS NOT NULL
      GROUP BY b.dosage_form
      ORDER BY count DESC
    `);

    return NextResponse.json(result.rows, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('Dosage forms error:', error);
    return NextResponse.json({ error: 'Failed to fetch dosage forms' }, { status: 500 });
  }
}
