import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT 
        b.therapeutic_class as name,
        COUNT(*)::int as count
      FROM brands b
      WHERE b.therapeutic_class IS NOT NULL
      GROUP BY b.therapeutic_class
      ORDER BY b.therapeutic_class ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Drug classes error:', error);
    return NextResponse.json({ error: 'Failed to fetch drug classes' }, { status: 500 });
  }
}
