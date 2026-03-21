/**
 * Simple in-memory cache for image URLs to improve performance.
 * Uses a Map with a max size to prevent unbounded growth.
 */

// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION = 60 * 60 * 1000;

// Max number of entries to keep to prevent unbounded growth
const MAX_CACHE_SIZE = 500;

interface CacheEntry {
  url: string;
  timestamp: number;
}

// Use a Map for O(1) insertion-order iteration (easy LRU eviction)
const imageUrlCache = new Map<string, CacheEntry>();

/**
 * Get a URL from the cache
 */
export function getCachedImageUrl(key: string): string | null {
  if (!key) return null;
  
  const entry = imageUrlCache.get(key);
  if (!entry) return null;
  
  // Check if the cache entry has expired
  if (Date.now() - entry.timestamp > CACHE_EXPIRATION) {
    imageUrlCache.delete(key);
    return null;
  }
  
  return entry.url;
}

/**
 * Store a URL in the cache, evicting the oldest entry if at capacity
 */
export function cacheImageUrl(key: string, url: string): void {
  if (!key || !url) return;

  // Evict oldest entry if at capacity
  if (imageUrlCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = imageUrlCache.keys().next().value;
    if (oldestKey !== undefined) {
      imageUrlCache.delete(oldestKey);
    }
  }
  
  imageUrlCache.set(key, {
    url,
    timestamp: Date.now(),
  });
}
