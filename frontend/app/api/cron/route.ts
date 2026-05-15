import { NextResponse } from 'next/server';

export async function GET() {
  // Cron runs server-side — use relative URLs
  await Promise.allSettled([
    fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/drugs?page=1&limit=20`),
    fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/generics?page=1`),
    fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/stats`),
  ]);

  return NextResponse.json({ ok: true });
}
