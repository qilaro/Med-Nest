import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { db } from '../lib/db';
import { brands, generics, companies } from '../lib/db/schema';
import { eq, sql, inArray } from 'drizzle-orm';
import * as crypto from 'crypto';

interface Row {
  company: string
  brand: string
  generic: string
  strength: string
  dosageForm: string
  darNumber: string
  medicineType: string
}

function slugify(t: string): string {
  let s = t.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length > 200) { s = s.slice(0, 200) + '-' + crypto.createHash('md5').update(s).digest('hex').slice(0, 6); }
  return s;
}

function extractStrength(f: string): { g: string; s: string } {
  f = f.replace(/[?]+/g, '').trim();
  const m = f.match(/^(.+?)\s+(\d[\d.,]*\s*(?:mg|mcg|g|ml|%)\s*)$/i);
  return m ? { g: m[1].trim(), s: m[2].trim() } : { g: f, s: '' };
}

function loadCSV(path: string, type: string): Row[] {
  const content = fs.readFileSync(path, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true, bom: true }) as Record<string, string>[];
  return records.map(r => {
    const { g, s } = extractStrength(r['Generice Name With Strength'] || r['Generic Name With Strength'] || '');
    return {
      company: (r['Company'] || '').trim(),
      brand: (r['Trade Name'] || '').trim(),
      generic: g,
      strength: s || 'N/A',
      dosageForm: (r['Dosage From'] || r['Dosage Form'] || '').trim() || 'N/A',
      darNumber: (r['DAR No'] || '').trim(),
      medicineType: type,
    };
  }).filter(r => r.brand && r.company);
}

