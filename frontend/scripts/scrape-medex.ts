import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const COOKIES_PATH = path.resolve(process.cwd(), '../cookies.json');
const OUTPUT_DIR = path.resolve(process.cwd(), 'scraped_data');
const BASE_URL = 'https://medex.com.bd';

interface GenericLink {
  id: string;
  name: string;
  slug: string;
}

interface GenericDetail {
  id: string;
  name: string;
  slug: string;
  therapeuticClass: string;
  indications: string;
  pharmacology: string;
  dosage: string;
  interaction: string;
  contraindications: string;
  sideEffects: string;
  pregnancyLactation: string;
  precautions: string;
  specialPopulations: string;
  overdoseEffects: string;
  storageConditions: string;
  chemicalStructure: string;
  commonQuestions: { question: string; answer: string }[];
  quickTips: string[];
}

async function loadCookies() {
  if (!fs.existsSync(COOKIES_PATH)) {
    console.warn('No cookies.json found. Running without auth (may get rate-limited).');
    return [];
  }
  return JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
}

async function getAllGenericLinks(browser: any): Promise<GenericLink[]> {
  const page = await browser.newPage();
  const links: GenericLink[] = [];
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  for (const letter of letters) {
    let currentPage = 1;
    let hasNext = true;

    while (hasNext) {
      const url = `${BASE_URL}/generics?alpha=${letter}&page=${currentPage}`;
      console.log(`[Listing] ${url}`);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForSelector('.data-row', { timeout: 10000 });

        const html = await page.content();
        const $ = cheerio.load(html);

        const pageLinks: GenericLink[] = [];
        $('a.hoverable-block.darker').each((_, el) => {
          const href = $(el).attr('href') || '';
          const match = href.match(/\/generics\/(\d+)\/(.+)/);
          if (match) {
            pageLinks.push({
              id: match[1],
              name: $(el).find('.data-row-top').text().trim(),
              slug: match[2],
            });
          }
        });

        links.push(...pageLinks);
        console.log(`  → Found ${pageLinks.length} generics (total: ${links.length})`);

        // Check for next page
        const nextLink = $(`a.page-link[rel="next"]`);
        hasNext = nextLink.length > 0;
        currentPage++;
      } catch (err) {
        console.error(`  → Error on ${url}:`, (err as Error).message);
        hasNext = false;
      }
    }
  }

  await page.close();
  return links;
}

async function scrapeGenericDetail(browser: any, link: GenericLink): Promise<GenericDetail | null> {
  const page = await browser.newPage();
  const url = `${BASE_URL}/generics/${link.id}/${link.slug}`;

  try {
    console.log(`[Detail] ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    const html = await page.content();
    const $ = cheerio.load(html);

    const sections: Record<string, string> = {};

    // Extract content from tab panels and sections
    $('.tab-pane, .panel-body, .section-content, .generic-detail-content').each((_, el) => {
      const heading = $(el).find('h2, h3, h4').first().text().trim().toLowerCase();
      const content = $(el).text().trim();
      if (heading && content) {
        sections[heading] = content;
      }
    });

    // Also try to extract from the main content area
    const mainContent = $('#ms-block, .main-content, .generic-content').first();
    if (mainContent.length) {
      const text = mainContent.text().trim();
      // Try to split by section headers
      const headers = mainContent.find('h2, h3, h4');
      headers.each((_, el) => {
        const heading = $(el).text().trim().toLowerCase();
        let content = '';
        let next = $(el).next();
        while (next.length && !next.is('h2, h3, h4')) {
          content += next.text().trim() + '\n';
          next = next.next();
        }
        if (heading && content.trim()) {
          sections[heading] = content.trim();
        }
      });
    }

    const result: GenericDetail = {
      id: link.id,
      name: link.name,
      slug: link.slug,
      therapeuticClass: extractSection(sections, ['therapeutic class', 'drug class', 'class']),
      indications: extractSection(sections, ['indications', 'indication', 'uses', 'use']),
      pharmacology: extractSection(sections, ['pharmacology', 'mechanism of action', 'mode of action']),
      dosage: extractSection(sections, ['dosage', 'dosage & administration', 'dosage and administration', 'administration']),
      interaction: extractSection(sections, ['interaction', 'drug interaction', 'interactions']),
      contraindications: extractSection(sections, ['contraindications', 'contraindication', 'when not to use']),
      sideEffects: extractSection(sections, ['side effects', 'side effect', 'adverse effects', 'adverse effect']),
      pregnancyLactation: extractSection(sections, ['pregnancy', 'lactation', 'pregnancy & lactation', 'pregnancy and lactation']),
      precautions: extractSection(sections, ['precautions', 'precaution', 'warnings', 'warnings and precautions']),
      specialPopulations: extractSection(sections, ['special populations', 'special population', 'use in special']),
      overdoseEffects: extractSection(sections, ['overdose', 'overdose effects', 'overdosage']),
      storageConditions: extractSection(sections, ['storage', 'storage conditions', 'storage condition']),
      chemicalStructure: extractSection(sections, ['chemical structure', 'chemical']),
      commonQuestions: [],
      quickTips: [],
    };

    await page.close();
    return result;

  } catch (err) {
    console.error(`  → Error scraping ${link.name}:`, (err as Error).message);
    await page.close();
    return null;
  }
}

function extractSection(sections: Record<string, string>, keywords: string[]): string {
  for (const key of Object.keys(sections)) {
    for (const kw of keywords) {
      if (key.includes(kw)) {
        return sections[key];
      }
    }
  }
  return '';
}

async function main() {
  console.log('=== Med-Ex Generic Scraper ===');
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const cookies = await loadCookies();
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();
    if (cookies.length > 0) {
      await context.addCookies(cookies);
    }

    const browserInstance = await context.newPage();
    await browserInstance.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('Session started\n');

    // Step 1: Collect all generic links
    console.log('=== Step 1: Collecting all generic links ===');
    const links = await getAllGenericLinks(context);
    console.log(`\nTotal generics found: ${links.length}\n`);

    // Save links list
    fs.writeFileSync(
      path.join(OUTPUT_DIR, '_generics-index.json'),
      JSON.stringify(links, null, 2)
    );

    // Step 2: Scrape each generic detail
    console.log('=== Step 2: Scraping generic details ===');
    const errors: string[] = [];

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      console.log(`\n[${i + 1}/${links.length}] ${link.name} (${link.id})`);

      const detail = await scrapeGenericDetail(context, link);
      if (detail) {
        const filename = `${link.slug}.json`;
        fs.writeFileSync(
          path.join(OUTPUT_DIR, filename),
          JSON.stringify(detail, null, 2)
        );
        console.log(`  → Saved: ${filename}`);
      } else {
        errors.push(link.name);
      }

      // Be nice to the server — delay between requests
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    }

    // Summary
    console.log('\n=== Done ===');
    console.log(`Total generics: ${links.length}`);
    console.log(`Successfully scraped: ${links.length - errors.length}`);
    console.log(`Failed: ${errors.length}`);
    if (errors.length > 0) {
      console.log(`Errors: ${errors.join(', ')}`);
    }

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
