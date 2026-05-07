import * as fs from 'fs';
import * as path from 'path';
import { db } from '../lib/db';
import { generics } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

const DATA_DIR = path.resolve(process.cwd(), 'scraped_data');

interface ScrapedGeneric {
  id: number;
  name: string;
  medicineType: string;
  indications: string;
  pharmacology: string;
  dosage___administration: string;
  dosage: string;
  administration: string;
  interaction: string;
  contraindications: string;
  side_effects: string;
  pregnancy___lactation: string;
  precautions___warnings: string;
  precautions: string;
  use_in_special_populations: string;
  overdose_effects: string;
  therapeutic_class: string;
  storage_conditions: string;
  reconstitution: string;
  duration_of_treatment: string;
  [key: string]: any;
}

function slugify(str: string): string {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-');
}

async function main() {
  console.log('=== Import Scraped Med-Ex Generics ===\n');
  console.log(`Data directory: ${DATA_DIR}\n`);

  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Directory not found: ${DATA_DIR}`);
    console.log('Run the scraper on your local machine first, then copy scraped_data/ here.');
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => /^\d+\.json$/.test(f));
  console.log(`Found ${files.length} scraped generic files\n`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const data: ScrapedGeneric = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const name = data.name?.trim();
    if (!name) { skipped++; continue; }

    // Build slug from name
    const slug = slugify(name.split('|')[0].trim());

    // Map scraped fields to DB columns
    const indications = data.indications || '';
    const pharmacology = data.pharmacology || '';
    const dosage = data.dosage || data.dosage___administration || '';
    const administration = data.administration || '';
    const interactions = data.interaction || '';
    const contraindications = data.contraindications || '';
    const sideEffects = data.side_effects || '';
    const pregnancyLactation = data.pregnancy___lactation || '';
    const precautions = data.precautions___warnings || data.precautions || '';
    const specialPopulations = data.use_in_special_populations || '';
    const overdoseEffects = data.overdose_effects || '';
    const therapeuticClass = data.therapeutic_class || '';
    const storageConditions = data.storage_conditions || '';
    const reconstitution = data.reconstitution || '';
    const durationOfTreatment = data.duration_of_treatment || '';
    const medicineType = data.medicineType || 'Allopathic';
    const sourceId = String(data.id);
    const sourceUrl = data.url || `https://medex.com.bd/generics/${data.id}`;

    // Check if generic already exists by source_id or name
    const existing = await db.execute(sql`
      SELECT id, what_is, source_id FROM generics
      WHERE source_id = ${sourceId} OR LOWER(name) = ${name.toLowerCase()}
      LIMIT 1
    `);

    if (existing.rows.length > 0) {
      const row = existing.rows[0] as Record<string, unknown>;
      const existingId = row.id;

      // Update — only fill empty fields (don't overwrite curated data)
      await db.execute(sql`
        UPDATE generics SET
          indications = COALESCE(NULLIF(${indications}, ''), indications),
          pharmacology = COALESCE(NULLIF(${pharmacology}, ''), pharmacology),
          dosage = COALESCE(NULLIF(${dosage}, ''), dosage),
          administration = COALESCE(NULLIF(${administration}, ''), administration),
          interactions = COALESCE(NULLIF(${interactions}, ''), interactions),
          contraindications = COALESCE(NULLIF(${contraindications}, ''), contraindications),
          side_effects = COALESCE(NULLIF(${sideEffects}, ''), side_effects),
          pregnancy_lactation = COALESCE(NULLIF(${pregnancyLactation}, ''), pregnancy_lactation),
          precautions = COALESCE(NULLIF(${precautions}, ''), precautions),
          special_populations = COALESCE(NULLIF(${specialPopulations}, ''), special_populations),
          overdose_effects = COALESCE(NULLIF(${overdoseEffects}, ''), overdose_effects),
          therapeutic_class = COALESCE(NULLIF(${therapeuticClass}, ''), therapeutic_class),
          storage_conditions = COALESCE(NULLIF(${storageConditions}, ''), storage_conditions),
          reconstitution = COALESCE(NULLIF(${reconstitution}, ''), reconstitution),
          duration_of_treatment = COALESCE(NULLIF(${durationOfTreatment}, ''), duration_of_treatment),
          source_url = COALESCE(NULLIF(${sourceUrl}, ''), source_url),
          source_id = COALESCE(NULLIF(${sourceId}, ''), source_id),
          medicine_type = CASE
            WHEN ${medicineType} = 'Herbal' THEN 'Herbal'
            ELSE medicine_type
          END,
          updated_at = now()
        WHERE id = ${existingId}
      `);
      updated++;
    } else {
      // Insert new generic
      await db.insert(generics).values({
        name,
        slug,
        indications: indications || null,
        pharmacology: pharmacology || null,
        dosage: dosage || null,
        administration: administration || null,
        interactions: interactions || null,
        contraindications: contraindications || null,
        sideEffects: sideEffects || null,
        pregnancyLactation: pregnancyLactation || null,
        precautions: precautions || null,
        specialPopulations: specialPopulations || null,
        overdoseEffects: overdoseEffects || null,
        therapeuticClass: therapeuticClass || null,
        storageConditions: storageConditions || null,
        reconstitution: reconstitution || null,
        durationOfTreatment: durationOfTreatment || null,
        medicineType,
        sourceUrl,
        sourceId,
      });
      inserted++;
    }

    if ((inserted + updated + skipped) % 200 === 0) {
      console.log(`  Processed ${inserted + updated + skipped}/${files.length} (inserted: ${inserted}, updated: ${updated}, skipped: ${skipped})`);
    }
  }

  console.log(`\n✓ Done`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total: ${inserted + updated + skipped}`);
}

main().catch(console.error);
