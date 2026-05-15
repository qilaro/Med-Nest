import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MedNestCron/1.0)' } };

  await Promise.allSettled([
    fetch(`${base}/api/drugs?page=1&limit=20`, opts),
    fetch(`${base}/api/generics?page=1`, opts),
    fetch(`${base}/api/stats`, opts),
  ]);

  return NextResponse.json({ ok: true });
}
