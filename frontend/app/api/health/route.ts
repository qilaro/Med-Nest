import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = {};

  // 1. DB test
  try {
    const r = await db.execute(sql`SELECT 1 as ok`);
    results.db = { ok: true };
  } catch (e: any) {
    results.db = { ok: false, error: e.message };
  }

  // 2. Redis test with increasing sizes
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  results.redis = { envUrlSet: !!url, envTokenSet: !!token };

  if (url && token) {
    const tests: Record<string, any> = {};

    // Small data (~100 bytes — like a health check)
    try {
      const key = 'test:small';
      const val = JSON.stringify({ test: true, time: Date.now() });
      await fetch(`${url}/set/${key}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: val });
      const r = await fetch(`${url}/get/${key}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      tests.small = d?.result === val;
      await fetch(`${url}/del/${key}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e: any) { tests.small = { error: e.message }; }

    // Large data (~20KB — like a real drugs API response)
    try {
      const key = 'test:large';
      const big = JSON.stringify({ data: 'x'.repeat(20000) });
      await fetch(`${url}/set/${key}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: big });
      const r = await fetch(`${url}/get/${key}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      tests.large = d?.result?.length === big.length;
      await fetch(`${url}/del/${key}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e: any) { tests.large = { error: e.message }; }

    results.redis.tests = tests;
    results.redis.ok = tests.small === true && tests.large === true;
  }

  return NextResponse.json(results);
}
