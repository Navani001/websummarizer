import { FastifyRequest, FastifyReply } from 'fastify';
import { WebsiteChatBot } from '../lib/websiteChatBot';
import { chatWithWebsite } from '../lib/websiteProcessor';

interface SwitchWebsiteBody {
  url: string;
  forceRefresh?: boolean;
}

interface ClearCacheBody {
  url?: string;
}

interface AskQuestionBody {
  question: string;
  url?: string;
  forceRefresh?: boolean;
}

interface DirectChatBody {
  url: string;
  question: string;
  forceRefresh?: boolean;
}

// Store for bot instances per session (in production, use Redis or similar)
const botSessions = new Map<string, WebsiteChatBot>();

// Get or create bot instance for session
function getBotInstance(sessionId: string = 'default'): WebsiteChatBot {
  if (!botSessions.has(sessionId)) {
    botSessions.set(sessionId, new WebsiteChatBot());
  }
  return botSessions.get(sessionId)!;
}

// Route handler for testing cached vector store
export async function testCacheHandler(request: FastifyRequest, reply: FastifyReply) {
  console.log('🔍 Starting cached vector store test...');
  try {
    const bot = new WebsiteChatBot();

    // Test switching between websites
    const testUrls = [
      'https://example.com',
      'https://httpbin.org/html'
    ];

    const results = [];

    for (const url of testUrls) {
      console.log(`\n🔄 Testing website: ${url}`);

      // First visit
      const firstVisit = await bot.switchToWebsite(url);
      const firstQuery = await bot.ask('What information is available?');

      // Second visit (should use cache)
      const secondVisit = await bot.switchToWebsite(url);
      const secondQuery = await bot.ask('What information is available?');

      results.push({
        url,
        firstVisit: { ...firstVisit, fromCache: firstVisit.fromCache },
        secondVisit: { ...secondVisit, fromCache: secondVisit.fromCache },
        queryResult: {
          response: secondQuery.response.substring(0, 100) + '...',
          fromCache: secondQuery.fromCache
        }
      });
    }

    return {
      message: 'Website caching test completed',
      cacheStats: bot.getCacheStats(),
      testResults: results
    };
  } catch (error) {
    console.error('❌ Error in cache test:', error);
    return reply.status(500).send({
      error: 'Internal server error'
    });
  }
}

// Route handler for switching websites
export async function switchWebsiteHandler(request: FastifyRequest<{ Body: SwitchWebsiteBody }>, reply: FastifyReply) {
  try {
    const { url, forceRefresh } = request.body;

    if (!url || typeof url !== 'string') {
      return reply.status(400).send({
        error: 'Please provide a valid URL'
      });
    }

    const bot = new WebsiteChatBot();
    const result = await bot.switchToWebsite(url, forceRefresh || false);

    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('❌ Error switching website:', error);
    return reply.status(500).send({
      error: 'Failed to switch website',
    });
  }
}

// Route handler for getting cache statistics
export async function getCacheStatsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const bot = new WebsiteChatBot();
    const stats = bot.getCacheStats();

    return {
      success: true,
      ...stats
    };
  } catch (error) {
    console.error('❌ Error getting cache stats:', error);
    return reply.status(500).send({
      error: 'Failed to get cache statistics'
    });
  }
}

// Route handler for clearing cache
export async function clearCacheHandler(request: FastifyRequest<{ Body: ClearCacheBody }>, reply: FastifyReply) {
  try {
    const { url } = request.body;
    const bot = new WebsiteChatBot();

    if (url) {
      // Clear specific website cache
      const deleted = bot.clearWebsiteCache(url);
      return {
        success: true,
        message: deleted ? `Cache cleared for ${url}` : `No cache found for ${url}`
      };
    } else {
      // Clear all cache
      const count = bot.clearAllCache();
      return {
        success: true,
        message: `Cleared cache for ${count} websites`
      };
    }
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return reply.status(500).send({
      error: 'Failed to clear cache'
    });
  }
}

