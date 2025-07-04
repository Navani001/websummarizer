import { FastifyRequest, FastifyReply } from "fastify";
import { WebsiteChatBot, chatWithWebsite } from "../../index";

// Store active chatbots in memory (in production, use Redis or similar)
const activeChatBots = new Map<string, WebsiteChatBot>();

interface InitializeChatBotBody {
  url: string;
  sessionId: string;
}

interface AskChatBotBody {
  sessionId: string;
  query: string;
}

interface SingleChatQueryBody {
  url: string;
  query: string;
}

// Single query endpoint - no session state
export const singleChatQuery = async (
  request: FastifyRequest<{ Body: SingleChatQueryBody }>,
  reply: FastifyReply
) => {
  try {
    const { url, query } = request.body;

    if (!url || !query) {
      return reply.status(400).send({
        error: "Missing required fields: url and query"
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return reply.status(400).send({
        error: "Invalid URL format"
      });
    }

    const result = await chatWithWebsite(url, query);
    
    return reply.status(200).send({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in single chat query:", error);
    return reply.status(500).send({
      error: "Failed to process chat query",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Initialize chatbot for a specific website
export const initializeChatBot = async (
  request: FastifyRequest<{ Body: InitializeChatBotBody }>,
  reply: FastifyReply
) => {
  try {
    const { url, sessionId } = request.body;

    if (!url || !sessionId) {
      return reply.status(400).send({
        error: "Missing required fields: url and sessionId"
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return reply.status(400).send({
        error: "Invalid URL format"
      });
    }

    // Check if session already exists
    if (activeChatBots.has(sessionId)) {
      return reply.status(409).send({
        error: "Session already exists. Use a different sessionId or ask questions directly."
      });
    }

    const chatBot = new WebsiteChatBot();
    await chatBot.initialize(url);
    
    activeChatBots.set(sessionId, chatBot);

    return reply.status(200).send({
      success: true,
      message: `ChatBot initialized for ${url}`,
      sessionId,
      url
    });
  } catch (error) {
    console.error("Error initializing chatbot:", error);
    return reply.status(500).send({
      error: "Failed to initialize chatbot",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Ask a question to an initialized chatbot
export const askChatBot = async (
  request: FastifyRequest<{ Body: AskChatBotBody }>,
  reply: FastifyReply
) => {
  try {
    const { sessionId, query } = request.body;

    if (!sessionId || !query) {
      return reply.status(400).send({
        error: "Missing required fields: sessionId and query"
      });
    }

    const chatBot = activeChatBots.get(sessionId);
    if (!chatBot) {
      return reply.status(404).send({
        error: "ChatBot session not found. Initialize a session first."
      });
    }

    const result = await chatBot.ask(query);
    
    return reply.status(200).send({
      success: true,
      data: result,
      sessionId
    });
  } catch (error) {
    console.error("Error asking chatbot:", error);
    return reply.status(500).send({
      error: "Failed to process question",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get status of initialized chatbot
export const getChatBotStatus = async (
  request: FastifyRequest<{ Querystring: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { sessionId } = request.query;

    if (!sessionId) {
      return reply.status(400).send({
        error: "Missing required query parameter: sessionId"
      });
    }

    const chatBot = activeChatBots.get(sessionId);
    
    return reply.status(200).send({
      success: true,
      sessionExists: !!chatBot,
      sessionId,
      activeSessions: activeChatBots.size
    });
  } catch (error) {
    console.error("Error getting chatbot status:", error);
    return reply.status(500).send({
      error: "Failed to get chatbot status",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Clean up function to remove inactive sessions (call this periodically)
export const cleanupSessions = (sessionId?: string) => {
  if (sessionId) {
    activeChatBots.delete(sessionId);
  } else {
    // Clean up all sessions (useful for maintenance)
    activeChatBots.clear();
  }
};
