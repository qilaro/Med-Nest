import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_2hDat9wGjHJg@ep-icy-firefly-ao53vvur.c-2.ap-southeast-1.aws.neon.tech/mednest?sslmode=require";
const sql = neon(DB_URL.replace(/-pooler\./g, '.').split('?')[0]);
const BASE = "http://api.medeasy.health/api/patient/manufacturers/incepta-pharmaceuticals-ltd";

async function fetchPage(page) {
  const r = await fetch(`${BASE}/?page=${page}`);
  const d = await r.json();
  return d.results.all_products || [];
}

async function fetchAll() {
  const all = [];
  const f = await fetch(`${BASE}/?page=1`);
  const fd = await f.json();
  const pages = Math.ceil(fd.count / (fd.results.all_products?.length || 20));
  console.log(`Total: ${fd.count} products, ${pages} pages`);
  all.push(...(fd.results.all_products || []));
  for (let p = 2; p <= pages; p++) {
    all.push(...(await fetchPage(p)));
    if (p % 20 === 0) console.log(`Page ${p}/${pages}`);
    await new Promise(r => setTimeout(r, 100));
  }
  return all;
}

function getPrice(prices) {
  if (!prices?.length) return null;
  const s = prices.find(p => p.unit?.toLowerCase().includes('strip')) || prices[0];
  return s?.unit_size > 0 ? { u: Math.round((s.price / s.unit_size) * 100) / 100, sp: s.price, ss: s.unit_size } : null;
}

console.log("Fetching...");
const products = await fetchAll();
console.log(`Got ${products.length} products`);

let ok = 0, miss = 0;
for (const p of products) {
  const pr = getPrice(p.unit_prices);
  if (!pr) continue;
  const rows = await sql`SELECT id, price_unit FROM brands WHERE brand_name ILIKE ${p.medicine_name} AND strength ILIKE ${p.strength} AND company_name ILIKE '%incepta%'`;
  if (rows.length === 0) { miss++; continue; }
  await sql`UPDATE brands SET price_unit = ${pr.u}, price_strip = ${pr.sp}, brand_verified = true WHERE id = ${rows[0].id}`;
  console.log(`${p.medicine_name} ${p.strength}: ৳${rows[0].price_unit||'?'} → ৳${pr.u}`);
  ok++;
}
console.log(`\nUpdated: ${ok}, Missed: ${miss}`);
