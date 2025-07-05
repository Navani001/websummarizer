# Website ChatBot - Refactored Architecture

This project has been refactored into a clean, modular architecture for better maintainability and readability.

## 📁 Project Structure

```
src/
├── lib/                    # Core business logic
│   ├── config.ts          # Configuration constants
│   ├── aiService.ts       # Google AI & LangChain services
│   ├── vectorStoreCache.ts # Vector store caching logic
│   ├── websiteProcessor.ts # Website processing utilities
│   ├── websiteChatBot.ts  # Main ChatBot class
│   └── prisma.ts          # Database connection (existing)
├── controllers/           # Route handlers
│   ├── auth.ts           # Authentication controllers (existing)
│   ├── chat.ts           # Chat controllers (existing)
│   └── website.ts        # Website-related controllers (new)
├── routes/               # Route definitions
│   ├── auth.ts          # Auth routes (existing)
│   ├── chat.ts          # Chat routes (existing)
│   └── website.ts       # Website routes (new)
├── services/            # External services
│   ├── auth.ts         # Auth service (existing)
│   └── scraper.ts      # Web scraping service (existing)
└── middleware/          # Middleware
    └── jwt.ts          # JWT middleware (existing)
```

## 🧩 Module Breakdown

### 📋 **src/lib/config.ts**
- Contains all configuration constants
- Environment variables
- Cache settings
- AI model configurations

### 🤖 **src/lib/aiService.ts**
- Singleton service for Google AI integration
- Handles text generation and embeddings
- Text splitting functionality
- Centralized AI operations

### 💾 **src/lib/vectorStoreCache.ts**
- Manages vector store caching
- Automatic cleanup of expired entries
- Cache size management
- Cache statistics

### 🌐 **src/lib/websiteProcessor.ts**
- Website content processing
- Vector store creation and caching
- Core chat functionality
- Type definitions for processing results

### 🤖 **src/lib/websiteChatBot.ts**
- Main ChatBot class
- Website switching functionality
- Query processing with confidence scores
- Cache management interface

### 🎛️ **src/controllers/website.ts**
- Route handlers for website operations
- Request/response processing
- Error handling
- Input validation

### 🛣️ **src/routes/website.ts**
- Route definitions
- Endpoint registration
- Route organization

## 🚀 Key Features

### ✨ **Improved Modularity**
- Each module has a single responsibility
- Clear separation of concerns
- Easy to test and maintain

### 🔧 **Configuration Management**
- Centralized configuration
- Environment-based settings
- Easy to modify settings

### 🧪 **Type Safety**
- Comprehensive TypeScript interfaces
- Better IDE support
- Reduced runtime errors

### 📦 **Caching System**
- Intelligent cache management
- Automatic cleanup
- Performance optimization

### 🔌 **Easy Integration**
- Clean API interfaces
- Modular imports
- Extensible architecture

### 👥 **Session Management**
- Multi-user support with session IDs
- Isolated bot instances per session
- Session-based website state management
- Easy session cleanup and monitoring

## 📖 Usage Examples

### Basic Usage
```typescript
import { WebsiteChatBot } from './src/lib/websiteChatBot';

const bot = new WebsiteChatBot();

// Switch to a website
await bot.switchToWebsite('https://example.com');

// Ask questions
const result = await bot.ask('What is this website about?');
console.log(result.response);
```

### Direct Processing
```typescript
import { chatWithWebsite } from './src/lib/websiteProcessor';

const result = await chatWithWebsite(
  'https://example.com',
  'What information is available?'
);
```

### Session-based Chat Flow
```typescript
// Using session headers for multi-user support
const sessionId = 'user123';

// 1. Switch to website
await fetch('/api/website/switch-website', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-session-id': sessionId
  },
  body: JSON.stringify({ url: 'https://example.com' })
});

// 2. Ask multiple questions in the same session
const response1 = await fetch('/api/website/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-session-id': sessionId
  },
  body: JSON.stringify({ question: 'What is this website about?' })
});

const response2 = await fetch('/api/website/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-session-id': sessionId
  },
  body: JSON.stringify({ question: 'What are the main features?' })
});
```

### Cache Management
```typescript
const bot = new WebsiteChatBot();

// Get cache statistics
const stats = bot.getCacheStats();

// Clear specific website cache
bot.clearWebsiteCache('https://example.com');

// Clear all cache
bot.clearAllCache();
```

## 🛠️ API Endpoints

### Website Management
- `GET /` - Test cache functionality
- `POST /switch-website` - Switch to a different website
- `GET /current-website` - Get current website information
- `POST /refresh-website` - Refresh current website (force reload)

### Chat & Questions
- `POST /ask` - Ask a question to the current website
- `POST /chat` - Direct chat with a website (one-shot)

### Cache Management
- `GET /cache-stats` - Get cache statistics
- `POST /clear-cache` - Clear cache (all or specific URL)

### Session Management
- `POST /clear-session` - Clear current session
- `GET /sessions` - Get all active sessions

### Request Examples

#### Switch to Website
```bash
curl -X POST http://localhost:5000/api/website/switch-website \
  -H "Content-Type: application/json" \
  -H "x-session-id: user123" \
  -d '{"url": "https://example.com", "forceRefresh": false}'
```

#### Ask Question
```bash
curl -X POST http://localhost:5000/api/website/ask \
  -H "Content-Type: application/json" \
  -H "x-session-id: user123" \
  -d '{"question": "What is this website about?"}'
```

#### Direct Chat
```bash
curl -X POST http://localhost:5000/api/website/chat \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "question": "What information is available?",
    "forceRefresh": false
  }'
```

#### Get Current Website
```bash
curl -X GET http://localhost:5000/api/website/current-website \
  -H "x-session-id: user123"
```

## 🔧 Configuration

All configurations are centralized in `src/lib/config.ts`:

```typescript
export const CACHE_CONFIG = {
  EXPIRY_HOURS: 24,
  MAX_SIZE: 50,
};

export const AI_CONFIG = {
  GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,
  GEMINI_MODEL: 'gemini-1.5-flash',
  EMBEDDING_MODEL: 'text-embedding-004',
};
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```

3. Start the server:
```bash
npm start
```

## 🎯 Benefits of Refactoring

1. **Maintainability**: Each module is focused and easy to understand
2. **Testability**: Individual modules can be tested in isolation
3. **Scalability**: Easy to add new features without affecting existing code
4. **Readability**: Clear structure makes the codebase easier to navigate
5. **Reusability**: Modules can be imported and used independently
6. **Type Safety**: Comprehensive TypeScript interfaces reduce errors

This refactored architecture provides a solid foundation for future development and maintenance.
