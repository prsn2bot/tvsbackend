"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCache = exports.deleteCache = exports.getCache = exports.setCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const logger_1 = __importDefault(require("./logger"));
// Cache will store data for up to 20 minutes (1200 seconds) by default
const ttlSeconds = 1200;
const cache = new node_cache_1.default({
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
const setCache = (key, value, ttl) => {
    if (ttl) {
        cache.set(key, value, ttl);
    }
    else {
        cache.set(key, value);
    }
    logger_1.default.debug(`Cache: Stored ${key} for ${ttl || ttlSeconds} seconds`);
};
exports.setCache = setCache;
/**
 * Retrieves data from the cache using a specified key.
 * @param key The key of the data to retrieve.
 * @returns The cached data, or undefined if not found or expired.
 */
const getCache = (key) => {
    const value = cache.get(key);
    if (value) {
        logger_1.default.debug(`Cache: Retrieved ${key}`);
    }
    else {
        logger_1.default.debug(`Cache: ${key} not found or expired`);
    }
    return value;
};
exports.getCache = getCache;
/**
 * Deletes data from the cache using a specified key.
 * @param key The key of the data to delete.
 * @returns The number of keys deleted (0 or 1).
 */
const deleteCache = (key) => {
    const deletedCount = cache.del(key);
    if (deletedCount > 0) {
        logger_1.default.debug(`Cache: Deleted ${key}`);
    }
    return deletedCount;
};
exports.deleteCache = deleteCache;
/**
 * Checks if a key exists in the cache.
 * @param key The key to check.
 * @returns True if the key exists, false otherwise.
 */
const hasCache = (key) => {
    return cache.has(key);
};
exports.hasCache = hasCache;
// You can also add event listeners if needed for debugging or specific logic
// cache.on("del", (key, value) => {
//   console.log(`Cache: Key ${key} with value ${value} was deleted.`);
// });
// cache.on("expired", (key, value) => {
//   console.log(`Cache: Key ${key} with value ${value} expired.`);
// });
//# sourceMappingURL=cache.js.map