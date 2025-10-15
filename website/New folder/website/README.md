# KOPMA UNNES Website

Modern, secure, and high-performance website for KOPMA UNNES (Koperasi Mahasiswa Universitas Negeri Semarang) built with cutting-edge technologies and advanced security features.

## 🚀 Features

### Core Features
- **Modern Tech Stack**: TypeScript + Astro + React + TailwindCSS
- **High Performance**: Static Site Generation with optimized loading
- **Responsive Design**: Mobile-first approach with beautiful animations
- **SEO Optimized**: Meta tags, sitemap, and structured data

### Security Features
- **Advanced Security**: Multi-layer security with encryption
- **IP Masking**: Dynamic IP rotation and stealth DNS
- **Hidden Monitoring**: Real-time threat detection and alerts
- **Secure Admin Panel**: Hidden admin panel on Netlify

### Monitoring & Analytics
- **Real-time Monitoring**: Anomaly detection and performance tracking
- **Telegram Bot**: Encrypted notifications and remote management
- **Security Scanning**: Automated malware and vulnerability detection
- **Log Analysis**: Comprehensive logging and analysis

### Deployment
- **Oracle Cloud VPS**: Free tier deployment (2 core CPU, 8GB RAM)
- **Docker Containerization**: Multi-container architecture
- **SSL/TLS**: Automatic certificate management
- **Backup System**: Automated daily backups with retention

## 🏗️ Architecture

### Frontend (Main Website)
```
src/
├── pages/           # Astro pages
├── components/      # React components
├── layouts/         # Page layouts
├── styles/          # Global styles
├── types/           # TypeScript types
├── utils/           # Utility functions
└── data/            # Static data
```

### Backend (PHP API)
```
backend/
├── api/             # API endpoints
├── config/          # Configuration
├── includes/        # Shared functions
└── uploads/         # File uploads
```

### Admin Panel (Netlify)
```
admin-panel/
├── src/
│   ├── pages/       # Admin pages
│   ├── components/  # Admin components
│   └── utils/       # Admin utilities
└── netlify.toml     # Netlify configuration
```

### Monitoring System
```
monitoring/
├── anomaly_detector.py    # Anomaly detection
├── telegram_bot.py        # Telegram notifications
├── encryption.py          # Encryption utilities
├── log_analyzer.py        # Log analysis
└── security_scanner.py    # Security scanning
```

### IP Masking System
```
ip-masking/
├── rotation.py      # IP rotation
├── stealth-dns.ts   # Stealth DNS
└── Dockerfile       # Container config
```

## 🛠️ Technology Stack

### Frontend
- **Astro**: Static site generator
- **React**: UI components
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Framer Motion**: Animations

### Backend
- **PHP 8.2**: Server-side logic
- **MySQL 8.0**: Database
- **Redis**: Caching
- **Nginx**: Web server

### Monitoring
- **Python**: Monitoring scripts
- **Telegram Bot**: Notifications
- **Docker**: Containerization
- **Supervisor**: Process management

### Security
- **AES-256-GCM**: Encryption
- **PBKDF2**: Key derivation
- **CSRF Protection**: Cross-site request forgery
- **Rate Limiting**: Request throttling
- **IP Blocking**: Suspicious IP detection

## 📦 Installation

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git
- Oracle Cloud VPS (Free Tier)

### Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/kopma-unnes/website.git
cd website
```

2. **Install Dependencies**
```bash
npm install
cd admin-panel && npm install
```

3. **Configure Environment**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Build Project**
```bash
npm run build
```

5. **Deploy to Oracle Cloud**
```bash
chmod +x scripts/deploy-oracle.sh
./scripts/deploy-oracle.sh
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Database
DB_PASSWORD=your_secure_password
MYSQL_ROOT_PASSWORD=your_mysql_password

# Encryption
ENCRYPTION_KEY=your_32_char_encryption_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Cloudflare
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id

