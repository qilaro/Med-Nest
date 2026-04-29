import { DrugDetail } from "../../types/drug";
import fs from 'fs';
import path from 'path';

export const getDrugDetailServer = async (slug: string): Promise<DrugDetail> => {
    const dir = path.join(process.cwd(), 'frontend/public/data/drug_details');
    const filePath = path.join(dir, `${slug}.json`);
    
    // 1. Try exact match
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // 2. Fallback: try finding a file that contains the slug or brand
    const files = fs.readdirSync(dir);
    const fuzzyMatch = files.find(f => f.includes(slug.split('-')[0]));
    if (fuzzyMatch) {
        return JSON.parse(fs.readFileSync(path.join(dir, fuzzyMatch), 'utf-8'));
    }

    throw new Error(`Drug detail file not found for ${slug}`);
};
