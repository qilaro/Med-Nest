import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://medex.com.bd';
const OUTPUT_DIR = path.resolve('scraped_data');
const PROGRESS_FILE = path.join(OUTPUT_DIR, '_progress.json');
const MIN_DELAY = 3000;
const MAX_DELAY = 8000;

interface Progress {
  completed: number[];
  failed: number[];
  lastRun: string;
}

function loadProgress(): Progress {
  try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')); }
  catch { return { completed: [], failed: [], lastRun: '' }; }
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

function randomDelay() {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

function extractSection(html: string, headingText: string): string {
  const escaped = headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(?:${escaped})[\\s\\S]*?<div[^>]*class="[^"]*ac-body[^"]*"[^>]*>([\\s\\S]*?)<\\/div>`, 'i'
  );
  const match = html.match(regex);
  if (match) {
    return match[1]
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#27;/g, "'")
      .replace(/&nbsp;/g, ' ').replace(/Read more[\s\S]*$/i, '')
      .replace(/\s+/g, ' ').trim();
  }
  return '';
}

function extractSimple(html: string, headingText: string): string {
  const escaped = headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Try to find section heading followed by content in the same container
  const regex = new RegExp(
    `<h[23][^>]*>\\s*${escaped}\\s*<\\/h[23]>\\s*((?:(?!<h[23])[\\s\\S])*?)(?=<h[23]|$)`, 'i'
  );
  const match = html.match(regex);
  if (match) {
    return match[1]
      .replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  return '';
}

async function scrapeGeneric(context: any, id: number, progress: Progress) {
  const page = await context.newPage();
  const url = `${BASE_URL}/generics/${id}`;

  try {
    await new Promise(r => setTimeout(r, randomDelay()));
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const html = await page.content();

    // Detect security check
    if (html.includes('Security Check') && !html.includes('Indications')) {
      console.log(`  ⚠ #${id}: Security check triggered`);
      progress.failed.push(id);
      saveProgress(progress);
      await page.close();
      return false;
    }

    // Extract name from title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const name = titleMatch ? titleMatch[1].replace(/\s*\| MedEx\s*$/i, '').trim() : '';

    // Determine type: check if page has "herbal" indicator
    const isHerbal = html.includes('herbal') && !html.includes('allopathic');
    const medicineType = isHerbal ? 'Herbal' : 'Allopathic';

    // Extract all sections using multiple pattern strategies
    const data: Record<string, any> = {
      id,
      name,
      url,
      medicineType,
      scrapedAt: new Date().toISOString(),
    };

    const sections = [
      'Indications', 'Pharmacology', 'Dosage & Administration', 'Dosage',
      'Administration', 'Interaction', 'Contraindications', 'Side Effects',
      'Pregnancy & Lactation', 'Precautions & Warnings', 'Precautions',
      'Use in Special Populations', 'Overdose Effects', 'Therapeutic Class',
      'Storage Conditions', 'Reconstitution', 'Duration of Treatment'
    ];

    for (const section of sections) {
      let content = extractSection(html, section);
      if (!content) content = extractSimple(html, section);
      // Map section names to field names
      const key = section.toLowerCase()
        .replace(/ & /g, '_').replace(/ /g, '_')
        .replace(/[^a-z_]/g, '');
      data[key] = content;
    }

    // Save individual file
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${id}.json`),
      JSON.stringify(data, null, 2)
    );

    progress.completed.push(id);
    saveProgress(progress);
    console.log(`  ✓ #${id} ${name.slice(0, 60)}`);
    return true;

  } catch (err: any) {
    console.log(`  ✗ #${id}: ${err.message?.slice(0, 80) || 'Unknown error'}`);
    progress.failed.push(id);
    saveProgress(progress);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('=== Med-Ex Generic Scraper ===\n');
  console.log('To run on YOUR computer:');
  console.log('  1. npx playwright install chromium');
  console.log('  2. Log in to medex.com.bd in your browser');
  console.log('  3. Export cookies.json using Cookie-Editor extension');
  console.log('  4. Place cookies.json in project root folder');
  console.log('  5. Run: npx tsx scripts/scrape-medex-generics.ts\n');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const cookiesPath = path.resolve('../cookies.json');
  if (!fs.existsSync(cookiesPath)) {
    console.log('ERROR: cookies.json not found. Follow steps above.\n');
    const ids = process.argv[2] ? process.argv[2].split(',').map(Number) : [];
    if (ids.length === 0) {
      console.log('Usage: npx tsx scripts/scrape-medex-generics.ts <id1,id2,...>');
      console.log('Example: npx tsx scripts/scrape-medex-generics.ts 3,4,5,860');
      return;
    }
    console.log(`Scraping without cookies (may trigger security check): ${ids.join(', ')}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: Math.random() > 0.5
        ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
    });
    const progress = loadProgress();
    for (const id of ids) {
      if (progress.completed.includes(id)) continue;
      await scrapeGeneric(context, id, progress);
    }
    await browser.close();
    return;
  }

  // With cookies
  const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
  });
  await context.addCookies(cookies);
  const progress = loadProgress();

  if (process.argv[2]) {
    // Scrape specific IDs
    const ids = process.argv[2].split(',').map(Number);
    console.log(`Scraping specific IDs: ${ids.join(', ')}\n`);
    for (const id of ids) {
      if (progress.completed.includes(id)) continue;
      await scrapeGeneric(context, id, progress);
    }
  } else {
    // Scrape all 1-2556
    console.log('Scraping all IDs 1-2556\n');
    for (let id = 1; id <= 2556; id++) {
      if (progress.completed.includes(id) || progress.failed.includes(id)) continue;
      await scrapeGeneric(context, id, progress);
      if (id % 50 === 0) {
        console.log(`\n[Progress] ${progress.completed.length} done, ${progress.failed.length} failed\n`);
      }
    }
  }

  console.log(`\n✓ Done. Completed: ${progress.completed.length}, Failed: ${progress.failed.length}`);
  await browser.close();
}

main().catch(console.error);
