const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const memStore = new Map<string, { data: any; expiresAt: number }>();

async function redisGet<T>(key: string): Promise<T | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    if (!res.ok) {
      console.error(`[Redis GET] ${res.status} for key=${key.slice(0,40)}`);
      return null;
    }
    const json = await res.json();
    if (json.result === null || json.result === undefined) return null;
    if (typeof json.result === 'string') {
      try { return JSON.parse(json.result) as T; } catch {
        console.error(`[Redis GET] JSON parse failed for key=${key.slice(0,40)}`);
        return null;
      }
    }
    return json.result as T | null;
  } catch (e) {
    console.error(`[Redis GET] exception:`, e);
    return null;
  }
}

async function redisSet(key: string, value: any, ttl: number): Promise<void> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    const body = JSON.stringify(value);
    const res = await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      body,
    });
    if (!res.ok) {
      console.error(`[Redis SET] ${res.status} for key=${key.slice(0,40)} (${body.length} bytes)`);
    }
    await fetch(`${UPSTASH_URL}/expire/${encodeURIComponent(key)}/${ttl}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
  } catch (e) {
    console.error(`[Redis SET] exception:`, e);
  }
}

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await redisGet<T>(key);
  if (cached !== null && cached !== undefined) return cached;

  const local = memStore.get(key);
  if (local && Date.now() < local.expiresAt) return local.data as T;

  const fresh = await fn();
  await redisSet(key, fresh, ttl);
  memStore.set(key, { data: fresh, expiresAt: Date.now() + ttl * 1000 });

  return fresh;
}
