import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { db } from '../lib/db';
import { brands, generics, companies } from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import * as crypto from 'crypto';

const FILE = process.argv[2];
const TYPE = process.argv[3];

if (!FILE || !TYPE) {
  console.error('Usage: npx tsx script.ts <csv-path> <medicine-type>');
  console.error('Types: Ayurvedic, Unani');
  process.exit(1);
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
    .where(sql`LOWER(${generics.name}) = ${lower}`).limit(1);
  if (existing.length > 0) { cache.set(lower, existing[0].id); return existing[0].id; }
  const slug = slugify(name);
  try {
    const ins = await db.insert(generics).values({ name, slug, medicineType: TYPE }).returning({ id: generics.id });
    cache.set(lower, ins[0].id);
    return ins[0].id;
  } catch (e: any) {
    // Slug conflict — retry with hashed slug
    if ((e.message || '').includes('slug') || (e.message || '').includes('unique')) {
      const hashed = slug + '-' + crypto.createHash('md5').update(name).digest('hex').slice(0, 8);
      const ins = await db.insert(generics).values({ name, slug: hashed.slice(0, 255), medicineType: TYPE }).returning({ id: generics.id });
      cache.set(lower, ins[0].id);
      return ins[0].id;
    }
    const retry = await db.select({ id: generics.id }).from(generics)
      .where(sql`LOWER(${generics.name}) = ${lower}`).limit(1);
    if (retry.length > 0) { cache.set(lower, retry[0].id); return retry[0].id; }
    throw new Error(`Cannot resolve generic: ${name}`);
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

function extractStrength(field: string): { generic: string; strength: string } {
  let f = field.replace(/[?]+/g, '').trim();
  const m = f.match(/^(.+?)\s+(\d[\d.,]*\s*(mg|mcg|g|ml|%)\s*)$/i);
  if (m) return { generic: m[1].trim(), strength: m[2].trim() };
  return { generic: f, strength: '' };
}

async function main() {
  const content = fs.readFileSync(FILE, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true, bom: true }) as Record<string, string>[];
  console.log(`${TYPE}: ${records.length} records`);

  const companyCache = new Map<string, string>();
  const genericCache = new Map<string, string>();
  let stats = { newBrands: 0, updatedBrands: 0, errors: 0 };
  const start = Date.now();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    try {
      const companyName = r['Company']?.trim();
      const brandName = r['Trade Name']?.trim();
      const genericField = (r['Generice Name With Strength'] || r['Generic Name With Strength'] || '').trim();
      const dosageForm = (r['Dosage From'] || r['Dosage Form'] || '').trim();
      const darNumber = (r['DAR No'] || '').trim();
      if (!brandName || !companyName) continue;

      const { generic: genericName, strength } = extractStrength(genericField);
      const companyId = await ensureCompany(companyName, companyCache);
      const genericId = await ensureGeneric(genericName, genericCache);

      const brandSlug = slugify(brandName + '-' + companyName.slice(0, 30));
      const existing = await db.select({ id: brands.id }).from(brands).where(eq(brands.slug, brandSlug)).limit(1);

      if (existing.length > 0) {
        await db.update(brands).set({
          brandVerified: true, genericVerified: true,
          medicineType: TYPE, darNumber, dosageForm: dosageForm || undefined,
          verifiedBy: `DGDA ${TYPE}`, verifiedAt: new Date(),
          verificationNotes: `Source: DGDA ${TYPE} Product List`,
          updatedAt: new Date(),
        }).where(eq(brands.id, existing[0].id));
        stats.updatedBrands++;
      } else {
        await db.insert(brands).values({
          brandName, slug: brandSlug, genericId, companyId,
          strength: strength || 'N/A', dosageForm: dosageForm || 'N/A',
          genericName, companyName, medicineType: TYPE, darNumber,
          brandVerified: true, genericVerified: true,
          verifiedBy: `DGDA ${TYPE}`, verifiedAt: new Date(),
          verificationNotes: `Source: DGDA ${TYPE} Product List`,
        });
        stats.newBrands++;
      }
    } catch (e) {
      stats.errors++;
      if (stats.errors <= 5) console.error(`Error row ${i + 1}:`, (e as Error).message.slice(0, 150));
    }

    if ((i + 1) % 1000 === 0) {
      const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
      console.log(`  ${i + 1}/${records.length} | new: ${stats.newBrands} upd: ${stats.updatedBrands} err: ${stats.errors} [${elapsed}min]`);
    }
  }

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  console.log(`\nDone in ${elapsed}min`);
  console.log(`  Companies: ${companyCache.size}\n  Generics:  ${genericCache.size}\n  New: ${stats.newBrands}\n  Updated: ${stats.updatedBrands}\n  Errors: ${stats.errors}`);
}

main().catch(console.error);
