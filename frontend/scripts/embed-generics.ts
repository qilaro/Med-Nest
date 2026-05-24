import pg from 'pg';
import { generateEmbedding } from "../lib/services/gemini";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const { rows } = await pool.query("SELECT id, name FROM generics WHERE embedding IS NULL ORDER BY name ASC");
  console.log(`Found ${rows.length} generics without embeddings`);

  let done = 0;
  for (const g of rows) {
    try {
      const vec = await generateEmbedding(g.name);
      const vecStr = "[" + vec.join(",") + "]";
      await pool.query(`UPDATE generics SET embedding = '${vecStr}'::vector WHERE id = '${g.id}'`);
      done++;
      if (done % 50 === 0) console.log(`  ${done}/${rows.length} done`);
    } catch (e) {
      console.error(`  Failed on ${g.name}:`, (e as Error).message);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`✅ ${done} embeddings generated`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
