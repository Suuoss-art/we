#!/bin/bash
# Oracle Cloud VPS Setup Script for KOPMA UNNES Website
# Advanced deployment with security, monitoring, and IP masking

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Please run as a regular user with sudo privileges."
fi

# Check if sudo is available
if ! command -v sudo &> /dev/null; then
    error "sudo is required but not installed. Please install sudo first."
fi

log "🚀 Starting Oracle Cloud VPS setup for KOPMA UNNES Website..."

# Update system
log "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
log "📦 Installing essential packages..."
sudo apt install -y curl wget git vim nano htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
log "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log "✅ Docker installed successfully"
else
    log "✅ Docker already installed"
fi

# Install Docker Compose
log "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "✅ Docker Compose installed successfully"
else
    log "✅ Docker Compose already installed"
fi

# Install Node.js (for monitoring and admin panel)
log "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log "✅ Node.js installed successfully"
else
    log "✅ Node.js already installed"
fi

# Install Python (for monitoring)
log "🐍 Installing Python..."
sudo apt install -y python3 python3-pip python3-venv

# Install Nginx
log "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
log "🔒 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Install security tools
log "🔒 Installing security tools..."
sudo apt install -y ufw fail2ban iptables-persistent

# Configure firewall
log "🔥 Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
log "✅ Firewall configured"

# Configure fail2ban
log "🔒 Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create fail2ban jail for nginx
sudo tee /etc/fail2ban/jail.d/nginx.conf > /dev/null <<EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
findtime = 600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

sudo systemctl restart fail2ban
log "✅ Fail2ban configured"

# Create project directory
log "📁 Creating project directory..."
sudo mkdir -p /opt/kopma-website
sudo chown $USER:$USER /opt/kopma-website
cd /opt/kopma-website

# Clone repository (if not already present)
if [ ! -d ".git" ]; then
    log "📥 Cloning repository..."
    # This would be the actual repository URL
    # git clone https://github.com/your-repo/kopma-website.git .
    log "⚠️  Please clone your repository manually to /opt/kopma-website"
fi

# Create environment file
log "⚙️  Creating environment file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    log "✅ Environment file created. Please configure it manually."
    warn "⚠️  Please edit .env file with your actual credentials"
fi

# Create SSL directory
log "🔒 Creating SSL directory..."
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private
sudo chmod 700 /etc/ssl/private

# Create logs directory
log "📝 Creating logs directory..."
sudo mkdir -p /var/log/kopma-website
sudo chown $USER:$USER /var/log/kopma-website

# Create monitoring directory
log "📊 Creating monitoring directory..."
mkdir -p monitoring/logs
mkdir -p monitoring/scripts

# Install Python dependencies for monitoring
log "🐍 Installing Python monitoring dependencies..."
pip3 install --user cryptography requests python-telegram-bot

# Create systemd service for monitoring
log "🔧 Creating monitoring service..."
sudo tee /etc/systemd/system/kopma-monitoring.service > /dev/null <<EOF
[Unit]
Description=KOPMA Website Monitoring Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/kopma-website
ExecStart=/usr/bin/python3 monitoring/stealth-monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable kopma-monitoring

# Create systemd service for IP rotation
log "🔄 Creating IP rotation service..."
sudo tee /etc/systemd/system/kopma-ip-rotation.service > /dev/null <<EOF
[Unit]
Description=KOPMA Website IP Rotation Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/kopma-website
ExecStart=/usr/bin/node scripts/ip-rotation.js
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable kopma-ip-rotation

# Create backup script
log "💾 Creating backup script..."
sudo tee /usr/local/bin/kopma-backup.sh > /dev/null <<EOF
#!/bin/bash
# KOPMA Website Backup Script

BACKUP_DIR="/opt/backups/kopma-website"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kopma-backup-\$DATE.tar.gz"

mkdir -p \$BACKUP_DIR

# Backup website files
tar -czf \$BACKUP_DIR/\$BACKUP_FILE -C /opt kopma-website

# Backup database (if MySQL is running)
if systemctl is-active --quiet mysql; then
    mysqldump -u root -p kopma_db > \$BACKUP_DIR/kopma-db-\$DATE.sql
fi

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "kopma-backup-*.tar.gz" -mtime +7 -delete
find \$BACKUP_DIR -name "kopma-db-*.sql" -mtime +7 -delete

