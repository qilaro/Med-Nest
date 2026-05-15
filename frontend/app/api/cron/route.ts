import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  await Promise.allSettled([
    fetch(`${base}/api/drugs?page=1&limit=20`),
    fetch(`${base}/api/generics?page=1`),
    fetch(`${base}/api/stats`),
  ]);

  return NextResponse.json({ ok: true });
}
