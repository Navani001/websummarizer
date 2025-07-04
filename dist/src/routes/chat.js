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
exports.ChatRoutes = ChatRoutes;
const chat_1 = require("../controllers/chat");
function ChatRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        // Single query endpoint - chat with a website without maintaining state
        fastify.post("/query", chat_1.singleChatQuery);
        // Initialize chatbot for a specific website
        fastify.post("/initialize", chat_1.initializeChatBot);
        // Ask a question to an initialized chatbot
        fastify.post("/ask", chat_1.askChatBot);
        // Get status of initialized chatbot
        fastify.get("/status", chat_1.getChatBotStatus);
    });
}
