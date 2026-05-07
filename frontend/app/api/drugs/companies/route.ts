import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT c.name
      FROM companies c
      ORDER BY c.name ASC
    `);

    const companies = result.rows.map((r: any) => r.name);
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Companies error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
