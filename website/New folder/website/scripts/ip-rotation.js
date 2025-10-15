/**
 * IP Rotation Script for KOPMA UNNES Website
 * Automated IP rotation with health monitoring and failover
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class IPRotationManager {
  constructor() {
    this.config = {
      rotationInterval: 30 * 60 * 1000, // 30 minutes
      healthCheckInterval: 60 * 1000, // 1 minute
      maxFailures: 3,
      failoverThreshold: 5 * 60 * 1000, // 5 minutes
      cloudflare: {
        apiToken: process.env.CLOUDFLARE_API_TOKEN,
        zoneId: process.env.CLOUDFLARE_ZONE_ID,
        recordId: process.env.CLOUDFLARE_RECORD_ID
      },
      nginx: {
        configPath: '/etc/nginx/sites-available/kopma-website',
        reloadCommand: 'sudo nginx -s reload'
      },
      monitoring: {
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
        telegramChatId: process.env.TELEGRAM_CHAT_ID,
        webhookUrl: process.env.WEBHOOK_URL
      }
    };
    
    this.currentIPs = new Map();
    this.healthStatus = new Map();
    this.rotationHistory = [];
    this.isRunning = false;
    this.rotationInterval = null;
    this.healthCheckInterval = null;
  }

  // Start IP rotation
  async start() {
    console.log('🔄 Starting IP rotation manager...');
    
    try {
      // Load current configuration
      await this.loadCurrentConfiguration();
      
      // Start rotation interval
      this.rotationInterval = setInterval(async () => {
        await this.performRotation();
      }, this.config.rotationInterval);
      
      // Start health check interval
      this.healthCheckInterval = setInterval(async () => {
        await this.performHealthCheck();
      }, this.config.healthCheckInterval);
      
      this.isRunning = true;
      console.log('✅ IP rotation manager started');
      
      // Send startup notification
      await this.sendNotification('🔄 IP rotation manager started');
      
    } catch (error) {
      console.error('❌ Error starting IP rotation manager:', error);
      throw error;
    }
  }

  // Stop IP rotation
  async stop() {
    console.log('🛑 Stopping IP rotation manager...');
    
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.isRunning = false;
    console.log('✅ IP rotation manager stopped');
  }

  // Load current configuration
  async loadCurrentConfiguration() {
    try {
      // Load from environment or config file
      const configFile = path.join(__dirname, '..', 'config', 'ip-rotation.json');
      
      if (fs.existsSync(configFile)) {
        const configData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        this.currentIPs = new Map(configData.currentIPs);
        this.healthStatus = new Map(configData.healthStatus);
      }
      
      console.log('✅ Configuration loaded');
    } catch (error) {
      console.error('❌ Error loading configuration:', error);
    }
  }

  // Save current configuration
  async saveConfiguration() {
    try {
      const configDir = path.join(__dirname, '..', 'config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const configFile = path.join(configDir, 'ip-rotation.json');
      const configData = {
        currentIPs: Array.from(this.currentIPs.entries()),
        healthStatus: Array.from(this.healthStatus.entries()),
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(configFile, JSON.stringify(configData, null, 2));
      console.log('✅ Configuration saved');
    } catch (error) {
      console.error('❌ Error saving configuration:', error);
    }
  }

  // Perform IP rotation
  async performRotation() {
    try {
      console.log('🔄 Performing IP rotation...');
      
      // Get current IPs
      const currentIPs = await this.getCurrentIPs();
      
      // Select new IPs
      const newIPs = await this.selectNewIPs();
      
      // Update DNS records
      await this.updateDNSRecords(newIPs);
      
      // Update load balancer
      await this.updateLoadBalancer(newIPs);
      
      // Verify rotation
      const verificationResult = await this.verifyRotation(newIPs);
      
      // Update current IPs
      this.currentIPs = new Map(newIPs);
      
      // Save configuration
      await this.saveConfiguration();
      
      // Log rotation
      this.rotationHistory.push({
        timestamp: new Date(),
        oldIPs: currentIPs,
        newIPs: newIPs,
        success: verificationResult,
        duration: Date.now() - Date.now()
      });
      
      // Keep only last 100 rotations
      if (this.rotationHistory.length > 100) {
        this.rotationHistory = this.rotationHistory.slice(-100);
      }
      
      console.log('✅ IP rotation completed');
      
      // Send notification
      await this.sendNotification(`🔄 IP rotation completed. New IPs: ${Array.from(newIPs.values()).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Error during IP rotation:', error);
      await this.sendNotification(`❌ IP rotation failed: ${error.message}`);
    }
  }

  // Get current IPs
  async getCurrentIPs() {
    const currentIPs = new Map();
    
    try {
      // Get current IP from Cloudflare
      const cloudflareIP = await this.getCloudflareIP();
      if (cloudflareIP) {
        currentIPs.set('cloudflare', cloudflareIP);
      }
      
      // Get current IP from Nginx
      const nginxIP = await this.getNginxIP();
      if (nginxIP) {
        currentIPs.set('nginx', nginxIP);
      }
      
      // Get current IP from application
      const appIP = await this.getApplicationIP();
      if (appIP) {
        currentIPs.set('application', appIP);
      }
      
    } catch (error) {
      console.error('❌ Error getting current IPs:', error);
    }
    
    return currentIPs;
  }

  // Select new IPs
  async selectNewIPs() {
    const newIPs = new Map();
    
    try {
      // Get available IPs
      const availableIPs = await this.getAvailableIPs();
      
      // Select optimal IPs
      for (const [type, ips] of availableIPs) {
        const selectedIP = this.selectOptimalIP(ips, type);
        newIPs.set(type, selectedIP);
      }
      
    } catch (error) {
      console.error('❌ Error selecting new IPs:', error);
    }
    
    return newIPs;
  }

  // Get available IPs
  async getAvailableIPs() {
    const availableIPs = new Map();
    
    try {
      // Cloudflare IPs
      const cloudflareIPs = await this.getCloudflareIPs();
      availableIPs.set('cloudflare', cloudflareIPs);
      
      // Nginx IPs
      const nginxIPs = await this.getNginxIPs();
      availableIPs.set('nginx', nginxIPs);
      
      // Application IPs
      const appIPs = await this.getApplicationIPs();
      availableIPs.set('application', appIPs);
      
    } catch (error) {
      console.error('❌ Error getting available IPs:', error);
    }
    
    return availableIPs;
  }

  // Select optimal IP
  selectOptimalIP(ips, type) {
    // Filter healthy IPs
    const healthyIPs = ips.filter(ip => {
      const health = this.healthStatus.get(ip);
      return health && health.status === 'healthy';
    });
    
    if (healthyIPs.length === 0) {
      // Fallback to any IP if no healthy ones
      return ips[Math.floor(Math.random() * ips.length)];
    }
    
    // Select based on performance metrics
    const performanceScores = healthyIPs.map(ip => {
      const health = this.healthStatus.get(ip);
      return {
        ip,
        score: health ? health.score : 0
      };
    });
    
    // Sort by score and select the best
    performanceScores.sort((a, b) => b.score - a.score);
    return performanceScores[0].ip;
  }

  // Update DNS records
  async updateDNSRecords(newIPs) {
    try {
      console.log('🌐 Updating DNS records...');
      
      for (const [type, ip] of newIPs) {
        if (type === 'cloudflare') {
          await this.updateCloudflareRecord(ip);
        }
      }
      
      console.log('✅ DNS records updated');
    } catch (error) {
      console.error('❌ Error updating DNS records:', error);
      throw error;
    }
  }

  // Update load balancer
  async updateLoadBalancer(newIPs) {
    try {
      console.log('⚖️ Updating load balancer...');
      
      // Update Nginx configuration
      await this.updateNginxConfig(newIPs);
      
      // Reload Nginx
      await this.reloadNginx();
      
      console.log('✅ Load balancer updated');
    } catch (error) {
      console.error('❌ Error updating load balancer:', error);
      throw error;
    }
  }

  // Verify rotation
  async verifyRotation(newIPs) {
    try {
      console.log('✅ Verifying IP rotation...');
      
      let allVerified = true;
      
      for (const [type, ip] of newIPs) {
        const verified = await this.verifyIP(type, ip);
        if (!verified) {
          allVerified = false;
          console.warn(`⚠️ Failed to verify IP ${ip} for ${type}`);
        }
      }
      
      return allVerified;
    } catch (error) {
      console.error('❌ Error verifying rotation:', error);
      return false;
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      console.log('🏥 Performing health check...');
      
      const healthChecks = await Promise.all([
        this.checkCloudflareHealth(),
        this.checkNginxHealth(),
        this.checkApplicationHealth(),
        this.checkDatabaseHealth(),
        this.checkRedisHealth()
      ]);
      
      // Update health status
      for (const [type, health] of healthChecks) {
        this.healthStatus.set(type, health);
      }
      
      // Check for failures
      const failedServices = healthChecks.filter(([type, health]) => health.status === 'down');
      
      if (failedServices.length > 0) {
        console.warn(`⚠️ Failed services: ${failedServices.map(([type]) => type).join(', ')}`);
        
        // Send alert
        await this.sendNotification(`⚠️ Health check failed for: ${failedServices.map(([type]) => type).join(', ')}`);
        
        // Trigger failover if needed
        if (failedServices.length >= this.config.maxFailures) {
          await this.triggerFailover(failedServices);
        }
      }
      
    } catch (error) {
      console.error('❌ Error during health check:', error);
    }
  }

  // Check Cloudflare health
  async checkCloudflareHealth() {
    try {
      const response = await this.makeRequest('https://api.cloudflare.com/client/v4/user/tokens/verify');
      return ['cloudflare', { status: 'healthy', score: 100, timestamp: new Date() }];
    } catch (error) {
      return ['cloudflare', { status: 'down', score: 0, timestamp: new Date(), error: error.message }];
    }
  }

  // Check Nginx health
  async checkNginxHealth() {
    try {
      const { stdout } = await execAsync('sudo nginx -t');
      return ['nginx', { status: 'healthy', score: 100, timestamp: new Date() }];
    } catch (error) {
      return ['nginx', { status: 'down', score: 0, timestamp: new Date(), error: error.message }];
    }
  }

  // Check application health
  async checkApplicationHealth() {
    try {
      const response = await this.makeRequest('http://localhost:3000/health');
      return ['application', { status: 'healthy', score: 100, timestamp: new Date() }];
    } catch (error) {
      return ['application', { status: 'down', score: 0, timestamp: new Date(), error: error.message }];
    }
  }

  // Check database health
  async checkDatabaseHealth() {
    try {
      const { stdout } = await execAsync('docker exec mysql mysqladmin ping -h localhost');
      return ['database', { status: 'healthy', score: 100, timestamp: new Date() }];
    } catch (error) {
      return ['database', { status: 'down', score: 0, timestamp: new Date(), error: error.message }];
    }
  }

  // Check Redis health
  async checkRedisHealth() {
    try {
      const { stdout } = await execAsync('docker exec redis redis-cli ping');
      return ['redis', { status: 'healthy', score: 100, timestamp: new Date() }];
    } catch (error) {
      return ['redis', { status: 'down', score: 0, timestamp: new Date(), error: error.message }];
    }
  }

  // Trigger failover
  async triggerFailover(failedServices) {
    try {
      console.log('🚨 Triggering failover...');
      
      // Switch to backup IPs
      await this.switchToBackupIPs(failedServices);
      
      // Send alert
      await this.sendNotification(`🚨 Failover triggered for: ${failedServices.map(([type]) => type).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Error during failover:', error);
    }
  }

  // Switch to backup IPs
  async switchToBackupIPs(failedServices) {
    try {
      console.log('🔄 Switching to backup IPs...');
      
      // Get backup IPs
      const backupIPs = await this.getBackupIPs();
      
      // Update configuration
      for (const [type, ip] of backupIPs) {
        this.currentIPs.set(type, ip);
      }
      
      // Update DNS and load balancer
      await this.updateDNSRecords(backupIPs);
      await this.updateLoadBalancer(backupIPs);
      
      console.log('✅ Switched to backup IPs');
      
    } catch (error) {
      console.error('❌ Error switching to backup IPs:', error);
    }
  }

  // Get backup IPs
  async getBackupIPs() {
    // This would get backup IPs from configuration
    return new Map([
      ['cloudflare', '1.1.1.1'],
      ['nginx', '192.168.1.1'],
      ['application', '10.0.0.1']
    ]);
  }

  // Send notification
  async sendNotification(message) {
    try {
      if (this.config.monitoring.telegramBotToken && this.config.monitoring.telegramChatId) {
        await this.sendTelegramNotification(message);
      }
      
      if (this.config.monitoring.webhookUrl) {
        await this.sendWebhookNotification(message);
      }
      
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  // Send Telegram notification
  async sendTelegramNotification(message) {
    try {
      const url = `https://api.telegram.org/bot${this.config.monitoring.telegramBotToken}/sendMessage`;
      const data = {
        chat_id: this.config.monitoring.telegramChatId,
        text: message,
        parse_mode: 'HTML'
      };
      
      await this.makeRequest(url, 'POST', data);
      console.log('✅ Telegram notification sent');
      
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
    }
  }

  // Send webhook notification
  async sendWebhookNotification(message) {
    try {
      const data = {
        message,
        timestamp: new Date().toISOString(),
        service: 'ip-rotation'
      };
      
      await this.makeRequest(this.config.monitoring.webhookUrl, 'POST', data);
      console.log('✅ Webhook notification sent');
      
    } catch (error) {
      console.error('❌ Error sending webhook notification:', error);
    }
  }

  // Make HTTP request
  async makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (error) {
            resolve(body);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  // Helper methods (implementations would go here)
  async getCloudflareIP() { return '1.1.1.1'; }
  async getNginxIP() { return '192.168.1.1'; }
  async getApplicationIP() { return '10.0.0.1'; }
  async getCloudflareIPs() { return ['1.1.1.1', '1.0.0.1']; }
  async getNginxIPs() { return ['192.168.1.1', '192.168.1.2']; }
  async getApplicationIPs() { return ['10.0.0.1', '10.0.0.2']; }
  async updateCloudflareRecord(ip) { console.log(`Updating Cloudflare record to ${ip}`); }
  async updateNginxConfig(newIPs) { console.log('Updating Nginx config'); }
  async reloadNginx() { await execAsync('sudo nginx -s reload'); }
  async verifyIP(type, ip) { return true; }
}

// Main execution
async function main() {
  const rotationManager = new IPRotationManager();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    await rotationManager.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    await rotationManager.stop();
    process.exit(0);
  });
  
  try {
    await rotationManager.start();
  } catch (error) {
    console.error('❌ Failed to start IP rotation manager:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main().catch(console.error);
}

module.exports = IPRotationManager;
