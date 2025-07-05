// Export main classes and functions for external use
export { WebsiteChatBot } from './src/lib/websiteChatBot';
export { chatWithWebsite, processWebsiteWithCache } from './src/lib/websiteProcessor';

import fastify from './src/middleware/jwt';
import { LoginUserRoute } from './src/routes/auth';
import { websiteRoutes } from './src/routes/website';
import { SERVER_CONFIG } from './src/lib/config';

// Register routes
fastify.register(websiteRoutes, { prefix: "/api/website" });

// Uncomment these when you want to use auth and chat routes
// fastify.register(LoginUserRoute, { prefix: "/api/auth" });
// fastify.register(ChatRoutes, { prefix: "/api/chat" });

// For Vercel serverless functions
export default async function handler(req: any, res: any) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}

const start = async () => {
  try {
    await fastify.listen({ 
      port: SERVER_CONFIG.PORT, 
      host: SERVER_CONFIG.HOST 
    });
    console.log(`Server listening on port ${SERVER_CONFIG.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();