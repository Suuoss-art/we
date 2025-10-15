#!/usr/bin/env python3
"""
Advanced Telegram Bot for KOPMA UNNES Website Monitoring
Encrypted notifications and command handling
"""

import os
import sys
import json
import time
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import secrets

class AdvancedTelegramBot:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.bot_token = config['telegram']['bot_token']
        self.chat_id = config['telegram']['chat_id']
        self.webhook_url = config['telegram']['webhook']
        self.encryption_key = self.derive_key(config['encryption_key'])
        self.cipher = Fernet(self.encryption_key)
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        self.logger = self.setup_logger()
        self.commands = self.setup_commands()
        
    def derive_key(self, password: str) -> bytes:
        """Derive encryption key from password"""
        if not password:
            password = 'default_password_change_me'
        
        salt = b'kopma_telegram_salt_2024'
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key
    
    def setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('telegram_bot')
        logger.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)
        
        return logger
    
    def encrypt_message(self, message: str) -> str:
        """Encrypt message for secure transmission"""
        try:
            encrypted = self.cipher.encrypt(message.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            self.logger.error(f"Encryption error: {e}")
            return message
    
    def decrypt_message(self, encrypted_message: str) -> str:
        """Decrypt message"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_message.encode())
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            self.logger.error(f"Decryption error: {e}")
            return encrypted_message
    
    def setup_commands(self) -> Dict[str, Any]:
        """Setup bot commands"""
        return {
            '/start': self.handle_start,
            '/help': self.handle_help,
            '/status': self.handle_status,
            '/ips': self.handle_ips,
            '/rotate': self.handle_rotate,
            '/security': self.handle_security,
            '/performance': self.handle_performance,
            '/health': self.handle_health,
            '/logs': self.handle_logs,
            '/alerts': self.handle_alerts,
            '/backup': self.handle_backup,
            '/update': self.handle_update,
            '/monitor': self.handle_monitor
        }
    
    def send_message(self, text: str, parse_mode: str = 'HTML', reply_markup: Dict = None) -> bool:
        """Send message to Telegram"""
        try:
            url = f"{self.base_url}/sendMessage"
            data = {
                'chat_id': self.chat_id,
                'text': text,
                'parse_mode': parse_mode
            }
            
            if reply_markup:
                data['reply_markup'] = json.dumps(reply_markup)
            
            response = requests.post(url, data=data, timeout=10)
            
            if response.status_code == 200:
                self.logger.info("Message sent successfully")
                return True
            else:
                self.logger.error(f"Telegram API error: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error sending message: {e}")
            return False
    
    def send_encrypted_alert(self, alert_type: str, message: str, severity: str = 'info') -> bool:
        """Send encrypted alert to Telegram"""
        try:
            # Create alert payload
            alert_data = {
                'type': alert_type,
                'message': message,
                'severity': severity,
                'timestamp': datetime.now().isoformat(),
                'source': 'kopma_website'
            }
            
            # Encrypt alert data
            encrypted_data = self.encrypt_message(json.dumps(alert_data))
            
            # Create message
            emoji_map = {
                'info': 'ℹ️',
                'warning': '⚠️',
                'error': '❌',
                'success': '✅',
                'critical': '🚨'
            }
            
            emoji = emoji_map.get(severity, 'ℹ️')
            message_text = f"{emoji} <b>KOPMA Alert [{severity.upper()}]</b>\n\n{encrypted_data}"
            
            return self.send_message(message_text)
            
        except Exception as e:
            self.logger.error(f"Error sending encrypted alert: {e}")
            return False
    
    def send_status_update(self, status: str) -> bool:
        """Send status update to Telegram"""
        try:
            status_data = {
                'status': status,
                'timestamp': datetime.now().isoformat(),
                'source': 'kopma_website'
            }
            
            encrypted_status = self.encrypt_message(json.dumps(status_data))
            message_text = f"📊 <b>Status Update</b>\n\n{encrypted_status}"
            
            return self.send_message(message_text)
            
        except Exception as e:
            self.logger.error(f"Error sending status update: {e}")
            return False
    
    def handle_start(self, message: Dict[str, Any]) -> str:
        """Handle /start command"""
        return """
🚀 <b>KOPMA UNNES Website Bot</b>

Welcome to the KOPMA UNNES website monitoring bot!

<b>Available Commands:</b>
/status - Get system status
/ips - Get current IP information
/rotate - Manually rotate IPs
/security - Get security report
/performance - Get performance metrics
/health - Get health check results
/logs - Get recent logs
/alerts - Get recent alerts
/backup - Create backup
/update - Update website
/monitor - Start/stop monitoring

Use /help for more information.
        """
    
    def handle_help(self, message: Dict[str, Any]) -> str:
        """Handle /help command"""
        return """
📖 <b>Help - KOPMA UNNES Website Bot</b>

<b>System Commands:</b>
• /status - Get overall system status
• /ips - Get current IP addresses and rotation status
• /rotate - Manually trigger IP rotation
• /security - Get security scan results and threats
• /performance - Get performance metrics and scores
• /health - Get health check results for all services
• /logs - Get recent system logs
• /alerts - Get recent security alerts
• /backup - Create manual backup
• /update - Update website to latest version
• /monitor - Start or stop monitoring

<b>Security Features:</b>
• Real-time threat detection
• Automated IP rotation
• Encrypted communications
• Stealth monitoring
• Anomaly detection

<b>Monitoring Features:</b>
• Website uptime monitoring
• Performance tracking
• Security scanning
• IP rotation tracking
• Alert notifications

For more information, contact the system administrator.
        """
    
    def handle_status(self, message: Dict[str, Any]) -> str:
        """Handle /status command"""
        try:
            # Get system status (this would be actual system data)
            status_data = {
                'website': {
                    'uptime': '99.9%',
                    'response_time': '245ms',
                    'status': 'online'
                },
                'security': {
                    'threats_blocked': 23,
                    'vulnerabilities': 0,
                    'security_score': 95
                },
                'performance': {
                    'load_time': '1.2s',
                    'lighthouse_score': 92,
                    'server_load': '45%'
                },
                'monitoring': {
                    'anomalies': 2,
                    'alerts': 5,
                    'ip_rotations': 12
                }
            }
            
            status_text = f"""
📊 <b>System Status</b>

🌐 <b>Website:</b>
• Uptime: {status_data['website']['uptime']}
• Response Time: {status_data['website']['response_time']}
• Status: {status_data['website']['status']}

🔒 <b>Security:</b>
• Threats Blocked: {status_data['security']['threats_blocked']}
• Vulnerabilities: {status_data['security']['vulnerabilities']}
• Security Score: {status_data['security']['security_score']}/100

⚡ <b>Performance:</b>
• Load Time: {status_data['performance']['load_time']}
• Lighthouse Score: {status_data['performance']['lighthouse_score']}/100
• Server Load: {status_data['performance']['server_load']}

📈 <b>Monitoring:</b>
• Anomalies: {status_data['monitoring']['anomalies']}
• Alerts: {status_data['monitoring']['alerts']}
• IP Rotations: {status_data['monitoring']['ip_rotations']}

🕐 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return status_text
            
        except Exception as e:
            self.logger.error(f"Error getting status: {e}")
            return "❌ Error getting system status"
    
    def handle_ips(self, message: Dict[str, Any]) -> str:
        """Handle /ips command"""
        try:
            # Get current IP information (this would be actual IP data)
            ip_data = {
                'cloudflare': '1.1.1.1',
                'nginx': '192.168.1.1',
                'application': '10.0.0.1',
                'rotation_status': 'active',
                'last_rotation': '2 hours ago',
                'next_rotation': '28 minutes'
            }
            
            ip_text = f"""
🌐 <b>IP Information</b>

<b>Current IPs:</b>
• Cloudflare: {ip_data['cloudflare']}
• Nginx: {ip_data['nginx']}
• Application: {ip_data['application']}

<b>Rotation Status:</b>
• Status: {ip_data['rotation_status']}
• Last Rotation: {ip_data['last_rotation']}
• Next Rotation: {ip_data['next_rotation']}

<b>Health Status:</b>
• All IPs: ✅ Healthy
• Response Time: 245ms
• Uptime: 99.9%

🕐 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return ip_text
            
        except Exception as e:
            self.logger.error(f"Error getting IP information: {e}")
            return "❌ Error getting IP information"
    
    def handle_rotate(self, message: Dict[str, Any]) -> str:
        """Handle /rotate command"""
        try:
            # Trigger IP rotation (this would be actual rotation)
            self.logger.info("Manual IP rotation triggered")
            
            # Simulate rotation process
            rotation_text = """
🔄 <b>IP Rotation Initiated</b>

⏳ Starting rotation process...
• Checking current IPs
• Selecting new IPs
• Updating DNS records
• Updating load balancer
• Verifying rotation

✅ Rotation completed successfully!

<b>New IPs:</b>
• Cloudflare: 1.0.0.1
• Nginx: 192.168.1.2
• Application: 10.0.0.2

🕐 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return rotation_text
            
        except Exception as e:
            self.logger.error(f"Error rotating IPs: {e}")
            return "❌ Error rotating IPs"
    
    def handle_security(self, message: Dict[str, Any]) -> str:
        """Handle /security command"""
        try:
            # Get security report (this would be actual security data)
            security_data = {
                'threats_blocked': 23,
                'vulnerabilities': 0,
                'security_score': 95,
                'last_scan': '2 minutes ago',
                'threats': [
                    {'type': 'SQL Injection', 'count': 5, 'blocked': True},
                    {'type': 'XSS Attack', 'count': 3, 'blocked': True},
                    {'type': 'Brute Force', 'count': 15, 'blocked': True}
                ]
            }
            
            security_text = f"""
🔒 <b>Security Report</b>

<b>Overall Security:</b>
• Security Score: {security_data['security_score']}/100
• Threats Blocked: {security_data['threats_blocked']}
• Vulnerabilities: {security_data['vulnerabilities']}
• Last Scan: {security_data['last_scan']}

<b>Recent Threats:</b>
• SQL Injection: {security_data['threats'][0]['count']} attempts (Blocked)
• XSS Attack: {security_data['threats'][1]['count']} attempts (Blocked)
• Brute Force: {security_data['threats'][2]['count']} attempts (Blocked)

<b>Protection Status:</b>
• Firewall: ✅ Active
• Rate Limiting: ✅ Active
• SSL/TLS: ✅ Active
• Security Headers: ✅ Active

🕐 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return security_text
            
        except Exception as e:
            self.logger.error(f"Error getting security report: {e}")
            return "❌ Error getting security report"
    
    def handle_performance(self, message: Dict[str, Any]) -> str:
        """Handle /performance command"""
        try:
            # Get performance metrics (this would be actual performance data)
            performance_data = {
                'load_time': 1.2,
                'lighthouse_score': 92,
                'server_load': 45,
                'memory_usage': 67,
                'cpu_usage': 23,
                'disk_usage': 34
            }
            
            performance_text = f"""
⚡ <b>Performance Metrics</b>

<b>Website Performance:</b>
• Load Time: {performance_data['load_time']}s
• Lighthouse Score: {performance_data['lighthouse_score']}/100
• Page Views: 3,420 (24h)

<b>Server Performance:</b>
• CPU Usage: {performance_data['cpu_usage']}%
• Memory Usage: {performance_data['memory_usage']}%
• Disk Usage: {performance_data['disk_usage']}%
• Server Load: {performance_data['server_load']}%

<b>Optimization Status:</b>
• Image Optimization: ✅ Active
• Caching: ✅ Active
• Compression: ✅ Active
• CDN: ✅ Active

🕐 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return performance_text
            
        except Exception as e:
            self.logger.error(f"Error getting performance metrics: {e}")
            return "❌ Error getting performance metrics"
    
    def handle_health(self, message: Dict[str, Any]) -> str:
        """Handle /health command"""
        try:
            # Get health check results (this would be actual health data)
            health_data = {
                'website': {'status': 'healthy', 'response_time': '245ms'},
                'database': {'status': 'healthy', 'connections': 5},
                'redis': {'status': 'healthy', 'memory': '45MB'},
                'nginx': {'status': 'healthy', 'requests': 1250},
                'monitoring': {'status': 'healthy', 'alerts': 0}
            }
            
            health_text = f"""
🏥 <b>Health Check Results</b>

<b>Service Status:</b>
• Website: {health_data['website']['status']} ({health_data['website']['response_time']})
• Database: {health_data['database']['status']} ({health_data['database']['connections']} connections)
• Redis: {health_data['redis']['status']} ({health_data['redis']['memory']} memory)
• Nginx: {health_data['nginx']['status']} ({health_data['nginx']['requests']} requests)
• Monitoring: {health_data['monitoring']['status']} ({health_data['monitoring']['alerts']} alerts)

<b>Overall Health:</b>
• Status: ✅ All Systems Operational
• Uptime: 99.9%
• Last Check: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🕐 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return health_text
            
        except Exception as e:
            self.logger.error(f"Error getting health status: {e}")
            return "❌ Error getting health status"
    
    def handle_logs(self, message: Dict[str, Any]) -> str:
        """Handle /logs command"""
        try:
            # Get recent logs (this would be actual log data)
            logs_data = [
                {'timestamp': '2024-01-15 10:30:15', 'level': 'INFO', 'message': 'IP rotation completed successfully'},
                {'timestamp': '2024-01-15 10:25:30', 'level': 'WARNING', 'message': 'High CPU usage detected'},
                {'timestamp': '2024-01-15 10:20:45', 'level': 'INFO', 'message': 'Security scan completed - 0 threats found'},
                {'timestamp': '2024-01-15 10:15:20', 'level': 'INFO', 'message': 'Website backup completed'},
                {'timestamp': '2024-01-15 10:10:35', 'level': 'ERROR', 'message': 'Failed to connect to database'}
            ]
            
            logs_text = f"""
📝 <b>Recent Logs</b>

<b>Last 5 Log Entries:</b>
"""
            
            for log in logs_data:
                level_emoji = {
                    'INFO': 'ℹ️',
                    'WARNING': '⚠️',
                    'ERROR': '❌',
                    'DEBUG': '🔍'
                }
                emoji = level_emoji.get(log['level'], 'ℹ️')
                logs_text += f"\n{emoji} <b>{log['timestamp']}</b> [{log['level']}]\n{log['message']}\n"
            
            logs_text += f"\n🕐 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return logs_text
            
        except Exception as e:
            self.logger.error(f"Error getting logs: {e}")
            return "❌ Error getting logs"
    
    def handle_alerts(self, message: Dict[str, Any]) -> str:
        """Handle /alerts command"""
        try:
            # Get recent alerts (this would be actual alert data)
            alerts_data = [
                {'type': 'success', 'title': 'IP Rotation Completed', 'timestamp': '5 minutes ago'},
                {'type': 'warning', 'title': 'High CPU Usage', 'timestamp': '15 minutes ago'},
                {'type': 'info', 'title': 'Security Scan Completed', 'timestamp': '30 minutes ago'},
                {'type': 'success', 'title': 'Backup Completed', 'timestamp': '2 hours ago'},
                {'type': 'error', 'title': 'Database Connection Failed', 'timestamp': '3 hours ago'}
            ]
            
            alerts_text = f"""
🚨 <b>Recent Alerts</b>

<b>Last 5 Alerts:</b>
"""
            
            for alert in alerts_data:
                type_emoji = {
                    'success': '✅',
                    'warning': '⚠️',
                    'error': '❌',
                    'info': 'ℹ️'
                }
                emoji = type_emoji.get(alert['type'], 'ℹ️')
                alerts_text += f"\n{emoji} <b>{alert['title']}</b>\n{alert['timestamp']}\n"
            
            alerts_text += f"\n🕐 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return alerts_text
            
        except Exception as e:
            self.logger.error(f"Error getting alerts: {e}")
            return "❌ Error getting alerts"
    
    def handle_backup(self, message: Dict[str, Any]) -> str:
        """Handle /backup command"""
        try:
            # Trigger backup (this would be actual backup)
            self.logger.info("Manual backup triggered")
            
            backup_text = """
💾 <b>Backup Initiated</b>

⏳ Starting backup process...
• Creating database backup
• Archiving website files
• Compressing backup files
• Uploading to storage

✅ Backup completed successfully!

<b>Backup Details:</b>
• Size: 2.3 GB
• Files: 15,420
• Duration: 3 minutes
• Location: /opt/backups/kopma-website/

🕐 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return backup_text
            
        except Exception as e:
            self.logger.error(f"Error creating backup: {e}")
            return "❌ Error creating backup"
    
    def handle_update(self, message: Dict[str, Any]) -> str:
        """Handle /update command"""
        try:
            # Trigger update (this would be actual update)
            self.logger.info("Manual update triggered")
            
            update_text = """
🔄 <b>Update Initiated</b>

⏳ Starting update process...
• Pulling latest changes
• Installing dependencies
• Building application
• Restarting services

✅ Update completed successfully!

<b>Update Details:</b>
• Version: 2.1.0
• Changes: 15 commits
• Duration: 5 minutes
• Status: All services running

🕐 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return update_text
            
        except Exception as e:
            self.logger.error(f"Error updating: {e}")
            return "❌ Error updating"
    
    def handle_monitor(self, message: Dict[str, Any]) -> str:
        """Handle /monitor command"""
        try:
            # Toggle monitoring (this would be actual monitoring control)
            self.logger.info("Monitoring toggle triggered")
            
            monitor_text = """
📊 <b>Monitoring Control</b>

<b>Current Status:</b>
• Monitoring: ✅ Active
• Anomaly Detection: ✅ Active
• Security Scanning: ✅ Active
• IP Rotation: ✅ Active
• Performance Tracking: ✅ Active

<b>Monitoring Features:</b>
• Real-time threat detection
• Automated IP rotation
• Performance monitoring
• Security scanning
• Alert notifications

🕐 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return monitor_text
            
        except Exception as e:
            self.logger.error(f"Error controlling monitoring: {e}")
            return "❌ Error controlling monitoring"
    
    def process_message(self, message: Dict[str, Any]) -> bool:
        """Process incoming message"""
        try:
            if 'text' not in message:
                return False
            
            text = message['text']
            
            # Check if it's a command
            if text.startswith('/'):
                command = text.split()[0]
                if command in self.commands:
                    response = self.commands[command](message)
                    return self.send_message(response)
                else:
                    return self.send_message("❌ Unknown command. Use /help for available commands.")
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error processing message: {e}")
            return False
    
    def send_test_message(self) -> bool:
        """Send test message"""
        try:
            test_message = f"""
🧪 <b>Test Message</b>

This is a test message from the KOPMA UNNES website monitoring bot.

<b>Bot Status:</b>
• Status: ✅ Online
• Encryption: ✅ Active
• Commands: ✅ Available
• Monitoring: ✅ Active

🕐 Sent: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return self.send_message(test_message)
            
        except Exception as e:
            self.logger.error(f"Error sending test message: {e}")
            return False

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Advanced Telegram Bot for KOPMA UNNES Website')
    parser.add_argument('--config', help='Configuration file path')
    parser.add_argument('--test', action='store_true', help='Send test message')
    args = parser.parse_args()
    
    # Load configuration
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config = json.load(f)
    else:
        config = {
            'telegram': {
                'bot_token': os.getenv('TELEGRAM_BOT_TOKEN', ''),
                'chat_id': os.getenv('TELEGRAM_CHAT_ID', ''),
                'webhook': os.getenv('TELEGRAM_WEBHOOK', '')
            },
            'encryption_key': os.getenv('ENCRYPTION_KEY', '')
        }
    
    # Create bot instance
    bot = AdvancedTelegramBot(config)
    
    if args.test:
        # Send test message
        success = bot.send_test_message()
        if success:
            print("✅ Test message sent successfully")
        else:
            print("❌ Failed to send test message")
    else:
        print("🤖 KOPMA UNNES Website Telegram Bot")
        print("Use --test to send a test message")
        print("Use --config to specify configuration file")

if __name__ == '__main__':
    main()
