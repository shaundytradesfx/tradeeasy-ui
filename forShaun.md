# Backend-Frontend Integration Guide for Shaun

## Overview
This document provides specific integration requirements for the TradeEasy backend to ensure seamless connection with the existing Next.js frontend. The frontend is currently running on `http://localhost:3000` with a modern, responsive dashboard featuring sentiment gauges, news carousels, and market data tables.

## Current Frontend State
- ✅ **Dashboard**: Fully functional with sentiment gauges, news carousel, and market overview
- ✅ **UI Components**: Modern glassmorphism design with animations
- ✅ **Routing**: Next.js routing with dynamic asset pages
- ✅ **Real-time Ready**: WebSocket integration points prepared
- ⏳ **Backend Integration**: Waiting for API endpoints

## Required API Endpoints

### 1. Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "2024-01-20T10:00:00Z" }
```

### 2. Market Data & Sentiment
```
GET /api/sentiment/latest
Response: {
  "data": [
    {
      "asset": "AAPL",
      "name": "Apple Inc.",
      "sentiment_score": 0.65,
      "sentiment_label": "Bullish", // "Bullish", "Bearish", "Neutral"
      "price": 178.35,
      "change_percent": 1.25,
      "last_updated": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### 3. News Articles
```
GET /api/news/latest?limit=10
Response: {
  "news": [
    {
      "id": "uuid-string",
      "title": "Fed Expected to Maintain Interest Rates at Next Meeting",
      "content": "The Federal Reserve is widely expected...",
      "source": "Financial Times",
      "published_at": "2024-01-20T08:00:00Z",
      "sentiment": 0.15,
      "sentiment_label": "Bullish",
      "asset_mentions": ["USD", "SPY", "TLT"],
      "url": "https://ft.com/article/..."
    }
  ]
}
```

### 4. Asset-Specific Data
```
GET /api/assets/{symbol}
Response: {
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "current_price": 178.35,
  "change_percent": 1.25,
  "sentiment_score": 0.65,
  "sentiment_label": "Bullish",
  "price_history": [
    { "timestamp": "2024-01-20T09:00:00Z", "price": 177.50 },
    { "timestamp": "2024-01-20T10:00:00Z", "price": 178.35 }
  ],
  "sentiment_history": [
    { "timestamp": "2024-01-20T09:00:00Z", "score": 0.60 },
    { "timestamp": "2024-01-20T10:00:00Z", "score": 0.65 }
  ]
}
```

### 5. Search Functionality
```
GET /api/search?q={query}&limit=20
Response: {
  "results": [
    {
      "id": "uuid-string",
      "title": "Article title",
      "content_snippet": "First 200 characters...",
      "source": "Reuters",
      "published_at": "2024-01-20T08:00:00Z",
      "sentiment": 0.25,
      "sentiment_label": "Bullish",
      "asset_mentions": ["AAPL", "MSFT"],
      "relevance_score": 0.95
    }
  ],
  "total_count": 150
}
```

## Frontend Data Expectations

### Sentiment Scores
- **Range**: -1.0 to 1.0 (float)
- **Labels**: 
  - `score > 0.1`: "Bullish" 
  - `score < -0.1`: "Bearish"
  - `-0.1 <= score <= 0.1`: "Neutral"

### Asset Symbols
The frontend expects these specific symbols:
- **Equities**: AAPL, MSFT, GOOG, AMZN, TSLA
- **Crypto**: BTC, ETH, SOL, ADA, XRP
- **FX**: EUR/USD, GBP/USD, USD/JPY, USD/CAD, AUD/USD
- **Commodities**: GOLD, SILVER, OIL, NGAS, COPPER

### Date Formats
- All timestamps should be ISO 8601 format: `"2024-01-20T10:00:00Z"`
- Frontend will handle timezone conversion and relative time display

## WebSocket Integration

### Connection Endpoint
```
WS /ws/sentiment
```

### Message Format
```json
{
  "type": "sentiment_update",
  "data": {
    "asset": "AAPL",
    "sentiment_score": 0.67,
    "sentiment_label": "Bullish",
    "price": 179.25,
    "change_percent": 1.75,
    "timestamp": "2024-01-20T10:05:00Z"
  }
}

{
  "type": "news_update",
  "data": {
    "id": "uuid-string",
    "title": "Breaking: Apple announces new product",
    "source": "Reuters",
    "sentiment": 0.8,
    "asset_mentions": ["AAPL"],
    "published_at": "2024-01-20T10:05:00Z"
  }
}
```

## CORS Configuration
```python
# Required CORS settings for frontend integration
origins = [
    "http://localhost:3000",  # Development
    "http://localhost:3001",  # Backup port
    "https://tradeeasy.vercel.app",  # Production (if deployed)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## Environment Variables
The frontend expects the backend to run on:
- **Development**: `http://localhost:8000`
- **API Base URL**: Set in `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Error Handling
All API responses should include proper HTTP status codes:
- `200`: Success
- `400`: Bad Request (with error message)
- `404`: Not Found
- `500`: Internal Server Error
- `503`: Service Unavailable

Error response format:
```json
{
  "error": true,
  "message": "Descriptive error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Rate Limiting
Implement rate limiting for:
- Search API: 100 requests/minute per IP
- General APIs: 1000 requests/minute per IP
- WebSocket: 1 connection per IP

## Data Refresh Intervals
- **Market Data**: Update every 5 minutes
- **News Feed**: Update every 15 minutes  
- **Sentiment Scores**: Recalculate every hour
- **WebSocket Updates**: Real-time as data changes

## Testing Endpoints
For development and testing, please provide:
```
GET /api/test/sample-data
```
This should return sample data matching the exact format expected by the frontend components.

## Priority Implementation Order
1. **Health Check** - For basic connectivity testing
2. **Market Data API** - For dashboard sentiment gauges
3. **News API** - For news carousel functionality
4. **WebSocket** - For real-time updates
5. **Search API** - For search functionality
6. **Asset Detail API** - For individual asset pages

## Frontend Integration Points
- Dashboard components expect data every 30 seconds via polling or WebSocket
- News carousel auto-advances every 10 seconds
- Sentiment gauges animate when values change
- All components handle loading states and error conditions

## Notes for Implementation
- The frontend uses TypeScript - provide type definitions if possible
- All monetary values should include currency symbols in display format
- Asset mentions in news should be clickable links to asset detail pages
- Implement proper caching headers for static data
- Consider implementing GraphQL as an alternative to REST for complex queries

This integration guide ensures the backend will work seamlessly with the existing frontend architecture and user experience. 