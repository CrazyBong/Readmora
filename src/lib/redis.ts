import { Redis } from '@upstash/redis';

/**
 * Singleton Upstash Redis client.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 * If credentials are missing, it will log a warning and return null,
 * allowing the application to gracefully fall back to direct API calls.
 */
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn('Redis credentials missing. Caching will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
}

export { redis };

/**
 * Cache utility for the get-or-set pattern.
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 86400 // Default to 24 hours
): Promise<T> {
  if (!redis) return fetchFn();

  try {
    const cached = await redis.get<T>(key);
    if (cached) return cached;

    const freshData = await fetchFn();

    // Only cache if we actually got data back
    if (freshData && (!Array.isArray(freshData) || freshData.length > 0)) {
      await redis.set(key, freshData, { ex: ttlSeconds });
    }

    return freshData;
  } catch (err) {
    console.error(`Redis error for key "${key}":`, err);
    return fetchFn(); // Fail open: return fresh data if Redis fails
  }
}
