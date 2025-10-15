# 🚀 KOPMA UNNES Website - Deployment Guide

## 📋 Prerequisites

### Required Accounts
- **Oracle Cloud**: Free tier account
- **Cloudflare**: Free account
- **Netlify**: Free account
- **Domain**: Domain name for the website
- **Telegram**: Telegram account for bot

### Required Tools
- **SSH Client**: PuTTY, Terminal, or similar
- **Git**: Version control
- **Docker**: Containerization
- **Text Editor**: VS Code, Nano, or similar

## 🏗️ Oracle Cloud VPS Setup

### 1. Create VPS Instance
```bash
# Login to Oracle Cloud Console
# Navigate to Compute > Instances
# Click "Create Instance"

# Configuration:
# - Name: kopma-website
# - Image: Ubuntu 22.04 LTS
# - Shape: VM.Standard.A1.Flex (2 OCPU, 8GB RAM)
# - Network: Default VCN
# - SSH Key: Upload your public key
```

### 2. Configure Security Lists
```bash
# In Oracle Cloud Console:
# Navigate to Networking > Virtual Cloud Networks
# Select your VCN > Security Lists
# Add Ingress Rules:
# - Source: 0.0.0.0/0, Port: 22 (SSH)
# - Source: 0.0.0.0/0, Port: 80 (HTTP)
# - Source: 0.0.0.0.0/0, Port: 443 (HTTPS)
```

### 3. Connect to VPS
```bash
# SSH to your VPS
ssh -i your-key.pem ubuntu@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y
```

## 🔧 VPS Configuration

### 1. Run Setup Script
```bash
# Clone repository
git clone <your-repository-url>
cd website

# Make setup script executable
chmod +x scripts/oracle-cloud-setup.sh

# Run setup script
sudo ./scripts/oracle-cloud-setup.sh
```

### 2. Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Configure SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🌐 Cloudflare Configuration

### 1. Add Domain to Cloudflare
```bash
# In Cloudflare Dashboard:
# 1. Add your domain
# 2. Update nameservers at your domain registrar
# 3. Wait for DNS propagation
```

### 2. Configure DNS Records
```bash
# A Record: yourdomain.com -> VPS IP
# A Record: www.yourdomain.com -> VPS IP
# CNAME Record: admin.yourdomain.com -> netlify-app.netlify.app
```

### 3. Enable Cloudflare Proxy
```bash
# In Cloudflare Dashboard:
# 1. Go to DNS
# 2. Click the orange cloud icon for your domain
# 3. Enable "Proxied" status
```

### 4. Configure Security Settings
```bash
# In Cloudflare Dashboard:
# 1. Go to Security > Settings
# 2. Set Security Level to "High"
# 3. Enable "Bot Fight Mode"
# 4. Enable "Browser Integrity Check"
```

## 📱 Netlify Admin Panel Setup

### 1. Deploy Admin Panel
```bash
# In Netlify Dashboard:
# 1. Connect your GitHub repository
# 2. Set build command: npm run build
# 3. Set publish directory: admin-panel/dist
# 4. Deploy
```

### 2. Configure Custom Domain
```bash
# In Netlify Dashboard:
# 1. Go to Domain Management
# 2. Add custom domain: admin.yourdomain.com
# 3. Configure SSL certificate
```

### 3. Set Environment Variables
```bash
# In Netlify Dashboard:
# 1. Go to Site Settings > Environment Variables
# 2. Add the following variables:
#    - VITE_API_URL: https://yourdomain.com/api
#    - VITE_ENCRYPTION_KEY: your_encryption_key
#    - VITE_TELEGRAM_BOT_TOKEN: your_bot_token
```

## 🤖 Telegram Bot Setup

### 1. Create Telegram Bot
```bash
# 1. Message @BotFather on Telegram
# 2. Send /newbot
# 3. Follow the instructions
# 4. Save the bot token
```

### 2. Configure Bot
```bash
# Add bot token to environment variables
echo "TELEGRAM_BOT_TOKEN=your_bot_token" >> .env
echo "TELEGRAM_CHAT_ID=your_chat_id" >> .env
```

### 3. Test Bot
```bash
# Send message to your bot
# Bot should respond with available commands
```

## 🐳 Docker Deployment

