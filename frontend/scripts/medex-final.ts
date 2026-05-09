import * as fs from 'fs';
import { db } from '../lib/db';
import { brands, generics, companies } from '../lib/db/schema';
import { sql, eq, inArray } from 'drizzle-orm';
import * as crypto from 'crypto';

interface MedexBrand { brand: string; generic: string; strength: string; company: string; dosageForm?: string }

function norm(s: string | null): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normStrNum(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
}

function slugify(t: string): string {
  let s = t.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length > 200) { s = s.slice(0, 200) + '-' + crypto.createHash('md5').update(s).digest('hex').slice(0, 6); }
  return s;
}

async function batchUpdate(ids: string[], method: string, now: Date) {
  if (!ids.length) return;
  for (let i = 0; i < ids.length; i += 500) {
    const batch = ids.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: `Verified via MedEx (${method})`, updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
}

async function main() {
  const data = JSON.parse(fs.readFileSync('/home/xmm/Downloads/medex_brands(3).json', 'utf-8')) as MedexBrand[];
  console.log(`MedEx: ${data.length} brands`);

  const allBrands = await db.select({
    id: brands.id, brandName: brands.brandName, genericName: brands.genericName,
    companyName: brands.companyName, strength: brands.strength, dosageForm: brands.dosageForm,
  }).from(brands);
  console.log(`DB: ${allBrands.length} brands`);

  const byBrandCo = new Map<string, typeof allBrands[0][]>();
  const byBrand = new Map<string, typeof allBrands[0][]>();
  const byBrandGeneric = new Map<string, typeof allBrands[0][]>();
  const byPrefix5 = new Map<string, typeof allBrands[0][]>();
  const byGenStr = new Map<string, typeof allBrands[0][]>();
  const byNormCo = new Map<string, typeof allBrands[0][]>();
  const byGeneric = new Map<string, typeof allBrands[0][]>();
  const byGenericCo = new Map<string, typeof allBrands[0][]>();

  for (const b of allBrands) {
    const nb = norm(b.brandName), nc = norm(b.companyName);
    const kbc = nb + '|' + nc;
    if (!byBrandCo.has(kbc)) byBrandCo.set(kbc, []);
    byBrandCo.get(kbc)!.push(b);
    if (!byBrand.has(nb)) byBrand.set(nb, []);
    byBrand.get(nb)!.push(b);
    const kbg = nb + '|' + norm(b.genericName);
    if (!byBrandGeneric.has(kbg)) byBrandGeneric.set(kbg, []);
    byBrandGeneric.get(kbg)!.push(b);
    const p5 = nb.slice(0, 5);
    if (p5.length >= 5) { if (!byPrefix5.has(p5)) byPrefix5.set(p5, []); byPrefix5.get(p5)!.push(b); }
    const kgs = norm(b.genericName) + '|' + normStrNum(b.strength);
    if (!byGenStr.has(kgs)) byGenStr.set(kgs, []); byGenStr.get(kgs)!.push(b);
    if (!byNormCo.has(nc)) byNormCo.set(nc, []); byNormCo.get(nc)!.push(b);
    const ng = norm(b.genericName);
    if (!byGeneric.has(ng)) byGeneric.set(ng, []); byGeneric.get(ng)!.push(b);
    const kgc = ng + '|' + nc;
    if (!byGenericCo.has(kgc)) byGenericCo.set(kgc, []); byGenericCo.get(kgc)!.push(b);
  }

  const now = new Date();
  const usedIds = new Set<string>();
  const medexDone = new Set<number>();

  function isUnmatched(idx: number): boolean { return !medexDone.has(idx); }

  function findCands(key: string, index: Map<string, typeof allBrands[0][]>): typeof allBrands[0][] {
    return (index.get(key) || []).filter(c => !usedIds.has(c.id));
  }

  function best(cands: typeof allBrands[0][]): typeof allBrands[0] | undefined {
    return cands[0];
  }

  // Pass 1: exact brand+company
  let q1: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i];
    if (!isUnmatched(i) || !m.brand || !m.company) continue;
    const c = best(findCands(norm(m.brand) + '|' + norm(m.company), byBrandCo));
    if (c) { usedIds.add(c.id); q1.push(c.id); medexDone.add(i); }
  }
  await batchUpdate(q1, 'brand+co', now);
  console.log(`P1(brand+co): ${q1.length}`);

  // Pass 2: brand exact
  let q2: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i];
    if (!isUnmatched(i) || !m.brand) continue;
    const c = best(findCands(norm(m.brand), byBrand));
    if (c) { usedIds.add(c.id); q2.push(c.id); medexDone.add(i); }
  }
  await batchUpdate(q2, 'brand-exact', now);
  console.log(`P2(brand-exact): ${q2.length}`);

  // Pass 3: brand+generic
  let q3: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i];
    if (!isUnmatched(i) || !m.brand || !m.generic) continue;
    const c = best(findCands(norm(m.brand) + '|' + norm(m.generic), byBrandGeneric));
    if (c) { usedIds.add(c.id); q3.push(c.id); medexDone.add(i); }
  }
  await batchUpdate(q3, 'brand+gen', now);
  console.log(`P3(brand+gen): ${q3.length}`);

  // Pass 4: company + brand prefix 6
  let q4: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i];
    if (!isUnmatched(i) || !m.brand || !m.company) continue;
    const nb = norm(m.brand), nc = norm(m.company);
    const coBrands = findCands(nc, byNormCo);
    if (!coBrands.length) continue;
    const p6 = nb.slice(0, 6);
    if (p6.length < 6) continue;
    const match = best(coBrands.filter(c => norm(c.brandName).startsWith(p6)));
    if (match) { usedIds.add(match.id); q4.push(match.id); medexDone.add(i); }
  }
  await batchUpdate(q4, 'co+prefix6', now);
  console.log(`P4(co+prefix6): ${q4.length}`);

  // Pass 5: generic+company
  let q5: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i];
    if (!isUnmatched(i) || !m.generic || !m.company) continue;
    const c = best(findCands(norm(m.generic) + '|' + norm(m.company), byGenericCo));
    if (c) { usedIds.add(c.id); q5.push(c.id); medexDone.add(i); }
  }
  await batchUpdate(q5, 'gen+co', now);
  console.log(`P5(gen+co): ${q5.length}`);

  // Pass 6: generic + strength
  let q6: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i];
    if (!isUnmatched(i) || !m.generic || !m.strength || m.strength.length < 2) continue;
    const c = best(findCands(norm(m.generic) + '|' + normStrNum(m.strength), byGenStr));
    if (c) { usedIds.add(c.id); q6.push(c.id); medexDone.add(i); }
  }
  await batchUpdate(q6, 'gen+str', now);
  console.log(`P6(gen+str): ${q6.length}`);

  // Pass 8: generic match (brand name as generic)
  let q8: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i];
    if (!isUnmatched(i) || !m.brand || m.brand.length > 50) continue;
    const nb = norm(m.brand);
    if (nb.length < 4) continue;
    const c = best(findCands(nb, byGeneric));
    if (c) { usedIds.add(c.id); q8.push(c.id); medexDone.add(i); continue; }
    if (m.company) {
      const c2 = best(findCands(nb + '|' + norm(m.company), byGenericCo));
      if (c2) { usedIds.add(c2.id); q8.push(c2.id); medexDone.add(i); }
    }
  }
  await batchUpdate(q8, 'brand-as-gen', now);
  console.log(`P8(brand-as-gen): ${q8.length}`);

  console.log(`\nTotal matched: ${total}/${data.length} (${(total/data.length*100).toFixed(1)}%)`);

  // Unmatched — entries not in medexDone
  const unmatched: MedexBrand[] = [];
  const seenK = new Set<string>();
  for (let i = 0; i < data.length; i++) {
    if (medexDone.has(i)) continue;
    const m = data[i];
    if (!m.brand) continue;
    const k = norm(m.brand) + '|' + norm(m.company || '') + '|' + normStrNum(m.strength);
    if (seenK.has(k)) continue;
    seenK.add(k);
    unmatched.push(m);
  }
  console.log(`Unmatched to insert: ${unmatched.length}`);

  if (unmatched.length === 0) {
    const r = await db.execute(sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE brand_verified = true) as verified, COUNT(*) FILTER (WHERE price_unit IS NOT NULL) as priced FROM brands`);
    console.log(`DB: ${JSON.stringify(r.rows[0])}`);
    return;
  }

  // Insert unmatched as new brands
  const existingCos = new Map((await db.select({ name: companies.name, id: companies.id }).from(companies)).map(c => [c.name, c.id]));
  const existingGens = new Map((await db.select({ name: generics.name, id: generics.id }).from(generics)).map(g => [g.name.toLowerCase().trim(), g.id]));

  const coNames = [...new Set(unmatched.map(m => m.company).filter(Boolean))];
  const genNames = [...new Set(unmatched.map(m => m.generic).filter(Boolean))];

  let newCo = 0, newGen = 0;
  for (const name of coNames) {
    if (!existingCos.has(name)) {
      const ins = await db.insert(companies).values({ name, slug: slugify(name) }).returning({ id: companies.id });
      existingCos.set(name, ins[0].id); newCo++;
    }
  }
  for (const name of genNames) {
    const low = name.toLowerCase().trim();
    if (!existingGens.has(low)) {
      try {
        const ins = await db.insert(generics).values({ name, slug: slugify(name) }).returning({ id: generics.id });
        existingGens.set(low, ins[0].id); newGen++;
      } catch {
        const slug = slugify(name) + '-' + crypto.createHash('md5').update(name).digest('hex').slice(0, 6);
        const ins = await db.insert(generics).values({ name, slug }).returning({ id: generics.id });
        existingGens.set(low, ins[0].id); newGen++;
      }
    }
  }
  console.log(`  Companies: ${newCo} new, Generics: ${newGen} new`);

  // Check existing slugs to avoid duplicates
  const existingSlugs = new Set((await db.select({ slug: brands.slug }).from(brands)).map(b => b.slug));

  let inserted = 0;
  const batch: any[] = [];
  for (const m of unmatched) {
    const companyName = (m.company || '').trim();
    const genericName = (m.generic || '').trim();
    const brandName = (m.brand || '').trim();
    if (!brandName || !companyName || !genericName) continue;
    const companyId = existingCos.get(companyName);
    const genericId = existingGens.get(genericName.toLowerCase().trim());
    if (!companyId || !genericId) continue;

    const slug = slugify(brandName + '-' + companyName.slice(0, 30));
    if (existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);

    batch.push({
      brandName, slug, genericId, companyId,
      strength: (m.strength || '').trim() || 'N/A',
      dosageForm: (m.dosageForm || '').trim() || 'N/A',
      genericName, companyName,
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Imported from MedEx brand listing',
    });

    if (batch.length >= 500) {
      await db.insert(brands).values(batch);
      inserted += batch.length;
      batch.length = 0;
    }
  }
  if (batch.length > 0) { await db.insert(brands).values(batch); inserted += batch.length; }
  console.log(`  New brands inserted: ${inserted}`);

  const r = await db.execute(sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE brand_verified = true) as verified, COUNT(*) FILTER (WHERE price_unit IS NOT NULL) as priced FROM brands`);
  console.log(`\nDB final: ${JSON.stringify(r.rows[0])}`);
}

main().catch(console.error);
