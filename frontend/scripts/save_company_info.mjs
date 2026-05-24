import { neon } from '@neondatabase/serverless';
const DB_URL = "postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require";
const sql = neon(DB_URL);
const BASE = "https://medex.com.bd";
const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "text/html", "Accept-Language": "en-US" };

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // Get companies that were recently imported (have brands from May 22 imports)
  // but missing company info
  const companies = await sql`
    SELECT DISTINCT c.id, c.name FROM companies c
    JOIN brands b ON b.company_id = c.id
    WHERE b.created_at > '2026-05-22'
      AND c.founded_year IS NULL
      AND c.name NOT ILIKE '%select%'
      AND c.name NOT ILIKE '%sample%'
    ORDER BY c.name
  `;

  console.log(`Companies needing info: ${companies.length}\n`);

  let ok = 0, fail = 0;
  for (const co of companies) {
    const name = co.name;
    const id = co.id;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

    // Search MedEx page 1-8 for this company to find its mid
    let mid = null;
    for (let page = 1; page <= 8; page++) {
      try {
        const html = await (await fetch(`${BASE}/companies?page=${page}`, { headers: H })).text();
        const links = html.matchAll(/<a href="[^"]*\/companies\/(\d+)\/([^"]+)"[^>]*>([^<]+)<\/a>/g);
        for (const link of links) {
          const cid = link[1];
          const cslug = link[2];
          const cname = link[3].trim();
          if (cname.toLowerCase() === name.toLowerCase()) {
            mid = cid;
            break;
          }
        }
      } catch (e) {}
      if (mid) break;
    }

    if (!mid) {
      console.log(`  ❌ ${name} — not found on MedEx`);
      fail++;
      continue;
    }

    // Fetch company detail page
    try {
      await sleep(2000 + Math.random() * 3000);
      const html = await (await fetch(`${BASE}/companies/${mid}/${slug}`, { headers: H })).text();
      
      const cd = {};
      const e = html.match(/<td>\s*Established\s*<\/td>\s*<td>\s*(\d{4})/);
      if (e) cd.founded_year = parseInt(e[1]);
      const m = html.match(/<td>\s*Market Share\s*<\/td>\s*<td>\s*([\d.]+%)/);
      if (m) cd.market_share = m[1];
      const h = html.match(/<td>\s*Headquarter\s*<\/td>\s*<td>\s*<a[^>]*>([^<]+)/);
      if (h) cd.address = h[1].trim();
      const p = html.match(/<td>\s*Contact details\s*<\/td>\s*<td>\s*([\d()+\s-]+)/);
      if (p) cd.phone = p[1].trim();
      const d = html.match(/<div class="ov-data mb-50">\s*<p>(.*?)<\/p>/);
      if (d) {
        let txt = d[1].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
        if (txt.length > 50) cd.about = txt;
      }

      if (Object.keys(cd).length === 0) {
        console.log(`  ⚠️  ${name} — found but no extractable data`);
        fail++;
        continue;
      }

      if (cd.founded_year !== undefined) await sql`UPDATE companies SET founded_year = ${cd.founded_year} WHERE id = ${id}`;
      if (cd.market_share) await sql`UPDATE companies SET market_share = ${cd.market_share} WHERE id = ${id}`;
      if (cd.address) await sql`UPDATE companies SET address = ${cd.address} WHERE id = ${id}`;
      if (cd.phone) await sql`UPDATE companies SET phone = ${cd.phone} WHERE id = ${id}`;
      if (cd.about) await sql`UPDATE companies SET about = ${cd.about} WHERE id = ${id}`;

      console.log(`  ✅ ${name} — ${Object.keys(cd).length} fields saved (mid: ${mid})`);
      ok++;
    } catch (e) {
      console.log(`  ❌ ${name} — ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone. Success: ${ok}, Failed: ${fail}`);
}

main().catch(e => { console.error(e); process.exit(1); });
