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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWebsite = exports.WebsiteChatBot = void 0;
exports.chatWithWebsite = chatWithWebsite;
exports.default = handler;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generative_ai_1 = require("@google/generative-ai");
const textsplitters_1 = require("@langchain/textsplitters");
const scraper_1 = require("./src/services/scraper");
// === Setup ===
const ai = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');
const embedModel = ai.getGenerativeModel({ model: 'embedding-001' });
const chatModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
const textSplitter = new textsplitters_1.CharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 10,
});
// Custom embedding function that returns the values array
function embedText(text) {
    return __awaiter(this, void 0, void 0, function* () {
        // Limit text length to prevent API errors (roughly 30KB limit)
        const maxLength = 20000; // Conservative limit
        const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;
        if (truncatedText.trim().length === 0) {
            console.warn('Empty text provided to embedText, returning zero vector');
            return new Array(768).fill(0); // Return a zero vector of typical embedding size
        }
        try {
            const res = yield embedModel.embedContent(truncatedText);
            return res.embedding.values;
        }
        catch (error) {
            console.error('Error embedding text:', error);
            console.error('Text length:', truncatedText.length);
            throw error;
        }
    });
}
// Cosine similarity function
function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}
// Vector search function
function vectorSearch(queryEmbedding, documents, topK = 3) {
    const similarities = documents.map((doc, index) => ({
        index,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding),
        content: doc.pageContent
    }));
    return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
}
// Generate response using retrieved context
function generateResponse(query, relevantChunks) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = relevantChunks.map(chunk => chunk.content).join('\n\n');
        const prompt = `
Based on the following website content, answer the user's question about the website:

Website Content:
${context}

User Question: ${query}

Please provide a helpful and accurate response based on the website content. If the question cannot be answered from the content, say so politely.
`;
        const result = yield chatModel.generateContent(prompt);
        return result.response.text();
    });
}
const processWebsite = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`🔍 Scraping website: ${url}`);
        // Scrape website content
        const result = yield (0, scraper_1.scraper)(url, {
            timeout: 1000,
            screenshot: false
        });
        // Split content into chunks
        const texts = yield textSplitter.splitText(result.content);
        console.log(`📝 Split content into ${texts.length} chunks.`);
        // Embed each chunk
        const embeddings = yield Promise.all(texts.map((chunk) => embedText(chunk)));
        // Create document objects with embeddings
        const docs = texts.map((text, i) => ({
            pageContent: text,
            embedding: embeddings[i],
        }));
        console.log(`✅ Embedded and stored ${docs.length} chunks.`);
        return docs;
    }
    catch (error) {
        console.error('Error processing website:', error);
        throw error;
    }
});
exports.processWebsite = processWebsite;
// Main chat function
function chatWithWebsite(url, userQuery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Process website and get document embeddings
            const docs = yield processWebsite(url);
            // Embed user query
            console.log(`🤔 Processing query: "${userQuery}"`);
            const queryEmbedding = yield embedText(userQuery);
            // Perform vector search
            const relevantChunks = vectorSearch(queryEmbedding, docs, 3);
            console.log(`🔍 Found ${relevantChunks.length} relevant chunks`);
            // Generate response
            const response = yield generateResponse(userQuery, relevantChunks);
            return {
                query: userQuery,
                response: response,
                relevantChunks: relevantChunks.map(chunk => ({
                    content: chunk.content.substring(0, 100) + '...',
                    similarity: chunk.similarity.toFixed(3)
                }))
            };
        }
        catch (error) {
            console.error('Error in chat:', error);
            throw error;
        }
    });
}
// Interactive chat function for continuous conversation
class WebsiteChatBot {
    constructor() {
        this.docs = [];
        this.url = '';
    }
    initialize(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.url = url;
            this.docs = yield processWebsite(url);
            console.log(`🤖 Bot initialized for ${url}`);
        });
    }
    ask(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.docs.length === 0) {
                throw new Error('Bot not initialized. Call initialize() first.');
            }
            const queryEmbedding = yield embedText(query);
            const relevantChunks = vectorSearch(queryEmbedding, this.docs, 3);
            const response = yield generateResponse(query, relevantChunks);
            return {
                query,
                response,
                confidence: ((_a = relevantChunks[0]) === null || _a === void 0 ? void 0 : _a.similarity) || 0
            };
        });
    }
}
exports.WebsiteChatBot = WebsiteChatBot;
const jwt_1 = __importDefault(require("./src/middleware/jwt"));
const auth_1 = require("./src/routes/auth");
const chat_1 = require("./src/routes/chat");
// Register routes
jwt_1.default.get('/', {
    preHandler: [jwt_1.default.authenticate],
}, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { hello: 'world' };
}));
jwt_1.default.get('/jwt', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hi");
    return reply.status(200).send({ hello: 'world' });
}));
jwt_1.default.register(auth_1.LoginUserRoute, { prefix: "/api/auth" });
jwt_1.default.register(chat_1.ChatRoutes, { prefix: "/api/chat" });
// For Vercel serverless functions
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield jwt_1.default.ready();
        jwt_1.default.server.emit('request', req, res);
    });
}
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield jwt_1.default.listen({ port: 5000, host: '0.0.0.0' });
        console.log('Server listening on port 5000');
    }
    catch (err) {
        jwt_1.default.log.error(err);
        process.exit(1);
    }
});
start();
