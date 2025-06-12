/**
 * Simple in-memory cache for image URLs to improve performance
 */

// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION = 60 * 60 * 1000;

interface CacheEntry {
  url: string;
  timestamp: number;
}

// In-memory cache object
const imageUrlCache: Record<string, CacheEntry> = {};

/**
 * Get a URL from the cache
 * @param key The cache key (file key or metadata string)
 * @returns The cached URL or null if not found or expired
 */
export function getCachedImageUrl(key: string): string | null {
  if (!key) return null;
  
  const entry = imageUrlCache[key];
  if (!entry) return null;
  
  // Check if the cache entry has expired
  const now = Date.now();
  if (now - entry.timestamp > CACHE_EXPIRATION) {
    // Remove expired entry
    delete imageUrlCache[key];
    return null;
  }
  
  return entry.url;
}

/**
 * Store a URL in the cache
 * @param key The cache key (file key or metadata string)
 * @param url The URL to cache
 */
export function cacheImageUrl(key: string, url: string): void {
  if (!key || !url) return;
  
  imageUrlCache[key] = {
    url,
    timestamp: Date.now(),
  };
}

/**
 * Clear the entire image URL cache
 */
export function clearImageCache(): void {
  Object.keys(imageUrlCache).forEach(key => {
    delete imageUrlCache[key];
  });
}

/**
 * Remove a specific entry from the cache
 * @param key The cache key to remove
 */
export function removeCachedImage(key: string): void {
  if (key && imageUrlCache[key]) {
    delete imageUrlCache[key];
  }
}

/**
 * Get cache statistics
 * @returns Object with cache size and age information
 */
export function getCacheStats(): { size: number; oldestEntry: number; newestEntry: number } {
  const entries = Object.values(imageUrlCache);
  const timestamps = entries.map(entry => entry.timestamp);
  
  return {
    size: entries.length,
    oldestEntry: timestamps.length ? Math.min(...timestamps) : 0,
    newestEntry: timestamps.length ? Math.max(...timestamps) : 0,
  };
}