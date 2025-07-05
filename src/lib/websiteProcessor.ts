import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { scraper } from '../services/scraper';
import { aiService } from './aiService';
import { vectorStoreCache, CacheEntry } from './vectorStoreCache';

export interface ProcessWebsiteResult {
  vectorStore: MemoryVectorStore;
  fromCache: boolean;
  docCount: number;
  createdAt: Date;
}

export interface ChatResult {
  query: string;
  response: string;
  fromCache: boolean;
  docCount?: number;
  createdAt?: Date;
  website: string;
  relevantChunks?: Array<{
    content: string;
    metadata: any;
  }>;
}

export interface ChatBotResult {
  query: string;
  response: string;
  website: string;
  fromCache: boolean;
  confidence: number;
  sources: Array<{
    content: string;
    score: string;
    metadata: any;
  }>;
}

// Process website with caching
export async function processWebsiteWithCache(url: string, forceRefresh: boolean = false): Promise<ProcessWebsiteResult> {
  try {
    // Clean up old cache entries first
    vectorStoreCache.cleanup();

    // Check if we have a valid cached version
    const cachedEntry = vectorStoreCache.get(url);
    if (cachedEntry && !forceRefresh) {
      console.log(`📦 Using cached vector store for: ${url}`);
      console.log(`📊 Cache contains ${cachedEntry.docCount} documents, created ${cachedEntry.createdAt.toLocaleString()}`);
      return {
        vectorStore: cachedEntry.vectorStore,
        fromCache: true,
        docCount: cachedEntry.docCount,
        createdAt: cachedEntry.createdAt
      };
    }

    console.log(`🔍 Scraping website: ${url} ${forceRefresh ? '(force refresh)' : ''}`);

    // Scrape website content
    const result = await scraper(url, {
      timeout: 1000,
      screenshot: false
    });

    // Split content into chunks
    const texts = await aiService.splitText(result.content);
    console.log(`📝 Split content into ${texts.length} chunks.`);

    // Create Document objects
    const docs = texts.map((text, i) => new Document({
      pageContent: text,
      metadata: {
        source: url,
        chunkIndex: i,
        totalChunks: texts.length,
        domain: new URL(url).hostname,
        processedAt: new Date().toISOString()
      }
    }));

    // Create and populate vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, aiService.getEmbedder());

    // Cache the vector store
    const cacheEntry: CacheEntry = {
      vectorStore,
      createdAt: new Date(),
      docCount: docs.length,
      metadata: {
        url,
        domain: new URL(url).hostname,
        totalChunks: texts.length
      }
    };

    vectorStoreCache.set(url, cacheEntry);

    console.log(`✅ Embedded and cached ${docs.length} chunks for ${url}`);
    console.log(`📊 Cache now contains ${vectorStoreCache.size()} websites`);

    return {
      vectorStore,
      fromCache: false,
      docCount: docs.length,
      createdAt: cacheEntry.createdAt
    };
  } catch (error) {
    console.error(`Error processing website ${url}:`, error);
    throw error;
  }
}

// Main chat function with caching
export async function chatWithWebsite(url: string, userQuery: string, forceRefresh: boolean = false): Promise<ChatResult> {
  try {
    // Process website and get vector store (with caching)
    const { vectorStore, fromCache, docCount, createdAt } = await processWebsiteWithCache(url, forceRefresh);

    // Perform similarity search
    console.log(`🤔 Processing query: "${userQuery}"`);
    const relevantDocs = await vectorStore.similaritySearch(userQuery, 3);
    console.log(`🔍 Found ${relevantDocs.length} relevant chunks`);

    // Generate response
    const response = await aiService.generateResponse(userQuery, relevantDocs);

    return {
      query: userQuery,
      response: response,
      fromCache,
      docCount,
      createdAt,
      website: url,
      relevantChunks: relevantDocs.map(doc => ({
        content: doc.pageContent.substring(0, 100) + '...',
        metadata: doc.metadata
      }))
    };
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
}
