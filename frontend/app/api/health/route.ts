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
  results.redis = { envUrlSet: !!url, envTokenSet: !!token };

  if (url && token) {
    try {
      const key = 'health:' + Date.now();
      const testValue = JSON.stringify({ test: true, time: Date.now() });

      const setRes = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: testValue,
      });

      const getRes = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const getData = await getRes.json();

      // Cleanup
      await fetch(`${url}/del/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      results.redis.ok = getData?.result === testValue;
      if (!results.redis.ok) {
        results.redis.gotType = typeof getData?.result;
        results.redis.gotPreview = JSON.stringify(getData?.result).slice(0, 100);
      }
    } catch (e: any) {
      results.redis.ok = false;
      results.redis.error = e.message;
    }
  }

  return NextResponse.json(results);
}
