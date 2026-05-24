import { neon } from '@neondatabase/serverless';
const DB_URL = "postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require";
const sql = neon(DB_URL);
const BASE = "https://medex.com.bd";
const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "text/html", "Accept-Language": "en-US" };

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function extractSection(html, id) {
  const start = html.indexOf(`id="${id}"`);
  if (start === -1) return null;
  const acStart = html.indexOf('class="ac-body"', start);
  if (acStart === -1) return null;
  // Content starts after the first >
  const contentStart = html.indexOf('>', acStart) + 1;
  if (contentStart <= 0) return null;
  // Find end: next div with id= or end of container
  const nextSection = html.indexOf('<div id="', contentStart);
  const containerEnd = html.indexOf('</div>', contentStart);
  const end = (nextSection > 0 && nextSection < containerEnd + 50) ? nextSection : containerEnd;
  
  let text = html.substring(contentStart, end);
  // Prefer full-str if available, or min-str-block
  const fullStr = text.match(/class='full-str'>([\s\S]*?)<\/div>/);
  if (fullStr) text = fullStr[1];
  
  text = text.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  text = text.replace(/<script[\s\S]*?<\/script>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 10 ? text : null;
}

async function main() {
  // Get generics missing medical data AND present in our DB
  const generics = await sql`
    SELECT id, name FROM generics 
    WHERE (indications IS NULL OR indications = '')
    ORDER BY name LIMIT 5
  `;
  
  console.log(`Generics needing medical data: ${generics.length}\n`);
  if (generics.length === 0) { console.log("✅ All generics have medical data!"); return; }
  
  let ok = 0, fail = 0;
  for (const g of generics) {
    const name = g.name;
    const gid = g.id;
    
    // Build MedEx search URL
    const searchName = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    if (!searchName || searchName.length < 3) { fail++; continue; }
    
    // Search MedEx for this generic
    let medexId = null;
    try {
      const searchUrl = `${BASE}/search?type=generics&search=${encodeURIComponent(name)}`;
      const searchHtml = await (await fetch(searchUrl, { headers: H })).text();
      
      // Look for generic link in results
      const linkRegex = new RegExp(`<a\\s+href="/generics/(\\d+)/[^"]*"[^>]*>\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</a>`, 'i');
      const m = searchHtml.match(linkRegex);
      if (m) medexId = m[1];
      
      // If not found, try first result
      if (!medexId) {
        const firstResult = searchHtml.match(/<a\s+href="\/generics\/(\d+)\/[^"]*"[^>]*>\s*([^<]+?)\s*<\/a>/i);
        if (firstResult && firstResult[2].trim().toLowerCase().includes(searchName.slice(0, 15))) {
          medexId = firstResult[1];
        }
      }
    } catch (e) { /* search failed */ }
    
    if (!medexId) { fail++; continue; }
    
    // Fetch generic detail page
    try {
      await sleep(2000 + Math.random() * 3000);
      const html = await (await fetch(`${BASE}/generics/${medexId}/${searchName.replace(/\s+/g, '-').replace(/-+/g, '-')}`, { headers: H })).text();
      
      const updates = {};
      const s = extractSection(html, 'indications');
      if (s) updates.indications = s;
      const p = extractSection(html, 'mode_of_action');
      if (p) updates.pharmacology = p;
      const d = extractSection(html, 'dosage');
      if (d) updates.dosage = d;
      const i = extractSection(html, 'interaction');
      if (i) updates.interactions = i;
      const ci = extractSection(html, 'contraindications');
      if (ci) updates.contraindications = ci;
      const se = extractSection(html, 'side_effects');
      if (se) updates.side_effects = se;
      const pg = extractSection(html, 'pregnancy_cat');
      if (pg) updates.pregnancy_lactation = pg;
      const pr = extractSection(html, 'precautions');
      if (pr) updates.precautions = pr;
      const tc = extractSection(html, 'drug_classes') || extractSection(html, 'therapeutic_class');
      if (tc) updates.therapeutic_class = tc;
      const st = extractSection(html, 'storage_conditions');
      if (st) updates.storage_conditions = st;
      
      if (Object.keys(updates).length > 0) {
        const entries = Object.entries(updates);
        for (const [key, val] of entries) {
          await sql`UPDATE generics SET ${sql(key)} = ${val} WHERE id = ${gid}`;
        }
        ok++;
        if (ok <= 5) console.log(`  ✅ ${name} — ${Object.keys(updates).length} fields saved`);
      } else {
        fail++;
      }
    } catch (e) {
      fail++;
    }
  }
  
  console.log(`\nDone. Updated: ${ok}, Failed: ${fail}`);
}

main().catch(e => { console.error(e); process.exit(1); });
