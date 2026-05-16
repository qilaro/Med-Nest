// Direct Upstash REST API — no SDK, no version issues, works every time
const UPSTASH_URL = process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;
const memStore = new Map<string, { data: any; expiresAt: number }>();

async function redisGet<T>(key: string): Promise<T | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.result ?? null) as T | null;
  } catch { return null; }
}

async function redisSet(key: string, value: any, ttl: number): Promise<void> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
    await fetch(`${UPSTASH_URL}/expire/${encodeURIComponent(key)}/${ttl}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
  } catch {}
}

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // 1. Redis (shared across containers)
  const cached = await redisGet<T>(key);
  if (cached !== null && cached !== undefined) return cached;

  // 2. In-memory (per container)
  const local = memStore.get(key);
  if (local && Date.now() < local.expiresAt) return local.data as T;

  // 3. Fetch fresh
  const fresh = await fn();

  // 4. Cache in both
  await redisSet(key, fresh, ttl);
  memStore.set(key, { data: fresh, expiresAt: Date.now() + ttl * 1000 });

  return fresh;
}
