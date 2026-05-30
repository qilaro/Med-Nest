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
    const stopWords = new Set(["what","is","the","for","a","an","in","to","of","and","or","on","at","by","with","how","why","does","do","can","i","my","me","are","be","it","that","this","was","were","will","would","could","should","has","have","had","not","no","but","if","so","about","up","out","all","also","than","then","very","just","its","each","which","who","whom","when","where","side","effects","dose","dosage","uses","use","used","using","treatment","treat","info","information","tell","know","need","want","get","give","take","taking"]);
    const keywords = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
    const isPriceQuery = keywords.includes("price") || keywords.includes("cost");

    // Keyword search
    try {
      if (keywords.length > 0) {
        // Skip generic price/search words when looking for drug names
        const searchWords = isPriceQuery
          ? keywords.filter((k: string) => !["price","cost","rate","cheap","expensive","how","much","total","per","tablet","capsule","mg","ml","drop","drops","syrup","injection","bottle","strip","pack","unit","dose","dosage","mgml","mcg","tab","cap","suspension","solution","infusion","powder","cream","ointment","gel","spray","lotion"].includes(k) && !/^\d/.test(k))
          : keywords;
        if (searchWords.length > 0) {
          const genNameConds = searchWords.map(w => sql`g.name ILIKE ${'%' + w + '%'}`);
          const brandConds = searchWords.map(w => sql`b.brand_name ILIKE ${'%' + w + '%'}`);
          const kw = await db.execute(sql`
            SELECT g.id, g.name, g.slug, g.therapeutic_class
            FROM generics g
            LEFT JOIN brands b ON b.generic_id = g.id
            WHERE (${sql.join([...genNameConds, ...brandConds], sql` OR `)})
              AND g.id IS NOT NULL
            GROUP BY g.id, g.name, g.slug, g.therapeutic_class
            ORDER BY (SELECT COUNT(*) FROM brands WHERE generic_id = g.id AND is_discontinued = false) DESC
            LIMIT 1
          `);
          if (kw.rows.length > 0) drugs = kw.rows as any[];
        }
      }
    } catch {}

    // Vector search fallback
    if (drugs.length === 0) {
      try {
        const queryVector = await generateEmbedding(trimmed);
        const vectorStr = `[${queryVector.join(",")}]`;
        const vecResults = await db.execute(sql`
          SELECT id, name, slug, therapeutic_class, indications, side_effects, warnings,
                 dosage, interactions, half_life, pregnancy_category,
                 embedding <=> ${vectorStr}::vector AS distance
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
      try {
        let brandRows = await db.execute(sql`
          SELECT brand_name, strength, dosage_form, company_name,
                 price_unit, price_strip, pack_size
          FROM brands
          WHERE generic_id = ${d.id}::uuid
            AND is_discontinued = false
        `);
        const brands = brandRows.rows as any[];

        // PRICE QUERY: concise table, no generic info
        if (isPriceQuery && brands.length > 0) {
          context = `PRICING DATA: ${d.name}\n`;

          // Find if user asked about a specific brand
          const brandKeyword = keywords.find((k: string) => k.length > 2 && !["price","cost","mg","tablet","capsule","dose","dosage","how","much","per","rate","cheap","expensive","total"].includes(k) && brands.some((b: any) => b.brand_name.toLowerCase().includes(k)));

          if (brandKeyword) {
            const filtered = brands.filter((b: any) => b.brand_name.toLowerCase().includes(brandKeyword));
            if (filtered.length > 0) {
              context += `MATCHED BRANDS (${brandKeyword}):\n`;
              context += "Brand | Strength | Form | Unit Price | Strip Price | Pack\n";
              context += filtered.map((b: any) => {
                const unit = b.price_unit ? `৳${parseFloat(b.price_unit).toFixed(2)}` : "-";
                const strip = b.price_strip ? `৳${parseFloat(b.price_strip).toFixed(2)}` : "-";
                return `${b.brand_name} | ${b.strength || "-"} | ${b.dosage_form || "-"} | ${unit} | ${strip} | ${b.pack_size || "-"}`;
              }).join("\n");
            }
          } else {
            // No specific brand - show first 30 brands
            context += "Brand | Strength | Form | Unit Price | Strip Price | Pack\n";
            context += brands.slice(0, 30).map((b: any) => {
              const unit = b.price_unit ? `৳${parseFloat(b.price_unit).toFixed(2)}` : "-";
              const strip = b.price_strip ? `৳${parseFloat(b.price_strip).toFixed(2)}` : "-";
              return `${b.brand_name} | ${b.strength || "-"} | ${b.dosage_form || "-"} | ${unit} | ${strip} | ${b.pack_size || "-"}`;
            }).join("\n");
          }
        }
        // GENERAL QUERY: existing approach
        else {
          const matchedBrands = brands.filter((b: any) => keywords.some((k: string) => b.brand_name.toLowerCase().includes(k)));
          const brandNames = matchedBrands.length > 0
            ? matchedBrands.map((b: any) => b.brand_name).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(", ")
            : brands.slice(0, 5).map((b: any) => b.brand_name).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(", ");
          context = `Drug: ${d.name}. Available brands: ${brandNames}`;

          // Medical info
          const parts: string[] = [];
          if (d.therapeutic_class) parts.push(`Class: ${d.therapeutic_class}`);
          if (d.indications) parts.push(`Uses: ${d.indications}`);
          if (d.side_effects) parts.push(`Side effects: ${d.side_effects}`);
          if (d.dosage) parts.push(`Dosage: ${d.dosage}`);
          if (d.warnings) parts.push(`Warnings: ${d.warnings}`);
          if (parts.length > 0) context += "\n\n" + parts.join("\n");

          if (brands.length > 0) {
            context += "\n\nAvailable brands:\n";
            context += brands.slice(0, 20).map((b: any) =>
              `${b.brand_name} | ${b.strength || "?"} | ${b.dosage_form || "?"}${b.price_unit ? " | ৳" + parseFloat(b.price_unit).toFixed(2) : ""}`
            ).join("\n");
          }
        }
      } catch (e) {
        console.error("Brands query error:", e);
        context = `Drug: ${d.name}`;
      }
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        let fullAnswer = "";
        let hasError = false;

        try {
          const gen = chatWithContextStream(chatHistory, context, drugs, isPriceQuery);
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
