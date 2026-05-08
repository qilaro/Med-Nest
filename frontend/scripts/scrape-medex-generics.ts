import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const COOKIES_PATH = path.resolve(process.cwd(), '../cookies.json');
const OUTPUT_DIR = path.resolve(process.cwd(), 'scraped_data');
const PROGRESS_FILE = path.join(OUTPUT_DIR, '_progress.json');
const BASE_URL = 'https://medex.com.bd';
const MAX_ID = 2556;
const CONCURRENCY = 3;
const MIN_DELAY_MS = 3000;
const MAX_DELAY_MS = 8000;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
];

interface Progress {
  completed: number[];
  failed: number[];
  skipped: number[];
  lastRun: string;
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    } catch {}
  }
  return { completed: [], failed: [], skipped: [], lastRun: '' };
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

function randomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function isCaptchaPage(html: string): boolean {
  return html.includes('recaptcha') || html.includes('cf-challenge') || html.includes('challenge-form') || html.includes('Please complete the security');
}

function isRateLimited(html: string): boolean {
  return html.includes('429') || html.includes('Too Many Requests') || html.includes('rate limit');
}

function is404Page(html: string): boolean {
  return html.includes('404') || html.includes('page not found') || html.includes('Page Not Found');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#27;/g, "'").replace(/\s+/g, ' ').trim();
}

function extractSection(html: string, headingKeywords: string[]): string {
  const lines = html.split('\n');
  let capturing = false;
  let content: string[] = [];
  const headingPattern = new RegExp(headingKeywords.join('|'), 'i');

  for (const line of lines) {
    const stripped = stripHtml(line);
    if (!stripped) continue;

    if (/<(h[2-4]|strong|b)>/i.test(line) && headingPattern.test(stripped)) {
      capturing = true;
      content = [];
      continue;
    }

    if (capturing) {
      if (/<(h[2-4]|strong|b)>/i.test(line) && !headingPattern.test(stripped)) {
        break;
      }
      content.push(stripped);
    }
  }

  return content.join('\n').trim();
}

async function scrapeGeneric(context: any, id: number, progress: Progress): Promise<boolean> {
  const url = `${BASE_URL}/generics/${id}`;
  const page = await context.newPage();

  try {
    // Random user agent
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.setExtraHTTPHeaders({ 'User-Agent': ua });

    // Random delay before each request
    await new Promise(r => setTimeout(r, randomDelay()));

    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    if (!response) {
      progress.failed.push(id);
      saveProgress(progress);
      return false;
    }

    const status = response.status();
    const html = await page.content();

    if (status === 404 || is404Page(html)) {
      progress.skipped.push(id);
      saveProgress(progress);
      return true;
    }

    if (isCaptchaPage(html)) {
      console.log(`  ⚠ CAPTCHA on #${id} — waiting 60s...`);
      await new Promise(r => setTimeout(r, 60000));
      progress.failed.push(id);
      saveProgress(progress);
      return false;
    }

    if (isRateLimited(html) || status === 429) {
      console.log(`  ⚠ Rate limited on #${id} — waiting 120s...`);
      await new Promise(r => setTimeout(r, 120000));
      progress.failed.push(id);
      saveProgress(progress);
      return false;
    }

    if (status !== 200) {
      progress.failed.push(id);
      saveProgress(progress);
      return false;
    }

    // Extract name from title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const name = titleMatch ? titleMatch[1].replace(' | MedEx', '').trim() : '';

    // Parse structured sections
    const $ = html; // We'll use the raw HTML with regex since cheerio adds complexity
    const data = {
      id,
      name,
      url,
      scrapedAt: new Date().toISOString(),
      therapeuticClass: extractSection(html, ['therapeutic class', 'drug class']),
      indications: extractSection(html, ['indications', 'indication', 'uses']),
      pharmacology: extractSection(html, ['pharmacology', 'mechanism of action']),
      dosage: extractSection(html, ['dosage', 'dosage & administration', 'dosage and administration']),
      administration: extractSection(html, ['administration']),
      interaction: extractSection(html, ['interaction', 'drug interactions']),
      contraindications: extractSection(html, ['contraindications']),
      sideEffects: extractSection(html, ['side effects', 'adverse effects']),
      pregnancyLactation: extractSection(html, ['pregnancy', 'lactation', 'pregnancy & lactation']),
      precautions: extractSection(html, ['precautions', 'warnings']),
      pediatricUses: extractSection(html, ['pediatric']),
      overdoseEffects: extractSection(html, ['overdose']),
      reconstitution: extractSection(html, ['reconstitution']),
      storageConditions: extractSection(html, ['storage']),
      durationOfTreatment: extractSection(html, ['duration of treatment']),
    };

    // Save individual file
    const filename = `${id}.json`;
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(data, null, 2));

    progress.completed.push(id);
    saveProgress(progress);

    console.log(`  ✓ #${id} ${name.slice(0, 60)}`);
    return true;

  } catch (err) {
    console.error(`  ✗ #${id}: ${(err as Error).message.slice(0, 80)}`);
    progress.failed.push(id);
    saveProgress(progress);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('=== Production Med-Ex Scraper ===\n');
  console.log(`Target: ${MAX_ID} generics`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const progress = loadProgress();
  if (progress.lastRun) {
    console.log(`Resuming from previous run:`);
    console.log(`  Completed: ${progress.completed.length}`);
    console.log(`  Failed: ${progress.failed.length}`);
    console.log(`  Skipped (404): ${progress.skipped.length}\n`);
  }

  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  if (cookies.length > 0) {
    await context.addCookies(cookies);
  }

  const done = new Set([...progress.completed, ...progress.failed, ...progress.skipped]);
  const idsToScrape = [];

  for (let id = 1; id <= MAX_ID; id++) {
    if (!done.has(id)) {
      idsToScrape.push(id);
    }
  }

  console.log(`Remaining to scrape: ${idsToScrape.length}\n`);

  // Process in concurrent batches
  let index = 0;
  while (index < idsToScrape.length) {
    const batch = idsToScrape.slice(index, index + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(id => scrapeGeneric(context, id, progress))
    );

    // If a batch had failures due to CAPTCHA, back off
    const hadCaptcha = batch.some((id, i) =>
      results[i].status === 'fulfilled' && results[i].value === false
    );

    if (hadCaptcha) {
      console.log('  → Batch had issues, backing off 30s...');
      await new Promise(r => setTimeout(r, 30000));
    }

    index += CONCURRENCY;

    // Periodic status report
    if (index % 30 === 0 || index >= idsToScrape.length) {
      const totalDone = progress.completed.length + progress.failed.length + progress.skipped.length;
      console.log(`\n[Progress] ${totalDone}/${MAX_ID} done (${progress.completed.length} ok, ${progress.failed.length} failed, ${progress.skipped.length} skipped)\n`);
    }
  }

  console.log('\n=== Done ===');
  console.log(`Completed: ${progress.completed.length}`);
  console.log(`Failed: ${progress.failed.length}`);
  console.log(`Skipped (404): ${progress.skipped.length}`);

  progress.lastRun = new Date().toISOString();
  saveProgress(progress);

  await browser.close();
}

main().catch(console.error);
