import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CACHE_CONFIG } from './config';

export interface CacheEntry {
  vectorStore: MemoryVectorStore;
  createdAt: Date;
  docCount: number;
  metadata: {
    url: string;
    domain: string;
    totalChunks: number;
  };
}

export interface CacheStats {
  totalCachedWebsites: number;
  maxCacheSize: number;
  cacheExpiryHours: number;
  websites: Array<{
    url: string;
    docCount: number;
    createdAt: Date;
    domain: string;
    age: number; // Age in minutes
  }>;
}

class VectorStoreCache {
  private cache = new Map<string, CacheEntry>();

  // Check if cached vector store is still valid
  private isCacheValid(cacheEntry: CacheEntry): boolean {
    const now = new Date();
    const cacheAge = now.getTime() - cacheEntry.createdAt.getTime();
    const maxAge = CACHE_CONFIG.EXPIRY_HOURS * 60 * 60 * 1000; // Convert to milliseconds
    return cacheAge < maxAge;
  }

  // Clean up old cache entries
  cleanup(): void {
    const keysToDelete: string[] = [];

    for (const [url, cacheEntry] of this.cache.entries()) {
      if (!this.isCacheValid(cacheEntry)) {
        keysToDelete.push(url);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`🗑️ Removed expired cache for: ${key}`);
    });

    // If cache is still too large, remove oldest entries
    if (this.cache.size > CACHE_CONFIG.MAX_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime());

      const entriesToRemove = entries.slice(0, this.cache.size - CACHE_CONFIG.MAX_SIZE);
      entriesToRemove.forEach(([url]) => {
        this.cache.delete(url);
        console.log(`🗑️ Removed old cache entry for: ${url}`);
      });
    }
  }

  // Get cached entry
  get(url: string): CacheEntry | undefined {
    const entry = this.cache.get(url);
    if (entry && this.isCacheValid(entry)) {
      return entry;
    }
    if (entry) {
      // Remove invalid entry
      this.cache.delete(url);
    }
    return undefined;
  }

  // Set cache entry
  set(url: string, entry: CacheEntry): void {
    this.cache.set(url, entry);
  }

  // Delete specific cache entry
  delete(url: string): boolean {
    return this.cache.delete(url);
  }

  // Clear all cache
  clear(): number {
    const count = this.cache.size;
    this.cache.clear();
    return count;
  }

  // Get cache statistics
  getStats(): CacheStats {
    this.cleanup(); // Clean up before reporting stats

    const cacheEntries = Array.from(this.cache.entries()).map(([url, entry]) => ({
      url,
      docCount: entry.docCount,
      createdAt: entry.createdAt,
      domain: entry.metadata.domain,
      age: Math.round((new Date().getTime() - entry.createdAt.getTime()) / (1000 * 60)) // Age in minutes
    }));

    return {
      totalCachedWebsites: this.cache.size,
      maxCacheSize: CACHE_CONFIG.MAX_SIZE,
      cacheExpiryHours: CACHE_CONFIG.EXPIRY_HOURS,
      websites: cacheEntries
    };
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const vectorStoreCache = new VectorStoreCache();
