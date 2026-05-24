import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { searchQuerySchema } from '@/lib/validators';

const DOSAGE_KEYWORDS = ['tablet','capsule','injection','syrup','suspension','cream','ointment','drop','drops','spray','inhaler','sachet','infusion','gel','lotion','shampoo','solution','suppository','powder'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return NextResponse.json({ results: [] });

  const q = parsed.data.q.trim();
  if (!q) return NextResponse.json({ results: [] });

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const firstWord = words[0];
  const matchedForm = words.find(w => DOSAGE_KEYWORDS.includes(w));
  const strengthMatch = q.match(/(\d+\.?\d*)\s*(mg|mcg|g|ml|%|iu)/i);
  const strengthStr = strengthMatch ? strengthMatch[0].toLowerCase() : null;
  const numericWords = words.filter(w => /^\d+\.?\d*$/.test(w));

  // Per-word ILIKE conditions
  const brandConds = words.map(w => sql`b.brand_name ILIKE ${'%' + w + '%'}`);
  const genericConds = words.map(w => sql`b.generic_name ILIKE ${'%' + w + '%'}`);
  const companyConds = words.map(w => sql`b.company_name ILIKE ${'%' + w + '%'}`);

  const anyMatch = sql`(${sql.join([...brandConds, ...genericConds, ...companyConds], sql` OR `)})`;
  const formFilter = matchedForm ? sql` AND LOWER(b.dosage_form) ILIKE ${'%' + matchedForm + '%'}` : sql``;

  // Score: brand name hits (weighted), generic hits, rating, strength boost
  const firstInBrand = sql`CASE WHEN LOWER(b.brand_name) ILIKE ${'%' + firstWord + '%'} THEN 50 ELSE 0 END`;
  const otherBrandHits = sql`(${sql.join(words.slice(1).map(w => sql`CASE WHEN LOWER(b.brand_name) ILIKE ${'%' + w + '%'} THEN 10 ELSE 0 END`), sql` + `)})`;
  const otherBrandScore = words.length > 1 ? sql` + ${otherBrandHits}` : sql``;
  const genericHits = sql`(${sql.join(words.map(w => sql`CASE WHEN LOWER(b.generic_name) ILIKE ${'%' + w + '%'} THEN 5 ELSE 0 END`), sql` + `)})`;
  const exactBoost = sql`CASE WHEN LOWER(b.brand_name) = LOWER(${q}) OR LOWER(b.brand_name) = LOWER(${firstWord}) THEN 100 ELSE 0 END`;

  // Strength boost: if numeric word matches the strength field
  const strengthBoosts = numericWords.map(w => sql`CASE WHEN LOWER(COALESCE(b.strength,'')) ~ ${'\\m' + w + '\\M'} THEN 30 ELSE 0 END`);
  const strengthScore = strengthBoosts.length > 0 ? sql` + ${sql.join(strengthBoosts, sql` + `)}` : sql``;

  try {
    const results = await db.execute(sql`
      WITH brand_matches AS (
        SELECT 
          b.brand_name as "brandName",
          b.generic_name as "genericName",
          b.dosage_form as "dosageForm",
          b.strength,
          b.company_name as "companyName",
          b.company_name as "company",
          b.medicine_type as "medicineType",
          b.slug,
          b.average_rating,
          'brand' as type,
          ${exactBoost} + ${firstInBrand} ${otherBrandScore} + ${genericHits} ${strengthScore} + COALESCE(b.average_rating, 0) as score
        FROM brands b
        WHERE ${anyMatch} ${formFilter}
      ),
      deduped AS (
        SELECT *, ROW_NUMBER() OVER (
          PARTITION BY LOWER("brandName"), LOWER(COALESCE("companyName",'')), LOWER(COALESCE(strength,'')), LOWER("dosageForm")
          ORDER BY score DESC
        ) as rn
        FROM brand_matches
      ),
      generics_matches AS (
        SELECT 
          g.name as "brandName", g.name as "genericName",
          '' as "dosageForm", '' as strength, '' as "companyName", '' as company,
          NULL::text as "medicineType", g.slug, NULL::float8 as average_rating,
          'generic' as type,
          CASE WHEN LOWER(g.name) ILIKE ${'%' + firstWord + '%'} THEN 10 ELSE 0 END as score
        FROM generics g
        WHERE ${sql.join(words.map(w => sql`g.name ILIKE ${'%' + w + '%'}`), sql` OR `)}
      )
      SELECT * FROM (
        SELECT "brandName", "genericName", "dosageForm", strength, "companyName", "company", "medicineType", slug, type
        FROM deduped WHERE rn = 1
        ORDER BY score DESC, "brandName" ASC
        LIMIT 8
      ) brands
      UNION ALL
      SELECT * FROM (
        SELECT "brandName", "genericName", "dosageForm", strength, "companyName", "company", "medicineType", slug, type
        FROM generics_matches
        ORDER BY score DESC, "brandName" ASC
        LIMIT 2
      ) generics
      LIMIT 10
    `);
    const total = results.rows.length;

    return NextResponse.json(
      { results: results.rows, total },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10' } }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
