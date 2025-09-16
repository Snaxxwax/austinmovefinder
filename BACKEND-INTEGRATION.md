# Austin Move Finder - Backend Integration Guide

## Overview

The Austin Move Finder backend is a Node.js/Express API that provides:

- **Quote Management**: Create, update, and manage moving quotes
- **AI Object Detection**: Analyze uploaded photos/videos to identify moving items
- **Email Notifications**: Send confirmations and business notifications
- **Austin-Specific Pricing**: Location-aware pricing with neighborhood data
- **Media Processing**: Handle image/video uploads with analysis

## Architecture

```
austinmovefinder/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── server.js        # Main server entry point
│   │   ├── database/        # SQLite database layer
│   │   ├── models/          # Data models (Quote, Customer)
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic services
│   │   └── ...
│   ├── start.js             # Startup script with setup
│   ├── package.json         # Backend dependencies
│   └── .env.example         # Environment template
├── src/
│   └── services/
│       └── backendApi.ts    # Frontend API client
└── setup-dev.sh            # Development setup script
```

## Quick Start

### 1. Development Setup

```bash
# Run the automated setup
./setup-dev.sh

# Or manual setup:
# Frontend
npm install
cp .env.example .env.local

# Backend
cd backend
npm install
cp .env.example .env
cd ..
```

### 2. Configuration

**Frontend (.env.local):**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_HUGGINGFACE_API_KEY=your_api_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id  # Fallback email
```

**Backend (backend/.env):**
```env
PORT=5000
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
HUGGINGFACE_API_KEY=your_api_key_here
JWT_SECRET=your-secure-random-string
FROM_EMAIL=noreply@austinmovefinder.com
TO_EMAIL=quotes@austinmovefinder.com
```

### 3. Start Development

```bash
# Start both frontend and backend
./start-dev.sh

# Or start individually:
npm run dev                    # Frontend (port 5173)
cd backend && npm run dev      # Backend (port 5000)
```

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| POST | `/api/quotes` | Create new quote |
| GET | `/api/quotes/:id` | Get quote details |
| PUT | `/api/quotes/:id` | Update quote |
| POST | `/api/quotes/:id/items` | Add detected items |
| POST | `/api/quotes/:id/submit` | Submit quote (send emails) |
| POST | `/api/upload/:quote_id` | Upload media files |

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "services": {
    "database": "connected",
    "email": "connected",
    "ai_detection": "available",
    "server": "running"
  },
  "version": "1.0.0",
  "environment": "development"
}
```

### Quote Creation

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(512) 555-1234",
  "move_type": "local",
  "move_date": "2024-02-15",
  "from_address": "123 Main St, Austin, TX",
  "to_address": "456 Oak Ave, Austin, TX",
  "estimated_size": "2br",
  "special_items": "Piano, artwork",
  "notes": "Third floor, no elevator"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quote": {
      "id": 123,
      "customer_id": 456,
      "move_type": "local",
      "estimated_cost": 850,
      "status": "pending",
      "created_at": "2024-01-20T10:30:00.000Z"
    },
    "customer": {
      "id": 456,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "estimated_cost": 850
  }
}
```

## Frontend Integration

### Backend API Service

The frontend uses `src/services/backendApi.ts` to communicate with the backend:

```typescript
import { backendApi } from '../services/backendApi';

// Create a quote
const response = await backendApi.createQuote({
  customer: { name, email, phone },
  quote: { move_type, move_date, ... },
  files: [file1, file2]
});

// Check backend availability
const isAvailable = await backendApi.isBackendAvailable();

// Fallback to EmailJS if backend unavailable
if (!isAvailable) {
  await backendApi.sendEmailFallback(quoteData);
}
```

### Form Integration

The `FastQuoteForm` component automatically:

1. **Checks backend availability** on component mount
2. **Submits to backend** when available (full features)
3. **Falls back to EmailJS** when backend unavailable
4. **Shows appropriate status** to users
5. **Handles errors gracefully** with user-friendly messages

## Austin-Specific Features

### 1. Neighborhood Pricing

The backend includes Austin neighborhood data with pricing multipliers:

```javascript
// Downtown Austin (higher cost due to parking/permits)
if (addressText.includes('downtown')) {
  adjustedCost *= 1.25;
  adjustedCost += 85; // Parking fees
}

// Westlake/Tarrytown (difficult access)
if (difficultAreas.includes(area)) {
  adjustedCost *= 1.15;
}
```

### 2. Seasonal Adjustments

```javascript
// Peak season (May-August: UT students, summer moves)
if (month >= 5 && month <= 8) {
  adjustedCost *= 1.25;
}