### 1. Build and Deploy
```bash
# Build Docker images
docker-compose -f docker-compose.stealth.yml build

# Start services
docker-compose -f docker-compose.stealth.yml up -d

# Check status
docker-compose -f docker-compose.stealth.yml ps
```

### 2. Verify Deployment
```bash
# Check website
curl http://yourdomain.com

# Check admin panel
curl https://admin.yourdomain.com

# Check API
curl http://yourdomain.com/api/health
```

## 🔒 Security Configuration

### 1. Firewall Setup
```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 22/tcp from 0.0.0.0/0
```

### 2. Fail2ban Configuration
```bash
# Configure fail2ban
sudo nano /etc/fail2ban/jail.local

# Add the following:
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
```

### 3. SSL/TLS Configuration
```bash
# Configure Nginx SSL
sudo nano /etc/nginx/sites-available/yourdomain.com

# Add SSL configuration:
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

## 📊 Monitoring Setup

### 1. Start Monitoring Services
```bash
# Start stealth monitoring
sudo systemctl start kopma-monitoring
sudo systemctl enable kopma-monitoring

# Start IP rotation
sudo systemctl start kopma-ip-rotation
sudo systemctl enable kopma-ip-rotation
```

### 2. Configure Alerts
```bash
# Test Telegram bot
python3 monitoring/telegram-bot.py --test

# Check monitoring status
sudo systemctl status kopma-monitoring
```

### 3. Verify Monitoring
```bash
# Check logs
sudo journalctl -u kopma-monitoring -f

# Check IP rotation
sudo journalctl -u kopma-ip-rotation -f
```

## 🔄 Backup Configuration

### 1. Automated Backups
```bash
# Configure backup cron job
crontab -e

# Add the following line:
0 2 * * * /usr/local/bin/kopma-backup.sh
```

### 2. Test Backup
```bash
# Run manual backup
/usr/local/bin/kopma-backup.sh

# Check backup files
ls -la /opt/backups/kopma-website/
```

## 🚀 Go Live Checklist

### Pre-Deployment
- [ ] VPS instance created and configured
- [ ] Domain name configured
- [ ] Cloudflare setup completed
- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Docker services running
- [ ] Monitoring services active
- [ ] Backup system configured

### Post-Deployment
- [ ] Website accessible
- [ ] Admin panel accessible
- [ ] SSL certificate working
- [ ] Monitoring alerts working
- [ ] IP rotation functioning
- [ ] Backup system working
- [ ] Security scanning active
- [ ] Performance monitoring active

## 🛠️ Troubleshooting

### Common Issues

#### Website Not Accessible
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check certificate files
ls -la /etc/letsencrypt/live/yourdomain.com/
```

#### Monitoring Issues
```bash
# Check monitoring status
sudo systemctl status kopma-monitoring

# Check logs
sudo journalctl -u kopma-monitoring -f

# Restart monitoring
sudo systemctl restart kopma-monitoring
```

#### IP Rotation Issues
```bash
# Check IP rotation status
sudo systemctl status kopma-ip-rotation

# Check logs
sudo journalctl -u kopma-ip-rotation -f

# Restart IP rotation
sudo systemctl restart kopma-ip-rotation
```

### Performance Issues

#### High CPU Usage
```bash
# Check top processes
top

# Check system resources
htop

# Check Docker containers
docker stats
```

#### High Memory Usage
```bash
# Check memory usage
free -h

# Check swap usage
swapon -s

# Check Docker memory
docker stats --no-stream
```

#### Slow Response Times
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/access.log

# Check database performance
mysql -u root -p -e "SHOW PROCESSLIST;"

# Check Redis performance
redis-cli info stats
```

## 📞 Support

### Getting Help
1. **Check Logs**: Always check logs first
2. **Documentation**: Refer to documentation
3. **GitHub Issues**: Create GitHub issue
4. **Community**: Ask in community forums

### Emergency Procedures
1. **Website Down**: Check Nginx and Docker services
2. **Security Breach**: Check monitoring alerts
3. **Performance Issues**: Check system resources
4. **Data Loss**: Check backup status

---

**Deployment completed successfully! 🎉**

*Your KOPMA UNNES website is now live with advanced security, monitoring, and performance features.*
