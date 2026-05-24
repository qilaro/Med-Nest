import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.execute(sql`
      SELECT question, gemini_answer, drug_context, user_language, created_at
      FROM ai_training_data
      ORDER BY created_at ASC
    `);

    let csv = "id,question,gemini_answer,drug_context,user_language,created_at\n";
    (rows.rows as any[]).forEach((r, i) => {
      const q = (r.question || "").replace(/"/g, '""');
      const a = (r.gemini_answer || "").replace(/"/g, '""');
      const c = (r.drug_context || "").replace(/"/g, '""');
      csv += `${i + 1},"${q}","${a}","${c}",${r.user_language || "en"},${r.created_at || ""}\n`;
    });

    // Clear the table after export
    await db.execute(sql`DELETE FROM ai_training_data`);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ai_training_data_${Date.now()}.csv"`,
      },
    });
  } catch (e) {
    console.error("Export CSV error:", e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
