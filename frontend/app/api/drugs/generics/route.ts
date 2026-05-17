import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT generic_name as name FROM brands 
      WHERE generic_name IS NOT NULL AND generic_name != '' 
      ORDER BY generic_name ASC
    `);
    const names = result.rows.map((r: any) => r.name);
    return NextResponse.json(names, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' },
    });
  } catch (error) {
    return NextResponse.json([]);
  }
}
