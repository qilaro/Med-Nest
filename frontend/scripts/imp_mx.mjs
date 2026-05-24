import { neon } from '@neondatabase/serverless';
const DB_URL = "postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require";
const sql = neon(DB_URL);
const BASE = "https://medex.com.bd";
const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Accept": "text/html", "Accept-Language": "en-US" };

const [co] = process.argv.slice(2);
if (!co) { console.log("Usage: npx tsx imp_mx.mjs <json>"); process.exit(1); }
const { id, name, mid, pages: totalPages } = JSON.parse(co);

function norm_gen(s) {
  s = (s || '').toLowerCase().trim();
  s = s.replace(/\d+\.?\d*\s*(mg|mcg|g|ml|%|iu)\s*/g, ' ');
  s = s.replace(/\b\d+\.?\d*\b/g, ' ');
  for (const f of [' eye drops',' eye drop',' ear drops',' ear drop',' topical',' ophthalmic',' oral',' injection',' solution',' suspension',' cream',' ointment',' gel',' tablet',' capsule',' syrup',' drops',' powder',' prep',' e/e',' nasal',' eye',' ear']) {
    s = s.replace(new RegExp('\\b' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), ' ');
  }
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\[[^\]]*\]/g, ' ');
  s = s.replace(/dihydrochloride/g, 'hydrochloride');
  s = s.replace(/sulphate/g, 'sulfate');
  s = s.replace(/dihydrate/g, '');
  s = s.replace(/ & /g, ' + ');
  s = s.replace(/ and /g, ' + ');
  s = s.replace(/ with /g, ' + ');
  s = s.replace(/\s+/g, ' ').trim();
  const parts = [...new Set(s.split('+').map(p => p.trim()).filter(Boolean))].sort();
  return parts.join(' + ');
}

async function findOrCreateGeneric(genName) {
  if (!genName) return null;
  let r = await sql`SELECT id FROM generics WHERE LOWER(name) = LOWER(${genName}) LIMIT 1`;
  if (r.length > 0) return r[0].id;
  const norm = norm_gen(genName);
  const dbAll = await sql`SELECT id, name FROM generics`;
  for (const db of dbAll) {
    if (norm_gen(db.name) === norm) return db.id;
  }
  let slug = genName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').substring(0,200);
  if (!slug) slug = 'generic-' + Date.now();
  const exists = await sql`SELECT id FROM generics WHERE slug = ${slug} LIMIT 1`;
  if (exists.length > 0) slug += '-' + Date.now();
  await sql`INSERT INTO generics (name, slug, medicine_type) VALUES (${genName}, ${slug}, 'Allopathic')`;
  return (await sql`SELECT id FROM generics WHERE slug = ${slug} LIMIT 1`)[0]?.id;
}