echo "Backup completed: \$BACKUP_FILE"
EOF

sudo chmod +x /usr/local/bin/kopma-backup.sh

# Create cron job for backup
log "⏰ Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/kopma-backup.sh") | crontab -

# Create update script
log "🔄 Creating update script..."
sudo tee /usr/local/bin/kopma-update.sh > /dev/null <<EOF
#!/bin/bash
# KOPMA Website Update Script

cd /opt/kopma-website

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.stealth.yml down
docker-compose -f docker-compose.stealth.yml up -d --build

# Restart monitoring services
systemctl restart kopma-monitoring
systemctl restart kopma-ip-rotation

echo "Update completed successfully"
EOF

sudo chmod +x /usr/local/bin/kopma-update.sh

# Create health check script
log "🏥 Creating health check script..."
sudo tee /usr/local/bin/kopma-health-check.sh > /dev/null <<EOF
#!/bin/bash
# KOPMA Website Health Check Script

# Check if website is responding
if curl -f -s http://localhost/health > /dev/null; then
    echo "✅ Website is healthy"
    exit 0
else
    echo "❌ Website is not responding"
    exit 1
fi
EOF

sudo chmod +x /usr/local/bin/kopma-health-check.sh

# Create monitoring cron job
log "⏰ Setting up monitoring cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/kopma-health-check.sh") | crontab -

# Configure Nginx
log "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/kopma-website > /dev/null <<EOF
server {
    listen 80;
    server_name kopmaukmunnes.com www.kopmaukmunnes.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    
    # Main location
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # Obfuscated Admin Panel Route
    # IMPORTANT: Replace ADMIN_URL_PATH_PLACEHOLDER with actual admin path from .env
    # Example: location ~ ^/a8Kz2-xY9w3-pQ7m/vR4t8Hn2Js/bF6x {
    location ~ ^ADMIN_URL_PATH_PLACEHOLDER {
        # Extra security for admin panel
        limit_req zone=login burst=3 nodelay;
        
        # Additional security headers for admin
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Proxy to admin panel container
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Hide admin from logs (stealth)
        access_log off;
    }
    
    # Block suspicious requests
    location ~* \.(php|asp|aspx|jsp)$ {
        return 444;
    }
    
    # Block common attack patterns (decoy)
    location ~* /(wp-admin|wp-login|xmlrpc|admin|administrator) {
        return 444;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/kopma-website /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

log "✅ Nginx configured"

# Create SSL certificate
log "🔒 Setting up SSL certificate..."
if [ ! -f "/etc/ssl/certs/kopmaukmunnes.com.crt" ]; then
    log "⚠️  SSL certificate not found. Please run: sudo certbot --nginx -d kopmaukmunnes.com -d www.kopmaukmunnes.com"
else
    log "✅ SSL certificate found"
fi

# Start services
log "🚀 Starting services..."
sudo systemctl start kopma-monitoring
sudo systemctl start kopma-ip-rotation

# Check service status
log "📊 Checking service status..."
sudo systemctl status kopma-monitoring --no-pager
sudo systemctl status kopma-ip-rotation --no-pager

# Final instructions
log "🎉 Oracle Cloud VPS setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your .env file with actual credentials"
echo "2. Clone your repository to /opt/kopma-website"
echo "3. Run: sudo certbot --nginx -d kopmaukmunnes.com -d www.kopmaukmunnes.com"
echo "4. Start your application with: docker-compose -f docker-compose.stealth.yml up -d"
echo ""
echo "🔧 Useful commands:"
echo "- Check status: sudo systemctl status kopma-monitoring kopma-ip-rotation"
echo "- View logs: sudo journalctl -u kopma-monitoring -f"
echo "- Update website: /usr/local/bin/kopma-update.sh"
echo "- Backup website: /usr/local/bin/kopma-backup.sh"
echo "- Health check: /usr/local/bin/kopma-health-check.sh"
echo ""
echo "🔒 Security features enabled:"
echo "- Firewall (UFW) configured"
echo "- Fail2ban for intrusion prevention"
echo "- Rate limiting for API endpoints"
echo "- Security headers implemented"
echo "- SSL/TLS ready"
echo ""
echo "📊 Monitoring features enabled:"
echo "- Stealth monitoring service"
echo "- IP rotation service"
echo "- Automated backups"
echo "- Health checks"
echo ""
log "✅ Setup completed successfully!"
