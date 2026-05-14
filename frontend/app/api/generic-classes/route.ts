import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT therapeutic_class as name, COUNT(*)::int as count
      FROM generics
      WHERE therapeutic_class IS NOT NULL AND therapeutic_class != ''
      GROUP BY therapeutic_class
      ORDER BY therapeutic_class ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching generic classes:', error);
    return NextResponse.json([], { status: 500 });
  }
}
