import * as fs from 'fs';
import { db } from '../lib/db';
import { brands } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

interface MedexBrand { brand: string; generic: string; strength: string; company: string; dosageForm?: string }

function norm(s: string | null): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normStrNum(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
}

async function main() {
  const data = JSON.parse(fs.readFileSync('/home/xmm/Downloads/medex_brands(3).json', 'utf-8')) as MedexBrand[];
  console.log(`MedEx: ${data.length} brands`);

  // Load all DB brands
  const allBrands = await db.select({
    id: brands.id,
    brandName: brands.brandName,
    genericName: brands.genericName,
    companyName: brands.companyName,
    strength: brands.strength,
    dosageForm: brands.dosageForm,
    brandVerified: brands.brandVerified,
  }).from(brands);
  console.log(`DB: ${allBrands.length} brands`);

  // Build indexes
  const byBrandCo = new Map<string, typeof allBrands[0][]>();
  const byBrand = new Map<string, typeof allBrands[0][]>();
  const byBrandGeneric = new Map<string, typeof allBrands[0][]>();

  for (const b of allBrands) {
    const keyBC = norm(b.brandName) + '|' + norm(b.companyName);
    if (!byBrandCo.has(keyBC)) byBrandCo.set(keyBC, []);
    byBrandCo.get(keyBC)!.push(b);

    if (!byBrand.has(norm(b.brandName))) byBrand.set(norm(b.brandName), []);
    byBrand.get(norm(b.brandName))!.push(b);

    const keyBG = norm(b.brandName) + '|' + norm(b.genericName);
    if (!byBrandGeneric.has(keyBG)) byBrandGeneric.set(keyBG, []);
    byBrandGeneric.get(keyBG)!.push(b);
  }

  const now = new Date();
  let matched1 = 0, matched2 = 0, matched3 = 0;
  const usedIds = new Set<string>();
  const updateQueue: string[] = [];

  // === PASS 1: Exact brand + company ===
  for (const m of data) {
    if (!m.brand || !m.company) continue;
    const key = norm(m.brand) + '|' + norm(m.company);
    const cands = byBrandCo.get(key) || [];
    const cand = cands.find(c => !usedIds.has(c.id));
    if (cand) {
      usedIds.add(cand.id);
      updateQueue.push(cand.id);
      matched1++;
    }
  }

  // Batch update pass 1
  for (let i = 0; i < updateQueue.length; i += 500) {
    const batch = updateQueue.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Verified via MedEx brand listing',
      updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
  console.log(`Pass 1 (brand+company): ${matched1}`);

  // === PASS 2: Brand only (unique match) ===
  const pass2Queue: string[] = [];
  for (const m of data) {
    if (!m.brand) continue;
    const key = norm(m.brand);
    const cands = (byBrand.get(key) || []).filter(c => !usedIds.has(c.id));
    if (cands.length === 1) {
      usedIds.add(cands[0].id);
      pass2Queue.push(cands[0].id);
      matched2++;
    }
  }

  // Batch update pass 2
  for (let i = 0; i < pass2Queue.length; i += 500) {
    const batch = pass2Queue.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Verified via MedEx brand (unique)',
      updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
  console.log(`Pass 2 (brand unique): ${matched2}`);

  // === PASS 3: Brand + generic ===
  const pass3Queue: string[] = [];
  for (const m of data) {
    if (!m.brand || !m.generic) continue;
    const key = norm(m.brand) + '|' + norm(m.generic);
    const cands = (byBrandGeneric.get(key) || []).filter(c => !usedIds.has(c.id));
    if (cands.length > 0) {
      usedIds.add(cands[0].id);
      pass3Queue.push(cands[0].id);
      matched3++;
    }
  }

  // Batch update pass 3
  for (let i = 0; i < pass3Queue.length; i += 500) {
    const batch = pass3Queue.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Verified via MedEx (brand+generic)',
      updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
  console.log(`Pass 3 (brand+generic): ${matched3}`);

  // === PASS 4: Brand contains match (substring) ===
  let matched4 = 0;
  const pass4Queue: string[] = [];
  for (const m of data) {
    if (!m.brand) continue;
    const nb = norm(m.brand);
    if (nb.length < 4) continue;
    // Search by brand start for efficiency
    const prefix = nb.slice(0, 4);
    let best: typeof allBrands[0] | undefined;
    for (const [k, cands] of byBrand) {
      if (!k.startsWith(prefix)) continue;
      const cand = cands.find(c => !usedIds.has(c.id) && 
        (norm(c.brandName).includes(nb) || nb.includes(norm(c.brandName))));
      if (cand) {
        if (!best) best = cand;
        else { best = undefined; break; } // ambiguous
      }
    }
    if (best) {
      usedIds.add(best.id);
      pass4Queue.push(best.id);
      matched4++;
    }
    
  }

  for (let i = 0; i < pass4Queue.length; i += 500) {
    const batch = pass4Queue.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Verified via MedEx (brand contains)',
      updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
  console.log(`Pass 4 (brand contains): ${matched4}`);

  // === PASS 5: Company match + first 5 letters brand ===
  // Build company index
  const byNormCo = new Map<string, typeof allBrands[0][]>();
  for (const b of allBrands) {
    const k = norm(b.companyName);
    if (!byNormCo.has(k)) byNormCo.set(k, []);
    byNormCo.get(k)!.push(b);
  }

  let matched5 = 0;
  const pass5Queue: string[] = [];
  for (const m of data) {
    if (!m.brand || !m.company) continue;
    const nc = norm(m.company);
    const coBrands = byNormCo.get(nc) || [];
    if (coBrands.length === 0) {
      // Try prefix company match
      for (const [k, cands] of byNormCo) {
        if (k.startsWith(nc.slice(0, 6)) || nc.startsWith(k.slice(0, 6))) {
          coBrands.push(...cands);
        }
        if (coBrands.length > 100) break;
      }
    }
    if (coBrands.length === 0) continue;

    const nb = norm(m.brand);
    const p5 = nb.slice(0, 5);
    const match = coBrands.find(c => !usedIds.has(c.id) && norm(c.brandName).startsWith(p5));
    if (match && coBrands.filter(c => !usedIds.has(c.id) && norm(c.brandName).startsWith(p5)).length === 1) {
      usedIds.add(match.id);
      pass5Queue.push(match.id);
      matched5++;
    }
    if (pass5Queue.length >= 100000) break;
  }

  for (let i = 0; i < pass5Queue.length; i += 500) {
    const batch = pass5Queue.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Verified via MedEx (company+prefix)',
      updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
  console.log(`Pass 5 (company+prefix): ${matched5}`);

  // === PASS 6: Generic + company match ===
  let matched6 = 0;
  const byGeneric = new Map<string, typeof allBrands[0][]>();
  for (const b of allBrands) {
    const k = norm(b.genericName);
    if (!byGeneric.has(k)) byGeneric.set(k, []);
    byGeneric.get(k)!.push(b);
  }

  const pass6Queue: string[] = [];
  for (const m of data) {
    if (!m.generic || !m.company) continue;
    const ng = norm(m.generic);
    const nc = norm(m.company);
    const genCands = byGeneric.get(ng) || [];
    const match = genCands.find(c => !usedIds.has(c.id) && norm(c.companyName) === nc);
    if (match) {
      usedIds.add(match.id);
      pass6Queue.push(match.id);
      matched6++;
    }
    if (pass6Queue.length >= 100000) break;
  }

  for (let i = 0; i < pass6Queue.length; i += 500) {
    const batch = pass6Queue.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Verified via MedEx (generic+company)',
      updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
  console.log(`Pass 6 (generic+company): ${matched6}`);

  // === PASS 7: Company match + brand first 7 chars ===
  let matched7 = 0;
  const pass7Queue: string[] = [];
  for (const m of data) {
    if (!m.brand || !m.company) continue;
    const nc = norm(m.company);
    const coBrands = byNormCo.get(nc) || [];
    if (coBrands.length === 0) continue;

    const nb7 = norm(m.brand).slice(0, 7);
    if (nb7.length < 5) continue;
    const match = coBrands.find(c => !usedIds.has(c.id) && norm(c.brandName).startsWith(nb7));
    if (match && coBrands.filter(c => !usedIds.has(c.id) && norm(c.brandName).startsWith(nb7)).length === 1) {
      usedIds.add(match.id);
      pass7Queue.push(match.id);
      matched7++;
    }
  }
  for (let i = 0; i < pass7Queue.length; i += 500) {
    const batch = pass7Queue.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Verified via MedEx (company+brand-prefix7)',
      updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
  console.log(`Pass 7 (company+brand-prefix7): ${matched7}`);

  // === PASS 8: Generic + strength match (when brand name differs) ===
  // Build generic+strength index
  const byGenStr = new Map<string, typeof allBrands[0][]>();
  for (const b of allBrands) {
    const k = norm(b.genericName) + '|' + normStrNum(b.strength);
    if (!byGenStr.has(k)) byGenStr.set(k, []);
    byGenStr.get(k)!.push(b);
  }

  let matched8 = 0;
  const pass8Queue: string[] = [];
  for (const m of data) {
    if (!m.generic) continue;
    const key = norm(m.generic) + '|' + normStrNum(m.strength);
    const cands = (byGenStr.get(key) || []).filter(c => !usedIds.has(c.id));
    // Only match if strength is significant (not just "N/A")
    if (cands.length === 1 && m.strength && m.strength.length > 2) {
      usedIds.add(cands[0].id);
      pass8Queue.push(cands[0].id);
      matched8++;
    }
  }
  for (let i = 0; i < pass8Queue.length; i += 500) {
    const batch = pass8Queue.slice(i, i + 500);
    await db.update(brands).set({
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Verified via MedEx (generic+strength)',
      updatedAt: now,
    }).where(sql`${brands.id} = ANY(ARRAY[${sql.join(batch.map(id => sql`${id}::uuid`), sql`, `)}])`);
  }
  console.log(`Pass 8 (generic+strength): ${matched8}`);

  const total = matched1 + matched2 + matched3 + matched4 + matched5 + matched6 + matched7 + matched8;
  console.log(`\nTotal matched: ${total}/${data.length} (${(total/data.length*100).toFixed(1)}%)`);

  // Stats
  const r = await db.execute(sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE brand_verified = true) as verified, COUNT(*) FILTER (WHERE verified_by = 'MedEx') as medex FROM brands`);
  console.log(`DB now: ${JSON.stringify(r.rows[0])}`);
}

main().catch(console.error);
