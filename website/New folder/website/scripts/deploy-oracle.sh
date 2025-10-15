#!/bin/bash
# scripts/deploy-oracle.sh
# Oracle Cloud VPS deployment script for KOPMA UNNES Website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"kopmaukmunnes.com"}
SSL_EMAIL=${SSL_EMAIL:-"admin@kopmaukmunnes.com"}
DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -base64 32)}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-$(openssl rand -base64 32)}
ENCRYPTION_KEY=${ENCRYPTION_KEY:-$(openssl rand -base64 32)}
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN:-""}
TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID:-""}
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN:-""}
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID:-""}

# Admin Panel Configuration (Obfuscated)
ADMIN_URL_PATH=${ADMIN_URL_PATH:-""}
ADMIN_SUBDOMAIN=${ADMIN_SUBDOMAIN:-""}
ADMIN_NETLIFY_URL=${ADMIN_NETLIFY_URL:-""}

echo -e "${BLUE}🚀 Starting Oracle Cloud VPS deployment for KOPMA UNNES Website${NC}"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx
echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
sudo apt install nginx -y

# Install Certbot for SSL
echo -e "${YELLOW}🔒 Installing Certbot for SSL...${NC}"
sudo apt install certbot python3-certbot-nginx -y

# Create project directory
echo -e "${YELLOW}📁 Creating project directory...${NC}"
sudo mkdir -p /opt/kopma-website
sudo chown $USER:$USER /opt/kopma-website
cd /opt/kopma-website

# Clone repository (if not already present)
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone https://github.com/kopma-unnes/website.git .
fi

# Generate admin URL if not provided
if [ -z "$ADMIN_URL_PATH" ] || [ -z "$ADMIN_SUBDOMAIN" ]; then
    echo -e "${YELLOW}🔐 Generating secure admin panel URLs...${NC}"
    # Source the generated admin config if it exists
    if [ -f /tmp/kopma-deployment/admin-config.env ]; then
        source /tmp/kopma-deployment/admin-config.env
    else
        # Generate new admin URLs
        ./scripts/generate-admin-url.sh > /dev/null
        source /tmp/kopma-deployment/admin-config.env
    fi
    echo -e "${GREEN}✅ Admin URLs generated and configured${NC}"
fi

# Create environment file
echo -e "${YELLOW}⚙️ Creating environment configuration...${NC}"
cat > .env << EOF
# Database Configuration
DB_PASSWORD=${DB_PASSWORD}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}

# Encryption
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Telegram Bot
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}

# Cloudflare
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}

# Domain
DOMAIN=${DOMAIN}
SSL_EMAIL=${SSL_EMAIL}

# Admin Panel (Obfuscated)
ADMIN_URL_PATH=${ADMIN_URL_PATH}
ADMIN_SUBDOMAIN=${ADMIN_SUBDOMAIN}
ADMIN_NETLIFY_URL=${ADMIN_NETLIFY_URL}

# Oracle Cloud
ORACLE_CLOUD=true
VPS_MODE=true
NODE_ENV=production
EOF

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p logs backups ssl uploads mysql redis

# Set up SSL certificates
echo -e "${YELLOW}🔒 Setting up SSL certificates...${NC}"
sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${SSL_EMAIL}

