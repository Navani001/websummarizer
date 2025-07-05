import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { processWebsiteWithCache } from './websiteProcessor';
import { aiService } from './aiService';
import { vectorStoreCache, CacheStats } from './vectorStoreCache';
import { ChatBotResult } from './websiteProcessor';

export interface WebsiteInfo {
  url: string;
  fromCache: boolean;
  docCount: number;
  createdAt: Date;
}

export interface CurrentWebsiteInfo {
  url: string;
  hasVectorStore: boolean;
  fromCache: boolean;
}

// Enhanced Website ChatBot with caching
export class WebsiteChatBot {
  private currentUrl: string = '';
  private currentVectorStore: MemoryVectorStore | null = null;
  private fromCache: boolean = false;

  async switchToWebsite(url: string, forceRefresh: boolean = false): Promise<WebsiteInfo> {
    this.currentUrl = url;
    const result = await processWebsiteWithCache(url, forceRefresh);
    this.currentVectorStore = result.vectorStore;
    this.fromCache = result.fromCache;

    console.log(`🔄 Switched to website: ${url}`);
    console.log(`📊 Document count: ${result.docCount}`);
    console.log(`📦 From cache: ${result.fromCache ? 'Yes' : 'No'}`);

    return {
      url,
      fromCache: result.fromCache,
      docCount: result.docCount,
      createdAt: result.createdAt
    };
  }

  async ask(query: string): Promise<ChatBotResult> {
    if (!this.currentVectorStore || !this.currentUrl) {
      throw new Error('No website loaded. Call switchToWebsite() first.');
    }

    // Perform similarity search with scores
    const results = await this.currentVectorStore.similaritySearchWithScore(query, 3);
    const relevantDocs = results.map(([doc, score]) => doc);

    const response = await aiService.generateResponse(query, relevantDocs);

    return {
      query,
      response,
      website: this.currentUrl,
      fromCache: this.fromCache,
      confidence: results[0]?.[1] || 0,
      sources: results.map(([doc, score]) => ({
        content: doc.pageContent.substring(0, 100) + '...',
        score: score.toFixed(3),
        metadata: doc.metadata
      }))
    };
  }

  // Get current website info
  getCurrentWebsite(): CurrentWebsiteInfo {
    return {
      url: this.currentUrl,
      hasVectorStore: !!this.currentVectorStore,
      fromCache: this.fromCache
    };
  }

  // Get cache statistics
  getCacheStats(): CacheStats {
    return vectorStoreCache.getStats();
  }

  // Clear cache for specific website
  clearWebsiteCache(url: string): boolean {
    const deleted = vectorStoreCache.delete(url);
    if (deleted) {
      console.log(`🗑️ Cleared cache for: ${url}`);
    }
    return deleted;
  }

  // Clear all cache
  clearAllCache(): number {
    const count = vectorStoreCache.clear();
    console.log(`🗑️ Cleared all cache (${count} websites)`);
    return count;
  }

  // Force refresh current website
  async refreshCurrentWebsite(): Promise<WebsiteInfo> {
    if (!this.currentUrl) {
      throw new Error('No website loaded. Call switchToWebsite() first.');
    }

    return await this.switchToWebsite(this.currentUrl, true);
  }
}
