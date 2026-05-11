import * as fs from 'fs';
import { db } from '../lib/db';
import { brands, generics } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

function norm(s: string): string { return (s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }
function normCo(s: string) { return norm(s).replace(/limited|ltd|pvt|plc|pharmaceuticals|pharma|lab|laboratories|industries|international|healthcare|inc|company|co|corp|corporation|enterprise|group|life.?science|bio.?pharma|formulations/gi,'').replace(/\.|\,/g,'').trim(); }

async function main() {
  const data = JSON.parse(fs.readFileSync('/home/xmm/Downloads/medex_generics(5).json','utf-8'));

  const allBrands = await db.select({
    brandName: brands.brandName, companyName: brands.companyName,
  }).from(brands).where(sql`medicine_type = 'Allopathic'`);

  const byBrandCo = new Map<string, any[]>(), byBrand = new Map<string, any[]>();
  for (const b of allBrands) {
    const k1 = norm(b.brandName) + '|' + normCo(b.companyName);
    if(!byBrandCo.has(k1)) byBrandCo.set(k1,[]); byBrandCo.get(k1)!.push(b);
    if(!byBrand.has(norm(b.brandName))) byBrand.set(norm(b.brandName),[]); byBrand.get(norm(b.brandName))!.push(b);
  }

  // Unmatched prices
  const unmatchedP = new Map<string, any>();
  for (const [key, value] of Object.entries(data)) {
    if (!key.endsWith('_prices') || !Array.isArray(value)) continue;
    for (const p of value) {
      if (!p.brand||!p.company||!p.unitPrice) continue;
      let co = p.company.replace(/\(Mfg\. by:\s*(.+?)\)/g, (_: string, g: string) => g).replace(/\.$/,'').trim();
      let cands = (byBrandCo.get(norm(p.brand)+'|'+normCo(co))||[]);
      if(!cands.length) cands = (byBrand.get(norm(p.brand))||[]);
      if(!cands.length) {
        const uk = p.brand+'|'+co;
        if(!unmatchedP.has(uk)) unmatchedP.set(uk, p);
      }
    }
  }

  // Unmatched generics
  const allGens = await db.select({ name: generics.name }).from(generics);
  const genSet = new Set(allGens.map(g=>g.name.toLowerCase().trim()));
  const unmatchedG: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key.endsWith('_prices') || typeof value !== 'object') continue;
    const info = value as any; if (!info.content||info.content.length<100) continue;
    let clean = (info.name||'').replace(/\s*\([^)]*\)\s*$/g,'').trim().toLowerCase();
    if(![...genSet].some(g=>g===clean||g.includes(clean)||clean.includes(g))) unmatchedG.push(clean);
  }

  const pArr = [...unmatchedP.values()].map((p:any) => `${p.brand},${p.company},${p.strength},${p.unitPrice}`);
  fs.writeFileSync('/home/xmm/Downloads/unmatched_prices.csv', 'Brand,Company,Strength,Price\n'+pArr.join('\n'));
  fs.writeFileSync('/home/xmm/Downloads/unmatched_generics.csv', 'Generic Name\n'+unmatchedG.join('\n'));
  console.log('Unmatched prices:', unmatchedP.size, '-> unmatched_prices.csv');
  console.log('Unmatched generics:', unmatchedG.length, '-> unmatched_generics.csv');
}
main().catch(console.error);
