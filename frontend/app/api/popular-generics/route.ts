import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT g.name, g.slug, NULL::text as medicine_type,
        (SELECT COUNT(*) FROM brands WHERE generic_id = g.id)::int as brand_count
      FROM generics g
      ORDER BY brand_count DESC
      LIMIT 5
    `);
    const rows = result.rows.map((r: any) => ({
      name: String(r.name || ''),
      slug: String(r.slug || ''),
      brandCount: Number(r.brand_count) || 0,
      medicineType: r.medicine_type ? String(r.medicine_type) : null,
    }));
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching popular generics:', error);
    return NextResponse.json([]);
  }
}
