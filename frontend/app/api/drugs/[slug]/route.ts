import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const result = await db.execute(sql`
      SELECT 
        b.id::text as id,
        b.slug,
        b.brand_name as "brandName",
        b.generic_name as "genericName",
        b.dosage_form as "dosageForm",
        b.strength,
        b.therapeutic_class as "drugClass",
        b.company_name as "companyName",
        b.company_name as "company",
        b.price_unit as price,
        b.price_strip as "priceStrip",
        b.price_box as "priceBox",
        b.pack_size as "packSize",
        b.image_url as "imageUrl",
        b.pack_images as "packImages",
        b.average_rating::float as "averageRating",
        b.review_count as "reviewCount",
        b.dar_number as "darNumber",
        b.medicine_type as "medicineType",
        b.indications,
        'brand' as type,
        g.side_effects as "sideEffects",
        g.interactions,
        g.contraindications,
        g.dosage,
        g.precautions,
        g.pregnancy_lactation as "pregnancyLactation",
        g.storage_conditions as "storageConditions",
        g.overdose_effects as "overdoseEffects"
      FROM brands b
      LEFT JOIN generics g ON b.generic_id = g.id
      WHERE b.slug = ${slug}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Drug detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch drug' }, { status: 500 });
  }
}