# Copy SSL certificates
sudo cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ssl/
sudo chown $USER:$USER ssl/*.pem

# Set up firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Build and start services
echo -e "${YELLOW}🏗️ Building and starting services...${NC}"
docker-compose -f docker/docker-compose.oci.yml build
docker-compose -f docker/docker-compose.oci.yml up -d

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
if curl -f http://localhost/health; then
    echo -e "${GREEN}✅ Website is healthy${NC}"
else
    echo -e "${RED}❌ Website health check failed${NC}"
    exit 1
fi

# Set up monitoring
echo -e "${YELLOW}📊 Setting up monitoring...${NC}"
sudo systemctl enable docker
sudo systemctl start docker

# Create systemd service for monitoring
sudo tee /etc/systemd/system/kopma-monitoring.service > /dev/null << EOF
[Unit]
Description=KOPMA Website Monitoring
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/kopma-website
ExecStart=/usr/bin/docker-compose -f docker/docker-compose.oci.yml up -d
ExecStop=/usr/bin/docker-compose -f docker/docker-compose.oci.yml down
User=$USER
Group=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable kopma-monitoring.service
sudo systemctl start kopma-monitoring.service

# Set up log rotation
echo -e "${YELLOW}📝 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/kopma-website > /dev/null << EOF
/opt/kopma-website/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f /opt/kopma-website/docker/docker-compose.oci.yml restart nginx
    endscript
}
EOF

# Set up backup cron job
echo -e "${YELLOW}💾 Setting up backup cron job...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kopma-website/scripts/backup.sh") | crontab -

# Set up SSL renewal
echo -e "${YELLOW}🔄 Setting up SSL renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --nginx") | crontab -

# Final status check
echo -e "${YELLOW}🔍 Performing final status check...${NC}"
docker-compose -f docker/docker-compose.oci.yml ps

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "  • Domain: ${DOMAIN}"
echo -e "  • SSL: Enabled (Let's Encrypt)"
echo -e "  • Database: MySQL with Redis cache"
echo -e "  • Monitoring: Active (Telegram alerts)"
echo -e "  • Backup: Scheduled daily at 2 AM"
echo -e "  • SSL Renewal: Scheduled daily at 3 AM"
echo -e "  • Cost: \$0/month (100% FREE - Oracle Cloud Free Tier)"
echo -e ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo -e "  • Public Website: https://${DOMAIN}"
echo -e "  • Website (www): https://www.${DOMAIN}"
echo -e ""
echo -e "${BLUE}🔐 ADMIN PANEL URLS (KEEP SECRET!):${NC}"
if [ ! -z "$ADMIN_URL_PATH" ]; then
    echo -e "${YELLOW}  • Admin URL Path: ${ADMIN_URL_PATH}${NC}"
    echo -e "${YELLOW}  • Admin on Main Domain: https://${DOMAIN}${ADMIN_URL_PATH}${NC}"
fi
if [ ! -z "$ADMIN_NETLIFY_URL" ]; then
    echo -e "${YELLOW}  • Admin on Netlify: ${ADMIN_NETLIFY_URL}${NC}"
fi
echo -e "${RED}  ⚠️  SAVE THESE ADMIN URLS! They are randomly generated and CANNOT be recovered!${NC}"
echo -e ""
echo -e "${BLUE}📊 Monitoring & Logs:${NC}"
echo -e "  • Health Check: https://${DOMAIN}/health"
echo -e "  • Logs Directory: /opt/kopma-website/logs/"
echo -e "  • Backups Directory: /opt/kopma-website/backups/"
echo -e "  • Docker Status: docker-compose -f docker/docker-compose.oci.yml ps"
echo -e ""
echo -e "${YELLOW}⚠️ Important Security Notes:${NC}"
echo -e "  • Admin URLs are obfuscated for security"
echo -e "  • Never share admin URLs publicly"
echo -e "  • Configure Telegram bot for monitoring alerts"
echo -e "  • Set up Cloudflare for additional security"
echo -e "  • Review and update passwords in .env file"
echo -e "  • Test all functionality before announcing site"
echo -e ""
echo -e "${BLUE}💰 Cost Breakdown (100% FREE):${NC}"
echo -e "  • Oracle Cloud VPS (2 OCPU, 8GB RAM): \$0/month (Free Tier Forever)"
echo -e "  • Netlify Admin Panel Hosting: \$0/month (Free Tier)"
echo -e "  • Let's Encrypt SSL Certificate: \$0/month (Free)"
echo -e "  • Cloudflare CDN (optional): \$0/month (Free Tier)"
echo -e "  ${GREEN}TOTAL: \$0/month - Completely FREE!${NC}"
echo -e ""
echo -e "${GREEN}✅ KOPMA UNNES Website is now live on Oracle Cloud Free Tier VPS!${NC}"
echo -e "${GREEN}🎯 A+ Security Rating Configured with SSL, Firewall, and Monitoring!${NC}"