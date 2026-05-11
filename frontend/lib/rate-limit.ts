// In-memory rate limiter (production-ready Redis version in plan)
const rateMap = new Map<string, { count: number; resetAt: number }>();

// Periodically clean stale entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, 60000);

export function rateLimit(ip: string, limit = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}
