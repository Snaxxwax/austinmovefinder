# Austin Move Finder Backend

Backend API server for the Austin Move Finder moving services platform.

## Features

- **Quote Management**: Create, update, and track moving quotes
- **AI Object Detection**: Automatically detect household items from photos/videos
- **File Upload**: Handle media files with processing and storage
- **Email Notifications**: Automated email system for quotes and confirmations
- **Austin-Specific Pricing**: Dynamic pricing based on Austin neighborhoods and factors
- **Database**: SQLite with comprehensive schema for customers, quotes, and items

## Tech Stack

- **Runtime**: Node.js 18+ with ES modules
- **Framework**: Express.js with security middleware
- **Database**: SQLite3 with custom ORM models
- **File Storage**: Local filesystem with multer
- **Email**: Nodemailer with SMTP
- **AI**: Hugging Face object detection API
- **Security**: Helmet, CORS, rate limiting, input validation

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start development server
npm run dev

# Or start production server
npm start
```

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./data/austinmovefinder.db

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@austinmovefinder.com
TO_EMAIL=quotes@austinmovefinder.com

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=26214400
UPLOAD_PATH=./uploads

# AI Object Detection
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

## API Endpoints

### Health Check
- `GET /api/health` - Server and service health status

### Quotes
- `POST /api/quotes` - Create new quote
- `GET /api/quotes/:id` - Get quote details
- `PUT /api/quotes/:id` - Update quote
- `GET /api/quotes` - List quotes (with pagination)
- `POST /api/quotes/:id/items` - Add detected items to quote
- `POST /api/quotes/:id/submit` - Submit quote and send emails

### File Upload
- `POST /api/upload/:quote_id` - Upload media files
- `GET /api/upload/:quote_id/files` - Get files for quote
- `GET /api/upload/file/:filename` - Serve uploaded file
- `DELETE /api/upload/file/:filename` - Delete file

## Database Schema

### Tables
- **customers**: Customer information and contact details
- **quotes**: Moving quotes with all details and pricing
- **detected_items**: AI-detected household items from photos
- **media_files**: Uploaded photos and videos
- **quote_history**: Audit trail of quote changes
- **neighborhoods**: Austin neighborhood data with pricing factors
- **pricing_rules**: Dynamic pricing rules and multipliers

### Key Features
- Foreign key constraints for data integrity
- Indexes for query performance
- Austin-specific neighborhood and pricing data
- Audit trails for quote modifications

## Austin-Specific Features

### Neighborhood Pricing
The system includes Austin-specific neighborhoods with pricing multipliers:
- **Downtown**: Higher rates due to parking and access challenges
- **Westlake/Hill Country**: Terrain and distance surcharges
- **Cedar Park/Round Rock**: Suburban distance factors
- **East Austin**: Standard rates with growth considerations

### Seasonal Pricing
- **Peak Season (May-September)**: 25% increase due to heat and UT students
- **Off Season (October-April)**: 10% discount
- **Weekend Surcharge**: 15% increase for weekend moves

### Move Type Multipliers
- **Local Austin**: Base rate
- **Long Distance**: 50% increase + fixed costs
- **Commercial**: 80% increase for business moves
- **Storage**: 20% increase for storage services

## Object Detection

The system uses Hugging Face's DETR model for object detection:

### Supported Items
- **Furniture**: Couch, chair, bed, dining table, etc.
- **Appliances**: Refrigerator, microwave, oven, etc.
- **Electronics**: TV, laptop, computer equipment
- **Fragile Items**: Glassware, vases, decorative items
- **Personal Items**: Suitcases, books, clothing

### Processing Pipeline
1. Image upload and optimization
2. AI object detection via Hugging Face API
3. Label mapping to moving item catalog
4. Cost calculation based on detected items
5. Automatic quote updates

## Email System

### Business Notifications
- Detailed quote information with customer details
- AI-detected items list with confidence scores
- Media file attachments and summaries
- Follow-up reminders and scheduling

### Customer Confirmations
- Professional branded emails with Austin theme
- Quote summaries with cost breakdowns
- Next steps and contact information
- Moving tips and preparation guides

## Development

### Project Structure
```
backend/
├── src/
│   ├── database/           # Database connection and schema
│   ├── models/            # Data models (Customer, Quote)
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   └── server.js          # Main server entry point
├── data/                  # SQLite database files
├── uploads/               # Uploaded media files
└── package.json           # Dependencies and scripts
```

### Adding New Features

1. **Database Changes**: Update `schema.sql` and run migrations
2. **API Endpoints**: Add routes in appropriate route files
3. **Business Logic**: Implement in service classes
4. **Models**: Extend database models as needed

### Testing

```bash
# Run tests (when implemented)
npm test

# Check API endpoints
curl http://localhost:5000/api/health
```

## Deployment

### Production Setup

1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Ensure data directory is persistent
3. **Uploads**: Configure file storage (consider cloud storage)
4. **Email**: Use production SMTP service
5. **Security**: Review rate limits and CORS origins
6. **Monitoring**: Set up logging and error tracking

### Docker Support (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Follow Austin Move Finder coding standards
2. Add tests for new features
3. Update documentation
4. Test with local Austin data

## Support

For issues or questions:
- Check API documentation at `/api`
- Review health check at `/api/health`
- Contact: hello@austinmovefinder.com

---

**Austin Move Finder Backend** - Powering smooth moves across Austin, Texas! 🚚