import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json([]);

  try {
    const results = await db.execute(sql`
      SELECT 
        b.company_name as name,
        COUNT(*)::int as brand_count,
        MIN(b.medicine_type) as medicine_type
      FROM brands b
      WHERE b.company_name ILIKE ${q + '%'}
      GROUP BY b.company_name
      ORDER BY brand_count DESC
      LIMIT 8
    `);

    return NextResponse.json(results.rows.map(r => ({
      name: String(r.name || ''),
      brandCount: Number(r.brand_count) || 0,
      medicineType: r.medicine_type ? String(r.medicine_type) : null,
    })));
  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
