import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../lib/db';
import { brands } from '../lib/db/schema';

async function main() {
  const filePath = path.join(process.cwd(), '../data/archive/medicine.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Ingesting ${records.length} records...`);

  for (const record of records as Record<string, string>[]) {
    // Basic mapping based on assumed schema
    await db.insert(brands).values({
      brandName: record.brand_name,
      slug: record.slug || record.brand_name.toLowerCase().replace(/ /g, '-'),
      genericId: record.generic_id,
      companyId: record.company_id,
      strength: record.strength || 'N/A',
      dosageForm: record.dosage_form || 'Tablet',
      genericName: record.generic_name,
      companyName: record.company_name,
    });
  }
  
  console.log('Ingestion complete.');
}

main().catch(console.error);
