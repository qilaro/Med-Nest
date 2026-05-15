import { kv } from '@vercel/kv';

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Only use KV if the env var is set (Vercel KV integration installed)
  if (!process.env.KV_URL) return fn();

  try {
    const cached = await kv.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {
    return fn();
  }

  const fresh = await fn();
  try {
    await kv.set(key, fresh, { ex: ttl });
  } catch {}
  return fresh;
}
