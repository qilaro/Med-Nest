import * as fs from 'fs';
import { db } from '../lib/db';
import { brands } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

interface EphEntry { rawName: string; price: number; brand: string; strength: string; form: string }

function norm(s: string | null): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseEpharmaName(name: string): { brand: string; strength: string; form: string } {
  let n = name.replace(/\|.*$/, '').replace(/\s*\([^)]*\)\s*$/, '').trim();

  const forms = ['Tablet', 'Capsule', 'Injection', 'Syrup', 'Suspension', 'Cream', 'Ointment',
    'Gel', 'Drops', 'Drop', 'Shampoo', 'Lotion', 'Spray', 'Powder', 'Suppository',
    'Solution', 'Nasal', 'Ophthalmic', 'Otic', 'Lozenge', 'Granules', 'Granule',
    'Inhaler', 'Inhalation', 'Nebuliser', 'Soap', 'Oil', 'Paste', 'Mouthwash', 'Gargle',
    'Emulsion', 'Elixir', 'Liniment', 'Tincture', 'Pessary', 'Vaginal'];

  // Token-based: split into words, classify each
  const tokens = n.split(/\s+/);
  let strength = '', form = '';
  const brandTokens: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    // Check if it's a strength pattern (with unit)
    const strMatch = t.match(/^(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|l|%|IU|unit|mcg\/ml|mg\/ml|mg\/5ml|mcg\/dose))\s*$/i);
    if (strMatch) {
      strength = strMatch[1].toLowerCase().replace(/gm\b/i, 'g');
      continue;
    }
    // Check if it's a form
    const isForm = forms.some(f => t.toLowerCase() === f.toLowerCase());
    if (isForm) {
      form = t;
      continue;
    }
    // Check if it's just a number (strength without unit, like "500" in "Fixcef 500")
    if (/^\d+(\.\d+)?$/.test(t) && i > 0) {
      strength = t;
      continue;
    }
    // Check if it's a pack size like "30pcs", "10's", "15ml", "20g" (at or near end)
    if (i === tokens.length - 1 && /^\d+\s*(pcs|'s)s?$/i.test(t)) continue;
    // Skip packaging words
    if (i === tokens.length - 1 && /^(Tube|Box|Strip|Pack|Vial|Ampoule|PFS|Pre-filled)$/i.test(t)) continue;

    brandTokens.push(t);
  }

  // If no strength was found but a dosage form was, and there's a number next to brand
  if (!strength && form) {
    const lastBrand = brandTokens[brandTokens.length - 1];
    if (lastBrand && /^\d+$/.test(lastBrand)) {
      strength = lastBrand;
      brandTokens.pop();
    }
  }

  return { brand: brandTokens.join(' '), strength, form };
}

function stripPrefix(brand: string): string[] {
  // Remove common company prefixes like KP-, SMC-, ARI-, Novo-, etc.
  const variants = [brand];
  const m = brand.match(/^([A-Z]{2,5})-/);
  if (m) variants.push(brand.slice(m[0].length));
  // Also try removing first word if it's a short abbreviation
  const words = brand.split(/\s+/);
  if (words.length > 1 && words[0].length <= 4 && /^[A-Z0-9]+$/i.test(words[0])) {
    variants.push(words.slice(1).join(' '));
  }
  return variants;
}

function tokenOverlap(a: string, b: string): number {
  const at = new Set(a.toLowerCase().split(/\s+/));
  const bt = new Set(b.toLowerCase().split(/\s+/));
  let overlap = 0;
  for (const t of at) { if (bt.has(t)) overlap++; }
  return overlap / Math.max(at.size, bt.size);
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(i ? 0 : (i || 0)));
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

