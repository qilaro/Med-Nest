import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MedNestCron/1.0)' } };

  // Keep the most common first-page queries warm in Redis
  await Promise.allSettled([
    fetch(`${base}/api/drugs?page=1&limit=20`, opts),
    fetch(`${base}/api/drugs?page=1&limit=20&medicine_type=allopathic`, opts),
    fetch(`${base}/api/generics?page=1`, opts),
  ]);

  return NextResponse.json({ ok: true });
}
