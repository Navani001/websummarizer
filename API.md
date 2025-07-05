# API Documentation

## Overview
This API provides endpoints for interacting with websites through AI-powered chat functionality. It supports multi-user sessions, caching, and intelligent question answering.

## Base URL
```
http://localhost:5000/api/website
```

## Authentication
No authentication required for basic functionality. Use `x-session-id` header for session management.

## Headers
- `Content-Type: application/json` (for POST requests)
- `x-session-id: <session_id>` (optional, for session management)

---

## Website Management Endpoints

### Switch to Website
**POST** `/switch-website`

Switch the chatbot to a specific website for the session.

**Request Body:**
```json
{
  "url": "https://example.com",
  "forceRefresh": false
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "fromCache": false,
  "docCount": 25,
  "createdAt": "2025-07-05T10:30:00.000Z"
}
```

### Get Current Website
**GET** `/current-website`

Get information about the currently loaded website for the session.

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "hasVectorStore": true,
  "fromCache": true
}
```

### Refresh Current Website
**POST** `/refresh-website`

Force refresh the current website content.

**Response:**
```json
{
  "success": true,
  "message": "Website refreshed successfully",
  "url": "https://example.com",
  "fromCache": false,
  "docCount": 25,
  "createdAt": "2025-07-05T10:35:00.000Z"
}
```

---

## Chat & Question Endpoints

### Ask Question
**POST** `/ask`

Ask a question about the currently loaded website.

**Request Body:**
```json
{
  "question": "What is this website about?",
  "url": "https://example.com",
  "forceRefresh": false
}
```

**Response:**
```json
{
  "success": true,
  "query": "What is this website about?",
  "response": "This website is about...",
  "website": "https://example.com",
  "fromCache": true,
  "confidence": 0.85,
  "sources": [
    {
      "content": "This is the main content of the page...",
      "score": "0.850",
      "metadata": {
        "source": "https://example.com",
        "chunkIndex": 0
      }
    }
  ]
}
```

### Direct Chat
**POST** `/chat`

Have a one-shot conversation with a website without maintaining session state.

**Request Body:**
```json
{
  "url": "https://example.com",
  "question": "What information is available?",
  "forceRefresh": false
}
```

**Response:**
```json
{
  "success": true,
  "query": "What information is available?",
  "response": "The website contains information about...",
  "fromCache": false,
  "docCount": 25,
  "createdAt": "2025-07-05T10:30:00.000Z",
  "website": "https://example.com",
  "relevantChunks": [
    {
      "content": "Relevant content snippet...",
      "metadata": {
        "source": "https://example.com",
        "chunkIndex": 2
      }
    }
  ]
}
```

---

## Cache Management Endpoints

### Get Cache Statistics
**GET** `/cache-stats`

Get statistics about the current cache state.

**Response:**
```json
{
  "success": true,
  "totalCachedWebsites": 5,
  "maxCacheSize": 50,
  "cacheExpiryHours": 24,
  "websites": [
    {
      "url": "https://example.com",
      "docCount": 25,
      "createdAt": "2025-07-05T10:30:00.000Z",
      "domain": "example.com",
      "age": 15
    }
  ]
}
```

### Clear Cache
**POST** `/clear-cache`

Clear cache for a specific URL or all cached websites.

**Request Body (Clear specific URL):**
```json
{
  "url": "https://example.com"
}
```

**Request Body (Clear all cache):**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared for https://example.com"
}
```

---

## Session Management Endpoints

### Clear Session
**POST** `/clear-session`

Clear the current session state.

**Response:**
```json
{
  "success": true,
  "message": "Session cleared successfully"
}
```

### Get Active Sessions
**GET** `/sessions`

Get information about all active sessions.

**Response:**
```json
{
  "success": true,
  "totalSessions": 3,
  "sessions": [
    {
      "sessionId": "user123",
      "currentWebsite": "https://example.com",
      "hasVectorStore": true,
      "fromCache": true
    },
    {
      "sessionId": "user456",
      "currentWebsite": null,
      "hasVectorStore": false,
      "fromCache": false
    }
  ]
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Errors:**
- `"Please provide a valid URL"` - Missing or invalid URL
- `"Please provide a valid question"` - Missing or invalid question
- `"No website loaded. Please switch to a website first or provide a URL."` - No website in session
- `"Failed to process question"` - Internal processing error

---

## Session Management

### Using Sessions
Include the `x-session-id` header in your requests to maintain state across multiple API calls:

```bash
curl -X POST http://localhost:5000/api/website/switch-website \
  -H "Content-Type: application/json" \
  -H "x-session-id: user123" \
  -d '{"url": "https://example.com"}'

curl -X POST http://localhost:5000/api/website/ask \
  -H "Content-Type: application/json" \
  -H "x-session-id: user123" \
  -d '{"question": "What is this about?"}'
```

### Session Benefits
- Maintain website state between requests
- Ask multiple questions without re-processing
- Isolated user experiences
- Better performance through state reuse

---

## Performance Notes

### Caching
- First visit to a website: ~5-10 seconds (scraping + processing)
- Subsequent visits: ~100-500ms (from cache)
- Cache automatically expires after 24 hours
- Maximum 50 websites cached at once

### Rate Limiting
Currently no rate limiting implemented. Consider adding rate limiting for production use.

### Timeouts
- Website scraping timeout: 1000ms
- Default request timeout: 30 seconds
