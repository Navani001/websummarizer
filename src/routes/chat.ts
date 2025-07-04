import { FastifyInstance } from "fastify";
import { askChatBot, getChatBotStatus, initializeChatBot, singleChatQuery } from "../controllers/chat";

export async function ChatRoutes(fastify: FastifyInstance) {
  // Single query endpoint - chat with a website without maintaining state
  fastify.post("/query", singleChatQuery);
  
  // Initialize chatbot for a specific website
  fastify.post("/initialize", initializeChatBot);
  
  // Ask a question to an initialized chatbot
  fastify.post("/ask", askChatBot);
  
  // Get status of initialized chatbot
  fastify.get("/status", getChatBotStatus);

}
