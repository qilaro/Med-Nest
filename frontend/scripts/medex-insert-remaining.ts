import * as fs from 'fs';
import { db } from '../lib/db';
import { brands, generics, companies } from '../lib/db/schema';
import { sql, eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';

interface MedexBrand { brand: string; generic: string; strength: string; company: string; dosageForm?: string }

function norm(s: string | null): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function slugify(t: string): string {
  let s = t.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length > 200) { s = s.slice(0, 200) + '-' + crypto.createHash('md5').update(s).digest('hex').slice(0, 6); }
  return s;
}

async function main() {
  const data = JSON.parse(fs.readFileSync('/home/xmm/Downloads/medex_brands(3).json', 'utf-8')) as MedexBrand[];
  console.log(`MedEx: ${data.length} brands`);

  // Build a set of existing brand keys: (brand + company + strength + dosage) normalized
  const existing = await db.select({
    brandName: brands.brandName, companyName: brands.companyName,
    strength: brands.strength, dosageForm: brands.dosageForm,
  }).from(brands);

  const existingKeys = new Set<string>();
  for (const b of existing) {
    existingKeys.add(
      norm(b.brandName) + '|' + norm(b.companyName) + '|' + normStrNum(b.strength) + '|' + norm(b.dosageForm)
    );
  }

  function normStrNum(s: string | null): string {
    return (s || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  }

  // Find truly unmatched MedEx entries
  const unseen: MedexBrand[] = [];
  const seenKeys = new Set<string>();
  let alreadyInDb = 0;
  
  for (const m of data) {
    if (!m.brand || !m.company) continue;
    const key = norm(m.brand) + '|' + norm(m.company) + '|' + normStrNum(m.strength) + '|' + norm(m.dosageForm || '');
    if (existingKeys.has(key)) { alreadyInDb++; continue; }
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    unseen.push(m);
  }

  console.log(`${alreadyInDb} already in DB, ${unseen.length} truly new`);

  if (unseen.length === 0) {
    console.log('Nothing to insert!');
    return;
  }

  // Get existing companies and generics
  const existingCos = new Map((await db.select({ name: companies.name, id: companies.id }).from(companies)).map(c => [c.name, c.id]));
  const existingGens = new Map((await db.select({ name: generics.name, id: generics.id }).from(generics)).map(g => [g.name.toLowerCase().trim(), g.id]));

  const now = new Date();
  let newCos = 0, newGens = 0;

  // Insert missing companies
  const coNames = [...new Set(unseen.map(m => m.company).filter(Boolean))];
  for (const name of coNames) {
    if (!existingCos.has(name)) {
      const ins = await db.insert(companies).values({ name, slug: slugify(name) }).returning({ id: companies.id });
      existingCos.set(name, ins[0].id); newCos++;
    }
  }
  console.log(`  Companies: ${newCos} new`);

  // Insert missing generics
  const genNames = [...new Set(unseen.map(m => m.generic).filter(Boolean))];
  for (const name of genNames) {
    const low = name.toLowerCase().trim();
    if (!existingGens.has(low)) {
      try {
        const ins = await db.insert(generics).values({ name, slug: slugify(name) }).returning({ id: generics.id });
        existingGens.set(low, ins[0].id); newGens++;
      } catch {
        const slug = slugify(name) + '-' + crypto.createHash('md5').update(name).digest('hex').slice(0, 6);
        const ins = await db.insert(generics).values({ name, slug }).returning({ id: generics.id });
        existingGens.set(low, ins[0].id); newGens++;
      }
    }
  }
  console.log(`  Generics: ${newGens} new`);

  // Insert new brands in batches
  let inserted = 0;
  const batch: any[] = [];
  for (const m of unseen) {
    const companyName = m.company.trim();
    const genericName = m.generic.trim();
    const brandName = m.brand.trim();
    const strength = (m.strength || '').trim() || 'N/A';
    const dosageForm = (m.dosageForm || '').trim() || 'N/A';
    const companyId = existingCos.get(companyName);
    const genericId = existingGens.get(genericName.toLowerCase().trim());
    if (!companyId || !genericId) continue;

    batch.push({
      brandName, slug: slugify(brandName + '-' + companyName.slice(0, 30) + '-' + strength.slice(0, 20)),
      genericId, companyId, strength, dosageForm, genericName, companyName,
      brandVerified: true, genericVerified: true,
      verifiedBy: 'MedEx', verifiedAt: now,
      verificationNotes: 'Imported from MedEx brand listing',
    });
    if (batch.length >= 500) {
      await db.insert(brands).values(batch);
      inserted += batch.length; batch.length = 0;
    }
  }
  if (batch.length > 0) { await db.insert(brands).values(batch); inserted += batch.length; }

  console.log(`  New brands inserted: ${inserted}`);

  const r = await db.execute(sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE brand_verified = true) as verified, COUNT(*) FILTER (WHERE price_unit IS NOT NULL) as priced FROM brands`);
  console.log(`\nDB final: ${JSON.stringify(r.rows[0])}`);
}

main().catch(console.error);
