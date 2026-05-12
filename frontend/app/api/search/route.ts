import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { searchQuerySchema } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return NextResponse.json({ results: [] });

  const q = parsed.data.q.trim();
  if (!q) return NextResponse.json({ results: [] });

  const isShort = q.length < 3;

  try {
    // Single combined query for brands + generics + classes
    const results = await db.execute(sql`
      WITH brand_matches AS (
        SELECT 
          b.brand_name as "brandName",
          b.generic_name as "genericName",
          b.dosage_form as "dosageForm",
          b.strength as strength,
          b.company_name as "companyName",
          b.company_name as "company",
          b.medicine_type as "medicineType",
          b.slug as slug,
          'brand' as type,
          CASE 
            WHEN LOWER(b.brand_name) = LOWER(${q}) THEN 10
            WHEN LOWER(b.brand_name) LIKE LOWER(${q + '%'}) THEN 8
            WHEN LOWER(b.brand_name) ILIKE ${'%' + q + '%'} THEN 5
            WHEN LOWER(b.generic_name) LIKE LOWER(${q + '%'}) THEN 4
            WHEN LOWER(b.generic_name) ILIKE ${'%' + q + '%'} THEN 2
            WHEN LOWER(b.company_name) ILIKE ${'%' + q + '%'} THEN 3
            ELSE 0
          END as rank
        FROM brands b
        WHERE 
          ${isShort 
            ? sql`LOWER(b.brand_name) ILIKE ${'%' + q + '%'} OR LOWER(b.generic_name) ILIKE ${'%' + q + '%'} OR LOWER(b.company_name) ILIKE ${'%' + q + '%'}`
            : sql`LOWER(b.brand_name) ILIKE ${'%' + q + '%'} OR LOWER(b.generic_name) ILIKE ${'%' + q + '%'} OR LOWER(b.company_name) ILIKE ${'%' + q + '%'}
               OR similarity(LOWER(b.brand_name), LOWER(${q})) > 0.4
               OR similarity(LOWER(b.generic_name), LOWER(${q})) > 0.3`
          }
      ),
      deduped AS (
        SELECT *, ROW_NUMBER() OVER (
          PARTITION BY LOWER("brandName"), LOWER(COALESCE("companyName",'')), LOWER(COALESCE(strength,'')), LOWER(COALESCE("dosageForm",''))
          ORDER BY rank DESC
        ) as rn
        FROM brand_matches
        WHERE rank > 0
      ),
      generics_matches AS (
        SELECT 
          g.name as "brandName", g.name as "genericName",
          '' as "dosageForm", '' as strength, '' as "companyName", '' as company,
          g.medicine_type as "medicineType", g.slug as slug, 'generic' as type,
          CASE WHEN LOWER(g.name) LIKE LOWER(${q + '%'}) THEN 3 ELSE 1 END as rank
        FROM generics g
        WHERE ${isShort 
          ? sql`LOWER(g.name) ILIKE ${'%' + q + '%'}`
          : sql`LOWER(g.name) ILIKE ${'%' + q + '%'} OR similarity(LOWER(g.name), LOWER(${q})) > 0.3`
        }
      )
      SELECT * FROM (
        SELECT "brandName", "genericName", "dosageForm", strength, "companyName", "company", "medicineType", slug, type
        FROM deduped WHERE rn = 1
        ORDER BY rank DESC, "brandName" ASC
        LIMIT 8
      ) brands
      UNION ALL
      SELECT * FROM (
        SELECT "brandName", "genericName", "dosageForm", strength, "companyName", "company", "medicineType", slug, type
        FROM generics_matches
        ORDER BY rank DESC, "brandName" ASC
        LIMIT 2
      ) generics
      LIMIT 10
    `);

    return NextResponse.json(
      { results: results.rows },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10' } }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