async function main() {
  const epharmaData = JSON.parse(fs.readFileSync('/home/xmm/Downloads/epharma.json', 'utf-8')) as { name: string; price: string }[];
  const skipRe = /^(MRP|Sign in|Sign up|Buy |Order |Blog|Home |Personal|0 Item|Baby|Accessor|Sexual|\d+%?\s*off)/i;
  const entries: EphEntry[] = [];
  const seen = new Set<string>();
  for (const item of epharmaData) {
    const name = item.name.trim();
    const price = parseInt(item.price) || 0;
    if (!name || price <= 0 || skipRe.test(name)) continue;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const { brand, strength, form } = parseEpharmaName(name);
    entries.push({ rawName: name, price, brand, strength, form });
  }
  console.log(`${entries.length} ePharma entries`);

  const allBrands = await db.select({
    id: brands.id, brandName: brands.brandName, companyName: brands.companyName,
    genericName: brands.genericName, strength: brands.strength, dosageForm: brands.dosageForm,
    priceUnit: brands.priceUnit,
  }).from(brands);

  console.log(`${allBrands.length} DB brands`);

  const now = new Date();

  // Get brands already priced from ePharma in prior run
  const alreadyPricedByEpharma = new Set(
    (await db.select({ id: brands.id }).from(brands).where(sql`verified_by = 'ePharma'`)).map(r => r.id)
  );
  console.log(`Already priced by ePharma: ${alreadyPricedByEpharma.size}`);

  // Build all needed indexes
  const byNormBrand = new Map<string, typeof allBrands>();
  const byNormGeneric = new Map<string, typeof allBrands>();
  const byNormCompany = new Map<string, typeof allBrands>();
  const byBrandFormStr = new Map<string, typeof allBrands>();
  const byGenericCo = new Map<string, typeof allBrands>();
  const byPrefix5 = new Map<string, typeof allBrands>();

  for (const b of allBrands) {
    const nb = norm(b.brandName);
    if (!byNormBrand.has(nb)) byNormBrand.set(nb, []);
    byNormBrand.get(nb)!.push(b);

    const ng = norm(b.genericName);
    if (!byNormGeneric.has(ng)) byNormGeneric.set(ng, []);
    byNormGeneric.get(ng)!.push(b);

    const nc = norm(b.companyName);
    if (!byNormCompany.has(nc)) byNormCompany.set(nc, []);
    byNormCompany.get(nc)!.push(b);

    const bfs = nb + '|' + norm(b.dosageForm) + '|' + norm(b.strength);
    if (!byBrandFormStr.has(bfs)) byBrandFormStr.set(bfs, []);
    byBrandFormStr.get(bfs)!.push(b);

    const gc = ng + '|' + nc;
    if (!byGenericCo.has(gc)) byGenericCo.set(gc, []);
    byGenericCo.get(gc)!.push(b);

    const p5 = nb.slice(0, 5);
    if (p5.length >= 5) {
      if (!byPrefix5.has(p5)) byPrefix5.set(p5, []);
      byPrefix5.get(p5)!.push(b);
    }
  }

  let totalUpdated = 0;
  const usedIds = new Set<string>(alreadyPricedByEpharma);
  const unmatched: { ep: EphEntry }[] = [];

  // Helper to try match+update
  async function tryUpdate(entry: EphEntry, candidate: typeof allBrands[0] | undefined, method: string): Promise<boolean> {
    if (!candidate) return false;
    if (usedIds.has(candidate.id)) return false;
    usedIds.add(candidate.id);
    await db.update(brands).set({
      priceUnit: entry.price.toString(), priceVerified: true,
      verifiedBy: 'ePharma', verifiedAt: now,
      verificationNotes: `Price via ePharma (${method})`,
      updatedAt: now,
    }).where(sql`${brands.id} = ${candidate.id}`);
    totalUpdated++;
    return true;
  }

  // Processes each ePharma entry
  for (const ep of entries) {
    const nb = norm(ep.brand);
    const nf = norm(ep.form);
    const ns = norm(ep.strength);

    // Strategy 1: Exact brand+form+strength
    const bfsKey = nb + '|' + nf + '|' + ns;
    if (byBrandFormStr.has(bfsKey)) {
      const cand = byBrandFormStr.get(bfsKey)!.find(c => !usedIds.has(c.id));
      if (await tryUpdate(ep, cand, 'exact-bfs')) continue;
    }

    // Strategy 2: Exact brand name (single match)
    const brandCands = (byNormBrand.get(nb) || []).filter(c => !usedIds.has(c.id));
    if (brandCands.length === 1 && await tryUpdate(ep, brandCands[0], 'exact-brand')) continue;

    // Strategy 3: Brand + form (without strength)
    if (nf && brandCands.length > 0) {
      const formMatch = brandCands.filter(c => norm(c.dosageForm) === nf);
      if (formMatch.length === 1 && await tryUpdate(ep, formMatch[0], 'brand+form')) continue;
    }

    // Strategy 4: Generic name match (treat ePharma brand as generic)
    const genCands = byNormGeneric.get(nb) || [];
    if (genCands.length === 1 && norm(genCands[0].dosageForm) === nf) {
      if (await tryUpdate(ep, genCands[0], 'generic-exact')) continue;
    }

    // Strategy 5: Generic + company + form + strength (best match)
    // Try each generic candidate
    const genericCands = byNormGeneric.get(nb);
    if (genericCands && genericCands.length > 0) {
      for (const gc of genericCands) {
        if (usedIds.has(gc.id)) continue;
        const matchForm = !nf || norm(gc.dosageForm) === nf;
        const matchStr = !ns || norm(gc.strength).includes(ns) || ns.includes(norm(gc.strength));
        if (matchForm && matchStr) {
          if (await tryUpdate(ep, gc, 'generic+form+strength')) break;
        }
      }
      if (usedIds.has(genericCands.find(g => g.id === genericCands[0]?.id)?.id!)) continue;
    }

    // Strategy 6: Strip prefixes (KP-, SMC-, etc.) and retry brand match
    const altBrands = stripPrefix(ep.brand);
    let matchedViaPrefix = false;
    for (const alt of altBrands) {
      if (alt === ep.brand) continue;
      const altKey = norm(alt);
      const altCands = (byNormBrand.get(altKey) || []).filter(c => !usedIds.has(c.id));
      if (altCands.length === 1 && nf && norm(altCands[0].dosageForm) === nf) {
        if (await tryUpdate(ep, altCands[0], 'prefix-strip+form')) { matchedViaPrefix = true; break; }
      }
      if (altCands.length === 1 && await tryUpdate(ep, altCands[0], 'prefix-strip')) { matchedViaPrefix = true; break; }
    }
    if (matchedViaPrefix) continue;

    // Strategy 7: First 5 letters match + same form
    if (nb.length >= 5 && nf) {
      const p5 = nb.slice(0, 5);
      const pCands = (byPrefix5.get(p5) || []).filter(c => !usedIds.has(c.id) && norm(c.dosageForm) === nf);
      if (pCands.length === 1 && await tryUpdate(ep, pCands[0], 'prefix5+form')) continue;
    }

    // Strategy 8: Brand+strength numeric match (ignoring unit: "500" == "500 mg")
    if (ns && brandCands.length > 0) {
      const epNum = ns.replace(/[^0-9.]/g, '');
      if (epNum) {
        const numMatch = brandCands.find(c => {
          const dbNum = (c.strength || '').replace(/[^0-9.]/g, '');
          return epNum === dbNum;
        });
        if (numMatch && await tryUpdate(ep, numMatch, 'brand+strength-num')) continue;
      }
    }

    // Strategy 9: Try matching each word in ePharma brand as a standalone brand
    if (nb.length >= 6) {
      const words = nb.split(/\s+/);
      for (const w of words) {
        if (w.length < 3) continue;
        const wCands = (byNormBrand.get(w) || []).filter(c => !usedIds.has(c.id));
        if (wCands.length === 1 && nf && norm(wCands[0].dosageForm) === nf) {
          if (await tryUpdate(ep, wCands[0], 'word-match+form')) break;
        }
      }
      if (words.some(w => {
        const wCands = byNormBrand.get(w);
        return wCands && wCands.some(c => usedIds.has(c.id));
      })) continue;
    }

    // Collect unmatched for analysis (first 20)
    if (unmatched.length < 20) {
      unmatched.push({ ep });
    }
  }

  console.log(`\nUpdated this run: ${totalUpdated}`);

  // Show sample unmatched
  console.log(`\nSample unmatched (first 20):`);
  for (const u of unmatched) {
    console.log(`  "${u.ep.rawName}" [৳${u.ep.price}] → brand="${u.ep.brand}" str="${u.ep.strength}" form="${u.ep.form}"`);
  }

  // Final count
  const pCounts = await db.execute(sql`SELECT COUNT(*) FILTER (WHERE price_unit IS NOT NULL) as priced, COUNT(*) FILTER (WHERE verified_by = 'ePharma') as epharma FROM brands`);
  console.log(`\nDB now: ${JSON.stringify(pCounts.rows[0])}`);
}

main().catch(console.error);
