// Simple in-memory cache with TTL — no external dependencies
const store = new Map<string, { data: any; expiresAt: number }>();

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const existing = store.get(key);
  if (existing && Date.now() < existing.expiresAt) {
    return existing.data as T;
  }

  const fresh = await fn();
  store.set(key, { data: fresh, expiresAt: Date.now() + ttl * 1000 });
  return fresh;
}