function extractCards(html) {
  const cards = [];
  const re = /<div class="row data-row">(.*?)<\/div>\s*<\/div>\s*<\/a>/gs;
  let m;
  while ((m = re.exec(html)) !== null) {
    const c = m[1];
    const nameM = c.match(/data-row-top">\s*([^<]+?)\s*<span\s+class="inline-dosage-form">/);
    const formM = c.match(/inline-dosage-form">([^<]+)<\/span>/);
    const strM = c.match(/grey-ligten">([^<]+)<\/span>/);
    const genM = c.match(/<\/div>\s*<div class="col-xs-12">\s*([^<]+?)\s*<\/div>/);
    const pathM = c.match(/href="(\/brands\/\d+\/[^"]+)"/);
    
    let price = 0, pack = '';
    const pw = c.match(/<span class="unit-price">(.*?)<\/span>/s);
    if (pw) {
      let raw = pw[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().replace(/[৳৲]/g,'');
      if (raw.includes('Unit Price')) {
        const p = raw.replace('Unit Price','').match(/[\d,.]+/);
        if (p) price = parseFloat(p[0].replace(/,/g,''));
      } else if (raw.includes(':')) {
        const parts = raw.split(':');
        pack = parts[0].trim();
        const p = parts[parts.length-1].match(/[\d,.]+/);
        if (p) price = parseFloat(p[0].replace(/,/g,''));
      }
    }
    
    cards.push({
      name: nameM ? nameM[1].trim() : '',
      form: formM ? formM[1].trim() : '',
      str: strM ? strM[1].trim() : '',
      gen: genM ? genM[1].trim() : '',
      path: pathM ? pathM[1] : '',
      price, pack
    });
  }
  return cards;
}

function extractDetail(html) {
  const u = html.match(/Unit Price[^<]*<\/span>\s*<span[^>]*>\s*[৳৲]?\s*([\d,.]+)/);
  const s = html.match(/Strip Price[^<]*<\/span>\s*<span[^>]*>\s*[৳৲]?\s*([\d,.]+)/);
  const p = html.match(/pack-size-info">\s*\(([^)]+)\)/);
  const unit = u ? parseFloat(u[1].replace(/,/g,'')) : 0;
  const strip = s ? parseFloat(s[1].replace(/,/g,'')) : 0;
  let size = 0;
  if (p) {
    const sz = p[1].match(/x\s*(\d+)/);
    if (sz) size = parseInt(sz[1]);
  }
  return { unit, strip, size, info: p ? p[1] : '' };
}

function extractMedical(html) {
  const out = {};
  const sections = [
    ['indications','Indications'],['mode_of_action','Pharmacology'],
    ['side_effects','Side Effects'],['contraindications','Contraindications'],
    ['pregnancy_cat','Pregnancy & Lactation'],['precautions','Precautions & Warnings'],
    ['storage_conditions','Storage Conditions'],['drug_classes','Therapeutic Class']
  ];
  for (const [sid] of sections) {
    const start = html.indexOf(`id="${sid}"`);
    if (start === -1) continue;
    const acStart = html.indexOf('<div class="ac-body">', start);
    if (acStart === -1) continue;
    let contentStart = acStart + '<div class="ac-body">'.length;
    // Find end - next section with id= or end of generic-data-container
    const nextId = html.indexOf('id="', contentStart);
    const containerEnd = html.indexOf('</div>', contentStart);
    const end = (nextId > 0 && nextId < containerEnd + 20) ? nextId - 10 : containerEnd;
    let text = html.substring(contentStart, end).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
    if (text && text.length > 10) out[sid] = text;
  }
  return out;
}

async function fetchWithDelay(url) {
  await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
  const resp = await fetch(url, { headers: H });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

async function main() {
  console.log(`=== ${name} (MedEx ID: ${mid}) ===`);
  
  // Ensure company record
  const exists = await sql`SELECT id FROM companies WHERE id = ${id} LIMIT 1`;
  if (exists.length === 0) {
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,200);
    await sql`INSERT INTO companies (id, name, slug) VALUES (${id}, ${name}, ${slug})`;
  }
  
  // Fetch company detail page for company info
  try {
    const cs = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    const ch = await fetchWithDelay(`${BASE}/companies/${mid}/${cs}`);
    const cd = {};
    const e = ch.match(/<td>\s*Established\s*<\/td>\s*<td>\s*(\d{4})/);
    if (e) cd.founded_year = parseInt(e[1]);
    const m = ch.match(/<td>\s*Market Share\s*<\/td>\s*<td>\s*([\d.]+%)/);
    if (m) cd.market_share = m[1];
    const h = ch.match(/<td>\s*Headquarter\s*<\/td>\s*<td>\s*<a[^>]*>([^<]+)/);
    if (h) cd.address = h[1].trim();
    const p = ch.match(/<td>\s*Contact details\s*<\/td>\s*<td>\s*([\d()+\s-]+)/);
    if (p) cd.phone = p[1].trim();
    const d = ch.match(/<div class="ov-data mb-50">\s*<p>(.*?)<\/p>/);
    if (d) {
      let txt = d[1].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
      if (txt.length > 50) cd.about = txt;
    }
    if (Object.keys(cd).length > 0) {
      if (cd.founded_year !== undefined) await sql`UPDATE companies SET founded_year = ${cd.founded_year} WHERE id = ${id}`;
      if (cd.market_share) await sql`UPDATE companies SET market_share = ${cd.market_share} WHERE id = ${id}`;
      if (cd.address) await sql`UPDATE companies SET address = ${cd.address} WHERE id = ${id}`;
      if (cd.phone) await sql`UPDATE companies SET phone = ${cd.phone} WHERE id = ${id}`;
      if (cd.about) await sql`UPDATE companies SET about = ${cd.about} WHERE id = ${id}`;
    }
  } catch (e) {
    console.error(`  ⚠️ Company info failed for ${name}: ${e.message}`);
  }
  
  // Normalize strength for robust comparison (MedEx "90 mg" vs DB "90mg")
  const normStr = s => s.toLowerCase().replace(/\s*(\d+\.?\d*)\s*(mg|mcg|g|ml|%|iu)\s*/g, '$1$2').replace(/\s+/g,' ').trim();
  
  // Get existing brands for diff (include prices for cross-check)
  const existing = await sql`SELECT brand_name, COALESCE(strength,'') as s, price_unit, price_strip, pack_size FROM brands WHERE company_id = ${id}`;
  const dbSet = new Set(existing.map(b => b.brand_name.toLowerCase().trim() + '||' + normStr(b.s)));
  const dbPriceMap = {};
  for (const b of existing) {
    const key = b.brand_name.toLowerCase().trim() + '||' + normStr(b.s);
    dbPriceMap[key] = { price_unit: b.price_unit, price_strip: b.price_strip, pack_size: b.pack_size };
  }
  console.log(`  Existing in DB: ${existing.length}`);
  
  // Build company slug
  const compSlug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  
  // Fetch all pages
  let allCards = [];
  const pages = totalPages || (await (async () => {
    const html = await fetchWithDelay(`${BASE}/companies/${mid}/${compSlug}/brands`);
    const pagLinks = html.match(/<a[^>]*href="[^"]*brands\?page=(\d+)"[^>]*>/g);
    if (!pagLinks) return 1;
    const nums = pagLinks.map(p => parseInt(p.match(/page=(\d+)/)[1])).filter(n => !isNaN(n));
    return Math.max(...nums, 1);
  })());
  
  for (let p = 1; p <= pages; p++) {
    const url = `${BASE}/companies/${mid}/${compSlug}/brands${p > 1 ? `?page=${p}` : ''}`;
    const html = await fetchWithDelay(url);
    const cards = extractCards(html);
    allCards = allCards.concat(cards);
    process.stdout.write(p === pages ? '\n' : '.');
  }
  console.log(`  Total fetched: ${allCards.length}`);
  
  // Filter new
  const newCards = allCards.filter(c => !dbSet.has(c.name.toLowerCase() + '||' + c.str.toLowerCase()));
  const dupCards = allCards.length - newCards.length;
  console.log(`  Already in DB: ${dupCards}`);
  console.log(`  New to import: ${newCards.length}`);
  
  if (newCards.length === 0) {
    console.log(`  ✅ ${name} done — nothing new`);
    return;
  }
  
  // Import new ones
  let ins = 0, ng = 0;
  const seenInRun = new Set();
  for (const c of newCards) {
    const key = c.name.toLowerCase() + '||' + c.str.toLowerCase();
    if (seenInRun.has(key)) continue;
    seenInRun.add(key);
    let priceUnit = c.price, priceStrip = c.price, packSize = c.pack;
    
    // Fetch detail if Unit Price (need strip info)
    if (!c.pack && c.path) {
      try {
        const html = await fetchWithDelay(`${BASE}${c.path}`);
        const d = extractDetail(html);
        if (d.unit > 0) priceUnit = d.unit;
        if (d.strip > 0) priceStrip = d.strip;
        if (d.size > 0) packSize = `${d.size}'s Strip`;
      } catch (e) { /* use listing page data */ }
    }
    
    if (priceUnit <= 0) continue;
    
    const gid = await findOrCreateGeneric(c.gen);
    if (!gid) continue;
    
    // Check if generic needs medical data
    const genRow = await sql`SELECT indications FROM generics WHERE id = ${gid}`;
    if (genRow.length > 0 && !genRow[0].indications && c.path) {
      try {
        const html = await fetchWithDelay(`${BASE}${c.path}`);
        const med = extractMedical(html);
        const updates = {};
        if (med.indications) updates.indications = med.indications;
        if (med.side_effects) updates.side_effects = med.side_effects;
        if (med.contraindications) updates.contraindications = med.contraindications;
        if (med.pregnancy_cat) updates.pregnancy_lactation = med.pregnancy_cat;
        if (med.precautions) updates.precautions = med.precautions;
        if (med.storage_conditions) updates.storage_conditions = med.storage_conditions;
        if (med.mode_of_action) updates.pharmacology = med.mode_of_action;
        if (med.drug_classes) updates.therapeutic_class = med.drug_classes;
        if (Object.keys(updates).length > 0) {
          await sql`UPDATE generics SET ${sql(updates)} WHERE id = ${gid}`;
        }
      } catch (e) {}
    }
    
    const slug = `${c.name}-${c.str}-${mid}`.toLowerCase()
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,200);
    
    try {
      await sql`
        INSERT INTO brands (brand_name, slug, strength, dosage_form, generic_name, company_name, company_id, generic_id, price_unit, price_strip, pack_size, is_otc, medicine_type, brand_verified, price_verified)
        VALUES (${c.name}, ${slug}, ${c.str || null}, ${c.form}, ${c.gen}, ${name}, ${id}, ${gid}, ${priceUnit}, ${priceStrip}, ${packSize || null}, false, 'Allopathic', true, true)
      `;
      ins++;
    } catch (e) { /* slug duplicate */ }
  }
  
  console.log(`  Inserted: ${ins}/${newCards.length}`);
  
  // Log price differences for manual review
  let priceDiffs = 0;
  for (const c of newCards) {
    const key = (c.name + '||' + c.str).toLowerCase();
    const existingEntry = dbPriceMap[key];
    if (existingEntry && existingEntry.price_unit > 0 && c.price > 0) {
      const diff = Math.abs(existingEntry.price_unit - c.price);
      if (diff > 0.5) { // only flag significant differences
        priceDiffs++;
        const msg = `PRICE_DIFF: ${name} | ${c.name} | ${c.str} | DB: ${existingEntry.price_unit} | MedEx: ${c.price} | pack: ${existingEntry.pack_size} | diff: ${diff.toFixed(2)}`;
        try {
          const fs = await import('fs');
          fs.appendFileSync('/tmp/medex_price_diffs.log', msg + '\n');
        } catch (e) {}
        if (priceDiffs <= 5) console.log(`  ⚠️  ${msg}`);
      }
    }
  }
  if (priceDiffs > 5) console.log(`  ⚠️  ... and ${priceDiffs - 5} more price diffs (see /tmp/medex_price_diffs.log)`);
  if (priceDiffs === 0) console.log(`  ✅ No significant price differences`);
  
  console.log(`  ✅ ${name} done`);
}

main().catch(e => { console.error(e); process.exit(1); });
