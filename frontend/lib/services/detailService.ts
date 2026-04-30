import fs from 'fs';
import path from 'path';

// This service is server-only. It reads individual JSON files from the public folder.
const DATA_DIR = path.join(process.cwd(), 'public/data/drug_details');

export async function getDrugDetail(slug: string) {
  try {
    // 1. Ensure the directory exists
    if (!fs.existsSync(DATA_DIR)) {
      return null;
    }

    // 2. Try exact match
    const filePath = path.join(DATA_DIR, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // 3. Fallback logic: try finding a file that starts with the base slug
    const files = fs.readdirSync(DATA_DIR);
    const baseMatch = files.find(f => f.startsWith(`${slug.split('-')[0]}.json`));
    if (baseMatch) {
      return JSON.parse(fs.readFileSync(path.join(DATA_DIR, baseMatch), 'utf-8'));
    }

    return null;
  } catch (e) {
    console.error(`Error loading detail for ${slug}:`, e);
    return null;
  }
}