async function main() {
  const files: [string, string][] = [
    ['/home/xmm/Downloads/Directorate General of Drug Administration.csv', 'Herbal'],
    ['/home/xmm/Downloads/Directorate General of Drug Administration(1).csv', 'Homeopathic'],
    ['/home/xmm/Downloads/Directorate General of Drug Administration(2).csv', 'Ayurvedic'],
    ['/home/xmm/Downloads/Directorate General of Drug Administration(3).csv', 'Unani'],
  ];

  // Load all rows into memory
  let allRows: Row[] = [];
  for (const [path, type] of files) {
    if (!fs.existsSync(path)) { console.log(`Skipping ${path} (not found)`); continue; }
    const rows = loadCSV(path, type);
    console.log(`${type}: ${rows.length} rows`);
    allRows.push(...rows);
  }
  console.log(`Total: ${allRows.length} rows`);

  // Deduplicate companies
  const companyMap = new Map<string, { name: string; slug: string }>();
  for (const r of allRows) {
    if (!companyMap.has(r.company)) companyMap.set(r.company, { name: r.company, slug: slugify(r.company) });
  }
  const companiesData = [...companyMap.values()];

  // Deduplicate generics
  const genericMap = new Map<string, { name: string; slug: string; type: string }>();
  for (const r of allRows) {
    const key = r.generic.toLowerCase().trim();
    if (!genericMap.has(key)) genericMap.set(key, { name: r.generic, slug: slugify(r.generic), type: r.medicineType });
  }
  const genericsData = [...genericMap.values()];

  console.log(`Unique companies: ${companiesData.length}, generics: ${genericsData.length}`);

  // Get existing companies
  const existingCompanies = await db.select({ name: companies.name, id: companies.id }).from(companies);
  const existingCompanyMap = new Map(existingCompanies.map(c => [c.name, c.id]));

  // Insert new companies
  const newCompanies = companiesData.filter(c => !existingCompanyMap.has(c.name));
  if (newCompanies.length > 0) {
    const inserted = await db.insert(companies).values(newCompanies).returning({ name: companies.name, id: companies.id });
    for (const c of inserted) existingCompanyMap.set(c.name, c.id);
    console.log(`Inserted ${newCompanies.length} new companies`);
  }

  // Get existing generics (case-insensitive)
  const existingGenerics = await db.select({ name: generics.name, id: generics.id }).from(generics);
  const existingGenericMap = new Map(existingGenerics.map(g => [g.name.toLowerCase().trim(), g.id]));

  // Insert new generics
  const newGenerics = genericsData.filter(g => !existingGenericMap.has(g.name.toLowerCase()));
  if (newGenerics.length > 0) {
    // Handle slug conflicts by inserting one by one for problematic ones
    const batchSize = 200;
    for (let i = 0; i < newGenerics.length; i += batchSize) {
      const batch = newGenerics.slice(i, i + batchSize);
      try {
        const inserted = await db.insert(generics).values(batch).returning({ name: generics.name, id: generics.id });
        for (const g of inserted) existingGenericMap.set(g.name.toLowerCase().trim(), g.id);
      } catch {
        // Fallback: insert one by one
        for (const g of batch) {
          try {
            const ins = await db.insert(generics).values(g).returning({ name: generics.name, id: generics.id });
            existingGenericMap.set(ins[0].name.toLowerCase().trim(), ins[0].id);
          } catch {
            // Slug conflict - add hash
            const hashed = g.slug + '-' + crypto.createHash('md5').update(g.name).digest('hex').slice(0, 8);
            const ins = await db.insert(generics).values({ ...g, slug: hashed.slice(0, 255) }).returning({ name: generics.name, id: generics.id });
            existingGenericMap.set(ins[0].name.toLowerCase().trim(), ins[0].id);
          }
        }
      }
    }
    console.log(`Inserted ${newGenerics.length} new generics`);
  }

  // Prepare brand data
  const existingBrands = await db.select({ slug: brands.slug, id: brands.id }).from(brands);
  const existingBrandMap = new Map(existingBrands.map(b => [b.slug, b.id]));
  const now = new Date();

  let newBrandsData: any[] = [];
  let updateIds: string[] = [];
  const seenSlugs = new Set<string>();

  for (const r of allRows) {
    const slug = slugify(r.brand + '-' + r.company.slice(0, 30) + '-' + r.strength.slice(0, 20));
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    if (existingBrandMap.has(slug)) {
      updateIds.push(existingBrandMap.get(slug)!);
    } else {
      newBrandsData.push({
        brandName: r.brand,
        slug,
        genericId: existingGenericMap.get(r.generic.toLowerCase().trim()),
        companyId: existingCompanyMap.get(r.company),
        strength: r.strength,
        dosageForm: r.dosageForm,
        genericName: r.generic,
        companyName: r.company,
        medicineType: r.medicineType,
        darNumber: r.darNumber,
        brandVerified: true,
        genericVerified: true,
        verifiedBy: `DGDA ${r.medicineType}`,
        verifiedAt: now,
        verificationNotes: `Source: DGDA ${r.medicineType} Product List`,
      });
    }
  }

  // Batch insert new brands
  if (newBrandsData.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < newBrandsData.length; i += batchSize) {
      const batch = newBrandsData.slice(i, i + batchSize);
      await db.insert(brands).values(batch);
      console.log(`  Inserted brands ${i + 1}-${Math.min(i + batchSize, newBrandsData.length)}/${newBrandsData.length}`);
    }
    console.log(`Inserted ${newBrandsData.length} new brands`);
  }

  // Batch update existing brands
  if (updateIds.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < updateIds.length; i += batchSize) {
      const batch = updateIds.slice(i, i + batchSize);
      await db.update(brands).set({
        brandVerified: true,
        verifiedAt: now,
        updatedAt: now,
      }).where(inArray(brands.id, batch));
    }
    console.log(`Updated ${updateIds.length} existing brands`);
  }

  // Final counts
  const counts = await db.execute(sql`
    SELECT medicine_type, COUNT(*) as cnt FROM brands
    WHERE medicine_type IN ('Herbal', 'Homeopathic', 'Ayurvedic', 'Unani')
    GROUP BY medicine_type ORDER BY medicine_type
  `);
  console.log('\nFinal counts:');
  for (const r of counts.rows) {
    console.log(`  ${(r as any).medicine_type}: ${(r as any).cnt}`);
  }
}

main().catch(console.error);
