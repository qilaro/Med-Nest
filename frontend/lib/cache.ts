import { Redis } from '@upstash/redis';

const redis = process.env.KV_REST_API_URL
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN! })
  : null;
const memStore = new Map<string, { data: any; expiresAt: number }>();

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null && cached !== undefined) return cached;
    } catch {}
  }

  const existing = memStore.get(key);
  if (existing && Date.now() < existing.expiresAt) return existing.data as T;

  const fresh = await fn();

  if (redis) {
    try { await redis.set(key, fresh, { ex: ttl }); } catch {}
  }
  memStore.set(key, { data: fresh, expiresAt: Date.now() + ttl * 1000 });

  return fresh;
}
