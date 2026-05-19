import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("drug");
  if (!slug) return NextResponse.json({ interactions: null });

  try {
    const result = await db.execute(sql`
      SELECT g.interactions, g.name, g.alcohol_warning
      FROM generics g
      JOIN brands b ON b.generic_id = g.id
      WHERE b.slug = ${slug}
      LIMIT 1
    `);

    const row = result.rows[0] as any;
    if (!row) return NextResponse.json({ interactions: null });

    let text = "";
    if (row.interactions && row.interactions !== "Information not available.") {
      text += row.interactions;
    }
    if (row.alcohol_warning && row.alcohol_warning !== "Information not available.") {
      text += (text ? "\n\n" : "") + `Alcohol Warning: ${row.alcohol_warning}`;
    }

    return NextResponse.json({ interactions: text || null, name: row.name });
  } catch {
    return NextResponse.json({ interactions: null });
  }
}
