# Chat API Documentation

## Overview
This API provides endpoints to chat with websites using AI. It supports both single queries and session-based conversations.

## Base URL
All chat endpoints are prefixed with `/api/chat`

## Endpoints

### 1. Single Chat Query
**POST** `/api/chat/query`

Performs a one-time chat with a website without maintaining session state.

**Request Body:**
```json
{
  "url": "https://example.com",
  "query": "What is this website about?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "What is this website about?",
    "response": "AI generated response...",
    "relevantChunks": [
      {
        "content": "Content snippet...",
        "similarity": "0.85"
      }
    ]
  }
}
```

### 2. Initialize ChatBot Session
**POST** `/api/chat/initialize`

Initializes a persistent chatbot session for a specific website.

**Request Body:**
```json
{
  "url": "https://example.com",
  "sessionId": "unique-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ChatBot initialized for https://example.com",
  "sessionId": "unique-session-id",
  "url": "https://example.com"
}
```

### 3. Ask Question to ChatBot
**POST** `/api/chat/ask`

Ask a question to an initialized chatbot session.

**Request Body:**
```json
{
  "sessionId": "unique-session-id",
  "query": "Tell me more about this topic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Tell me more about this topic",
    "response": "AI generated response...",
    "confidence": 0.85
  },
  "sessionId": "unique-session-id"
}
```

### 4. Get ChatBot Status
**GET** `/api/chat/status?sessionId=unique-session-id`

Check if a chatbot session exists and get general status.

**Response:**
```json
{
  "success": true,
  "sessionExists": true,
  "sessionId": "unique-session-id",
  "activeSessions": 3
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing fields, invalid URL)
- `404` - Not Found (session not found)
- `409` - Conflict (session already exists)
- `500` - Internal Server Error

## Usage Examples

### Using curl

#### Single Query:
```bash
curl -X POST http://localhost:5000/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://en.wikipedia.org/wiki/Game",
    "query": "What is this page about?"
  }'
```

#### Initialize Session:
```bash
curl -X POST http://localhost:5000/api/chat/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://en.wikipedia.org/wiki/Game",
    "sessionId": "my-session-123"
  }'
```

#### Ask Question:
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session-123",
    "query": "What are the different types of games mentioned?"
  }'
```

## Notes

- Sessions are stored in memory and will be lost when the server restarts
- For production use, consider implementing session persistence with Redis or a database
- URL validation is performed on all endpoints that accept URLs
- The AI model used is Google's Gemini 1.5 Flash
- Website content is scraped and chunked for efficient processing
