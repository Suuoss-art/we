#!/bin/bash
# KOPMA UNNES Testing Script
# Comprehensive testing suite for deployment validation

set -e

echo "🧪 KOPMA UNNES Testing Suite"
echo "=============================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

print_success() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

print_section() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
}

# Test 1: Environment Configuration
print_section "Test 1: Environment Configuration"
if [ -f .env ]; then
    print_success "Environment file exists"
    
    # Check for required variables
    if grep -q "TELEGRAM_BOT_TOKEN=" .env && ! grep -q "your_telegram_bot_token_here" .env; then
        print_success "Telegram bot token configured"
    else
        print_error "Telegram bot token not configured"
    fi
    
    if grep -q "ENCRYPTION_KEY=" .env && ! grep -q "your_secure_encryption_key_here" .env; then
        print_success "Encryption key configured"
    else
        print_error "Encryption key not configured"
    fi
else
    print_error "Environment file not found"
fi

# Test 2: Dependencies
print_section "Test 2: Dependencies Check"
if [ -d "node_modules" ]; then
    print_success "Node modules installed"
else
    print_error "Node modules not installed"
fi

if command -v docker &> /dev/null; then
    print_success "Docker installed"
else
    print_error "Docker not installed"
fi

if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose installed"
else
    print_error "Docker Compose not installed"
fi

# Test 3: Build Verification
print_section "Test 3: Build Verification"
if [ -d "dist" ] || [ -d ".astro" ]; then
    print_success "Build artifacts present"
else
    print_warning "Build artifacts not found. Run 'npm run build'"
fi

# Test 4: Docker Containers
print_section "Test 4: Docker Containers Status"
if docker-compose -f docker/docker-compose.yml ps 2>/dev/null | grep -q "Up"; then
    print_success "Docker containers running"
    
    # Check individual containers
    if docker ps | grep -q "kopma-website"; then
        print_success "Website container running"
    else
        print_warning "Website container not running"
    fi
    
    if docker ps | grep -q "kopma-backend"; then
        print_success "Backend container running"
    else
        print_warning "Backend container not running"
    fi
    
    if docker ps | grep -q "kopma-mysql"; then
        print_success "MySQL container running"
    else
        print_warning "MySQL container not running"
    fi
    
    if docker ps | grep -q "kopma-redis"; then
        print_success "Redis container running"
    else
        print_warning "Redis container not running"
    fi
else
    print_warning "Docker containers not running. Start with 'docker-compose up'"
fi

# Test 5: Health Endpoints
print_section "Test 5: Health Endpoints"
if curl -sf http://localhost/health > /dev/null 2>&1; then
    print_success "Website health endpoint responsive"
else
    print_warning "Website health endpoint not accessible"
fi

if curl -sf http://localhost/api/health > /dev/null 2>&1; then
    print_success "API health endpoint responsive"
else
    print_warning "API health endpoint not accessible"
fi

# Test 6: Database Connection
print_section "Test 6: Database Connection"
if docker exec kopma-mysql mysql -u kopma_user -p"$DB_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_warning "Database connection failed or container not running"
fi

# Test 7: Redis Connection
print_section "Test 7: Redis Connection"
if docker exec kopma-redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis connection successful"
else
    print_warning "Redis connection failed or container not running"
fi

# Test 8: API Endpoints
print_section "Test 8: API Endpoints"
# Test auth endpoint
if curl -sf http://localhost/api/auth?action=verify > /dev/null 2>&1; then
    print_success "Auth API endpoint accessible"
else
    print_warning "Auth API endpoint not accessible"
fi

# Test content endpoint
if curl -sf http://localhost/api/content > /dev/null 2>&1; then
    print_success "Content API endpoint accessible"
else
    print_warning "Content API endpoint not accessible"
fi

# Test monitoring endpoint
if curl -sf http://localhost/api/monitoring?action=status > /dev/null 2>&1; then
    print_success "Monitoring API endpoint accessible"
else
    print_warning "Monitoring API endpoint not accessible"
fi

# Test 9: Security Headers
print_section "Test 9: Security Headers"
HEADERS=$(curl -sI http://localhost 2>/dev/null || echo "")
if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    print_success "X-Frame-Options header present"
else
    print_warning "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    print_success "X-Content-Type-Options header present"
else
    print_warning "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "X-XSS-Protection"; then
    print_success "X-XSS-Protection header present"
else
    print_warning "X-XSS-Protection header missing"
fi

# Test 10: File Structure
print_section "Test 10: File Structure Integrity"
required_files=(
    "backend/api/auth.php"
    "backend/api/content.php"
    "backend/api/monitoring.php"
    "backend/config/database.php"
    "backend/config/security.php"
    "monitoring/telegram-bot.py"
    "monitoring/security-scanner.ts"
    "docker/Dockerfile"
    "docker/docker-compose.yml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Required file exists: $file"
    else
        print_error "Required file missing: $file"
    fi
done

# Test 11: Gambling Content Check
print_section "Test 11: Content Validation (No Gambling Keywords)"
GAMBLING_CHECK=$(grep -r "slot88\|joker123\|pragmatic\|le-vao-ban-choi" src/pages/blog/ 2>/dev/null || echo "")
if [ -z "$GAMBLING_CHECK" ]; then
    print_success "No gambling content found in blog pages"
else
    print_error "Gambling content still present in blog pages"
fi

# Test 12: NPM Security Audit
print_section "Test 12: NPM Security Audit"
print_info "Running npm audit..."
if npm audit --production > /dev/null 2>&1; then
    print_success "No high severity vulnerabilities found"
else
    print_warning "Security vulnerabilities detected. Run 'npm audit' for details"
fi

# Test 13: Monitoring System
print_section "Test 13: Monitoring System"
if [ -f "monitoring/telegram-bot.py" ]; then
    print_success "Telegram bot script exists"
else
    print_error "Telegram bot script missing"
fi

if [ -f "monitoring/security-scanner.ts" ]; then
    print_success "Security scanner exists"
else
    print_error "Security scanner missing"
fi

if [ -f "monitoring/anomaly-detector.ts" ]; then
    print_success "Anomaly detector exists"
else
    print_error "Anomaly detector missing"
fi

# Test 14: Admin Panel
print_section "Test 14: Admin Panel Configuration"
if [ -f "../admin-panel/netlify.toml" ]; then
    print_success "Netlify configuration exists"
else
    print_error "Netlify configuration missing"
fi

if [ -d "../admin-panel/src" ]; then
    print_success "Admin panel source exists"
else
    print_error "Admin panel source missing"
fi

# Test 15: SSL/TLS Configuration
print_section "Test 15: SSL/TLS Configuration"
if [ -d "docker/ssl" ]; then
    print_success "SSL directory exists"
else
    print_warning "SSL directory not found"
fi

# Final Summary
print_section "Test Summary"
echo ""
echo "Total Tests Run: $((PASSED + FAILED + WARNINGS))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! System is ready for deployment.${NC}"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  All critical tests passed, but there are warnings to address.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please address the issues before deployment.${NC}"
    exit 1
fi
