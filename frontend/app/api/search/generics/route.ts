import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { genericSearchQuerySchema } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = genericSearchQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success || !parsed.data.q) {
    return NextResponse.json([]);
  }

  const query = parsed.data.q;

  try {
    const results = await db.execute(sql`
      SELECT g.name, g.slug, NULL::text as medicine_type, g.therapeutic_class,
        (SELECT COUNT(*) FROM brands WHERE generic_id = g.id)::int as brand_count
      FROM generics g
      WHERE g.name ILIKE ${query + '%'}
      ORDER BY brand_count DESC
      LIMIT 8
    `);

    return NextResponse.json(results.rows.map(r => ({
      name: String(r.name || ''),
      slug: String(r.slug || ''),
      brandCount: Number(r.brand_count) || 0,
      medicineType: r.medicine_type ? String(r.medicine_type) : null,
      therapeuticClass: r.therapeutic_class ? String(r.therapeutic_class) : null,
    }), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }));
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
