const memStore = new Map<string, { data: any; expiresAt: number }>();

async function redisGet<T>(key: string): Promise<T | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result as T;
  } catch { return null; }
}

async function redisSet(key: string, value: any, ttl: number): Promise<void> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${ttl}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {}
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
