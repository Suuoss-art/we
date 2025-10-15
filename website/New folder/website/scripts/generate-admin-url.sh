#!/bin/bash
# Script to generate secure, obfuscated admin panel URL
# Generates a long, complex URL path that's hard to detect

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Generating secure admin panel URL...${NC}"

# Generate random components
# Mix of: lowercase, uppercase, numbers, and URL-safe special characters
generate_segment() {
    local length=$1
    # Use alphanumeric characters and some safe symbols
    LC_ALL=C tr -dc 'a-zA-Z0-9-_' < /dev/urandom | head -c $length
}

# Generate a complex admin URL with multiple segments
# Format: /[random]-[random]-[random]/[random]/[random]
SEGMENT1=$(generate_segment 12)
SEGMENT2=$(generate_segment 8)
SEGMENT3=$(generate_segment 10)
SEGMENT4=$(generate_segment 15)
SEGMENT5=$(generate_segment 7)

# Create the obfuscated admin URL path
ADMIN_URL_PATH="/${SEGMENT1}-${SEGMENT2}-${SEGMENT3}/${SEGMENT4}/${SEGMENT5}"

# Also generate a secure admin subdomain for Netlify
ADMIN_SUBDOMAIN="kopma-admin-$(generate_segment 16)"

echo ""
echo -e "${GREEN}✅ Secure admin URLs generated:${NC}"
echo ""
echo -e "${YELLOW}Admin URL Path (for Oracle VPS routing):${NC}"
echo -e "${BLUE}${ADMIN_URL_PATH}${NC}"
echo ""
echo -e "${YELLOW}Admin Subdomain (for Netlify):${NC}"
echo -e "${BLUE}${ADMIN_SUBDOMAIN}.netlify.app${NC}"
echo ""
echo -e "${YELLOW}Full Admin URL Examples:${NC}"
echo -e "  Local: http://localhost:3000${ADMIN_URL_PATH}"
echo -e "  Production: https://kopmaukmunnes.com${ADMIN_URL_PATH}"
echo -e "  Netlify: https://${ADMIN_SUBDOMAIN}.netlify.app"
echo ""
echo -e "${GREEN}💡 Save these URLs securely! They will be used in:${NC}"
echo -e "  • .env file (ADMIN_URL_PATH)"
echo -e "  • nginx configuration"
echo -e "  • netlify.toml configuration"
echo ""

# Save to temporary file for use in deployment
mkdir -p /tmp/kopma-deployment
cat > /tmp/kopma-deployment/admin-config.env <<EOF
# Generated Admin Panel Configuration
# Generated on: $(date)
# KEEP THESE VALUES SECRET!

ADMIN_URL_PATH=${ADMIN_URL_PATH}
ADMIN_SUBDOMAIN=${ADMIN_SUBDOMAIN}
ADMIN_NETLIFY_URL=https://${ADMIN_SUBDOMAIN}.netlify.app
EOF

echo -e "${GREEN}✅ Configuration saved to: /tmp/kopma-deployment/admin-config.env${NC}"
echo -e "${YELLOW}⚠️  Keep this file secure and add values to your .env file!${NC}"
echo ""

# Output for easy copying
echo -e "${BLUE}# Add to .env file:${NC}"
echo "ADMIN_URL_PATH=${ADMIN_URL_PATH}"
echo "ADMIN_SUBDOMAIN=${ADMIN_SUBDOMAIN}"
echo "ADMIN_NETLIFY_URL=https://${ADMIN_SUBDOMAIN}.netlify.app"
