#!/bin/bash

# Austin Move Finder Backend Deployment Script
# Deploys backend to Docker containers or cloud services

set -e

echo "🚚 Austin Move Finder Backend Deployment"
echo "========================================"

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

# Check deployment target
DEPLOYMENT_TARGET=${1:-"local"}
ENVIRONMENT=${NODE_ENV:-"production"}

log "Deployment target: $DEPLOYMENT_TARGET"
log "Environment: $ENVIRONMENT"

# Validate environment
if [ ! -f "./backend/.env" ]; then
    error "Backend .env file not found. Please create it first."
fi

# Check if backend directory exists
if [ ! -d "./backend" ]; then
    error "Backend directory not found. Are you in the correct directory?"
fi

# Function to deploy locally with Docker
deploy_local() {
    log "Deploying backend locally with Docker..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not available. Please install it first."
    fi

    # Build and start services
    log "Building Austin Move Finder backend..."
    docker-compose build austinmovefinder-backend

    log "Starting services..."
    docker-compose up -d austinmovefinder-backend

    # Wait for service to be healthy
    log "Waiting for backend to be healthy..."
    timeout 60 bash -c 'until docker-compose exec -T austinmovefinder-backend curl -f http://localhost:5000/api/health; do sleep 2; done' || {
        error "Backend failed to become healthy within 60 seconds"
    }

    success "Backend deployed locally!"
    log "Backend URL: http://localhost:5000"
    log "Health check: http://localhost:5000/api/health"
}

# Function to deploy to cloud (placeholder)
deploy_cloud() {
    log "Deploying backend to cloud..."

    # This is a placeholder for cloud deployment
    # You would add specific cloud provider deployment logic here

    case "$CLOUD_PROVIDER" in
        "aws")
            deploy_aws
            ;;
        "gcp")
            deploy_gcp
            ;;
        "azure")
            deploy_azure
            ;;
        "railway")
            deploy_railway
            ;;
        *)
            warning "Cloud provider not specified or not supported yet."
            warning "Please set CLOUD_PROVIDER environment variable."
            warning "Supported: aws, gcp, azure, railway"
            ;;
    esac
}

# AWS deployment function
deploy_aws() {
    log "Deploying to AWS..."

    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi

    # This would include ECS, Lambda, or EC2 deployment logic
    warning "AWS deployment not fully implemented yet."
    warning "Please manually deploy using AWS ECS or EC2."
}

# Railway deployment function
deploy_railway() {
    log "Deploying to Railway..."

    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        error "Railway CLI is not installed. Install it with: npm install -g @railway/cli"
    fi

    # Deploy to Railway
    cd backend
    railway login
    railway deploy
    cd ..

    success "Deployed to Railway!"
}

# Function to run backend tests
run_tests() {
    log "Running backend tests..."

    cd backend
    npm test || warning "Some tests failed"
    cd ..
}

# Function to backup database
backup_database() {
    log "Creating database backup..."

    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="backup_${timestamp}.db"

    if [ -f "./backend/data/austinmovefinder.db" ]; then
        cp "./backend/data/austinmovefinder.db" "./backend/backups/$backup_file"
        success "Database backed up to: ./backend/backups/$backup_file"
    else
        warning "Database file not found, skipping backup"
    fi
}

# Function to check backend health
check_health() {
    log "Checking backend health..."

    if [ "$DEPLOYMENT_TARGET" == "local" ]; then
        health_url="http://localhost:5000/api/health"
    else
        health_url="${BACKEND_URL}/api/health"
    fi

    if curl -f "$health_url" > /dev/null 2>&1; then
        success "Backend is healthy!"
    else
        error "Backend health check failed!"
    fi
}

# Main deployment logic
main() {
    # Austin timezone check
    log "Current Austin time: $(TZ=America/Chicago date)"

    # Backup database if it exists
    backup_database

    # Run tests
    if [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    fi

    # Deploy based on target
    case "$DEPLOYMENT_TARGET" in
        "local")
            deploy_local
            ;;
        "cloud")
            deploy_cloud
            ;;
        *)
            error "Unknown deployment target: $DEPLOYMENT_TARGET"
            ;;
    esac

    # Health check
    sleep 10
    check_health

    # Final instructions
    success "Austin Move Finder backend deployment completed!"
    log ""
    log "Next steps:"
    log "1. Update frontend VITE_BACKEND_URL to point to this backend"
    log "2. Test API endpoints manually"
    log "3. Monitor logs for any issues"

    if [ "$DEPLOYMENT_TARGET" == "local" ]; then
        log ""
        log "Local backend commands:"
        log "  View logs: docker-compose logs -f austinmovefinder-backend"
        log "  Stop: docker-compose down"
        log "  Restart: docker-compose restart austinmovefinder-backend"
    fi
}

# Handle command line arguments
case "$1" in
    "local")
        DEPLOYMENT_TARGET="local"
        ;;
    "cloud")
        DEPLOYMENT_TARGET="cloud"
        ;;
    "test")
        run_tests
        exit 0
        ;;
    "health")
        check_health
        exit 0
        ;;
    "backup")
        backup_database
        exit 0
        ;;
    "--help"|"-h")
        echo "Austin Move Finder Backend Deployment Script"
        echo ""
        echo "Usage: $0 [target] [options]"
        echo ""
        echo "Targets:"
        echo "  local    Deploy locally with Docker (default)"
        echo "  cloud    Deploy to cloud provider"
        echo "  test     Run tests only"
        echo "  health   Check backend health"
        echo "  backup   Backup database only"
        echo ""
        echo "Environment Variables:"
        echo "  NODE_ENV=production|staging|development"
        echo "  CLOUD_PROVIDER=aws|gcp|azure|railway"
        echo "  BACKEND_URL=https://your-backend.com (for cloud health checks)"
        echo "  SKIP_TESTS=true (skip running tests)"
        exit 0
        ;;
    *)
        if [ -n "$1" ]; then
            error "Unknown command: $1. Use --help for usage information."
        fi
        ;;
esac

# Run main deployment
main