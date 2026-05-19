import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  try {
    const result = await db.execute(sql`
      SELECT
        b.brand_name, b.slug, b.strength, b.dosage_form, b.company_name,
        b.price_unit, b.price_strip, b.price_box, b.average_rating, b.review_count,
        b.therapeutic_class, b.dar_number, b.medicine_type,
        g.name as generic_name,
        g.indications, g.side_effects, g.interactions, g.warnings,
        g.pregnancy_category, g.half_life, g.csa_schedule, g.alcohol_warning
      FROM brands b
      JOIN generics g ON g.id = b.generic_id
      WHERE b.slug = ${slug}
      LIMIT 1
    `);

    const row = result.rows[0] as any;
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      brandName: row.brand_name,
      slug: row.slug,
      strength: row.strength,
      dosageForm: row.dosage_form,
      company: row.company_name,
      unitPrice: row.price_unit ? parseFloat(String(row.price_unit).replace(/[^0-9.]/g, "")) : null,
      stripPrice: row.price_strip ? parseFloat(String(row.price_strip).replace(/[^0-9.]/g, "")) : null,
      boxPrice: row.price_box ? parseFloat(String(row.price_box).replace(/[^0-9.]/g, "")) : null,
      rating: row.average_rating ? parseFloat(row.average_rating) : null,
      reviewCount: row.review_count || 0,
      drugClass: row.therapeutic_class,
      darNumber: row.dar_number,
      medicineType: row.medicine_type,
      genericName: row.generic_name,
      indications: row.indications && row.indications !== "Information not available." ? row.indications : null,
      sideEffects: row.side_effects && row.side_effects !== "Information not available." ? row.side_effects : null,
      interactions: row.interactions && row.interactions !== "Information not available." ? row.interactions : null,
      warnings: row.warnings && row.warnings !== "Information not available." ? row.warnings : null,
      pregnancyCategory: row.pregnancy_category && row.pregnancy_category !== "Information not available." ? row.pregnancy_category : null,
      halfLife: row.half_life && row.half_life !== "Information not available." ? row.half_life : null,
      csaSchedule: row.csa_schedule && row.csa_schedule !== "Information not available." ? row.csa_schedule : null,
      alcoholWarning: row.alcohol_warning && row.alcohol_warning !== "Information not available." ? row.alcohol_warning : null,
    });
  } catch (e) {
    console.error("Compare API error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
