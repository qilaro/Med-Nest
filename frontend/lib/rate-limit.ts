import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  analytics: true,
});

export async function rateLimit(ip: string): Promise<boolean> {
  try {
    const { success } = await ratelimit.limit(ip);
    return success;
  } catch {
    return true; // Allow on failure
  }
}
