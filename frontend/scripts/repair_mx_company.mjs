import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require");
const BASE = "https://medex.com.bd";
const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Accept": "text/html", "Accept-Language": "en-US" };

async function fetchWithDelay(url) {
  await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
  const resp = await fetch(url, { headers: H });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

async function extractCompanyInfo(html) {
  const cd = {};
  const e = html.match(/<td>\s*Established\s*<\/td>\s*<td>\s*(\d{4})/);
  if (e) cd.founded_year = parseInt(e[1]);
  const m = html.match(/<td>\s*Market Share\s*<\/td>\s*<td>\s*([\d.]+%)/);
  if (m) cd.market_share = m[1];
  const h = html.match(/<td>\s*Headquarter\s*<\/td>\s*<td>\s*<a[^>]*>([^<]+)/);
  if (h) cd.address = h[1].trim();
  const p = html.match(/<td>\s*Contact details\s*<\/td>\s*<td>\s*([\d()+\s-]+)/);
  if (p) cd.phone = p[1].trim();
  const f = html.match(/<td>\s*Fax\s*<\/td>\s*<td>\s*([\d(),+\s-]+)/);
  if (f) cd.fax = f[1].trim();
  const d = html.match(/<div class="ov-data mb-50">\s*<p>(.*?)<\/p>/);
  if (d) {
    let txt = d[1].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
    if (txt.length > 50) cd.about = txt;
  }
  return cd;
}

async function main() {
  // Get all companies that need MedEx company info (missing founded_year)
  const companies = await sql`
    SELECT id, name FROM companies 
    WHERE founded_year IS NULL 
      AND name NOT ILIKE '%select%' 
      AND name NOT ILIKE '%sample%'
    ORDER BY name
  `;

  console.log(`Companies needing company info: ${companies.length}\n`);

  let ok = 0, fail = 0;
  for (const co of companies) {
    const name = co.name;
    const id = co.id;
    
    // Build MedEx slug from company name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    
    // Try to find MedEx ID by matching slug pattern
    // We'll try the MedEx search or known patterns
    try {
      // First, search MedEx for this company by name
      const searchUrl = `${BASE}/companies?page=1`;
      const searchHtml = await fetchWithDelay(searchUrl);
      
      // Find all company links and match by name
      const links = searchHtml.matchAll(/<a href="[^"]*\/companies\/(\d+)\/([^"]+)"[^>]*>([^<]+)<\/a>/g);
      let found = false;
      for (const link of links) {
        const cid = link[1];
        const cslug = link[2];
        const cname = link[3].trim();
        
        if (cname.toLowerCase() === name.toLowerCase() || 
            cname.toLowerCase().includes(name.toLowerCase().slice(0, 15)) ||
            name.toLowerCase().includes(cname.toLowerCase().slice(0, 15))) {
          
          // Found the company on MedEx
          const detailHtml = await fetchWithDelay(`${BASE}/companies/${cid}/${cslug}`);
          const cd = await extractCompanyInfo(detailHtml);
          
          if (Object.keys(cd).length > 0) {
            if (cd.founded_year !== undefined) await sql`UPDATE companies SET founded_year = ${cd.founded_year} WHERE id = ${id}`;
            if (cd.market_share) await sql`UPDATE companies SET market_share = ${cd.market_share} WHERE id = ${id}`;
            if (cd.address) await sql`UPDATE companies SET address = ${cd.address} WHERE id = ${id}`;
            if (cd.phone) await sql`UPDATE companies SET phone = ${cd.phone} WHERE id = ${id}`;
            if (cd.fax) await sql`UPDATE companies SET fax = ${cd.fax} WHERE id = ${id}`;
            if (cd.about) await sql`UPDATE companies SET about = ${cd.about} WHERE id = ${id}`;
            console.log(`  ✅ ${name} — founded: ${cd.founded_year || '?'}, share: ${cd.market_share || '?'}`);
            ok++;
          } else {
            console.log(`  ⚠️  ${name} — company page found but no extractable data`);
            fail++;
          }
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Try the direct slug approach
        const directUrl = `${BASE}/companies/${slug}/${slug}`;
        const resp = await fetch(directUrl, { headers: H });
        if (resp.ok) {
          const html = await resp.text();
          const cd = await extractCompanyInfo(html);
          if (Object.keys(cd).length > 0) {
            if (cd.founded_year !== undefined) await sql`UPDATE companies SET founded_year = ${cd.founded_year} WHERE id = ${id}`;
            if (cd.market_share) await sql`UPDATE companies SET market_share = ${cd.market_share} WHERE id = ${id}`;
            if (cd.address) await sql`UPDATE companies SET address = ${cd.address} WHERE id = ${id}`;
            if (cd.phone) await sql`UPDATE companies SET phone = ${cd.phone} WHERE id = ${id}`;
            if (cd.fax) await sql`UPDATE companies SET fax = ${cd.fax} WHERE id = ${id}`;
            if (cd.about) await sql`UPDATE companies SET about = ${cd.about} WHERE id = ${id}`;
            console.log(`  ✅ ${name} (direct)`);
            ok++;
          }
        } else {
          console.log(`  ❌ ${name} — not found on MedEx`);
          fail++;
        }
      }
    } catch (e) {
      console.log(`  ❌ ${name} — error: ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone. Success: ${ok}, Failed: ${fail}`);
}

main().catch(e => { console.error(e); process.exit(1); });
