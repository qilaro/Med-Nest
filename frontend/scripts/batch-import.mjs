// Batch import companies from MedEasy
import { neon } from '@neondatabase/serverless';
const DB_URL = "postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require";
const sql = neon(DB_URL);

const companies = [
  // Already cleaned before staging - re-import
  { id: '9014cad0-9b23-4952-b457-32c99131c127', name: 'Incepta Pharmaceuticals Ltd.', api: 'incepta-pharmaceuticals-ltd', expected: 1196 },
  { id: '8a1b79db-ae73-4ee7-bafd-89b6711bec16', name: 'Square Pharmaceuticals PLC', api: 'square-pharmaceuticals-plc', expected: 998 },
  { id: '4f5520d3-c951-4df7-bbd6-3f5859191d90', name: 'Opsonin Pharma Ltd.', api: 'opsonin-pharma-ltd', expected: 880 },
  // New ones to process
  { id: null, name: 'Renata Limited', api: 'renata-limited', slug: 'renata-limited' },
  { id: null, name: 'Drug International Ltd.', api: 'drug-international-ltd', slug: 'drug-international-ltd' },
  { id: null, name: 'Healthcare Pharmaceuticals Ltd.', api: 'healthcare-pharmaceuticals-ltd', slug: 'healthcare-pharmaceuticals-ltd' },
  { id: null, name: 'ACME Laboratories Ltd.', api: 'acme-laboratories-ltd', slug: 'acme-laboratories-ltd' },
  { id: null, name: 'Eskayef Bangladesh Ltd.', api: 'eskayef-bangladesh-ltd', slug: 'eskayef-bangladesh-ltd' },
  { id: null, name: 'Beximco Pharmaceuticals Ltd.', api: 'beximco-pharmaceuticals-ltd', slug: 'beximco-pharmaceuticals-ltd' },
  { id: null, name: 'Aristopharma Ltd.', api: 'aristopharma-ltd', slug: 'aristopharma-ltd' },
  { id: null, name: 'ACI Limited', api: 'aci-limited', slug: 'aci-limited' },
  { id: null, name: 'Ibn Sina Pharmaceuticals Ltd.', api: 'ibn-sina-pharmaceuticals-ltd', slug: 'ibn-sina-pharmaceuticals-ltd' },
  { id: null, name: 'Beacon Pharmaceuticals PLC', api: 'beacon-pharmaceuticals-plc', slug: 'beacon-pharmaceuticals-plc' },
];

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

async function importCompany(c) {
  // Find company ID if not provided
  if (!c.id) {
    const row = await sql`SELECT id FROM companies WHERE slug = ${c.slug} OR LOWER(name) = LOWER(${c.name}) LIMIT 1`;
    if (row.length === 0) {
      console.log(`  ✗ COMPANY NOT FOUND: ${c.name}`);
      return;
    }
    c.id = row[0].id;
  }

  console.log(`\n=== Processing ${c.name} ===`);
  
  // Fetch from MedEasy
  const all = [];
  const p1 = await (await fetch(`https://api.medeasy.health/api/patient/manufacturers/${c.api}/?page=1`)).json();
  const pages = Math.ceil(p1.count / (p1.results.all_products?.length || 20));
  all.push(...(p1.results.all_products || []));
  for (let p = 2; p <= pages; p++) {
    all.push(...((await (await fetch(`https://api.medeasy.health/api/patient/manufacturers/${c.api}/?page=${p}`)).json()).results.all_products || []));
    process.stdout.write('.');
  }
  console.log(`\n  MedEasy has: ${all.length} products (expected ${c.expected})`);
  
  if (all.length !== c.expected) {
    console.log(`  ⚠️ COUNT MISMATCH! Expected ${c.expected}, got ${all.length}`);
  }

  // Create missing generics
  let ng = 0;
  for (const p of all) {
    if (!p.generic_name) continue;
    const e = await sql`SELECT id FROM generics WHERE LOWER(name) = LOWER(${p.generic_name}) LIMIT 1`;
    if (e.length === 0) {
      let s = p.generic_name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').substring(0,200);
      if ((await sql`SELECT id FROM generics WHERE slug = ${s} LIMIT 1`).length > 0) s += '-' + Date.now();
      await sql`INSERT INTO generics (name, slug, medicine_type) VALUES (${p.generic_name}, ${s}, 'Allopathic')`;
      ng++;
    }
  }
  console.log(`  New generics: ${ng}`);

  // Delete old brands for this company, insert fresh
  await sql`DELETE FROM brands WHERE company_id = ${c.id}`;

  let ins = 0, sk = 0;
  for (const p of all) {
    const pr = getPrice(p.unit_prices, isTab(p.category_name));
    if (!pr) { sk++; continue; }
    const gen = p.generic_name ? await sql`SELECT id FROM generics WHERE LOWER(name) = LOWER(${p.generic_name}) LIMIT 1` : [];
    if (gen.length === 0) { sk++; continue; }
    const slug = `${p.medicine_name}-${p.strength}-${c.api}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,200);
    await sql`INSERT INTO brands (brand_name, slug, strength, dosage_form, generic_name, company_name, company_id, generic_id, price_unit, price_strip, pack_size, is_otc, medicine_type, brand_verified, price_verified) VALUES (${p.medicine_name}, ${slug}, ${p.strength}, ${p.category_name}, ${p.generic_name}, ${c.name}, ${c.id}, ${gen[0].id}, ${pr.u}, ${pr.sp}, ${pr.ps}, ${!p.rx_required}, 'Allopathic', true, true)`;
    ins++;
  }

  const t = await sql`SELECT COUNT(*) as cnt FROM brands WHERE company_id = ${c.id}`;
  console.log(`  Inserted: ${ins}/${all.length} | DB now has: ${t[0].cnt} | Skipped: ${sk}`);
  
  if (t[0].cnt !== c.expected) {
    console.log(`  ⚠️ DB COUNT ${t[0].cnt} ≠ EXPECTED ${c.expected}`);
  } else {
    console.log(`  ✅ MATCH!`);
  }
}

async function main() {
  for (const c of companies) {
    await importCompany(c);
  }
  console.log('\n=== ALL DONE ===');
}

main().catch(e => { console.error(e); process.exit(1); });
