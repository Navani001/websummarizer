import { FastifyInstance } from 'fastify';
import {
  testCacheHandler,
  switchWebsiteHandler,
  getCacheStatsHandler,
  clearCacheHandler,
  askQuestionHandler,
  directChatHandler,
  getCurrentWebsiteHandler,
  refreshCurrentWebsiteHandler,
  clearSessionHandler,
  getActiveSessionsHandler
} from '../controllers/website';

export async function websiteRoutes(fastify: FastifyInstance) {
  // Test route for cached vector store
  fastify.get('/', {}, testCacheHandler);

  // Website management routes
  fastify.post('/switch-website', {}, switchWebsiteHandler);
  fastify.get('/current-website', {}, getCurrentWebsiteHandler);
  fastify.post('/refresh-website', {}, refreshCurrentWebsiteHandler);

  // Chat and question routes
  fastify.post('/ask', {}, askQuestionHandler);
  fastify.post('/chat', {}, directChatHandler);

  // Cache management routes
  fastify.get('/cache-stats', {}, getCacheStatsHandler);
  fastify.post('/clear-cache', {}, clearCacheHandler);

  // Session management routes
  fastify.post('/clear-session', {}, clearSessionHandler);
  fastify.get('/sessions', {}, getActiveSessionsHandler);
}
