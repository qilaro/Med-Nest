import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { searchQuerySchema } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ results: [] });
  }

  const query = parsed.data.q;

  try {
    const results = await db.execute(sql`
      SELECT 
        b.brand_name as "brandName", 
        b.generic_name as "genericName", 
        b.dosage_form as "dosageForm",
        b.strength as strength,
        b.company_name as "companyName",
        b.company_name as "company",
        b.verification_status as "verificationStatus",
        MIN(b.slug) as slug,
        'brand' as type
      FROM brands b
      WHERE b.brand_name ILIKE ${'%' + query + '%'} OR b.generic_name ILIKE ${'%' + query + '%'}
      GROUP BY b.brand_name, b.generic_name, b.dosage_form, b.strength, b.company_name, b.verification_status
      ORDER BY 
        CASE b.verification_status 
          WHEN 'verified' THEN 1 
          WHEN 'verified_auto' THEN 2 
          ELSE 3 
        END,
        (CASE WHEN b.brand_name ILIKE ${query + '%'} THEN 1 ELSE 2 END),
        MIN(similarity(b.brand_name, ${query})) DESC
      LIMIT 10
    `);

    return NextResponse.json({ results: results.rows });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
