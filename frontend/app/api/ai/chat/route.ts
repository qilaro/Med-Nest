import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { generateEmbedding, chatWithContext } from "@/lib/services/gemini";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const trimmed = message.trim().slice(0, 500);

    // 1. Embed the user's question
    let queryVector: number[];
    try {
      queryVector = await generateEmbedding(trimmed);
    } catch {
      // Fallback: keyword search if embedding fails
      const fallback = await db.execute(sql`
        SELECT name, slug, therapeutic_class, indications, side_effects, warnings,
               dosage, interactions, half_life, pregnancy_category
        FROM generics
        WHERE name ILIKE ${"%" + trimmed.split(" ").slice(0, 3).join("%") + "%"}
           OR indications ILIKE ${"%" + trimmed.split(" ").slice(0, 3).join("%") + "%"}
        LIMIT 3
      `);

      const drugs = fallback.rows as any[];
      if (drugs.length === 0) {
        return NextResponse.json({
          answer: "I couldn't find information about that in our database.",
          sources: [],
        });
      }

      const context = drugs.map((d: any) =>
        `Name: ${d.name}\nClass: ${d.therapeutic_class || "N/A"}\nUses: ${d.indications || "N/A"}\nSide Effects: ${d.side_effects || "N/A"}\nDosage: ${d.dosage || "N/A"}\nWarnings: ${d.warnings || "N/A"}`
      ).join("\n---\n");

      const answer = await chatWithContext(trimmed, context, drugs);
      await db.execute(sql`
        INSERT INTO ai_training_data (question, gemini_answer, drug_context, user_language)
        VALUES (${trimmed}, ${answer}, ${context}, 'en')
      `);

      return NextResponse.json({
        answer,
        sources: drugs.map((d: any) => ({ name: d.name, slug: d.slug })),
      });
    }

    const vectorStr = `[${queryVector.join(",")}]`;

    // 2. Search generics by vector similarity
    const results = await db.execute(sql`
      SELECT name, slug, therapeutic_class, indications, side_effects, warnings,
             dosage, interactions, half_life, pregnancy_category,
             (embedding <=> ${vectorStr}::vector) AS distance
      FROM generics
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT 3
    `);

    const drugs = results.rows as any[];

    if (drugs.length === 0 || (drugs[0] as any).distance > 0.7) {
      // No close match found
      return NextResponse.json({
        answer: "I couldn't find information about that in our database.",
        sources: [],
      });
    }

    // 3. Build context from retrieved drugs
    const context = drugs.map((d: any) =>
      `Name: ${d.name}\nClass: ${d.therapeutic_class || "N/A"}\nUses: ${d.indications || "N/A"}\nSide Effects: ${d.side_effects || "N/A"}\nDosage: ${d.dosage || "N/A"}\nWarnings: ${d.warnings || "N/A"}`
    ).join("\n---\n");

    // 4. Call Gemini with context
    const answer = await chatWithContext(trimmed, context, drugs);

    // 5. Log to training data
    await db.execute(sql`
      INSERT INTO ai_training_data (question, gemini_answer, drug_context, user_language)
      VALUES (${trimmed}, ${answer}, ${context}, 'en')
    `);

    return NextResponse.json({
      answer,
      sources: drugs.map((d: any) => ({ name: d.name, slug: d.slug })),
    });
  } catch (e) {
    console.error("AI chat error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", sources: [] },
      { status: 500 }
    );
  }
}
