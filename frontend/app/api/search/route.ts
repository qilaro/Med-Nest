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

  const q = parsed.data.q.trim();
  if (!q) return NextResponse.json({ results: [] });

  const threshold = q.length <= 3 ? 0.2 : 0.3; // Lower threshold for short queries

  try {
    // === BRANDS with weighted fuzzy ranking ===
    const brands = await db.execute(sql`
      WITH ranked AS (
        SELECT 
          b.brand_name as "brandName",
          b.generic_name as "genericName",
          b.dosage_form as "dosageForm",
          b.strength as strength,
          b.company_name as "companyName",
          b.medicine_type as "medicineType",
          MIN(b.slug) as slug,
          'brand' as type,
          CASE 
            WHEN LOWER(b.brand_name) = LOWER(${q}) THEN 100
            WHEN LOWER(b.brand_name) LIKE LOWER(${q + '%'}) THEN 80
            WHEN LOWER(b.brand_name) ILIKE ${'%' + q + '%'} THEN 60
            WHEN similarity(LOWER(b.brand_name), LOWER(${q})) > ${threshold} THEN 40
            WHEN LOWER(b.generic_name) LIKE LOWER(${q + '%'}) THEN 35
            WHEN LOWER(b.generic_name) ILIKE ${'%' + q + '%'} THEN 25
            WHEN similarity(LOWER(b.generic_name), LOWER(${q})) > ${threshold} THEN 15
            ELSE 0
          END as relevance
        FROM brands b
        WHERE 
          LOWER(b.brand_name) ILIKE ${'%' + q + '%'}
          OR LOWER(b.generic_name) ILIKE ${'%' + q + '%'}
          OR similarity(LOWER(b.brand_name), LOWER(${q})) > ${threshold}
          OR similarity(LOWER(b.generic_name), LOWER(${q})) > ${threshold}
      )
      SELECT "brandName", "genericName", "dosageForm", strength, "companyName", "medicineType", slug, type
      FROM ranked
      WHERE relevance > 0
      GROUP BY "brandName", "genericName", "dosageForm", strength, "companyName", "medicineType", slug, type, relevance
      ORDER BY relevance DESC, "brandName" ASC
      LIMIT 7
    `);

    // Also get company separately with a simple query
    let brandCompanies: Record<string, string> = {};
    const compRows = await db.execute(sql`
      SELECT brand_name, company_name FROM brands 
      WHERE LOWER(brand_name) ILIKE ${'%' + q + '%'} 
      GROUP BY brand_name, company_name
    `);
    for (const r of compRows.rows) {
      const rr = r as any;
      brandCompanies[(rr.brand_name || '').toLowerCase()] = rr.company_name;
    }

    // === SMART STRENGTH SEARCH: "Napa 500" → brand Napa + strength 500 ===
    const strengthMatch = q.match(/^(.*?)\s+(\d+(?:\.\d+)?)$/);
    let strengthBrands: any[] = [];
    if (strengthMatch) {
      const brandPart = strengthMatch[1];
      const numPart = strengthMatch[2];
      if (brandPart.length >= 2) {
        strengthBrands = (await db.execute(sql`
          SELECT 
            b.brand_name as "brandName",
            b.generic_name as "genericName",
            b.dosage_form as "dosageForm",
            b.strength as strength,
            b.company_name as "companyName",
            b.medicine_type as "medicineType",
            MIN(b.slug) as slug,
            'brand' as type
          FROM brands b
          WHERE (LOWER(b.brand_name) ILIKE ${'%' + brandPart + '%'} OR similarity(LOWER(b.brand_name), LOWER(${brandPart})) > ${threshold})
            AND b.strength ILIKE ${'%' + numPart + '%'}
          GROUP BY b.brand_name, b.generic_name, b.dosage_form, b.strength, b.company_name, b.medicine_type
          ORDER BY similarity(LOWER(b.brand_name), LOWER(${brandPart})) DESC
          LIMIT 5
        `)).rows;
      }
    }

    // === GENERICS ===
    const generics = await db.execute(sql`
      SELECT 
        g.name as "brandName",
        g.name as "genericName",
        '' as "dosageForm", '' as strength, '' as "companyName", '' as company,
        g.medicine_type as "medicineType",
        g.slug as slug, 'generic' as type
      FROM generics g
      WHERE LOWER(g.name) ILIKE ${'%' + q + '%'} OR similarity(LOWER(g.name), LOWER(${q})) > ${threshold * 0.8}
      ORDER BY 
        CASE WHEN LOWER(g.name) LIKE LOWER(${q + '%'}) THEN 3 ELSE 2 END,
        similarity(LOWER(g.name), LOWER(${q})) DESC
      LIMIT 3
    `);

    // === DRUG CLASSES ===
    const classes = await db.execute(sql`
      SELECT DISTINCT
        b.therapeutic_class as "brandName",
        b.therapeutic_class as "genericName",
        '' as "dosageForm", '' as strength, '' as "companyName", '' as company,
        b.medicine_type as "medicineType", '' as slug, 'class' as type
      FROM brands b
      WHERE b.therapeutic_class IS NOT NULL 
        AND (LOWER(b.therapeutic_class) ILIKE ${'%' + q + '%'} OR similarity(LOWER(b.therapeutic_class), LOWER(${q})) > ${threshold * 0.7})
      ORDER BY b.therapeutic_class
      LIMIT 3
    `);

    // === RECENT SEARCHES (when query is short or empty-ish) ===
    let recentSearches: any[] = [];
    if (q.length <= 3) {
      const recent = await db.execute(sql`
        SELECT query, COUNT(*) as cnt
        FROM search_log
        WHERE query ILIKE ${q + '%'}
        GROUP BY query ORDER BY cnt DESC LIMIT 5
      `);
      if (recent.rows.length > 1) {
        for (const row of recent.rows) {
          const r = row as any;
          if (r.query.toLowerCase() !== q.toLowerCase()) {
            recentSearches.push({
              brandName: r.query,
              genericName: '',
              dosageForm: '', strength: '', companyName: '', company: '',
              medicineType: null, slug: '', type: 'brand',
              _recent: true,
            });
          }
        }
      }
    }

    // === MERGE & DEDUPLICATE ===
    const seen = new Set<string>();
    const combined: any[] = [];
    const add = (items: any[]) => {
      for (const item of items) {
        const key = item.type + '|' + (item.slug || item.brandName).toLowerCase();
        if (!seen.has(key) && combined.length < 15) {
          seen.add(key);
          // Add company alias if missing
          if (item.type === 'brand' && !item.company) {
            item.company = brandCompanies[(item.brandName || '').toLowerCase()] || item.companyName || '';
          }
          combined.push(item);
        }
      }
    };
    add(strengthBrands);         // Strength-matched first (most precise)
    add(brands.rows);            // Fuzzy-matched brands
    add(generics.rows);          // Generics
    add(classes.rows);           // Classes
    add(recentSearches);         // Recent searches (if relevant)

    return NextResponse.json({ results: combined });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
