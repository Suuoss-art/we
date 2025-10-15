#!/bin/bash
# scripts/backup.sh
# Backup script for KOPMA UNNES Website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/kopma-website/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="kopma_backup_${DATE}"
RETENTION_DAYS=30

echo -e "${BLUE}💾 Starting backup process...${NC}"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Create backup subdirectory
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
mkdir -p ${BACKUP_PATH}

echo -e "${YELLOW}📦 Creating database backup...${NC}"
# Database backup
docker-compose -f docker/docker-compose.oci.yml exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} --all-databases > ${BACKUP_PATH}/database.sql

echo -e "${YELLOW}📦 Creating Redis backup...${NC}"
# Redis backup
docker-compose -f docker/docker-compose.oci.yml exec -T redis redis-cli --rdb /data/dump.rdb
docker cp $(docker-compose -f docker/docker-compose.oci.yml ps -q redis):/data/dump.rdb ${BACKUP_PATH}/redis.rdb

echo -e "${YELLOW}📦 Creating files backup...${NC}"
# Files backup
tar -czf ${BACKUP_PATH}/files.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    --exclude=backups \
    --exclude=.astro \
    --exclude=dist \
    .

echo -e "${YELLOW}📦 Creating logs backup...${NC}"
# Logs backup
tar -czf ${BACKUP_PATH}/logs.tar.gz logs/

echo -e "${YELLOW}📦 Creating configuration backup...${NC}"
# Configuration backup
tar -czf ${BACKUP_PATH}/config.tar.gz \
    docker/ \
    .env \
    package.json \
    astro.config.mjs \
    tailwind.config.mjs \
    tsconfig.json

echo -e "${YELLOW}📦 Creating Docker volumes backup...${NC}"
# Docker volumes backup
docker run --rm -v kopma-website_mysql_data:/data -v kopma-website_redis_data:/redis -v ${BACKUP_PATH}:/backup alpine tar -czf /backup/volumes.tar.gz /data /redis

echo -e "${YELLOW}📦 Creating SSL certificates backup...${NC}"
# SSL certificates backup
if [ -d "ssl" ]; then
    tar -czf ${BACKUP_PATH}/ssl.tar.gz ssl/
fi

echo -e "${YELLOW}📦 Creating uploads backup...${NC}"
# Uploads backup
if [ -d "uploads" ]; then
    tar -czf ${BACKUP_PATH}/uploads.tar.gz uploads/
fi

# Create backup manifest
echo -e "${YELLOW}📋 Creating backup manifest...${NC}"
cat > ${BACKUP_PATH}/manifest.json << EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "$(date -Iseconds)",
  "version": "1.0.0",
  "components": {
    "database": "database.sql",
    "redis": "redis.rdb",
    "files": "files.tar.gz",
    "logs": "logs.tar.gz",
    "config": "config.tar.gz",
    "volumes": "volumes.tar.gz",
    "ssl": "ssl.tar.gz",
    "uploads": "uploads.tar.gz"
  },
  "size": {
    "total": "$(du -sh ${BACKUP_PATH} | cut -f1)",
    "database": "$(du -sh ${BACKUP_PATH}/database.sql | cut -f1)",
    "redis": "$(du -sh ${BACKUP_PATH}/redis.rdb | cut -f1)",
    "files": "$(du -sh ${BACKUP_PATH}/files.tar.gz | cut -f1)",
    "logs": "$(du -sh ${BACKUP_PATH}/logs.tar.gz | cut -f1)",
    "config": "$(du -sh ${BACKUP_PATH}/config.tar.gz | cut -f1)",
    "volumes": "$(du -sh ${BACKUP_PATH}/volumes.tar.gz | cut -f1)",
    "ssl": "$(du -sh ${BACKUP_PATH}/ssl.tar.gz | cut -f1)",
    "uploads": "$(du -sh ${BACKUP_PATH}/uploads.tar.gz | cut -f1)"
  },
  "system": {
    "hostname": "$(hostname)",
    "os": "$(uname -s)",
    "kernel": "$(uname -r)",
    "architecture": "$(uname -m)",
    "docker_version": "$(docker --version)",
    "docker_compose_version": "$(docker-compose --version)"
  }
}
EOF

# Create backup archive
echo -e "${YELLOW}📦 Creating final backup archive...${NC}"
cd ${BACKUP_DIR}
tar -czf ${BACKUP_NAME}.tar.gz ${BACKUP_NAME}/
rm -rf ${BACKUP_NAME}

# Calculate backup size
BACKUP_SIZE=$(du -sh ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz | cut -f1)

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "${BLUE}📋 Backup Summary:${NC}"
echo -e "  • Backup Name: ${BACKUP_NAME}"
echo -e "  • Backup Size: ${BACKUP_SIZE}"
echo -e "  • Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo -e "  • Timestamp: $(date)"

# Clean up old backups
echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
find ${BACKUP_DIR} -name "kopma_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete

# Send notification (if Telegram is configured)
if [ ! -z "${TELEGRAM_BOT_TOKEN}" ] && [ ! -z "${TELEGRAM_CHAT_ID}" ]; then
    echo -e "${YELLOW}📱 Sending backup notification...${NC}"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d chat_id="${TELEGRAM_CHAT_ID}" \
        -d text="💾 Backup completed successfully!
        
📋 Backup Details:
• Name: ${BACKUP_NAME}
• Size: ${BACKUP_SIZE}
• Time: $(date)
• Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz

✅ KOPMA UNNES Website backup is ready!" \
        -d parse_mode="HTML" > /dev/null
fi

echo -e "${GREEN}🎉 Backup process completed!${NC}"




