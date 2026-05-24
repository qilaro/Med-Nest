import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require");
const BASE = "https://medex.com.bd";
const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function extract(html, sid) {
  try {
    const start = html.indexOf(`id="${sid}"`);
    if (start === -1) return null;
    const ac = html.indexOf('class="ac-body"', start);
    if (ac === -1) return null;
    let cs = html.indexOf('>', ac) + 1;
    const ns = html.indexOf('<div id="', cs);
    const ce = html.indexOf('</div>', cs);
    const end = (ns > 0 && ns < ce + 50) ? ns : ce;
    let text = html.substring(cs, end);
    const full = text.match(/class='full-str'>([\s\S]*?)<\/div>/);
    if (full) text = full[1];
    text = text.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 10 ? text : null;
  } catch (e) { return null; }
}

function rewrite(text) {
  if (!text || text.length < 20) return text;
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length > 1) sentences.push(sentences.shift());
  return sentences.join(' ');
}

async function main() {
  console.log("Loading generics from DB...");
  const allGens = await sql`SELECT id, name, medicine_type FROM generics ORDER BY name`;
  const our = new Map();
  for (const g of allGens) our.set(g.name.toLowerCase().trim(), { id: g.id, type: g.medicine_type || 'Allopathic' });

  const needData = await sql`SELECT id FROM generics WHERE (indications IS NULL OR indications = '')`;
  const needSet = new Set(needData.map(r => r.id));

  console.log(`DB: ${allGens.length} generics, ${needSet.size} need data\n`);

  let scanned = 0, matched = 0, updated = 0, inserted = 0, errors = 0;
  const seenRun = new Set();

  const SECTIONS = [
    ['indications','indications'],['mode_of_action','pharmacology'],
    ['side_effects','side_effects'],['contraindications','contraindications'],
    ['pregnancy_cat','pregnancy_lactation'],['precautions','precautions'],
    ['storage_conditions','storage_conditions'],['drug_classes','therapeutic_class'],
    ['dosage','dosage'],['interaction','interactions'],
    ['pediatric_uses','special_populations'],['overdose_effects','overdose_effects']
  ];

  for (let id = 3; id <= 2556; id++) {
    await sleep(2000);
    try {
      const html = await (await fetch(`${BASE}/generics/${id}`, { headers: H })).text();
      scanned++;

      const h1m = html.match(/<h1[^>]+>([^<]+)<\/h1>/);
      if (!h1m) { errors++; continue; }
      const name = h1m[1].trim();
      const key = name.toLowerCase().trim();

      const existing = our.get(key);

      if (existing) {
        matched++;
        if (needSet.has(existing.id)) {
          const updates = {};
          for (const [sid, fld] of SECTIONS) {
            const text = extract(html, sid);
            if (text) updates[fld] = rewrite(text);
          }
          if (Object.keys(updates).length > 0) {
            await sql`UPDATE generics SET ${sql(updates)} WHERE id = ${existing.id}`;
            updated++;
          }
        }
      } else if (!seenRun.has(key)) {
        seenRun.add(key);
        // Detect type: MedEx has "Generics (Herbal)" section — check if page 
        // body/container has herbal indicator. Default Allopathic for MedEx.
        let medType = 'Allopathic';
        // Check for herbal/homeo/unani indicators in page
        const bodyHtml = html.substring(0, html.indexOf('</head>'));
        if (bodyHtml.includes('herbal') || html.includes('?herbal=1') || html.includes('herbal-gen')) {
          medType = 'Herbal';
        }
        // For Unani/Homeo/Ayurvedic — MedEx doesn't classify these, keep default

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
        const updates = { name, slug, medicine_type: medType };
        for (const [sid, fld] of SECTIONS) {
          const text = extract(html, sid);
          if (text) updates[fld] = rewrite(text);
        }
        await sql`INSERT INTO generics ${sql(updates)}`;
        inserted++;
      }
    } catch (e) {
      errors++;
      if (errors <= 5) console.error(`  ID ${id}: ${e.message}`);
    }

    if (id % 100 === 0 || id === 2556 || inserted > 0) {
      console.log(`  [${id}/2556] Scanned:${scanned} Matched:${matched} Updated:${updated} Inserted:${inserted} Errors:${errors}`);
    }
  }

  console.log(`\nDone! Scanned:${scanned} Matched:${matched} Updated:${updated} Inserted:${inserted} Errors:${errors}`);
}

main().catch(e => { console.error(e); process.exit(1); });
