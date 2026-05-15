import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const memStore = new Map<string, { data: any; expiresAt: number }>();

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // 1. Try Redis (fastest, shared across containers)
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {}

  // 2. Try in-memory (fallback if Redis unavailable)
  const existing = memStore.get(key);
  if (existing && Date.now() < existing.expiresAt) {
    return existing.data as T;
  }

  // 3. Execute the function and cache the result
  const fresh = await fn();

  try {
    await redis.set(key, JSON.parse(JSON.stringify(fresh)), { ex: ttl });
  } catch {}
  memStore.set(key, { data: fresh, expiresAt: Date.now() + ttl * 1000 });

  return fresh;
}
