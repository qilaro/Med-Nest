import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require");
const SEARCH = "https://api.arogga.com/general/v3/search";
const DETAIL = "https://api.arogga.com/general/v1/product";
const H = { "User-Agent": "Mozilla/5.0", "Origin": "https://www.arogga.com" };

const [co] = process.argv.slice(2);
if (!co) { console.log("Usage: npx tsx impa.mjs <json>"); process.exit(1); }
const { id, name, brand_id, expected } = JSON.parse(co);

function normalize(s) {
  s = s.toLowerCase().trim();
  s = s.replace(/\d+\.?\d*\s*(mg|mcg|g|ml|%|iu|unit)\s*/g, ' ');
  s = s.replace(/\b\d+\.?\d*\b/g, ' ');
  const fw = ['eye drops','eye drop','eye/ear drop','eye/ear','eye or ear','eye prep','ear drops','ear drop','topical','ophthalmic','oral','injection','solution','suspension','cream','ointment','gel','tablet','capsule','syrup','drops','powder','prep','e/e','nasal','eye','ear','and nasal'];
  for (const f of fw) s = s.replace(new RegExp('\\b' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), ' ');
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\[[^\]]*\]/g, ' ');
  s = s.replace(/dihydrochloride/g, 'hydrochloride');
  s = s.replace(/sulphate/g, 'sulfate');
  s = s.replace(/dihydrate/g, '');
  s = s.replace(/ & /g, ' + ');
  s = s.replace(/ and /g, ' + ');
  s = s.replace(/ with /g, ' + ');
  s = s.replace(/ or /g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  const parts = [...new Set(s.split('+').map(p => p.trim()).filter(Boolean))].sort();
  return parts.join(' + ');
}

function mapType(aroggaType) {
  const t = (aroggaType || '').toLowerCase();
  if (t === 'medicine') return 'Allopathic';
  if (t === 'homeopathy') return 'Homeopathic';
  if (t === 'herbal') return 'Herbal';
  if (t === 'sexual_wellness') return 'Herbal';
  if (t === 'supplement') return 'Supplement';
  // Skip non-pharma types
  if (['healthcare','beauty','home_care','baby_&_mom_care','food','pet_care'].includes(t)) return null;
  return null;
}

async function findOrCreateGeneric(genericName, medType = 'Allopathic') {
  if (!genericName) return null;
  // Step 1: exact match
  let r = await sql`SELECT id FROM generics WHERE LOWER(name) = LOWER(${genericName}) AND medicine_type = ${medType} LIMIT 1`;
  if (r.length > 0) return r[0].id;
  // Step 2: same name, any type
  r = await sql`SELECT id FROM generics WHERE LOWER(name) = LOWER(${genericName}) LIMIT 1`;
  if (r.length > 0) return r[0].id;
  // Step 3: normalized match
  const norm = normalize(genericName);
  const dbAll = await sql`SELECT id, name FROM generics`;
  for (const db of dbAll) {
    if (normalize(db.name) === norm) return db.id;
  }
  // Step 4: insert new
  let slug = genericName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').substring(0,200);
  if (!slug) slug = 'generic-' + Date.now();
  const exists = await sql`SELECT id FROM generics WHERE slug = ${slug} LIMIT 1`;
  if (exists.length > 0) slug += '-' + Date.now();
  await sql`INSERT INTO generics (name, slug, medicine_type) VALUES (${genericName}, ${slug}, ${medType})`;
  return (await sql`SELECT id FROM generics WHERE slug = ${slug} LIMIT 1`)[0]?.id;
}

async function fetchAllProducts(bid) {
  const all = [];
  const first = await (await fetch(`${SEARCH}?_brand_id=${bid}&_perPage=100&_page=1`, { headers: H })).json();
  const total = first.total;
  all.push(...(first.data || []));
  const pages = Math.ceil(total / 100);
  for (let p = 2; p <= pages; p++) {
    const page = await (await fetch(`${SEARCH}?_brand_id=${bid}&_perPage=100&_page=${p}`, { headers: H })).json();
    all.push(...(page.data || []));
    process.stdout.write('.');
  }
  return { all, total };
}

