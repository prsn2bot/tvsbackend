import NodeCache from "node-cache";
import logger from "./logger";

// Cache will store data for up to 20 minutes (1200 seconds) by default
const ttlSeconds = 1200;

const cache = new NodeCache({
  stdTTL: ttlSeconds,
  checkperiod: ttlSeconds * 0.2,
  useClones: false,
});

/**
 * Stores data in the cache with a specified key and optional TTL.
 * If no TTL is provided, it defaults to the cache's standard TTL (20 minutes).
 * @param key The key under which to store the data.
 * @param value The data to store.
 * @param ttlSeconds Optional. The time-to-live for this specific data in seconds.
 */
export const setCache = (key: string, value: any, ttl?: number) => {
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
  logger.debug(`Cache: Stored ${key} for ${ttl || ttlSeconds} seconds`);
};

/**
 * Retrieves data from the cache using a specified key.
 * @param key The key of the data to retrieve.
 * @returns The cached data, or undefined if not found or expired.
 */
export const getCache = <T>(key: string): T | undefined => {
  const value = cache.get<T>(key);
  if (value) {
    logger.debug(`Cache: Retrieved ${key}`);
  } else {
    logger.debug(`Cache: ${key} not found or expired`);
  }
  return value;
};

/**
 * Deletes data from the cache using a specified key.
 * @param key The key of the data to delete.
 * @returns The number of keys deleted (0 or 1).
 */
export const deleteCache = (key: string): number => {
  const deletedCount = cache.del(key);
  if (deletedCount > 0) {
    logger.debug(`Cache: Deleted ${key}`);
  }
  return deletedCount;
};

/**
 * Checks if a key exists in the cache.
 * @param key The key to check.
 * @returns True if the key exists, false otherwise.
 */
export const hasCache = (key: string): boolean => {
  return cache.has(key);
};
// You can also add event listeners if needed for debugging or specific logic
// cache.on("del", (key, value) => {
//   console.log(`Cache: Key ${key} with value ${value} was deleted.`);
// });

// cache.on("expired", (key, value) => {
//   console.log(`Cache: Key ${key} with value ${value} expired.`);
// });
