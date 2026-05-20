/**
 * One-time script: generate embeddings for all generics that don't have one yet.
 * Run: npx tsx scripts/embed-generics.ts
 */
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { generateEmbedding } from "@/lib/services/gemini";

async function main() {
  const generics = await db.execute(sql`
    SELECT id, name, therapeutic_class, indications, side_effects, dosage
    FROM generics
    WHERE embedding IS NULL
    ORDER BY name ASC
  `);

  const rows = generics.rows as any[];
  console.log(`Found ${rows.length} generics without embeddings`);

  let done = 0;
  for (const g of rows) {
    const text = [
      g.name,
      g.therapeutic_class,
      g.indications?.slice(0, 500),
      g.side_effects?.slice(0, 300),
    ].filter(Boolean).join(" ").slice(0, 1000);

    try {
      const vec = await generateEmbedding(text);
      const vecStr = `[${vec.join(",")}]`;
      await db.execute(sql`
        UPDATE generics SET embedding = ${vecStr}::vector WHERE id = ${g.id}
      `);
      done++;
      if (done % 50 === 0) console.log(`  ${done}/${rows.length} done`);
    } catch (e) {
      console.error(`  Failed on ${g.name}:`, (e as Error).message);
    }
  }

  console.log(`✅ ${done} embeddings generated`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
