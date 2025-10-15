#!/bin/bash
# scripts/restore.sh
# Restore script for KOPMA UNNES Website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/kopma-website/backups"
RESTORE_DIR="/tmp/kopma_restore_$(date +%Y%m%d_%H%M%S)"

# Function to display usage
usage() {
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 kopma_backup_20240115_120000.tar.gz"
    exit 1
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Backup file not specified${NC}"
    usage
fi

BACKUP_FILE=$1
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Check if backup file exists
if [ ! -f "${BACKUP_PATH}" ]; then
    echo -e "${RED}❌ Error: Backup file not found: ${BACKUP_PATH}${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Starting restore process...${NC}"
echo -e "${YELLOW}⚠️ Warning: This will overwrite current data!${NC}"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 1
fi

# Create restore directory
mkdir -p ${RESTORE_DIR}
cd ${RESTORE_DIR}

echo -e "${YELLOW}📦 Extracting backup file...${NC}"
tar -xzf ${BACKUP_PATH}

# Get backup directory name
BACKUP_NAME=$(ls -1 | head -n 1)
cd ${BACKUP_NAME}

echo -e "${YELLOW}📋 Reading backup manifest...${NC}"
if [ -f "manifest.json" ]; then
    cat manifest.json
else
    echo -e "${RED}❌ Error: Backup manifest not found${NC}"
    exit 1
fi

# Stop services
echo -e "${YELLOW}⏹️ Stopping services...${NC}"
cd /opt/kopma-website
docker-compose -f docker/docker-compose.oci.yml down

# Restore database
echo -e "${YELLOW}🗄️ Restoring database...${NC}"
if [ -f "${RESTORE_DIR}/${BACKUP_NAME}/database.sql" ]; then
    docker-compose -f docker/docker-compose.oci.yml up -d mysql
    sleep 10
    docker-compose -f docker/docker-compose.oci.yml exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} < ${RESTORE_DIR}/${BACKUP_NAME}/database.sql
    echo -e "${GREEN}✅ Database restored${NC}"
else
    echo -e "${YELLOW}⚠️ Database backup not found, skipping...${NC}"
fi

# Restore Redis
echo -e "${YELLOW}🗄️ Restoring Redis...${NC}"
if [ -f "${RESTORE_DIR}/${BACKUP_NAME}/redis.rdb" ]; then
    docker-compose -f docker/docker-compose.oci.yml up -d redis
    sleep 5
    docker cp ${RESTORE_DIR}/${BACKUP_NAME}/redis.rdb $(docker-compose -f docker/docker-compose.oci.yml ps -q redis):/data/dump.rdb
    docker-compose -f docker/docker-compose.oci.yml restart redis
    echo -e "${GREEN}✅ Redis restored${NC}"
else
    echo -e "${YELLOW}⚠️ Redis backup not found, skipping...${NC}"
fi

# Restore files
echo -e "${YELLOW}📁 Restoring files...${NC}"
if [ -f "${RESTORE_DIR}/${BACKUP_NAME}/files.tar.gz" ]; then
    tar -xzf ${RESTORE_DIR}/${BACKUP_NAME}/files.tar.gz -C /opt/kopma-website
    echo -e "${GREEN}✅ Files restored${NC}"
else
    echo -e "${YELLOW}⚠️ Files backup not found, skipping...${NC}"
fi

# Restore configuration
echo -e "${YELLOW}⚙️ Restoring configuration...${NC}"
if [ -f "${RESTORE_DIR}/${BACKUP_NAME}/config.tar.gz" ]; then
    tar -xzf ${RESTORE_DIR}/${BACKUP_NAME}/config.tar.gz -C /opt/kopma-website
    echo -e "${GREEN}✅ Configuration restored${NC}"
else
    echo -e "${YELLOW}⚠️ Configuration backup not found, skipping...${NC}"
fi

# Restore SSL certificates
echo -e "${YELLOW}🔒 Restoring SSL certificates...${NC}"
if [ -f "${RESTORE_DIR}/${BACKUP_NAME}/ssl.tar.gz" ]; then
    tar -xzf ${RESTORE_DIR}/${BACKUP_NAME}/ssl.tar.gz -C /opt/kopma-website
    echo -e "${GREEN}✅ SSL certificates restored${NC}"
else
    echo -e "${YELLOW}⚠️ SSL certificates backup not found, skipping...${NC}"
fi

# Restore uploads
echo -e "${YELLOW}📁 Restoring uploads...${NC}"
if [ -f "${RESTORE_DIR}/${BACKUP_NAME}/uploads.tar.gz" ]; then
    tar -xzf ${RESTORE_DIR}/${BACKUP_NAME}/uploads.tar.gz -C /opt/kopma-website
    echo -e "${GREEN}✅ Uploads restored${NC}"
else
    echo -e "${YELLOW}⚠️ Uploads backup not found, skipping...${NC}"
fi

# Restore Docker volumes
echo -e "${YELLOW}🐳 Restoring Docker volumes...${NC}"
if [ -f "${RESTORE_DIR}/${BACKUP_NAME}/volumes.tar.gz" ]; then
    docker-compose -f docker/docker-compose.oci.yml up -d mysql redis
    sleep 10
    docker run --rm -v kopma-website_mysql_data:/data -v kopma-website_redis_data:/redis -v ${RESTORE_DIR}/${BACKUP_NAME}:/backup alpine tar -xzf /backup/volumes.tar.gz -C /
    echo -e "${GREEN}✅ Docker volumes restored${NC}"
else
    echo -e "${YELLOW}⚠️ Docker volumes backup not found, skipping...${NC}"
fi

# Set permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
chown -R $USER:$USER /opt/kopma-website
chmod -R 755 /opt/kopma-website

# Start services
echo -e "${YELLOW}▶️ Starting services...${NC}"
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
    echo -e "${YELLOW}⚠️ Please check the logs and restart services if needed${NC}"
fi

# Clean up restore directory
echo -e "${YELLOW}🧹 Cleaning up restore directory...${NC}"
rm -rf ${RESTORE_DIR}

# Send notification (if Telegram is configured)
if [ ! -z "${TELEGRAM_BOT_TOKEN}" ] && [ ! -z "${TELEGRAM_CHAT_ID}" ]; then
    echo -e "${YELLOW}📱 Sending restore notification...${NC}"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d chat_id="${TELEGRAM_CHAT_ID}" \
        -d text="🔄 Restore completed successfully!
        
📋 Restore Details:
• Backup: ${BACKUP_FILE}
• Time: $(date)
• Status: ✅ Success

✅ KOPMA UNNES Website has been restored!" \
        -d parse_mode="HTML" > /dev/null
fi

echo -e "${GREEN}🎉 Restore process completed!${NC}"
echo -e "${BLUE}📋 Restore Summary:${NC}"
echo -e "  • Backup File: ${BACKUP_FILE}"
echo -e "  • Restore Time: $(date)"
echo -e "  • Status: ✅ Success"
echo -e ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo -e "  • Website: https://${DOMAIN:-kopmaukmunnes.com}"
echo -e "  • Health Check: https://${DOMAIN:-kopmaukmunnes.com}/health"
echo -e ""
echo -e "${YELLOW}⚠️ Important Notes:${NC}"
echo -e "  • Please verify all functionality"
echo -e "  • Check SSL certificates if restored"
echo -e "  • Monitor logs for any issues"
echo -e ""
echo -e "${GREEN}✅ KOPMA UNNES Website has been restored successfully!${NC}"




