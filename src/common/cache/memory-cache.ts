/**
 * Simple in-memory cache implementation with TTL and size limits
 * Optimized for trade area polygon data caching
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class MemoryCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private readonly defaultTtl: number;
  private readonly maxSize: number;

  constructor(defaultTtl: number = 3600000, maxSize: number = 1000) {
    this.defaultTtl = defaultTtl; // 1 hour default
    this.maxSize = maxSize;

    // Cleanup expired items every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Set item in cache with optional TTL
   */
  set(key: string, data: T, ttl?: number): void {
    // If cache is at max size, remove oldest items
    if (this.cache.size >= this.maxSize) {
      this.removeOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    });
  }

  /**
   * Get item from cache (returns null if expired or not found)
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Remove expired items from cache
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired items`);
    }
  }

  /**
   * Remove oldest items when cache is full
   */
  private removeOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Export singleton instance for trade areas
export const tradeAreaCache = new MemoryCache(
  1800000, // 30 minutes TTL for trade areas
  500      // Max 500 trade areas in cache (~35MB estimated)
);