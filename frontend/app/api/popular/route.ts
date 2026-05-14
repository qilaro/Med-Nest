import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Top 8 most searched queries from last 7 days
    const popularQueries = await db.execute(sql`
      SELECT query, COUNT(*) as cnt
      FROM search_log
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY query
      ORDER BY cnt DESC
      LIMIT 8
    `);

    if (popularQueries.rows.length > 0) {
      // Match each popular query to a brand
      const results: any[] = [];
      for (const row of popularQueries.rows) {
        const q = (row as any).query;
        const brand = await db.execute(sql`
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
          WHERE LOWER(b.brand_name) ILIKE ${'%' + q + '%'}
          GROUP BY b.brand_name, b.generic_name, b.dosage_form, b.strength, b.company_name, b.medicine_type
          ORDER BY
            CASE
              WHEN LOWER(b.brand_name) = LOWER(${q}) THEN 0
              WHEN LOWER(b.brand_name) LIKE LOWER(${q + '%'}) THEN 1
              ELSE 2
            END,
            b.brand_name ASC
          LIMIT 1
        `);
        if (brand.rows.length > 0) {
          results.push(brand.rows[0]);
        }
      }
      if (results.length >= 3) return NextResponse.json({ results: results.slice(0, 8) });
    }

    // Fallback: top 8 most common brands (by review count or verified)
    const fallback = await db.execute(sql`
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
      WHERE b.medicine_type = 'Allopathic' AND b.price_unit IS NOT NULL
      GROUP BY b.brand_name, b.generic_name, b.dosage_form, b.strength, b.company_name, b.medicine_type
      ORDER BY SUM(b.review_count) DESC, b.brand_name ASC
      LIMIT 8
    `);
    return NextResponse.json({ results: fallback.rows });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
