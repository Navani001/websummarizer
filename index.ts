import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { scraper } from './src/services/scraper';

// === Setup ===
const ai = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');
const embedModel = ai.getGenerativeModel({ model: 'embedding-001' });
const chatModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

const textSplitter = new CharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 10,
});

// Custom embedding function that returns the values array
async function embedText(text: string): Promise<number[]> {
  // Limit text length to prevent API errors (roughly 30KB limit)
  const maxLength = 20000; // Conservative limit
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;
  
  if (truncatedText.trim().length === 0) {
    console.warn('Empty text provided to embedText, returning zero vector');
    return new Array(768).fill(0); // Return a zero vector of typical embedding size
  }
  
  try {
    const res = await embedModel.embedContent(truncatedText);
    return res.embedding.values;
  } catch (error) {
    console.error('Error embedding text:', error);
    console.error('Text length:', truncatedText.length);
    throw error;
  }
}

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Vector search function
function vectorSearch(queryEmbedding: number[], documents: any[], topK: number = 3) {
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
async function generateResponse(query: string, relevantChunks: any[]) {
  const context = relevantChunks.map(chunk => chunk.content).join('\n\n');
  
  const prompt = `
Based on the following website content, answer the user's question about the website:

Website Content:
${context}

User Question: ${query}

Please provide a helpful and accurate response based on the website content. If the question cannot be answered from the content, say so politely.
`;

  const result = await chatModel.generateContent(prompt);
  return result.response.text();
}

const processWebsite = async (url: string) => {
  try {
    console.log(`🔍 Scraping website: ${url}`);
    
    // Scrape website content
    const result = await scraper(url, {
      timeout: 1000,
      screenshot: false
    });

    // Split content into chunks
    const texts = await textSplitter.splitText(result.content);
    console.log(`📝 Split content into ${texts.length} chunks.`);

    // Embed each chunk
    const embeddings = await Promise.all(
      texts.map((chunk) => embedText(chunk))
    );

    // Create document objects with embeddings
    const docs = texts.map((text, i) => ({
      pageContent: text,
      embedding: embeddings[i],
    }));

    console.log(`✅ Embedded and stored ${docs.length} chunks.`);
    
    return docs;
  } catch (error) {
    console.error('Error processing website:', error);
    throw error;
  }
};

// Main chat function
async function chatWithWebsite(url: string, userQuery: string) {
  try {
    // Process website and get document embeddings
    const docs = await processWebsite(url);
    
    // Embed user query
    console.log(`🤔 Processing query: "${userQuery}"`);
    const queryEmbedding = await embedText(userQuery);
    
    // Perform vector search
    const relevantChunks = vectorSearch(queryEmbedding, docs, 3);
    console.log(`🔍 Found ${relevantChunks.length} relevant chunks`);
    
    // Generate response
    const response = await generateResponse(userQuery, relevantChunks);
    
    return {
      query: userQuery,
      response: response,
      relevantChunks: relevantChunks.map(chunk => ({
        content: chunk.content.substring(0, 100) + '...',
        similarity: chunk.similarity.toFixed(3)
      }))
    };
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
}

// Example usage
const runExample = async () => {
  try {
    const result = await chatWithWebsite(
      'https://en.wikipedia.org/wiki/Game',
      'What is the purpose of this website?'
    );
    
    console.log('\n=== Chat Result ===');
    console.log('Query:', result.query);
    console.log('Response:', result.response);
    console.log('\nRelevant chunks used:');
    result.relevantChunks.forEach((chunk, i) => {
      console.log(`${i + 1}. Similarity: ${chunk.similarity} - ${chunk.content}`);
    });
  } catch (error) {
    console.error('Example failed:', error);
  }
};

// Interactive chat function for continuous conversation
class WebsiteChatBot {
  private docs: any[] = [];
  private url: string = '';

  async initialize(url: string) {
    this.url = url;
    this.docs = await processWebsite(url);
    console.log(`🤖 Bot initialized for ${url}`);
  }

  async ask(query: string) {
    if (this.docs.length === 0) {
      throw new Error('Bot not initialized. Call initialize() first.');
    }

    const queryEmbedding = await embedText(query);
    const relevantChunks = vectorSearch(queryEmbedding, this.docs, 3);
    const response = await generateResponse(query, relevantChunks);
    
    return {
      query,
      response,
      confidence: relevantChunks[0]?.similarity || 0
    };
  }
}

// Export for use in other modules
export { WebsiteChatBot, chatWithWebsite, processWebsite };



import fastify from './src/middleware/jwt';
import {  LoginUserRoute } from './src/routes/auth';
import { ChatRoutes } from './src/routes/chat';

fastify.get('/',{
            preHandler: [fastify.authenticate],
        }, async (request:any, reply:any) => {
  return { hello: 'world' }
})
fastify.get('/jwt', async (request:any, reply:any) => {
  console.log("Hi")
  return reply.status(200).send({ hello: 'world' })
})
fastify.register(LoginUserRoute,{prefix:"/api/auth"})
fastify.register(ChatRoutes,{prefix:"/api/chat"})
const start = async () => {
  try {
    await fastify.listen({ port: 5000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()