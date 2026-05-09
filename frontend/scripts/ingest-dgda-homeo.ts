import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { db } from '../lib/db';
import { brands, generics, companies } from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import * as crypto from 'crypto';

function parseHomeoGenericStrength(field: string): { generic: string; strength: string } {
  // Pattern: "Remedy Name ? 100 gm/" or "Remedy Name 1X 100 gm/" or "Remedy Name 30 100 gm/"
  // Potency can be: ?, 1X, 2X, 3X, 6X, 12X, 30, 30X, 200, 200X, 1M, 10M, CM, LM1, etc.
  const match = field.match(/^(.+?)\s+(\?|\d+\s*X?|C\d+|M|LM\d+|CM|\d+[MCLX]+)\s+(\d[\d.,]*\s*(?:gm|ml|g)\s*\/?)\s*$/i);
  if (match) {
    return { generic: match[1].trim(), strength: `${match[2].trim()} ${match[3].trim()}` };
  }
  // Fallback: remove trailing "gm/" or "ml/" patterns
  const simple = field.match(/^(.+?)\s+(\d[\d.,]*\s*(?:gm|ml|g)\s*\/?)\s*$/i);
  if (simple) {
    return { generic: simple[1].trim(), strength: simple[2].trim() };
  }
  return { generic: field.trim(), strength: '' };
}

function slugify(text: string): string {
  let s = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length > 200) {
    const hash = crypto.createHash('md5').update(s).digest('hex').slice(0, 6);
    s = s.slice(0, 200) + '-' + hash;
  }
  return s;
}

async function ensureGeneric(name: string, cache: Map<string, string>): Promise<string> {
  const lower = name.toLowerCase().trim();
  const cached = cache.get(lower);
  if (cached) return cached;

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
      name, slug, medicineType: 'Homeopathic',
    }).returning({ id: generics.id });
    cache.set(lower, ins[0].id);
    return ins[0].id;
  } catch (e: any) {
    if ((e.message?.includes('slug') || e.message?.includes('unique')) && !e.message?.includes('name')) {
      const hashed = slug + '-' + crypto.createHash('md5').update(name).digest('hex').slice(0, 8);
      const ins = await db.insert(generics).values({
        name, slug: hashed.slice(0, 255), medicineType: 'Homeopathic',
      }).returning({ id: generics.id });
      cache.set(lower, ins[0].id);
      return ins[0].id;
    }
    const retry = await db.select({ id: generics.id }).from(generics)
      .where(sql`LOWER(${generics.name}) = ${lower}`)
      .limit(1);
    if (retry.length > 0) {
      cache.set(lower, retry[0].id);
      return retry[0].id;
    }
    throw e;
  }
}

async function ensureCompany(name: string, cache: Map<string, string>): Promise<string> {
  const cached = cache.get(name);
  if (cached) return cached;
  const existing = await db.select({ id: companies.id }).from(companies).where(eq(companies.name, name)).limit(1);
  if (existing.length > 0) { cache.set(name, existing[0].id); return existing[0].id; }
  const ins = await db.insert(companies).values({ name, slug: slugify(name) }).returning({ id: companies.id });
  cache.set(name, ins[0].id);
  return ins[0].id;
}

async function main() {
  const filePath = '/home/xmm/Downloads/Directorate General of Drug Administration(1).csv';
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true, bom: true }) as Record<string, string>[];
  console.log(`Total records: ${records.length}`);

  const companyCache = new Map<string, string>();
  const genericCache = new Map<string, string>();
  let stats = { newBrands: 0, updatedBrands: 0 };

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    try {
      const companyName = r['Company']?.trim();
      const brandName = r['Trade Name']?.trim();
      const genericField = (r['Generice Name With Strength'] || r['Generic Name With Strength'] || '').trim();
      const dosageForm = (r['Dosage From'] || r['Dosage Form'] || '').trim();
      const darNumber = (r['DAR No'] || '').trim();
      if (!brandName || !companyName) continue;

      const { generic: genericName, strength } = parseHomeoGenericStrength(genericField);
      const companyId = await ensureCompany(companyName, companyCache);
      const genericId = await ensureGeneric(genericName, genericCache);

      const brandSlug = slugify(brandName + '-' + (strength || 'N/A').slice(0, 30));
      const existingBrand = await db.select({ id: brands.id }).from(brands).where(eq(brands.slug, brandSlug)).limit(1);

      if (existingBrand.length > 0) {
        await db.update(brands).set({
          brandVerified: true, genericVerified: true,
          medicineType: 'Homeopathic',
          darNumber, dosageForm: dosageForm || undefined,
          verifiedBy: 'DGDA Homeo', verifiedAt: new Date(),
          verificationNotes: 'Source: DGDA Homeopathic Product List',
          updatedAt: new Date(),
        }).where(eq(brands.id, existingBrand[0].id));
        stats.updatedBrands++;
      } else {
        await db.insert(brands).values({
          brandName, slug: brandSlug,
          genericId, companyId,
          strength: strength || 'N/A', dosageForm: dosageForm || 'N/A',
          genericName, companyName,
          medicineType: 'Homeopathic', darNumber,
          brandVerified: true, genericVerified: true,
          verifiedBy: 'DGDA Homeo', verifiedAt: new Date(),
          verificationNotes: 'Source: DGDA Homeopathic Product List',
        });
        stats.newBrands++;
      }

      if ((i + 1) % 500 === 0) console.log(`Progress: ${i + 1}/${records.length} | new: ${stats.newBrands} upd: ${stats.updatedBrands} cos: ${companyCache.size} gens: ${genericCache.size}`);
    } catch (e) {
      console.error(`Error row ${i + 1} (${r['Trade Name']}):`, (e as Error).message.slice(0, 200));
    }
  }

  console.log(`\nDone!\n  Companies: ${companyCache.size}\n  Generics:  ${genericCache.size}\n  New brands: ${stats.newBrands}\n  Updated:   ${stats.updatedBrands}`);
}

main().catch(console.error);
