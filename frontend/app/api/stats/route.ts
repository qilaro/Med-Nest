import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const [drugs, generics, classes, companies] = await Promise.all([
      db.execute(sql`SELECT COUNT(*)::int as count FROM brands WHERE price_unit IS NOT NULL`),
      db.execute(sql`SELECT COUNT(*)::int as count FROM generics WHERE indications IS NOT NULL AND indications != ''`),
      db.execute(sql`SELECT COUNT(DISTINCT therapeutic_class)::int as count FROM generics WHERE therapeutic_class IS NOT NULL AND therapeutic_class != ''`),
      db.execute(sql`SELECT COUNT(*)::int as count FROM companies`),
    ]);

    return NextResponse.json({
      drugs: drugs.rows[0].count,
      generics: generics.rows[0].count,
      classes: classes.rows[0].count,
      companies: companies.rows[0].count,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json({ drugs: 0, generics: 0, classes: 0, companies: 0 }, { status: 500 });
  }
}
