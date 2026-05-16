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
  // 1. Redis (shared across containers, Virginia)
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null && cached !== undefined) return cached;
    } catch (e) {
      console.error('Redis GET error:', e);
    }
  }

  // 2. In-memory (per container)
  const local = memStore.get(key);
  if (local && Date.now() < local.expiresAt) return local.data as T;

  // 3. Fetch fresh
  const fresh = await fn();

  // 4. Cache in Redis + memory
  if (redis) {
    try { await redis.set(key, fresh, { ex: ttl }); } catch (e) {
      console.error('Redis SET error:', e);
    }
  }
  memStore.set(key, { data: fresh, expiresAt: Date.now() + ttl * 1000 });

  return fresh;
}
