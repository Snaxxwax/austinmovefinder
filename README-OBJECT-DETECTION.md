# 🤖 AI Object Detection Integration

This document explains how to set up and use the AI-powered object detection feature for instant moving quotes.

## 🎯 Features

- **Instant Item Recognition**: Upload photos/videos and get furniture & household items detected automatically
- **Dynamic Pricing**: Real-time cost calculation based on detected items
- **Editable Quotes**: Users can modify quantities, add/remove items
- **Austin-Specific Pricing**: Local labor rates, distance factors, and seasonal adjustments
- **Video Analysis**: Extract frames from videos for comprehensive item detection

## 🛠 Setup Instructions

### 1. Get Hugging Face API Key

1. Create account at [Hugging Face](https://huggingface.co)
2. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Create a new token with "Read" permissions
4. Copy the token

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API key
VITE_HUGGINGFACE_API_KEY=hf_your_actual_token_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## 📊 Cost Estimation

### Expected API Costs (Hugging Face Inference API):

- **Low Volume** (100 quotes/month): ~$3-5/month
- **Medium Volume** (1,000 quotes/month): ~$15-25/month  
- **High Volume** (10,000+ quotes/month): ~$100-200/month

### Cost Factors:
- Model: `facebook/detr-resnet-50` (~$0.002 per image)
- Video processing: 3x cost (extracts 3 frames)
- File size optimization reduces costs

## 🏗 Architecture

### Components:

1. **ObjectDetectionService** (`src/services/objectDetection.ts`)
   - Handles Hugging Face API calls
   - Processes images and videos
   - Filters relevant household items

2. **ItemizedQuote** (`src/components/ItemizedQuote.tsx`)
   - Displays detected items with confidence scores
   - Allows quantity editing and custom item addition
   - Calculates dynamic pricing

3. **Moving Cost Catalog** (`src/data/movingCosts.ts`)
   - 25+ furniture/household items with pricing
   - Austin-specific cost factors
   - Difficulty and special handling multipliers

### Detection Process:

```
Upload Media → Extract Frames (if video) → 
Send to Hugging Face → Filter Results → 
Group Similar Items → Calculate Costs → 
Display Editable Quote
```

## 🎨 Detected Item Categories

### Furniture
- Chairs, couches, beds, dining tables
- Base costs: $25-150 per item

### Appliances  
- Refrigerators, ovens, microwaves
- Base costs: $40-200 per item
- Special handling required

### Electronics
- TVs, laptops, gaming consoles
- Base costs: $20-75 per item
- Fragile item protection

### Personal Items
- Books, suitcases, decorative items
- Base costs: $15-40 per item

## 🔧 Customization

### Adding New Items

Edit `src/data/movingCosts.ts`:

```typescript
'new_item': {
  id: 'new_item',
  name: 'New Item',
  category: 'furniture',
  baseCost: 50,
  weight: 30,
  volume: 10,
  difficulty: 'medium',
  specialHandling: false,
  description: 'Description of new item'
}
```

### Adjusting Pricing

Modify `austinPricingFactors` in `movingCosts.ts`:

```typescript
export const austinPricingFactors = {
  baseLaborRate: 120, // per hour per mover
  truckRate: 1.2, // per mile
  specialtyMultiplier: 1.8,
  peakSeasonMultiplier: 1.3 // May-September
};
```

### Using Different Models

Update `ObjectDetectionService` constructor:

```typescript
private readonly API_URL = 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50';
```

**Recommended Models:**
- `facebook/detr-resnet-50` (Current - Best balance)
- `microsoft/table-transformer-structure-recognition` (Furniture focus)
- `PekingU/rtdetr_v2_r50vd` (Fastest)

## 🧪 Testing

### Manual Testing:
1. Navigate to `/fast-quote`
2. Upload test images with furniture
3. Verify items are detected correctly
4. Test quantity adjustments
5. Confirm pricing calculations

### Test Images:
Use images containing:
- Multiple furniture pieces
- Common household items
- Different room layouts
- Various lighting conditions

## 🚀 Production Deployment

### Performance Optimization:
1. **Image Compression**: Resize images before upload
2. **Caching**: Cache detection results for similar images
3. **Batch Processing**: Process multiple images together
4. **CDN**: Use CDN for faster image uploads

### Security:
- API keys in environment variables only
- Rate limiting on detection requests
- File type and size validation
- Sanitize user inputs

### Monitoring:
- Track API usage and costs
- Monitor detection accuracy
- Log errors and performance metrics
- A/B test different models

## 🐛 Troubleshooting

### Common Issues:

1. **"Failed to detect objects"**
   - Check API key is valid
   - Verify internet connection
   - Ensure image format is supported

2. **Slow detection**
   - Reduce image file sizes
   - Use single images instead of videos
   - Check Hugging Face API status

3. **Inaccurate detection**
   - Use better quality images
   - Ensure good lighting
   - Try different camera angles

4. **Cost calculation errors**
   - Verify Austin pricing factors
   - Check item catalog completeness
   - Review distance calculations

### Debug Mode:

Add to `.env.local`:
```
VITE_DEBUG_DETECTION=true
```

This enables console logging of:
- Detection API responses
- Cost calculations
- Processing times

## 📈 Analytics & Optimization

### Track These Metrics:
- Detection accuracy rate
- User quote acceptance rate
- Average items per quote
- Cost per detection
- Processing time per image

### Optimization Strategies:
1. **Model Fine-tuning**: Train on moving-specific images
2. **Smart Defaults**: Pre-populate common items
3. **User Feedback**: Learn from quote corrections
4. **Seasonal Adjustments**: Update pricing for peak times

## 🆘 Support

For technical issues:
1. Check console logs for errors
2. Verify environment configuration
3. Test with sample images
4. Review Hugging Face API documentation

For business questions:
- Pricing optimization
- Feature requests  
- Custom model training
- Enterprise deployment

## 🔮 Future Enhancements

### Planned Features:
- [ ] Room-by-room analysis
- [ ] 3D volume estimation
- [ ] Voice description processing
- [ ] Mobile app integration  
- [ ] Custom model training
- [ ] Real-time video analysis
- [ ] AR/VR visualization

### Advanced Integrations:
- [ ] Google Maps distance calculation
- [ ] Calendar scheduling integration
- [ ] Payment processing
- [ ] CRM system connection
- [ ] SMS/email notifications