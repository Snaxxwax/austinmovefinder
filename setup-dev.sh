#!/bin/bash

# Austin Move Finder Development Setup Script
# This script sets up both frontend and backend for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚚 Austin Move Finder - Development Setup${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION detected. Please upgrade to Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Function to setup frontend
setup_frontend() {
    echo -e "\n${CYAN}📱 Setting up Frontend...${NC}"

    # Install frontend dependencies
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install

    # Copy environment template if it doesn't exist
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from template${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env.local with your configuration${NC}"
    else
        echo -e "${GREEN}✅ .env.local already exists${NC}"
    fi

    echo -e "${GREEN}✅ Frontend setup complete${NC}"
}

# Function to setup backend
setup_backend() {
    echo -e "\n${CYAN}🔧 Setting up Backend...${NC}"

    cd backend

    # Install backend dependencies
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install

    # Copy environment template if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created backend .env from template${NC}"
        echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
    else
        echo -e "${GREEN}✅ Backend .env already exists${NC}"
    fi

    # Create necessary directories
    mkdir -p data uploads logs backups
    echo -e "${GREEN}✅ Created backend directories${NC}"

    cd ..
    echo -e "${GREEN}✅ Backend setup complete${NC}"
}

# Function to provide configuration guidance
provide_config_guidance() {
    echo -e "\n${PURPLE}⚙️  Configuration Guide:${NC}\n"

    echo -e "${YELLOW}Frontend (.env.local):${NC}"
    echo -e "  • VITE_HUGGINGFACE_API_KEY: Get from https://huggingface.co/settings/tokens"
    echo -e "  • VITE_EMAILJS_*: Get from https://dashboard.emailjs.com (optional fallback)"

    echo -e "\n${YELLOW}Backend (backend/.env):${NC}"
    echo -e "  • SMTP_USER/SMTP_PASS: Gmail app password for notifications"
    echo -e "  • HUGGINGFACE_API_KEY: Same as frontend for object detection"
    echo -e "  • JWT_SECRET: Generate a secure random string (32+ characters)"
    echo -e "  • FROM_EMAIL/TO_EMAIL: Email addresses for quote notifications"

    echo -e "\n${CYAN}Quick setup for Gmail SMTP:${NC}"
    echo -e "  1. Enable 2-factor authentication on your Gmail account"
    echo -e "  2. Generate an app password: https://myaccount.google.com/apppasswords"
    echo -e "  3. Use your Gmail address for SMTP_USER and app password for SMTP_PASS"
}

# Function to create start scripts
create_start_scripts() {
    echo -e "\n${CYAN}📜 Creating development scripts...${NC}"

    # Create frontend start script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Austin Move Finder Frontend..."
npm run dev
EOF
    chmod +x start-frontend.sh

    # Create backend start script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Austin Move Finder Backend..."
cd backend && npm run dev
EOF
    chmod +x start-backend.sh

    # Create combined start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Austin Move Finder (Frontend + Backend)..."

# Function to kill all processes on exit
cleanup() {
    echo "🛑 Shutting down all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Return to root directory and start frontend
cd ..
echo "📱 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for all background jobs
wait $BACKEND_PID $FRONTEND_PID
EOF
    chmod +x start-dev.sh

    echo -e "${GREEN}✅ Created start scripts${NC}"
}

# Main setup process
echo -e "${YELLOW}Setting up Austin Move Finder for development...${NC}\n"

# Setup frontend
setup_frontend

# Setup backend
setup_backend

# Create start scripts
create_start_scripts

# Provide configuration guidance
provide_config_guidance

echo -e "\n${GREEN}🎉 Setup Complete!${NC}\n"

echo -e "${CYAN}Next Steps:${NC}"
echo -e "1. ${YELLOW}Configure your environment files:${NC}"
echo -e "   • Edit .env.local (frontend config)"
echo -e "   • Edit backend/.env (backend config)"
echo -e ""
echo -e "2. ${YELLOW}Start development servers:${NC}"
echo -e "   • Frontend only: ${GREEN}./start-frontend.sh${NC}"
echo -e "   • Backend only: ${GREEN}./start-backend.sh${NC}"
echo -e "   • Both together: ${GREEN}./start-dev.sh${NC}"
echo -e ""
echo -e "3. ${YELLOW}Access your application:${NC}"
echo -e "   • Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "   • Backend API: ${CYAN}http://localhost:5000/api${NC}"
echo -e "   • Backend Health: ${CYAN}http://localhost:5000/api/health${NC}"
echo -e ""
echo -e "${PURPLE}💡 Pro tip: Run './start-dev.sh' to start both frontend and backend together!${NC}"

# Check if configuration is needed
if [ ! -s ".env.local" ] || [ ! -s "backend/.env" ]; then
    echo -e "\n${YELLOW}⚠️  Don't forget to configure your environment files before starting!${NC}"
fi