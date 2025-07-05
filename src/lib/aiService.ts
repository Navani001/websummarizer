import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { AI_CONFIG, TEXT_SPLITTER_CONFIG } from './config';

// Initialize AI services
class AIService {
  private ai: GoogleGenerativeAI;
  private chatModel: any;
  private embedder: GoogleGenerativeAIEmbeddings;
  private textSplitter: CharacterTextSplitter;

  constructor() {
    this.ai = new GoogleGenerativeAI(AI_CONFIG.GOOGLE_GENAI_API_KEY);
    this.chatModel = this.ai.getGenerativeModel({ model: AI_CONFIG.GEMINI_MODEL });
    
    this.embedder = new GoogleGenerativeAIEmbeddings({
      model: AI_CONFIG.EMBEDDING_MODEL,
      apiKey: AI_CONFIG.GOOGLE_GENAI_API_KEY,
    });

    this.textSplitter = new CharacterTextSplitter({
      chunkSize: TEXT_SPLITTER_CONFIG.CHUNK_SIZE,
      chunkOverlap: TEXT_SPLITTER_CONFIG.CHUNK_OVERLAP,
    });
  }

  // Generate response using retrieved context
  async generateResponse(query: string, relevantDocs: Document[]): Promise<string> {
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');

    const prompt = `
Based on the following website content, answer the user's question about the website:

Website Content:
${context}

User Question: ${query}

Please provide a helpful and accurate response based on the website content. If the question cannot be answered from the content, say so politely.
`;

    const result = await this.chatModel.generateContent(prompt);
    return result.response.text();
  }

  // Split text into chunks
  async splitText(content: string): Promise<string[]> {
    return await this.textSplitter.splitText(content);
  }

  // Get embedder instance
  getEmbedder(): GoogleGenerativeAIEmbeddings {
    return this.embedder;
  }
}

// Export singleton instance
export const aiService = new AIService();
