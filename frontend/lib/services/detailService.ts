import fs from 'fs';
import path from 'path';

// The service is server-side and reads files from the public folder.
// We prioritize checking for the data in the project root, then try looking relative to the 
// current process directory (which handles Vercel's monorepo structure).
export async function getDrugDetail(slug: string) {
  try {
    // In Next.js server components, we can use absolute URLs for internal fetch.
    // We assume the origin is available or we can use origin-relative paths
    // and rely on the Next.js fetch polyfill/handler.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Try exact match
    const response = await fetch(`${baseUrl}/data/drug_details/${slug}.json`);
    
    if (response.ok) {
      return await response.json();
    }

    // If exact match fails, we can't easily iterate the directory with fetch.
    // However, the previous 'fs' logic tried a fallback. 
    // We will rely on exact slug matching for now as it's the standard.
    return null;
  } catch (e) {
    console.error(`Error loading detail for ${slug}:`, e);
    return null;
  }
}