// Weekend premium
if (dayOfWeek === 0 || dayOfWeek === 6) {
  adjustedCost *= 1.15;
}
```

### 3. Austin Moving Tips

The pricing service generates location-specific tips:

```javascript
getAustinMovingTips(detectedItems);
// Returns tips like:
// "🌡️ Austin heat: Schedule early morning moves in summer"
// "🚦 Traffic: Avoid I-35 and MoPac during rush hours"
// "🅿️ Parking: Downtown moves may require permit"
```

## Database Schema

### Core Tables

**quotes** - Moving quote information
```sql
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  move_type TEXT CHECK (move_type IN ('local', 'long-distance', 'commercial', 'storage')),
  move_date DATE,
  from_address TEXT,
  to_address TEXT,
  estimated_size TEXT,
  status TEXT DEFAULT 'pending',
  estimated_cost DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**customers** - Customer information
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**detected_items** - AI-detected items
```sql
CREATE TABLE detected_items (
  id INTEGER PRIMARY KEY,
  quote_id INTEGER,
  item_label TEXT,
  confidence_score REAL,
  quantity INTEGER DEFAULT 1,
  estimated_cost DECIMAL(8,2)
);
```

**neighborhoods** - Austin area data
```sql
CREATE TABLE neighborhoods (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  zone TEXT, -- 'central', 'north', 'south', 'east', 'west'
  avg_rent INTEGER,
  walk_score INTEGER,
  difficulty_multiplier DECIMAL(3,2)
);
```

## Email Services

### Backend Email Templates

The backend sends HTML emails with Austin branding:

1. **Business Notification** - New quote received
2. **Customer Confirmation** - Quote submitted successfully
3. **Quote Updates** - Changes to existing quotes

### Fallback Email (EmailJS)

When backend is unavailable, the frontend falls back to EmailJS:

```typescript
// Configure EmailJS in .env.local
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## Error Handling & Fallbacks

### Graceful Degradation

1. **Backend Available**: Full service with database, AI, email
2. **Backend Unavailable**: EmailJS fallback, local quote calculation
3. **AI Unavailable**: Demo mode with sample items
4. **Email Unavailable**: Quote still created, manual follow-up needed

### Error Messages

```typescript
// User-friendly error messages
if (error.message.includes('401')) {
  message = 'Invalid API key. Please check configuration.';
} else if (error.message.includes('429')) {
  message = 'Rate limit exceeded. Please try again in a few minutes.';
} else {
  message = 'Service temporarily unavailable. Please call (512) 555-MOVE.';
}
```

## Production Deployment

### Environment Variables

**Frontend (Cloudflare Pages):**
```env
VITE_BACKEND_URL=https://api.austinmovefinder.com
VITE_HUGGINGFACE_API_KEY=hf_xxxxx
VITE_EMAILJS_SERVICE_ID=service_xxxxx
```

**Backend (VPS/Cloud):**
```env
NODE_ENV=production
PORT=5000
DATABASE_PATH=/app/data/austinmovefinder.db
SMTP_HOST=smtp.gmail.com
FRONTEND_URL=https://austinmovefinder.pages.dev
```

### Security Considerations

1. **CORS**: Configured for production domains
2. **Rate Limiting**: 100 requests per 15 minutes per IP
3. **File Validation**: Size limits, type checking
4. **Input Sanitization**: All form inputs validated
5. **Error Handling**: No sensitive data in error responses

## Monitoring & Health Checks

### Health Check Endpoint

Monitor backend status:
```bash
curl -f http://localhost:5000/api/health
```

### Logging

The backend logs all requests and errors:
```javascript
// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url} - ${req.ip}`);
  next();
});
```

## Development Tools

### Available Scripts

```bash
# Backend
npm run dev      # Start with nodemon
npm run start    # Production start
npm run health   # Check backend health
npm run migrate  # Run database migrations

# Frontend Integration
./setup-dev.sh   # Complete setup
./start-dev.sh   # Start both services
```

### Testing

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test quote creation
curl -X POST http://localhost:5000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com",...}'
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change PORT in backend/.env
2. **Database locked**: Check file permissions in backend/data/
3. **SMTP errors**: Verify Gmail app password setup
4. **CORS errors**: Check ALLOWED_ORIGINS in backend/.env
5. **File upload fails**: Check UPLOAD_PATH directory exists

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

### Support

For technical issues:
- Check `/api/health` endpoint
- Review console logs in browser dev tools
- Check backend logs for server errors
- Contact: hello@austinmovefinder.com