// Route handler for asking questions to current website
export async function askQuestionHandler(request: FastifyRequest<{ Body: AskQuestionBody }>, reply: FastifyReply) {
  try {
    const { question, url, forceRefresh } = request.body;
    const sessionId = request.headers['x-session-id'] as string || 'default';

    if (!question || typeof question !== 'string') {
      return reply.status(400).send({
        error: 'Please provide a valid question'
      });
    }

    const bot = getBotInstance(sessionId);

    // If URL is provided, switch to that website first
    if (url) {
      await bot.switchToWebsite(url, forceRefresh || false);
    }

    // Check if bot has a current website
    const currentWebsite = bot.getCurrentWebsite();
    if (!currentWebsite.hasVectorStore) {
      return reply.status(400).send({
        error: 'No website loaded. Please switch to a website first or provide a URL.'
      });
    }

    const result = await bot.ask(question);

    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('❌ Error asking question:', error);
    return reply.status(500).send({
      error: 'Failed to process question'
    });
  }
}

// Route handler for direct chat (one-shot conversation)
export async function directChatHandler(request: FastifyRequest<{ Body: DirectChatBody }>, reply: FastifyReply) {
  try {
    const { url, question, forceRefresh } = request.body;

    if (!url || typeof url !== 'string') {
      return reply.status(400).send({
        error: 'Please provide a valid URL'
      });
    }

    if (!question || typeof question !== 'string') {
      return reply.status(400).send({
        error: 'Please provide a valid question'
      });
    }

    const result = await chatWithWebsite(url, question, forceRefresh || false);

    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('❌ Error in direct chat:', error);
    return reply.status(500).send({
      error: 'Failed to process chat request'
    });
  }
}

// Route handler for getting current website info
export async function getCurrentWebsiteHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const sessionId = request.headers['x-session-id'] as string || 'default';
    const bot = getBotInstance(sessionId);
    const websiteInfo = bot.getCurrentWebsite();

    return {
      success: true,
      ...websiteInfo
    };
  } catch (error) {
    console.error('❌ Error getting current website:', error);
    return reply.status(500).send({
      error: 'Failed to get current website information'
    });
  }
}

// Route handler for refreshing current website
export async function refreshCurrentWebsiteHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const sessionId = request.headers['x-session-id'] as string || 'default';
    const bot = getBotInstance(sessionId);
    const result = await bot.refreshCurrentWebsite();

    return {
      success: true,
      message: 'Website refreshed successfully',
      ...result
    };
  } catch (error) {
    console.error('❌ Error refreshing current website:', error);
    return reply.status(500).send({
      error: 'Failed to refresh current website'
    });
  }
}

// Route handler for clearing session
export async function clearSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const sessionId = request.headers['x-session-id'] as string || 'default';
    
    if (botSessions.has(sessionId)) {
      botSessions.delete(sessionId);
      return {
        success: true,
        message: 'Session cleared successfully'
      };
    } else {
      return {
        success: true,
        message: 'No active session found'
      };
    }
  } catch (error) {
    console.error('❌ Error clearing session:', error);
    return reply.status(500).send({
      error: 'Failed to clear session'
    });
  }
}

// Route handler for getting all active sessions
export async function getActiveSessionsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const sessions = Array.from(botSessions.entries()).map(([sessionId, bot]) => {
      const websiteInfo = bot.getCurrentWebsite();
      return {
        sessionId,
        currentWebsite: websiteInfo.url || null,
        hasVectorStore: websiteInfo.hasVectorStore,
        fromCache: websiteInfo.fromCache
      };
    });

    return {
      success: true,
      totalSessions: sessions.length,
      sessions
    };
  } catch (error) {
    console.error('❌ Error getting active sessions:', error);
    return reply.status(500).send({
      error: 'Failed to get active sessions'
    });
  }
}
