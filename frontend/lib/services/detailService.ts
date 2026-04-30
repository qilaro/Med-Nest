import fs from 'fs';
import path from 'path';

export async function getDrugDetail(slug: string) {
  try {
    // Define possible data directories for different environments (Local, Vercel Monorepo)
    const possibleDirs = [
      path.join(process.cwd(), 'public/data/drug_details'),
      path.join(process.cwd(), 'frontend/public/data/drug_details'),
      path.join(process.cwd(), '.next/server/public/data/drug_details'),
      // Fallback for Vercel's deployment structure
      path.join(process.cwd(), 'static/data/drug_details')
    ];

    let DATA_DIR = '';
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        DATA_DIR = dir;
        break;
      }
    }

    if (!DATA_DIR) {
      console.error('Could not find drug_details directory in any expected location.');
      return null;
    }

    // Try exact match
    const filePath = path.join(DATA_DIR, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    return null;
  } catch (e) {
    console.error(`Error loading detail for ${slug}:`, e);
    return null;
  }
}
