"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupSessions = exports.getChatBotStatus = exports.askChatBot = exports.initializeChatBot = exports.singleChatQuery = void 0;
const index_1 = require("../../index");
// Store active chatbots in memory (in production, use Redis or similar)
const activeChatBots = new Map();
// Single query endpoint - no session state
const singleChatQuery = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (_a) {
            return reply.status(400).send({
                error: "Invalid URL format"
            });
        }
        const result = yield (0, index_1.chatWithWebsite)(url, query);
        return reply.status(200).send({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error("Error in single chat query:", error);
        return reply.status(500).send({
            error: "Failed to process chat query",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.singleChatQuery = singleChatQuery;
// Initialize chatbot for a specific website
const initializeChatBot = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (_a) {
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
        const chatBot = new index_1.WebsiteChatBot();
        yield chatBot.initialize(url);
        activeChatBots.set(sessionId, chatBot);
        return reply.status(200).send({
            success: true,
            message: `ChatBot initialized for ${url}`,
            sessionId,
            url
        });
    }
    catch (error) {
        console.error("Error initializing chatbot:", error);
        return reply.status(500).send({
            error: "Failed to initialize chatbot",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.initializeChatBot = initializeChatBot;
// Ask a question to an initialized chatbot
const askChatBot = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield chatBot.ask(query);
        return reply.status(200).send({
            success: true,
            data: result,
            sessionId
        });
    }
    catch (error) {
        console.error("Error asking chatbot:", error);
        return reply.status(500).send({
            error: "Failed to process question",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.askChatBot = askChatBot;
// Get status of initialized chatbot
const getChatBotStatus = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        console.error("Error getting chatbot status:", error);
        return reply.status(500).send({
            error: "Failed to get chatbot status",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.getChatBotStatus = getChatBotStatus;
// Clean up function to remove inactive sessions (call this periodically)
const cleanupSessions = (sessionId) => {
    if (sessionId) {
        activeChatBots.delete(sessionId);
    }
    else {
        // Clean up all sessions (useful for maintenance)
        activeChatBots.clear();
    }
};
exports.cleanupSessions = cleanupSessions;
