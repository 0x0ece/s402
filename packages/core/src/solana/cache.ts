import { ClientCredits } from '../types';

/**
 * Cached credit information
 */
export interface CachedCredit extends ClientCredits {
  /** When this cache entry was last checked against blockchain */
  lastChecked: Date;
}

/**
 * Server-side credit cache manager
 * Stores client credits to avoid repeated blockchain queries
 */
export class CreditCache {
  private cache: Map<string, CachedCredit>;
  private cacheTimeout: number; // in seconds

  constructor(cacheTimeout: number = 300) {
    this.cache = new Map();
    this.cacheTimeout = cacheTimeout;
  }

  /**
   * Get credits from cache for a client
   */
  getCredits(clientPubkey: string): CachedCredit | null {
    const cached = this.cache.get(clientPubkey);
    
    if (!cached) {
      return null;
    }

    // Check if cache entry is still valid
    const now = new Date();
    const cacheAge = (now.getTime() - cached.lastChecked.getTime()) / 1000;

    // If cache is too old, return null to force refresh
    if (cacheAge > this.cacheTimeout) {
      return null;
    }

    return cached;
  }

  /**
   * Set credits in cache for a client
   */
  setCredits(clientPubkey: string, credits: ClientCredits): void {
    const cached: CachedCredit = {
      ...credits,
      lastChecked: new Date()
    };

    this.cache.set(clientPubkey, cached);
  }

  /**
   * Invalidate cache for a client
   */
  invalidate(clientPubkey: string): void {
    this.cache.delete(clientPubkey);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired cache entries
   */
  cleanup(): void {
    const now = new Date();
    
    for (const [pubkey, cached] of this.cache.entries()) {
      // Remove if credits expired or cache is too old
      if (
        cached.expiresAt < now ||
        (now.getTime() - cached.lastChecked.getTime()) / 1000 > this.cacheTimeout
      ) {
        this.cache.delete(pubkey);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
let globalCache: CreditCache | null = null;

/**
 * Get the global cache instance
 */
export function getCreditCache(): CreditCache {
  if (!globalCache) {
    globalCache = new CreditCache();
  }
  return globalCache;
}

/**
 * Reset the global cache (useful for testing)
 */
export function resetCreditCache(): void {
  globalCache = null;
}
