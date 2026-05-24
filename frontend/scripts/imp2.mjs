import { neon } from '@neondatabase/serverless';
const DB_URL = "postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require";
const sql = neon(DB_URL);
const BASE = "https://api.medeasy.health/api/patient/manufacturers";

const [co] = process.argv.slice(2);
if (!co) { console.log("Usage: npx tsx imp2.mjs <json>"); process.exit(1); }

const { id, name, slug, expected, extraIds } = JSON.parse(co);

function getPrice(prices, isTab) {
  if (!prices?.length) return null;
  let e = isTab ? prices.find(u => u.unit?.toLowerCase().includes('strip')) : null;
  if (!e) e = prices[0];
  if (!e?.unit_size || e.unit_size <= 0) return null;
  return { u: Math.round((e.price / e.unit_size) * 100) / 100, sp: e.price, ps: e.unit };
}
function isTab(cat) {
  if (!cat) return false;
  const c = cat.toLowerCase();
  return c.includes('tablet') || c.includes('capsule') || c.includes('lozenge') || c.includes('chewable');
}

async function main() {
  console.log(`=== ${name} (${expected}) ===`);
  const all = [];
  const p1 = await (await fetch(`${BASE}/${slug}/?page=1`)).json();
  const pages = Math.ceil(p1.count / (p1.results.all_products?.length || 20));
  all.push(...(p1.results.all_products || []));
  for (let p = 2; p <= pages; p++) {
    all.push(...((await (await fetch(`${BASE}/${slug}/?page=${p}`)).json()).results.all_products || []));
    process.stdout.write('.');
  }
  console.log(`\n  Fetched: ${all.length}/${expected}`);
  if (all.length !== expected) { console.log(`  ❌ Count mismatch!`); process.exit(1); }

  let ng = 0;
  for (const prod of all) {
    if (!prod.generic_name) continue;
    const e = await sql`SELECT id FROM generics WHERE LOWER(name) = LOWER(${prod.generic_name}) LIMIT 1`;
    if (e.length === 0) {
      let s = prod.generic_name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').substring(0,200);
      if ((await sql`SELECT id FROM generics WHERE slug = ${s} LIMIT 1`).length > 0) s += '-' + Date.now();
      await sql`INSERT INTO generics (name, slug, medicine_type) VALUES (${prod.generic_name}, ${s}, 'Allopathic')`;
      ng++;
    }
  }
  console.log(`  New generics: ${ng}`);

  // Delete old brands for this company + divisions
  if (extraIds?.length) {
    await sql`DELETE FROM brands WHERE company_id = ANY(${[id, ...extraIds]}::uuid[])`;
  } else {
    await sql`DELETE FROM brands WHERE company_id = ${id}`;
  }

  let ins = 0;
  for (const prod of all) {
    const pr = getPrice(prod.unit_prices, isTab(prod.category_name));
    if (!pr) continue;
    const gen = prod.generic_name ? await sql`SELECT id FROM generics WHERE LOWER(name) = LOWER(${prod.generic_name}) LIMIT 1` : [];
    if (gen.length === 0) continue;
    const s2 = `${prod.medicine_name}-${prod.strength}-${slug}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,200);
    await sql`INSERT INTO brands (brand_name, slug, strength, dosage_form, generic_name, company_name, company_id, generic_id, price_unit, price_strip, pack_size, is_otc, medicine_type, brand_verified, price_verified) VALUES (${prod.medicine_name}, ${s2}, ${prod.strength}, ${prod.category_name}, ${prod.generic_name}, ${name}, ${id}, ${gen[0].id}, ${pr.u}, ${pr.sp}, ${pr.ps}, ${!prod.rx_required}, 'Allopathic', true, true)`;
    ins++;
  }
  
  const cnt = await sql`SELECT COUNT(*) as c FROM brands WHERE company_id = ${id}`;
  console.log(`  Inserted: ${ins}/${all.length} | DB: ${cnt[0].c} ${Number(cnt[0].c) === expected ? '✅ MATCH' : '⚠️ WARNING'}`);

  if (extraIds?.length) {
    await sql`DELETE FROM companies WHERE id = ANY(${extraIds}::uuid[])`;
    console.log(`  Deleted ${extraIds.length} division company records`);
  }
  console.log(`  ✅ ${name} done`);
}

main().catch(e => { console.error(e); process.exit(1); });
