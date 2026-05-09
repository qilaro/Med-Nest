import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { db } from '../lib/db';
import { brands, generics, companies } from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import * as crypto from 'crypto';

function parseGenericStrength(field: string): { generic: string; strength: string } {
  const match = field.match(/^(.+?)\s+(\d[\d.,]*\s*(mg|mcg|g|ml|%|IU|unit|billion)(?:\s*[+]\s*.*)?)$/i);
  if (match) {
    return { generic: match[1].trim(), strength: match[2].trim() };
  }
  return { generic: field.trim(), strength: '' };
}

function slugify(text: string): string {
  let s = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
  // Truncate to 200 chars + 6-char hash to stay within varchar(255)
  if (s.length > 200) {
    const hash = crypto.createHash('md5').update(s).digest('hex').slice(0, 6);
    s = s.slice(0, 200) + '-' + hash;
  }
  return s;
}

async function ensureGeneric(name: string, cache: Map<string, string>, retries = 0): Promise<string> {
  const lower = name.toLowerCase().trim();
  const cached = cache.get(lower);
  if (cached) return cached;

  // Case-insensitive lookup
  const existing = await db.select({ id: generics.id }).from(generics)
    .where(sql`LOWER(${generics.name}) = ${lower}`)
    .limit(1);
  if (existing.length > 0) {
    cache.set(lower, existing[0].id);
    return existing[0].id;
  }

  const slug = slugify(name);
  try {
    const ins = await db.insert(generics).values({
      name,
      slug,
      medicineType: 'Herbal',
    }).returning({ id: generics.id });
    cache.set(lower, ins[0].id);
    return ins[0].id;
  } catch (e: any) {
    // Slug conflict — try appending a hash
    if (e.message?.includes('slug') && retries < 3) {
      const hashed = slug + '-' + crypto.createHash('md5').update(name).digest('hex').slice(0, 8);
      const ins = await db.insert(generics).values({
        name,
        slug: hashed.slice(0, 255),
        medicineType: 'Herbal',
      }).returning({ id: generics.id });
      cache.set(lower, ins[0].id);
      return ins[0].id;
    }
    // Name conflict (race condition) — retry lookup
    if (e.message?.includes('name') || e.message?.includes('unique')) {
      const retry = await db.select({ id: generics.id }).from(generics)
        .where(sql`LOWER(${generics.name}) = ${lower}`)
        .limit(1);
      if (retry.length > 0) {
        cache.set(lower, retry[0].id);
        return retry[0].id;
      }
    }
    throw e;
  }
}

async function ensureCompany(name: string, cache: Map<string, string>): Promise<string> {
  const cached = cache.get(name);
  if (cached) return cached;

  const existing = await db.select({ id: companies.id }).from(companies).where(eq(companies.name, name)).limit(1);
  if (existing.length > 0) {
    cache.set(name, existing[0].id);
    return existing[0].id;
  }

  const ins = await db.insert(companies).values({ name, slug: slugify(name) }).returning({ id: companies.id });
  cache.set(name, ins[0].id);
  return ins[0].id;
}

async function main() {
  const filePath = '/home/xmm/Downloads/Directorate General of Drug Administration.csv';
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as Record<string, string>[];

  console.log(`Total DGDA herbal records: ${records.length}`);

  const companyCache = new Map<string, string>();
  const genericCache = new Map<string, string>();
  let stats = { newCompanies: 0, newGenerics: 0, newBrands: 0, updatedBrands: 0, errors: 0 };

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    try {
      const companyName = r['Company']?.trim();
      const brandName = r['Trade Name']?.trim();
      const genericField = (r['Generice Name With Strength'] || r['Generic Name With Strength'] || '').trim();
      const dosageForm = (r['Dosage From'] || r['Dosage Form'] || '').trim();
      const darNumber = (r['DAR No'] || '').trim();

      if (!brandName || !companyName) continue;

      const { generic: genericName, strength } = parseGenericStrength(genericField);
      const companyId = await ensureCompany(companyName, companyCache);
      const genericId = await ensureGeneric(genericName, genericCache);

      const brandSlug = slugify(brandName + '-' + strength || 'N/A');
      const existingBrand = await db.select({ id: brands.id }).from(brands).where(eq(brands.slug, brandSlug)).limit(1);

      if (existingBrand.length > 0) {
        await db.update(brands).set({
          brandVerified: true,
          genericVerified: true,
          medicineType: 'Herbal',
          darNumber: darNumber,
          verifiedBy: 'DGDA Herbal',
          verifiedAt: new Date(),
          verificationNotes: 'Source: DGDA Herbal Product List',
          updatedAt: new Date(),
        }).where(eq(brands.id, existingBrand[0].id));
        stats.updatedBrands++;
      } else {
        await db.insert(brands).values({
          brandName,
          slug: brandSlug,
          genericId,
          companyId,
          strength: strength || 'N/A',
          dosageForm: dosageForm || 'N/A',
          genericName,
          companyName,
          medicineType: 'Herbal',
          darNumber,
          brandVerified: true,
          genericVerified: true,
          verifiedBy: 'DGDA Herbal',
          verifiedAt: new Date(),
          verificationNotes: 'Source: DGDA Herbal Product List',
        });
        stats.newBrands++;
      }

      if ((i + 1) % 200 === 0) {
        console.log(`Progress: ${i + 1}/${records.length} | new: ${stats.newBrands} upd: ${stats.updatedBrands} cos: ${companyCache.size} gens: ${genericCache.size}`);
      }
    } catch (e) {
      stats.errors++;
      console.error(`Error row ${i + 1} (${r['Trade Name']}):`, (e as Error).message.slice(0, 200));
    }
  }

  console.log(`\nDone!
  Companies: ${companyCache.size}
  Generics:  ${genericCache.size}
  New brands: ${stats.newBrands}
  Updated:   ${stats.updatedBrands}
  Errors:    ${stats.errors}`);
}

main().catch(console.error);
