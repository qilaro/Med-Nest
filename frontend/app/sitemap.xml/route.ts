import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const BASE_URL = 'https://mednest.com.bd';

export async function GET() {
  const brands = await db.execute(sql`
    SELECT slug, updated_at FROM brands 
    WHERE brand_verified = true AND slug IS NOT NULL
    ORDER BY slug LIMIT 45000
  `);

  const pages: { url: string; lastModified: string; changeFreq: string; priority: number }[] = brands.rows.map((row: any) => ({
    url: `${BASE_URL}/drugs/${row.slug}`,
    lastModified: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    changeFreq: 'weekly',
    priority: 0.8,
  }));

  // Add static pages
  pages.push(
    { url: BASE_URL, lastModified: new Date().toISOString(), changeFreq: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/drugs`, lastModified: new Date().toISOString(), changeFreq: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/dosage-forms`, lastModified: new Date().toISOString(), changeFreq: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/class`, lastModified: new Date().toISOString(), changeFreq: 'weekly', priority: 0.6 },
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastModified}</lastmod>
    <changefreq>${p.changeFreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
