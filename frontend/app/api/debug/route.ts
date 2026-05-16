import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = {};

  // 1. Test DB connection
  try {
    const r = await db.execute(sql`SELECT COUNT(*)::int as c FROM brands`);
    results.db = { ok: true, brands: r.rows[0]?.c || 0 };
  } catch (e: any) {
    results.db = { ok: false, error: e.message };
  }

  // 2. Test Redis via REST API
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      // Write + read test
      const testKey = 'health:' + Date.now();
      const writeRes = await fetch(`${url}/set/${testKey}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, time: Date.now() }),
      });
      const readRes = await fetch(`${url}/get/${testKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const readData = await readRes.json();
      // Clean up
      fetch(`${url}/del/${testKey}`, { headers: { Authorization: `Bearer ${token}` } });
      results.redis = { ok: readData?.result?.ok === true, url: url.split('//')[1] };
    } catch (e: any) {
      results.redis = { ok: false, error: e.message, envUrlSet: !!url };
    }
  } else {
    results.redis = { ok: false, error: 'Redis env vars not set' };
  }

  return NextResponse.json(results);
}
