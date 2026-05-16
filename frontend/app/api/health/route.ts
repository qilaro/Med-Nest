import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = {};

  try {
    const r = await db.execute(sql`SELECT COUNT(*)::int as c FROM brands`);
    results.db = { ok: true, brands: r.rows[0]?.c || 0 };
  } catch (e: any) {
    results.db = { ok: false, error: e.message };
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      const key = 'health:' + Date.now();
      await fetch(`${url}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });
      const read = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await read.json();
      fetch(`${url}/del/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${token}` } });
      results.redis = { ok: data?.result?.test === true };
    } catch (e: any) {
      results.redis = { ok: false, error: e.message };
    }
  } else {
    results.redis = { ok: false, error: 'Redis env vars not set' };
  }

  return NextResponse.json(results);
}
