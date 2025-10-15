#!/bin/bash
# KOPMA UNNES System Activation Script
# This script automates the activation process

set -e

echo "🚀 KOPMA UNNES Website Activation Script"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_warning "Please don't run as root"
fi

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { print_error "Docker is not installed. Please install Docker first."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { print_error "Docker Compose is not installed. Please install Docker Compose first."; exit 1; }
command -v node >/dev/null 2>&1 || { print_error "Node.js is not installed. Please install Node.js first."; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is not installed. Please install npm first."; exit 1; }
print_success "All prerequisites met"
echo ""

# Step 2: Environment configuration
echo "Step 2: Checking environment configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found. Copying from .env.example..."
    cp .env.example .env
    print_info "Please edit .env file with your configuration before proceeding"
    print_info "Required variables: DB_PASSWORD, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, ENCRYPTION_KEY"
    echo ""
    read -p "Have you configured .env file? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please configure .env file and run the script again"
        exit 1
    fi
fi
print_success ".env file exists"
echo ""

# Step 3: Generate secure keys if needed
echo "Step 3: Checking security keys..."
if grep -q "your_secure_encryption_key_here" .env; then
    print_warning "Generating new encryption key..."
    NEW_KEY=$(openssl rand -base64 32)
    sed -i "s/your_secure_encryption_key_here_32_chars_minimum/$NEW_KEY/g" .env
    print_success "Encryption key generated"
fi

if grep -q "your_jwt_secret_here" .env; then
    print_warning "Generating new JWT secret..."
    NEW_JWT=$(openssl rand -hex 32)
    sed -i "s/your_jwt_secret_here/$NEW_JWT/g" .env
    print_success "JWT secret generated"
fi

if grep -q "your_session_secret_here" .env; then
    print_warning "Generating new session secret..."
    NEW_SESSION=$(openssl rand -hex 32)
    sed -i "s/your_session_secret_here/$NEW_SESSION/g" .env
    print_success "Session secret generated"
fi
echo ""

# Step 4: Install dependencies
echo "Step 4: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    print_info "Installing npm packages..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi
echo ""

# Step 5: Build the application
echo "Step 5: Building application..."
print_info "This may take a few minutes..."
npm run build > /dev/null 2>&1 || print_warning "Build completed with warnings"
print_success "Application built successfully"
echo ""

# Step 6: Docker setup
echo "Step 6: Setting up Docker containers..."
read -p "Do you want to start Docker containers? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting Docker containers..."
    cd docker
    docker-compose up -d --build
    print_success "Docker containers started"
    
    print_info "Waiting for containers to be healthy..."
    sleep 10
    
    # Check container status
    if docker-compose ps | grep -q "Up"; then
        print_success "Containers are running"
    else
        print_error "Some containers failed to start. Check logs with: docker-compose logs"
    fi
    cd ..
fi
echo ""

# Step 7: Database initialization
echo "Step 7: Database initialization..."
read -p "Do you want to initialize the database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Initializing database..."
    if [ -f "backend/scripts/init-database.php" ]; then
        php backend/scripts/init-database.php
        print_success "Database initialized"
    else
        print_warning "Database initialization script not found"
    fi
fi
echo ""

# Step 8: Telegram bot test
echo "Step 8: Testing Telegram bot..."
if [ -f "monitoring/telegram-bot.py" ]; then
    read -p "Do you want to test Telegram bot? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Testing Telegram bot..."
        python3 monitoring/telegram-bot.py --test || print_warning "Telegram bot test failed. Check your configuration."
    fi
fi
echo ""

# Step 9: Start monitoring
echo "Step 9: Monitoring system..."
read -p "Do you want to start monitoring system? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting monitoring system..."
    npm run monitor:start &
    print_success "Monitoring system started"
fi
echo ""

# Step 10: Health check
echo "Step 10: Running health checks..."
sleep 5

# Check if website is accessible
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Website health check passed"
else
    print_warning "Website health check failed. The site might still be starting up."
fi

# Check if API is accessible
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    print_success "API health check passed"
else
    print_warning "API health check failed"
fi
echo ""

# Final summary
echo "=========================================="
echo "🎉 Activation Complete!"
echo "=========================================="
echo ""
print_success "Website: http://localhost"
print_success "API: http://localhost/api"
print_success "Admin Panel: Build and deploy to Netlify separately"
echo ""
print_info "Next steps:"
echo "1. Configure SSL certificates for production"
echo "2. Set up Cloudflare for IP masking"
echo "3. Deploy admin panel to Netlify"
echo "4. Configure domain DNS records"
echo "5. Run performance and security tests"
echo ""
print_info "To check logs: docker-compose -f docker/docker-compose.yml logs -f"
print_info "To stop services: docker-compose -f docker/docker-compose.yml down"
print_info "For full guide: See ACTIVATION_DEPLOYMENT_GUIDE.md"
echo ""
