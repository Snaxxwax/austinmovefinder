#!/bin/bash

# Austin Move Finder Frontend Deployment Script
# Production-ready deployment with comprehensive validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

echo "🚀 Austin Move Finder Frontend Deployment"
echo "========================================="

# Check if API token is available
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
        success "Loaded API token from .env file"
    elif [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
        success "Loaded API token from .env.local file"
    else
        error "CLOUDFLARE_API_TOKEN not found. Please set it as environment variable or in .env file"
    fi
fi

# Verify API token
echo "🔑 Verifying Cloudflare API token..."
TOKEN_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

if echo "$TOKEN_RESPONSE" | grep -q '"status":"active"'; then
    echo "✅ API token is valid and active"
else
    echo "❌ API token verification failed"
    echo "$TOKEN_RESPONSE"
    exit 1
fi

# Environment setup
ENVIRONMENT=${NODE_ENV:-"production"}
log "Deployment environment: $ENVIRONMENT"
log "Austin timezone: $(TZ=America/Chicago date)"

# Validate environment
log "🔧 Validating environment configuration..."
npm run validate:env || error "Environment validation failed"

# Run pre-deployment checks
log "🧪 Running pre-deployment tests..."
npm run lint || warning "Linting issues found"
npx tsc --noEmit --skipLibCheck || error "TypeScript compilation failed"

# Build the application
log "🔨 Building Austin Move Finder application..."
if [ "$ENVIRONMENT" == "production" ]; then
    npm run build:prod
elif [ "$ENVIRONMENT" == "staging" ]; then
    npm run build:staging
else
    npm run build:ci
fi

# Validate build output
log "🔍 Validating build output..."
if [ ! -f "dist/index.html" ]; then
    error "Build failed: dist/index.html not found"
fi

if [ ! -d "dist/assets" ]; then
    error "Build failed: dist/assets directory not found"
fi

# Check for Austin-specific content
if ! grep -q "Austin" dist/index.html; then
    warning "Austin content not found in build output"
fi

# Bundle size analysis
log "📊 Bundle size analysis:"
bundle_size=$(du -sh dist/ | cut -f1)
js_files=$(find dist/assets -name "*.js" | wc -l)
css_files=$(find dist/assets -name "*.css" | wc -l)

log "  Total size: $bundle_size"
log "  JS files: $js_files"
log "  CSS files: $css_files"

# Deploy to Cloudflare Pages
log "📤 Deploying to Cloudflare Pages..."
if [ "$ENVIRONMENT" == "staging" ]; then
    wrangler pages deploy dist --project-name=austinmovefinder --env=staging
else
    wrangler pages deploy dist --project-name=austinmovefinder --env=production
fi

# Post-deployment validation
log "🩺 Running post-deployment health checks..."
sleep 15  # Wait for deployment to propagate

# Install node-fetch for health checks
if [ ! -d "node_modules/node-fetch" ]; then
    npm install node-fetch@2
fi

# Run health checks
npm run health-check || warning "Some health checks failed"

# Performance check
log "⚡ Performance validation..."
if [ "$ENVIRONMENT" == "production" ]; then
    main_url="https://austinmovefinder.com"
    pages_url="https://austinmovefinder.pages.dev"
else
    main_url="https://staging-austinmovefinder.pages.dev"
    pages_url="https://staging-austinmovefinder.pages.dev"
fi

# Test main URLs
curl -f -H "User-Agent: Austin-Move-Finder-Deploy" "$main_url" > /dev/null && success "Main URL accessible: $main_url" || warning "Main URL check failed: $main_url"
curl -f -H "User-Agent: Austin-Move-Finder-Deploy" "$pages_url" > /dev/null && success "Pages URL accessible: $pages_url" || warning "Pages URL check failed: $pages_url"

# Deployment summary
log "🌐 Deployment URLs:"
log "  - Main URL: $main_url"
log "  - Pages URL: $pages_url"
if [ "$ENVIRONMENT" == "production" ]; then
    log "  - WWW Domain: https://www.austinmovefinder.com"
fi

log ""
log "📊 Deployment Summary:"
log "  Environment: $ENVIRONMENT"
log "  Bundle size: $bundle_size"
log "  JS files: $js_files"
log "  CSS files: $css_files"
log "  Austin timezone: $(TZ=America/Chicago date)"

success "Austin Move Finder deployment completed successfully!"

# Next steps
log ""
log "🎯 Next steps:"
log "1. Monitor the application for 5-10 minutes"
log "2. Test key Austin features (neighborhoods, quotes)"
log "3. Check analytics for traffic spikes"
log "4. Verify email notifications are working"

if [ "$ENVIRONMENT" == "production" ]; then
    log ""
    log "🚨 Production deployment reminders:"
    log "1. Austin moving season is March-September (peak traffic)"
    log "2. Monitor Core Web Vitals for Austin users"
    log "3. Check Cloudflare Analytics for Austin traffic patterns"
fi