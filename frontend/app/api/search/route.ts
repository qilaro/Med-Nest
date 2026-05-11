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

  const query = parsed.data.q.trim();

  try {
    // Brands
    const brands = await db.execute(sql`
      SELECT 
        b.brand_name as "brandName", 
        b.generic_name as "genericName", 
        b.dosage_form as "dosageForm",
        b.strength as strength,
        b.company_name as "companyName",
        b.company_name as "company",
        b.medicine_type as "medicineType",
        MIN(b.slug) as slug,
        'brand' as type
      FROM brands b
      WHERE b.brand_name ILIKE ${'%' + query + '%'} OR b.generic_name ILIKE ${'%' + query + '%'}
      GROUP BY b.brand_name, b.generic_name, b.dosage_form, b.strength, b.company_name, b.medicine_type
      ORDER BY 
        (CASE WHEN b.brand_name ILIKE ${query + '%'} THEN 1 ELSE 2 END),
        MIN(similarity(b.brand_name, ${query})) DESC
      LIMIT 5
    `);

    // Smart strength search: "Napa 500" → brand "Napa" with strength "500"
    const strengthMatch = query.match(/^(.*?)\s+(\d+(?:\.\d+)?)$/);
    let strengthBrands: any[] = [];
    if (strengthMatch) {
      const brandPart = strengthMatch[1];
      const numPart = strengthMatch[2];
      strengthBrands = (await db.execute(sql`
        SELECT 
          b.brand_name as "brandName", 
          b.generic_name as "genericName", 
          b.dosage_form as "dosageForm",
          b.strength as strength,
          b.company_name as "companyName",
          b.company_name as "company",
          b.medicine_type as "medicineType",
          MIN(b.slug) as slug,
          'brand' as type
        FROM brands b
        WHERE (b.brand_name ILIKE ${brandPart + '%'} OR b.generic_name ILIKE ${brandPart + '%'})
          AND b.strength ILIKE ${'%' + numPart + '%'}
        GROUP BY b.brand_name, b.generic_name, b.dosage_form, b.strength, b.company_name, b.medicine_type
        ORDER BY MIN(similarity(b.brand_name, ${brandPart})) DESC
        LIMIT 5
      `)).rows;
    }

    // Generics
    const generics = await db.execute(sql`
      SELECT 
        g.name as "brandName", 
        g.name as "genericName",
        '' as "dosageForm",
        '' as strength,
        '' as "companyName",
        '' as company,
        g.medicine_type as "medicineType",
        g.slug as slug,
        'generic' as type
      FROM generics g
      WHERE g.name ILIKE ${'%' + query + '%'}
      ORDER BY similarity(g.name, ${query}) DESC
      LIMIT 3
    `);

    // Drug Classes
    const classes = await db.execute(sql`
      SELECT DISTINCT
        b.therapeutic_class as "brandName",
        b.therapeutic_class as "genericName",
        '' as "dosageForm",
        '' as strength,
        '' as "companyName",
        '' as company,
        b.medicine_type as "medicineType",
        '' as slug,
        'class' as type
      FROM brands b
      WHERE b.therapeutic_class IS NOT NULL AND b.therapeutic_class ILIKE ${'%' + query + '%'}
      ORDER BY b.therapeutic_class
      LIMIT 3
    `);

    // Combine: brands first, then strength-matched, then generics, then classes
    const results = [...brands.rows, ...strengthBrands, ...generics.rows, ...classes.rows];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
