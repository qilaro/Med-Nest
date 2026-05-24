import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { generateEmbedding, chatWithContextStream } from "@/lib/services/gemini";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    const chatHistory: { role: "user" | "assistant"; content: string }[] = Array.isArray(history) ? history : [];
    // Add current message
    chatHistory.push({ role: "user", content: message.trim().slice(0, 500) });

    const trimmed = message.trim().slice(0, 500);
    let drugs: any[] = [];

    // Keyword search
    try {
      const stopWords = new Set(["what","is","the","for","a","an","in","to","of","and","or","on","at","by","with","how","why","does","do","can","i","my","me","are","be","it","that","this","was","were","will","would","could","should","has","have","had","not","no","but","if","so","about","up","out","all","also","than","then","very","just","its","each","which","who","whom","when","where","side","effects","dose","dosage","uses","use","used","using","treatment","treat","info","information","tell","know","need","want","get","give","take","taking"]);
      const keywords = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
      if (keywords.length > 0) {
        const genNameConds = keywords.map(w => sql`g.name ILIKE ${'%' + w + '%'}`);
        const indConds = keywords.map(w => sql`g.indications ILIKE ${'%' + w + '%'}`);
        const brandConds = keywords.map(w => sql`b.brand_name ILIKE ${'%' + w + '%'}`);
        const kw = await db.execute(sql`
          SELECT g.name, g.slug, g.therapeutic_class,
            g.indications, g.side_effects, g.warnings,
            g.dosage, g.interactions, g.half_life, g.pregnancy_category,
            (SELECT STRING_AGG(DISTINCT b2.brand_name, ', ') FROM brands b2 WHERE b2.generic_id = g.id AND (${sql.join(keywords.map(w => sql`b2.brand_name ILIKE ${'%' + w + '%'}`), sql` OR `)})) as matched_brands
          FROM generics g
          LEFT JOIN brands b ON b.generic_id = g.id
          WHERE (${sql.join([...genNameConds, ...indConds, ...brandConds], sql` OR `)})
            AND g.id IS NOT NULL
          GROUP BY g.id, g.name, g.slug, g.therapeutic_class, g.indications, g.side_effects, g.warnings, g.dosage, g.interactions, g.half_life, g.pregnancy_category
          ORDER BY GREATEST(${sql.join(keywords.map(w => sql`(CASE WHEN EXISTS (SELECT 1 FROM brands b3 WHERE b3.generic_id = g.id AND LOWER(b3.brand_name) = LOWER(${w})) THEN 2 ELSE 0 END)`), sql` + `)}) DESC,
            (CASE WHEN g.indications IS NOT NULL AND g.indications != '' THEN 1 ELSE 0 END) DESC,
            (SELECT COUNT(*) FROM brands WHERE generic_id = g.id) DESC
          LIMIT 1
        `);
        if (kw.rows.length > 0) drugs = kw.rows as any[];
      }
    } catch {}

    // Vector search fallback
    if (drugs.length === 0) {
      try {
        const queryVector = await generateEmbedding(trimmed);
        const vectorStr = `[${queryVector.join(",")}]`;
        const vecResults = await db.execute(sql`
          SELECT name, slug, therapeutic_class, indications, side_effects, warnings,
                 dosage, interactions, half_life, pregnancy_category
          FROM generics
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> ${vectorStr}::vector
          LIMIT 1
        `);
        if (vecResults.rows.length > 0 && (vecResults.rows[0] as any).distance <= 0.3) {
          drugs = vecResults.rows as any[];
        }
      } catch {}
    }

    // Build context
    let context = "";
    if (drugs.length > 0) {
      const d = drugs[0];
      const brands = d.matched_brands ? ` Matches brand(s): ${d.matched_brands}.` : "";

      context = `Drug: ${d.name}.${brands}`;

      // Fetch brands with pricing for this generic
      try {
        const brandRows = await db.execute(sql`
          SELECT brand_name, strength, dosage_form, company_name,
                 price_unit, price_strip, pack_size
          FROM brands
          WHERE generic_id = ${d.id}::uuid
            AND is_discontinued = false
          ORDER BY brand_name
          LIMIT 30
        `);
        if (brandRows.rows.length > 0) {
          context += "\n\nBrands with pricing:\n";
          const lines = (brandRows.rows as any[]).map((b, i) => {
            let line = `${i + 1}. ${b.brand_name} | ${b.strength || "?"} | ${b.dosage_form || "?"} | ${b.company_name || ""}`;
            if (b.price_unit) line += ` | ৳${parseFloat(b.price_unit).toFixed(2)} per unit`;
            if (b.price_strip) line += ` | ৳${parseFloat(b.price_strip).toFixed(2)} per strip`;
            if (b.pack_size) line += ` | Pack: ${b.pack_size}`;
            return line;
          });
          context += lines.join("\n");
        }
      } catch {}

      // Generic medical info (if available)
      const parts: string[] = [];
      if (d.therapeutic_class) parts.push(`Class: ${d.therapeutic_class}`);
      if (d.indications) parts.push(`Uses: ${d.indications}`);
      if (d.side_effects) parts.push(`Side effects: ${d.side_effects}`);
      if (d.dosage) parts.push(`Dosage: ${d.dosage}`);
      if (d.warnings) parts.push(`Warnings: ${d.warnings}`);
      if (parts.length > 0) context += "\n\n" + parts.join("\n");
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        let fullAnswer = "";
        let hasError = false;

        try {
          const gen = chatWithContextStream(chatHistory, context, drugs);
          for await (const chunk of gen) {
            fullAnswer += chunk;
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ token: chunk })}\n\n`));
          }
        } catch (e: any) {
          hasError = true;
          console.error("Groq API error:", e.message);
          let fallback = "";
          if (e.message?.includes("429")) {
            fallback = "You've reached your Daily Quota limit. Please wait a few hours and try again. 🙏";
          } else {
            fallback = context
              ? "Based on the drug data I found, here's what I know. However, I couldn't generate a full response right now. Please consult your doctor for detailed advice."
              : "I couldn't process your request right now. Please try again.";
          }
          fullAnswer = fallback;
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ token: fallback })}\n\n`));
        }

        // Log to training data
        if (!hasError && fullAnswer) {
          try {
            // Keep table under 500 rows
            await db.execute(sql`
              DELETE FROM ai_training_data
              WHERE id IN (
                SELECT id FROM ai_training_data
                ORDER BY created_at ASC
                LIMIT GREATEST(0, (SELECT COUNT(*) FROM ai_training_data) - 500)
              )
            `);
            await db.execute(sql`
              INSERT INTO ai_training_data (question, gemini_answer, drug_context, user_language)
              VALUES (${trimmed}, ${fullAnswer}, ${context || null}, 'en')
            `);
          } catch {}
        }

        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    console.error("AI chat error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong." }), { status: 500 });
  }
}