# Domain
DOMAIN=kopmaukmunnes.com
SSL_EMAIL=admin@kopmaukmunnes.com
```

### Security Configuration

1. **Change Default Passwords**
   - Database passwords
   - Encryption keys
   - JWT secrets

2. **Configure Telegram Bot**
   - Create bot with @BotFather
   - Get chat ID
   - Add to environment

3. **Set up Cloudflare**
   - Get API token
   - Configure DNS
   - Enable IP rotation

## 🚀 Deployment

### Oracle Cloud VPS Deployment

1. **Create VPS Instance**
   - Shape: VM.Standard.E2.1.Micro
   - OS: Ubuntu 22.04 LTS
   - Storage: 50GB

2. **Run Deployment Script**
```bash
./scripts/deploy-oracle.sh
```

3. **Configure Domain**
   - Point DNS to VPS IP
   - SSL certificates will be auto-generated

### Admin Panel Deployment (Netlify)

1. **Build Admin Panel**
```bash
cd admin-panel
npm run build
```

2. **Deploy to Netlify**
```bash
npm run deploy
```

3. **Configure Environment**
   - Set environment variables
   - Configure API endpoints

## 📊 Monitoring

### Health Checks
- Website: `https://yourdomain.com/health`
- Database: MySQL connection check
- Redis: Cache connectivity
- Services: Docker container status

### Telegram Bot Commands
- `/start` - Bot information
- `/status` - System status
- `/ips` - Current IP addresses
- `/rotate` - Manual IP rotation
- `/security` - Security report
- `/performance` - Performance metrics
- `/health` - Health check
- `/logs` - Recent logs
- `/alerts` - Recent alerts
- `/backup` - Create backup
- `/update` - Update website
- `/monitor` - Monitoring control

### Log Files
- Application: `/app/logs/application.log`
- Security: `/app/logs/security.log`
- Nginx: `/var/log/nginx/`
- PHP: `/var/log/php/`

## 🔒 Security Features

### Advanced Security
- **Multi-layer Encryption**: AES-256-GCM with key rotation
- **IP Masking**: Dynamic IP rotation every hour
- **Stealth DNS**: Encrypted DNS queries
- **Hidden Monitoring**: Undetectable monitoring system
- **Threat Detection**: Real-time anomaly detection

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: Comprehensive CSP

### Rate Limiting
- Login attempts: 5 per minute
- API requests: 10 per second
- General requests: 20 per second

## 📈 Performance

### Optimization Features
- **Static Site Generation**: Pre-built pages
- **Image Optimization**: WebP format with lazy loading
- **Caching**: Redis cache with TTL
- **Compression**: Gzip compression
- **CDN**: Cloudflare integration

### Performance Metrics
- **Lighthouse Score**: 90+
- **Page Load Time**: < 3 seconds
- **Core Web Vitals**: All green
- **Mobile Performance**: Optimized

## 🛡️ Backup & Recovery

### Automated Backups
- **Daily Backups**: 2 AM UTC
- **Retention**: 30 days
- **Components**: Database, files, logs, SSL
- **Location**: `/opt/kopma-website/backups/`

### Manual Backup
```bash
./scripts/backup.sh
```

### Restore from Backup
```bash
./scripts/restore.sh backup_file.tar.gz
```

## 🔧 Maintenance

### Regular Tasks
- **SSL Renewal**: Automatic via cron
- **Log Rotation**: Daily rotation
- **Security Updates**: Weekly checks
- **Performance Monitoring**: Continuous

### Monitoring Commands
```bash
# Check system status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update website
docker-compose pull
docker-compose up -d
```

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

### Content Management
```bash
GET /api/content/pages
POST /api/content/pages
PUT /api/content/pages/:id
DELETE /api/content/pages/:id
```

### File Upload
```bash
POST /api/upload
Content-Type: multipart/form-data

file: [binary data]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: admin@kopmaukmunnes.com
- **Telegram**: @kopmaunnes
- **Website**: https://kopmaukmunnes.com

## 🎯 Roadmap

### Phase 1 (Completed)
- ✅ Modern website with Astro + React
- ✅ Advanced security implementation
- ✅ Hidden monitoring system
- ✅ Oracle Cloud VPS deployment
- ✅ Admin panel on Netlify

### Phase 2 (Planned)
- 🔄 Mobile app development
- 🔄 Advanced analytics dashboard
- 🔄 Multi-language support
- 🔄 API documentation
- 🔄 Performance optimization

### Phase 3 (Future)
- 🔄 AI-powered content management
- 🔄 Advanced security features
- 🔄 Real-time collaboration
- 🔄 Integration with external services

---

**Built with ❤️ for KOPMA UNNES**

*Koperasi Mahasiswa Universitas Negeri Semarang*