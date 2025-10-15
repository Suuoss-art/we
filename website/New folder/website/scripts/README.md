# 🛠️ KOPMA UNNES Scripts

This directory contains automation scripts for deployment, testing, and maintenance.

## 🚀 New: Oracle Cloud Free Tier Deployment Scripts

### generate-admin-url.sh
**Purpose**: Generate secure, obfuscated admin panel URLs

**Usage**:
```bash
./generate-admin-url.sh
```

**Features**:
- ✅ Random 64+ character URLs
- ✅ High entropy security (~10^50+ combinations)
- ✅ URL-safe characters only
- ✅ Saves to `/tmp/kopma-deployment/admin-config.env`

---

### deploy-oracle.sh
**Purpose**: Complete Oracle Cloud Free Tier deployment ($0/month)

**Usage**:
```bash
./deploy-oracle.sh
```

**Features**:
- ✅ Full system setup
- ✅ Docker & Nginx installation
- ✅ SSL certificates (Let's Encrypt)
- ✅ Auto-generate admin URLs
- ✅ Firewall configuration
- ✅ Monitoring & backups

**Duration**: ~15-20 minutes

---

### configure-admin-nginx.sh
**Purpose**: Configure Nginx with obfuscated admin routes

**Usage**:
```bash
./configure-admin-nginx.sh
```

**Prerequisites**: .env file with ADMIN_URL_PATH set

---

### oracle-cloud-setup.sh
**Purpose**: Initial Oracle Cloud VPS system setup

**Usage**:
```bash
./oracle-cloud-setup.sh
```

---

## Available Scripts

### 1. activate-system.sh
**Purpose**: Automated system activation and deployment

**Usage**:
```bash
./scripts/activate-system.sh
```

**What it does**:
- ✅ Checks prerequisites (Docker, Node.js, npm)
- ✅ Configures environment variables
- ✅ Generates secure keys
- ✅ Installs dependencies
- ✅ Builds application
- ✅ Starts Docker containers
- ✅ Initializes database
- ✅ Tests Telegram bot
- ✅ Starts monitoring
- ✅ Runs health checks

**Requirements**:
- Docker and Docker Compose installed
- Node.js 18+ and npm 9+
- `.env` file configured (script can generate one)

**Estimated Time**: 10-15 minutes

---

### 2. run-tests.sh
**Purpose**: Comprehensive testing suite

**Usage**:
```bash
./scripts/run-tests.sh
```

**What it tests**:
1. ✅ Environment Configuration
2. ✅ Dependencies Check
3. ✅ Build Verification
4. ✅ Docker Containers Status
5. ✅ Health Endpoints
6. ✅ Database Connection
7. ✅ Redis Connection
8. ✅ API Endpoints
9. ✅ Security Headers
10. ✅ File Structure Integrity
11. ✅ Content Validation (No gambling)
12. ✅ NPM Security Audit
13. ✅ Monitoring System
14. ✅ Admin Panel Configuration
15. ✅ SSL/TLS Configuration

**Output**:
- Pass/Fail for each test
- Warnings for non-critical issues
- Summary report

**Exit Codes**:
- `0` - All tests passed
- `1` - Some tests failed

**Estimated Time**: 2-3 minutes

---

## Quick Start

### First Time Setup

```bash
# 1. Make scripts executable (if not already)
chmod +x scripts/*.sh

# 2. Run activation
./scripts/activate-system.sh

# 3. Verify with tests
./scripts/run-tests.sh
```

### After Changes

```bash
# Rebuild and restart
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up -d --build

# Run tests
./scripts/run-tests.sh
```

### Daily Operations

```bash
# Check system health
./scripts/run-tests.sh

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Restart services
docker-compose -f docker/docker-compose.yml restart
```

---

## Environment Variables

Both scripts expect these variables in `.env`:

### Required
```bash
DB_PASSWORD=<your-password>
MYSQL_ROOT_PASSWORD=<your-password>
ENCRYPTION_KEY=<32-char-key>
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_CHAT_ID=<chat-id>
JWT_SECRET=<secret>
SESSION_SECRET=<secret>
CSRF_SECRET=<secret>
```

### Optional but Recommended
```bash
CLOUDFLARE_API_TOKEN=<token>
CLOUDFLARE_ZONE_ID=<zone-id>
SMTP_HOST=smtp.gmail.com
SMTP_USER=<email>
SMTP_PASS=<password>
```

---

## Troubleshooting

### Script Won't Run

**Problem**: Permission denied
```bash
chmod +x scripts/activate-system.sh
chmod +x scripts/run-tests.sh
```

**Problem**: Command not found
```bash
# Use absolute path
/home/runner/work/WebKpm/WebKpm/WebK/website/scripts/activate-system.sh
```

### Activation Fails

**Problem**: Docker not running
```bash
sudo systemctl start docker
```

**Problem**: Port already in use
```bash
# Find what's using port 80
sudo lsof -i :80

# Kill the process or change port in docker-compose.yml
```

**Problem**: Permission error with Docker
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Tests Fail

**Problem**: Containers not running
```bash
docker-compose -f docker/docker-compose.yml up -d
```

**Problem**: Health endpoints not responding
```bash
# Wait a bit longer for services to start
sleep 10
./scripts/run-tests.sh
```

**Problem**: Database connection failed
```bash
# Check MySQL logs
docker-compose -f docker/docker-compose.yml logs mysql

# Restart MySQL
docker-compose -f docker/docker-compose.yml restart mysql
```

---

## Adding New Scripts

### Script Template

```bash
#!/bin/bash
# Script Name: your-script.sh
# Purpose: Brief description

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Main script logic here
echo "Starting script..."

# Your code here

echo "Script complete!"
```

### Make it Executable

```bash
chmod +x scripts/your-script.sh
```

### Document it

Add description to this README.md

---

## Script Best Practices

1. **Always use `set -e`** - Exit on first error
2. **Check prerequisites** - Verify required commands exist
3. **Use color output** - Makes output easier to read
4. **Add progress messages** - User knows what's happening
5. **Handle errors gracefully** - Show helpful error messages
6. **Document thoroughly** - Explain what script does
7. **Make idempotent** - Safe to run multiple times
8. **Test thoroughly** - Run in clean environment

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Tests
        run: ./scripts/run-tests.sh
        
      - name: Deploy
        if: success()
        run: ./scripts/deploy.sh
```

### GitLab CI

```yaml
stages:
  - test
  - deploy

test:
  script:
    - ./scripts/run-tests.sh

deploy:
  script:
    - ./scripts/activate-system.sh
  only:
    - main
```

---

## Performance

### Activation Script
- **Duration**: 10-15 minutes
- **CPU Usage**: High during build
- **Disk Usage**: ~500MB for containers
- **Network**: Downloads dependencies

### Test Script
- **Duration**: 2-3 minutes
- **CPU Usage**: Low
- **Disk Usage**: Minimal
- **Network**: Only for health checks

---

## Security

### What Scripts Do

✅ **Safe Operations**:
- Read configuration files
- Build application
- Start containers
- Run health checks

❌ **Never Does**:
- Delete user data
- Expose secrets
- Modify system files
- Send data externally

### Best Practices

1. **Review scripts** before running
2. **Don't run as root** unless necessary
3. **Keep scripts updated**
4. **Use version control**
5. **Audit regularly**

---

## Support

### Documentation
- Main guide: `../ACTIVATION_DEPLOYMENT_GUIDE.md`
- Monitoring: `../../MONITORING_QUICK_START.md`
- Complete status: `../../IMPLEMENTATION_COMPLETE.md`

### Help Commands

```bash
# Show script help
./scripts/activate-system.sh --help

# Run in verbose mode
./scripts/run-tests.sh --verbose

# Dry run (preview without changes)
./scripts/activate-system.sh --dry-run
```

---

## Version History

### v1.0.0 (2025-10-11)
- ✅ Initial release
- ✅ Activation script
- ✅ Testing script
- ✅ Documentation

---

**Status**: ✅ Ready for Production Use  
**Last Updated**: 2025-10-11  
**Maintainer**: KOPMA UNNES Development Team
