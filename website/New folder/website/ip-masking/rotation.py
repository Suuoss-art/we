#!/usr/bin/env python3
# ip-masking/rotation.py

import os
import sys
import json
import time
import random
import logging
import requests
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import secrets

class IPRotationSystem:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.cloudflare_token = config.get('cloudflare_token', '')
        self.cloudflare_zone_id = config.get('cloudflare_zone_id', '')
        self.encryption_key = config.get('encryption_key', '')
        self.telegram_bot_token = config.get('telegram_bot_token', '')
        self.telegram_chat_id = config.get('telegram_chat_id', '')
        self.logger = self.setup_logger()
        self.cipher = self.create_cipher()
        self.proxy_pools = self.setup_proxy_pools()
        self.rotation_schedule = self.setup_rotation_schedule()
        
    def setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('ip_rotation')
        logger.setLevel(logging.INFO)
        
        # Create logs directory if it doesn't exist
        os.makedirs('/app/logs', exist_ok=True)
        
        handler = logging.FileHandler('/app/logs/ip_rotation.log')
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
        
    def create_cipher(self) -> Fernet:
        """Create encryption cipher"""
        try:
            # Derive key from encryption key
            salt = b'kopma_ip_rotation_salt_2024'
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(self.encryption_key.encode()))
            return Fernet(key)
        except Exception as e:
            self.logger.error(f"Error creating cipher: {e}")
            return None
            
    def setup_proxy_pools(self) -> Dict[str, List[str]]:
        """Setup proxy pools for IP rotation"""
        return {
            'cloudflare': [
                '1.1.1.1',
                '1.0.0.1',
                '8.8.8.8',
                '8.8.4.4',
                '9.9.9.9',
                '9.9.9.10',
                '208.67.222.222',
                '208.67.220.220'
            ],
            'nginx': [
                '192.168.1.1',
                '192.168.1.2',
                '192.168.1.3',
                '192.168.1.4',
                '192.168.1.5'
            ],
            'application': [
                '10.0.0.1',
                '10.0.0.2',
                '10.0.0.3',
                '10.0.0.4',
                '10.0.0.5'
            ],
            'external': [
                '203.0.113.1',
                '203.0.113.2',
                '203.0.113.3',
                '203.0.113.4',
                '203.0.113.5'
            ]
        }
        
    def setup_rotation_schedule(self) -> Dict[str, Any]:
        """Setup rotation schedule"""
        return {
            'interval': 3600,  # 1 hour
            'random_delay': 300,  # 5 minutes
            'max_rotations_per_day': 24,
            'rotation_times': [
                '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
                '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
                '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
                '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
            ]
        }
        
    def get_current_ips(self) -> Dict[str, str]:
        """Get current IP addresses"""
        current_ips = {}
        
        try:
            # Get Cloudflare IP
            response = requests.get('https://api.cloudflare.com/client/v4/user/tokens/verify', 
                                  headers={'Authorization': f'Bearer {self.cloudflare_token}'}, 
                                  timeout=10)
            if response.status_code == 200:
                current_ips['cloudflare'] = self.get_public_ip()
            else:
                current_ips['cloudflare'] = 'unknown'
                
            # Get Nginx IP
            current_ips['nginx'] = self.get_nginx_ip()
            
            # Get Application IP
            current_ips['application'] = self.get_application_ip()
            
            # Get External IP
            current_ips['external'] = self.get_public_ip()
            
        except Exception as e:
            self.logger.error(f"Error getting current IPs: {e}")
            
        return current_ips
        
    def get_public_ip(self) -> str:
        """Get public IP address"""
        try:
            response = requests.get('https://api.ipify.org', timeout=10)
            if response.status_code == 200:
                return response.text.strip()
        except Exception as e:
            self.logger.error(f"Error getting public IP: {e}")
            
        return 'unknown'
        
    def get_nginx_ip(self) -> str:
        """Get Nginx IP address"""
        try:
            # This would be the actual Nginx IP
            return '192.168.1.1'
        except Exception as e:
            self.logger.error(f"Error getting Nginx IP: {e}")
            return 'unknown'
            
    def get_application_ip(self) -> str:
        """Get Application IP address"""
        try:
            # This would be the actual application IP
            return '10.0.0.1'
        except Exception as e:
            self.logger.error(f"Error getting application IP: {e}")
            return 'unknown'
            
    def select_new_ips(self) -> Dict[str, str]:
        """Select new IP addresses for rotation"""
        new_ips = {}
        
        try:
            # Select new Cloudflare IP
            new_ips['cloudflare'] = random.choice(self.proxy_pools['cloudflare'])
            
            # Select new Nginx IP
            new_ips['nginx'] = random.choice(self.proxy_pools['nginx'])
            
            # Select new Application IP
            new_ips['application'] = random.choice(self.proxy_pools['application'])
            
            # Select new External IP
            new_ips['external'] = random.choice(self.proxy_pools['external'])
            
        except Exception as e:
            self.logger.error(f"Error selecting new IPs: {e}")
            
        return new_ips
        
    def update_cloudflare_dns(self, new_ips: Dict[str, str]) -> bool:
        """Update Cloudflare DNS records"""
        try:
            if not self.cloudflare_token or not self.cloudflare_zone_id:
                self.logger.warning("Cloudflare credentials not configured")
                return False
                
            # Update A records
            for record_type, ip in new_ips.items():
                if record_type == 'cloudflare':
                    continue
                    
                # Get DNS records
                url = f"https://api.cloudflare.com/client/v4/zones/{self.cloudflare_zone_id}/dns_records"
                headers = {
                    'Authorization': f'Bearer {self.cloudflare_token}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    records = response.json()['result']
                    
                    # Update records
                    for record in records:
                        if record['type'] == 'A':
                            update_url = f"https://api.cloudflare.com/client/v4/zones/{self.cloudflare_zone_id}/dns_records/{record['id']}"
                            update_data = {
                                'type': 'A',
                                'name': record['name'],
                                'content': ip,
                                'ttl': 300
                            }
                            
                            update_response = requests.put(update_url, headers=headers, json=update_data, timeout=10)
                            if update_response.status_code == 200:
                                self.logger.info(f"Updated DNS record {record['name']} to {ip}")
                            else:
                                self.logger.error(f"Failed to update DNS record {record['name']}")
                                
        except Exception as e:
            self.logger.error(f"Error updating Cloudflare DNS: {e}")
            return False
            
        return True
        
    def update_nginx_config(self, new_ips: Dict[str, str]) -> bool:
        """Update Nginx configuration"""
        try:
            # This would update the actual Nginx configuration
            # For now, we'll just log the changes
            self.logger.info(f"Updating Nginx configuration with new IPs: {new_ips}")
            
            # In a real implementation, you would:
            # 1. Update nginx.conf with new upstream servers
            # 2. Reload Nginx configuration
            # 3. Verify the changes
            
        except Exception as e:
            self.logger.error(f"Error updating Nginx configuration: {e}")
            return False
            
        return True
        
    def update_application_config(self, new_ips: Dict[str, str]) -> bool:
        """Update application configuration"""
        try:
            # This would update the actual application configuration
            # For now, we'll just log the changes
            self.logger.info(f"Updating application configuration with new IPs: {new_ips}")
            
            # In a real implementation, you would:
            # 1. Update application config files
            # 2. Restart application services
            # 3. Verify the changes
            
        except Exception as e:
            self.logger.error(f"Error updating application configuration: {e}")
            return False
            
        return True
        
    def verify_rotation(self, new_ips: Dict[str, str]) -> bool:
        """Verify IP rotation was successful"""
        try:
            # Check if new IPs are active
            for ip_type, ip in new_ips.items():
                if ip_type == 'cloudflare':
                    # Check Cloudflare IP
                    response = requests.get(f'https://{ip}', timeout=10)
                    if response.status_code != 200:
                        self.logger.warning(f"Cloudflare IP {ip} not responding")
                        return False
                        
                elif ip_type == 'nginx':
                    # Check Nginx IP
                    response = requests.get(f'http://{ip}', timeout=10)
                    if response.status_code != 200:
                        self.logger.warning(f"Nginx IP {ip} not responding")
                        return False
                        
                elif ip_type == 'application':
                    # Check Application IP
                    response = requests.get(f'http://{ip}', timeout=10)
                    if response.status_code != 200:
                        self.logger.warning(f"Application IP {ip} not responding")
                        return False
                        
        except Exception as e:
            self.logger.error(f"Error verifying rotation: {e}")
            return False
            
        return True
        
    def send_rotation_notification(self, old_ips: Dict[str, str], new_ips: Dict[str, str]) -> bool:
        """Send rotation notification to Telegram"""
        try:
            if not self.telegram_bot_token or not self.telegram_chat_id:
                self.logger.warning("Telegram credentials not configured")
                return False
                
            # Create notification message
            message = f"🔄 IP Rotation Completed\n\n"
            message += f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            message += f"Old IPs:\n"
            for ip_type, ip in old_ips.items():
                message += f"• {ip_type}: {ip}\n"
            message += f"\nNew IPs:\n"
            for ip_type, ip in new_ips.items():
                message += f"• {ip_type}: {ip}\n"
                
            # Encrypt message
            if self.cipher:
                encrypted_message = self.cipher.encrypt(message.encode())
                encrypted_text = base64.urlsafe_b64encode(encrypted_message).decode()
                message = f"🔒 ENCRYPTED ROTATION NOTIFICATION\n\n{encrypted_text}"
                
            # Send to Telegram
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
            data = {
                'chat_id': self.telegram_chat_id,
                'text': message,
                'parse_mode': 'HTML'
            }
            
            response = requests.post(url, data=data, timeout=10)
            return response.status_code == 200
            
        except Exception as e:
            self.logger.error(f"Error sending rotation notification: {e}")
            return False
            
    def rotate_ips(self) -> bool:
        """Perform IP rotation"""
        try:
            self.logger.info("Starting IP rotation...")
            
            # Get current IPs
            old_ips = self.get_current_ips()
            self.logger.info(f"Current IPs: {old_ips}")
            
            # Select new IPs
            new_ips = self.select_new_ips()
            self.logger.info(f"New IPs: {new_ips}")
            
            # Update Cloudflare DNS
            if not self.update_cloudflare_dns(new_ips):
                self.logger.error("Failed to update Cloudflare DNS")
                return False
                
            # Update Nginx configuration
            if not self.update_nginx_config(new_ips):
                self.logger.error("Failed to update Nginx configuration")
                return False
                
            # Update application configuration
            if not self.update_application_config(new_ips):
                self.logger.error("Failed to update application configuration")
                return False
                
            # Wait for changes to propagate
            time.sleep(30)
            
            # Verify rotation
            if not self.verify_rotation(new_ips):
                self.logger.error("IP rotation verification failed")
                return False
                
            # Send notification
            self.send_rotation_notification(old_ips, new_ips)
            
            self.logger.info("IP rotation completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Error during IP rotation: {e}")
            return False
            
    def run_rotation_loop(self):
        """Run continuous IP rotation"""
        self.logger.info("Starting IP rotation loop...")
        
        while True:
            try:
                # Check if it's time for rotation
                current_time = datetime.now()
                rotation_time = current_time.replace(minute=0, second=0, microsecond=0)
                
                # Add random delay
                random_delay = random.randint(0, self.rotation_schedule['random_delay'])
                time.sleep(random_delay)
                
                # Perform rotation
                if self.rotate_ips():
                    self.logger.info("IP rotation completed successfully")
                else:
                    self.logger.error("IP rotation failed")
                    
                # Wait for next rotation
                time.sleep(self.rotation_schedule['interval'])
                
            except KeyboardInterrupt:
                self.logger.info("IP rotation loop stopped by user")
                break
            except Exception as e:
                self.logger.error(f"Error in rotation loop: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
                
    def get_rotation_status(self) -> Dict[str, Any]:
        """Get current rotation status"""
        try:
            current_ips = self.get_current_ips()
            
            status = {
                'timestamp': datetime.now().isoformat(),
                'current_ips': current_ips,
                'rotation_schedule': self.rotation_schedule,
                'proxy_pools': {
                    'cloudflare': len(self.proxy_pools['cloudflare']),
                    'nginx': len(self.proxy_pools['nginx']),
                    'application': len(self.proxy_pools['application']),
                    'external': len(self.proxy_pools['external'])
                },
                'status': 'active'
            }
            
            return status
            
        except Exception as e:
            self.logger.error(f"Error getting rotation status: {e}")
            return {'status': 'error', 'error': str(e)}

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='IP Rotation System for KOPMA UNNES Website')
    parser.add_argument('--config', help='Configuration file path')
    parser.add_argument('--rotate', action='store_true', help='Perform immediate rotation')
    parser.add_argument('--status', action='store_true', help='Get rotation status')
    parser.add_argument('--loop', action='store_true', help='Run continuous rotation loop')
    args = parser.parse_args()
    
    # Configuration
    config = {
        'cloudflare_token': os.getenv('CLOUDFLARE_API_TOKEN', ''),
        'cloudflare_zone_id': os.getenv('CLOUDFLARE_ZONE_ID', ''),
        'encryption_key': os.getenv('ENCRYPTION_KEY', ''),
        'telegram_bot_token': os.getenv('TELEGRAM_BOT_TOKEN', ''),
        'telegram_chat_id': os.getenv('TELEGRAM_CHAT_ID', '')
    }
    
    # Create rotation system
    rotation_system = IPRotationSystem(config)
    
    if args.rotate:
        # Perform immediate rotation
        success = rotation_system.rotate_ips()
        if success:
            print("✅ IP rotation completed successfully")
        else:
            print("❌ IP rotation failed")
    elif args.status:
        # Get rotation status
        status = rotation_system.get_rotation_status()
        print(json.dumps(status, indent=2))
    elif args.loop:
        # Run continuous rotation loop
        rotation_system.run_rotation_loop()
    else:
        print("🔄 IP Rotation System")
        print("Use --rotate to perform immediate rotation")
        print("Use --status to get rotation status")
        print("Use --loop to run continuous rotation loop")