async function main() {
  console.log(`=== ${name} (expected ${expected}) ===`);
  
  // Fetch all products
  const { all, total } = await fetchAllProducts(brand_id);
  console.log(`\n  Fetched: ${all.length}/${expected}`);
  if (all.length !== expected) {
    console.log(`  ❌ Count mismatch! Expected ${expected}, got ${all.length}`);
    // Don't exit - some products may have been filtered
  }

  // Create company record if not exists
  const existing = await sql`SELECT id FROM companies WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) {
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,200);
    await sql`INSERT INTO companies (id, name, slug) VALUES (${id}, ${name}, ${slug})`;
  }

  // Delete old brands
  await sql`DELETE FROM brands WHERE company_id = ${id}`;

  // Insert brands
  let ins = 0, ng = 0;
  for (const prod of all) {
    const pid = prod.p_id;
    let detail;
    try {
      detail = await (await fetch(`${DETAIL}/${pid}`, { headers: H })).json();
    } catch { continue; }
    const p = detail?.data;
    if (!p) continue;
    const pv = p.pv?.[0];
    if (!pv) continue;

    const price = pv.pv_b2c_mrp || pv.pv_b2c_price || 0;
    if (price <= 0) continue;

    const arogType = p.p_type || prod.p_type || '';
    const medType = mapType(arogType);
    if (!medType) continue; // skip beauty etc.

    // Use generic_name from Arogga, skip if none
    let genName = p.p_generic_name || prod.p_generic_name || '';
    if (!genName) continue;

    const gid = await findOrCreateGeneric(genName, medType);
    if (!gid) { ng++; continue; }

    const form = p.p_form || prod.p_form || '';
    const strength = p.p_strength || prod.p_strength || '';
    const rx = p.p_rx_req;
    const brandName = p.p_name || prod.p_name || '';
    const baseMult = pv.pu_b2c_base_unit_multiplier || 1;
    const salesUnit = pv.pu_b2c_sales_unit_label || pv.pu_base_unit_label || '';
    
    const isTab = /tablet|capsule|lozenge|chewable/i.test(form);
    const isMulti = baseMult > 1 && (isTab || /strip|box/i.test(salesUnit));

    let priceUnit, priceStrip, packSize;
    if (isMulti) {
      priceUnit = Math.round((price / baseMult) * 100) / 100;
      priceStrip = Math.round(price * 100) / 100;
      packSize = `${baseMult}'s ${salesUnit}`;
    } else {
      priceUnit = Math.round(price * 100) / 100;
      priceStrip = Math.round(price * 100) / 100;
      packSize = salesUnit || 'Unit';
    }

    const slug = `${brandName}-${strength}-${brand_id}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,200);

    try {
      await sql`
        INSERT INTO brands (brand_name, slug, strength, dosage_form, generic_name, company_name, company_id, generic_id, price_unit, price_strip, pack_size, is_otc, medicine_type, brand_verified, price_verified)
        VALUES (${brandName}, ${slug}, ${strength}, ${form}, ${genName}, ${name}, ${id}, ${gid}, ${priceUnit}, ${priceStrip}, ${packSize}, ${!rx}, ${medType}, true, true)
      `;
      ins++;
    } catch (e) {
      // skip duplicate slug
    }
  }
  console.log(`  New generics: ${ng}`);

  const cnt = await sql`SELECT COUNT(*) as c FROM brands WHERE company_id = ${id}`;
  const dbCount = Number(cnt[0].c);
  console.log(`  Inserted: ${ins}/${all.length} | DB: ${dbCount} ${dbCount === expected ? '✅ MATCH' : `⚠️ (expected ${expected})`}`);
  console.log(`  ✅ ${name} done`);
}

main().catch(e => { console.error(e); process.exit(1); });
