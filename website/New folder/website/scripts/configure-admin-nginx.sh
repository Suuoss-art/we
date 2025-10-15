#!/bin/bash
# Script to configure nginx with obfuscated admin URL
# This replaces the placeholder in nginx config with actual admin URL from .env

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configuring Nginx with obfuscated admin URL...${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file from .env.example first.${NC}"
    exit 1
fi

# Source the .env file to get ADMIN_URL_PATH
source .env

# Check if ADMIN_URL_PATH is set
if [ -z "$ADMIN_URL_PATH" ]; then
    echo -e "${RED}❌ Error: ADMIN_URL_PATH not set in .env file!${NC}"
    echo -e "${YELLOW}Run ./scripts/generate-admin-url.sh to generate admin URLs first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found admin URL path: ${ADMIN_URL_PATH}${NC}"

# Update nginx configuration
NGINX_CONFIG="/etc/nginx/sites-available/kopma-website"

if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}❌ Error: Nginx configuration file not found at $NGINX_CONFIG${NC}"
    echo -e "${YELLOW}Please run oracle-cloud-setup.sh first to create the configuration.${NC}"
    exit 1
fi

# Backup current nginx config
echo -e "${YELLOW}📋 Backing up current nginx configuration...${NC}"
sudo cp $NGINX_CONFIG ${NGINX_CONFIG}.backup

# Replace placeholder with actual admin URL path
echo -e "${YELLOW}🔄 Updating nginx configuration...${NC}"
sudo sed -i "s|ADMIN_URL_PATH_PLACEHOLDER|${ADMIN_URL_PATH}|g" $NGINX_CONFIG

# Test nginx configuration
echo -e "${YELLOW}🧪 Testing nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    
    # Reload nginx
    echo -e "${YELLOW}🔄 Reloading nginx...${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Error: Nginx configuration test failed!${NC}"
    echo -e "${YELLOW}Restoring backup...${NC}"
    sudo cp ${NGINX_CONFIG}.backup $NGINX_CONFIG
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Admin panel nginx configuration completed!${NC}"
echo ""
echo -e "${BLUE}Admin panel is now accessible at:${NC}"
echo -e "${YELLOW}  • https://kopmaukmunnes.com${ADMIN_URL_PATH}${NC}"
echo ""
echo -e "${RED}⚠️  KEEP THIS URL SECRET! It provides admin access to your site.${NC}"
