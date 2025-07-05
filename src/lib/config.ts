import dotenv from 'dotenv';
dotenv.config();

// Cache configuration
export const CACHE_CONFIG = {
  EXPIRY_HOURS: 24, // Cache expires after 24 hours
  MAX_SIZE: 50, // Maximum number of websites to cache
};

// AI Configuration
export const AI_CONFIG = {
  GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY || '',
  GEMINI_MODEL: 'gemini-1.5-flash',
  EMBEDDING_MODEL: 'text-embedding-004',
};

// Text Splitter Configuration
export const TEXT_SPLITTER_CONFIG = {
  CHUNK_SIZE: 100,
  CHUNK_OVERLAP: 10,
};

// Server Configuration
export const SERVER_CONFIG = {
  PORT: 5000,
  HOST: '0.0.0.0',
};
