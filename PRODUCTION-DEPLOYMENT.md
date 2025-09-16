# Austin Move Finder - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Austin Move Finder to production with optimized DevOps practices.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
npm run setup:env

# 3. Validate configuration
npm run validate:env

# 4. Deploy to production
npm run deploy
```

## 📋 Prerequisites

### Required Tools
- **Node.js 18+**: Runtime environment
- **npm**: Package manager
- **Wrangler CLI**: Cloudflare Pages deployment
- **Git**: Version control

### Required Accounts
- **Cloudflare**: Pages hosting and domain management
- **EmailJS**: Quote email delivery
- **HuggingFace**: AI object detection (optional)

## 🔧 Environment Configuration

### 1. Frontend Environment Variables

Create `.env.local` with production values:

```bash
# Application Configuration
VITE_APP_NAME=Austin Move Finder
VITE_APP_URL=https://austinmovefinder.com
VITE_BACKEND_URL=https://api.austinmovefinder.com

# Austin-Specific Configuration
VITE_BASE_LABOR_RATE=120
VITE_TRUCK_RATE_PER_MILE=1.2
VITE_ENABLE_OBJECT_DETECTION=true

# Service Integrations
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Analytics (Optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_PLAUSIBLE_DOMAIN=austinmovefinder.com
```

### 2. Cloudflare Pages Environment Variables

Set these in Cloudflare Pages dashboard:

**Production Environment:**
```
ENVIRONMENT=production
NODE_ENV=production
AUSTIN_TIMEZONE=America/Chicago
VITE_ENVIRONMENT=production
VITE_APP_URL=https://austinmovefinder.com
VITE_BACKEND_URL=https://api.austinmovefinder.com
VITE_BASE_LABOR_RATE=120
VITE_TRUCK_RATE_PER_MILE=1.2
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

**Staging Environment:**
```
ENVIRONMENT=staging
NODE_ENV=staging
AUSTIN_TIMEZONE=America/Chicago
VITE_ENVIRONMENT=staging
VITE_APP_URL=https://staging-austinmovefinder.pages.dev
VITE_BACKEND_URL=https://staging-api.austinmovefinder.com
```

### 3. Secrets Management

Store sensitive values as Cloudflare Pages environment variables:
- `CLOUDFLARE_API_TOKEN`
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_HUGGINGFACE_API_KEY`
- `VITE_GA_TRACKING_ID`

## 🏗️ Build Process

### Build Commands

```bash
# Development build
npm run build

# Production build with validation
npm run build:prod

# Staging build
npm run build:staging

# CI build (skips type checking for speed)
npm run build:ci
```

### Build Optimization

The build process includes:
- TypeScript compilation with strict checking
- ESLint validation
- Environment variable validation
- Bundle size analysis
- Austin-specific content validation
- Performance optimization

## 🚀 Deployment Options

### 1. Automated Deployment (Recommended)

**GitHub Actions CI/CD:**
- Automatic deployment on push to `main` (production) or `staging`
- Comprehensive testing and validation
- Multi-environment support
- Austin-specific health checks

**Cloudflare Pages Integration:**
- Automatic builds from GitHub
- Environment-specific configurations
- Custom domain support
- CDN optimization

### 2. Manual Deployment

```bash
# Deploy to production
NODE_ENV=production npm run deploy

# Deploy to staging
NODE_ENV=staging npm run deploy:staging

# Deploy backend
./scripts/deploy-backend.sh local
```

## 🔍 Health Checks & Monitoring

### Automated Health Checks

```bash
# Comprehensive health check
npm run health-check

# Backend health check
./scripts/deploy-backend.sh health

# Environment validation
npm run validate:env
```

### Monitoring Endpoints

- **Frontend Health**: `https://austinmovefinder.com/`
- **Backend Health**: `https://api.austinmovefinder.com/api/health`
- **Cloudflare Analytics**: Available in Cloudflare dashboard

### Performance Metrics

The system monitors:
- Page load times (target: <2 seconds)
- Core Web Vitals
- Bundle sizes
- Austin-specific content validation
- Email delivery success rates

## 🎯 Austin-Specific Optimizations

### Geographic Targeting
- Austin timezone: `America/Chicago`
- Peak moving season: March-September
- Local business hours: 8 AM - 6 PM CST

### Content Optimization
- Austin neighborhood data
- Local moving regulations
- Texas-specific requirements
- Austin traffic patterns

### Performance for Austin Users
- CDN edge locations for Texas
- Optimized images for mobile users
- Fast quote generation
- Local phone number formatting

## 🔐 Security Configuration

### Headers & Security

Cloudflare Pages automatically applies:
- HTTPS enforcement
- Security headers (CSP, HSTS)
- DDoS protection
- Bot protection

### Environment Security
- No sensitive data in frontend code
- Environment variables validation
- API key rotation support
- Secure cookie handling

## 📊 Analytics & Tracking

### Implemented Analytics
- **Google Analytics 4**: User behavior tracking
- **Plausible Analytics**: Privacy-focused analytics
- **Cloudflare Analytics**: Performance metrics
- **Custom Events**: Austin-specific tracking

### Key Metrics
- Quote conversion rates
- Neighborhood page views
- Moving guide engagement
- Email deliverability
- Austin market penetration

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Fix TypeScript errors
npm run lint:fix
npx tsc --noEmit --skipLibCheck

# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build:ci
```

**Environment Issues:**
```bash
# Validate environment
npm run validate:env

# Regenerate environment
npm run setup:env
```

**Deployment Issues:**
```bash
# Check Cloudflare token
wrangler whoami

# Verify API token
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```

### Health Check Failures

If health checks fail:
1. Check Cloudflare Pages deployment status
2. Verify environment variables
3. Test individual endpoints manually
4. Check browser console for errors
5. Verify Austin-specific content is present

## 📈 Performance Optimization

### Bundle Optimization
- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking for unused code
- Asset optimization and compression

### Caching Strategy
- Static assets: 1 year cache
- HTML pages: 5 minutes cache
- API responses: No cache
- Service worker for offline support

### Austin-Specific Performance
- Preload Austin neighborhood data
- Optimize quote calculator
- Fast email template loading
- Mobile-first design for Austin users

## 🔄 Rollback Strategy

### Automated Rollback
- GitHub Actions includes rollback capability
- Cloudflare Pages maintains deployment history
- Database backups for safe rollback

### Manual Rollback
```bash
# Rollback to previous Cloudflare Pages deployment
wrangler pages deployment list
wrangler pages deployment tail [deployment-id]
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- Weekly dependency updates
- Monthly security audits
- Quarterly performance reviews
- Austin market analysis updates

### Monitoring Schedule
- **Daily**: Automated health checks
- **Weekly**: Performance metrics review
- **Monthly**: Security and dependency audits
- **Quarterly**: Austin market data updates

### Emergency Contacts
- **Technical Issues**: Check GitHub Actions logs
- **Domain Issues**: Cloudflare dashboard
- **Email Issues**: EmailJS dashboard
- **Performance Issues**: Cloudflare Analytics

## 🎯 Austin Market Success Metrics

### Target KPIs
- Page load time: <2 seconds
- Quote conversion: >15%
- Austin traffic share: >70%
- Email delivery rate: >95%
- Mobile performance score: >90

### Seasonal Considerations
- **Peak Season (Mar-Sep)**: Increased capacity planning
- **Off Season (Oct-Feb)**: Maintenance and improvements
- **SXSW Period (March)**: Special Austin event handling
- **Summer Heat**: Performance optimization for mobile users

This guide ensures Austin Move Finder deploys successfully with optimal performance for the Austin, Texas moving market.