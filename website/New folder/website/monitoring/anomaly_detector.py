#!/usr/bin/env python3
# monitoring/anomaly_detector.py

import os
import json
import hashlib
import time
import requests
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from pathlib import Path

class AnomalyDetector:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.encryption_key = config.get('encryption_key', '')
        self.telegram_bot_token = config.get('telegram_bot_token', '')
        self.telegram_chat_id = config.get('telegram_chat_id', '')
        self.website_path = config.get('website_path', '/usr/share/nginx/html')
        self.log_file = config.get('log_file', '/var/log/nginx/access.log')
        self.logger = self._setup_logger()
        
    def _setup_logger(self) -> logging.Logger:
        """Setup logger for anomaly detection"""
        logger = logging.getLogger('anomaly_detector')
        logger.setLevel(logging.INFO)
        
        # Create logs directory if it doesn't exist
        log_dir = Path('/app/logs')
        log_dir.mkdir(exist_ok=True)
        
        handler = logging.FileHandler('/app/logs/anomaly_detector.log')
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
        
    def detect_file_changes(self) -> List[Dict[str, Any]]:
        """Detect any file changes in the website"""
        anomalies = []
        
        if not os.path.exists(self.website_path):
            self.logger.warning(f"Website path {self.website_path} does not exist")
            return anomalies
            
        try:
            for root, dirs, files in os.walk(self.website_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        # Check file modification time
                        mtime = os.path.getmtime(file_path)
                        size = os.path.getsize(file_path)
                        
                        # Check for suspicious files
                        if self._is_suspicious_file(file_path):
                            anomalies.append({
                                'type': 'suspicious_file',
                                'file': file_path,
                                'timestamp': datetime.now().isoformat(),
                                'severity': 'high',
                                'size': size
                            })
                            
                        # Check for file size anomalies
                        if size > 10 * 1024 * 1024:  # 10MB
                            anomalies.append({
                                'type': 'large_file',
                                'file': file_path,
                                'size': size,
                                'timestamp': datetime.now().isoformat(),
                                'severity': 'medium'
                            })
                            
                        # Check for recently modified files (last hour)
                        if time.time() - mtime < 3600:
                            anomalies.append({
                                'type': 'recent_file_change',
                                'file': file_path,
                                'modified_time': datetime.fromtimestamp(mtime).isoformat(),
                                'timestamp': datetime.now().isoformat(),
                                'severity': 'low'
                            })
                            
                    except Exception as e:
                        self.logger.error(f"Error checking file {file_path}: {e}")
                        
        except Exception as e:
            self.logger.error(f"Error walking directory {self.website_path}: {e}")
            
        return anomalies
        
    def detect_network_anomalies(self) -> List[Dict[str, Any]]:
        """Detect network anomalies from access logs"""
        anomalies = []
        
        if not os.path.exists(self.log_file):
            self.logger.warning(f"Log file {self.log_file} does not exist")
            return anomalies
            
        try:
            with open(self.log_file, 'r') as f:
                lines = f.readlines()
                recent_lines = lines[-1000:]  # Last 1000 lines
                
            # Analyze IP patterns
            ip_counts = {}
            suspicious_requests = []
            
            for line in recent_lines:
                parts = line.split()
                if len(parts) >= 7:
                    ip = parts[0]
                    method = parts[5].strip('"')
                    uri = parts[6]
                    status = parts[8]
                    user_agent = ' '.join(parts[11:]) if len(parts) > 11 else ''
                    
                    # Count requests per IP
                    ip_counts[ip] = ip_counts.get(ip, 0) + 1
                    
                    # Check for suspicious requests
                    if self._is_suspicious_request(uri, method, status, user_agent):
                        suspicious_requests.append({
                            'ip': ip,
                            'uri': uri,
                            'method': method,
                            'status': status,
                            'user_agent': user_agent,
                            'timestamp': datetime.now().isoformat()
                        })
                        
            # Detect high-frequency IPs
            for ip, count in ip_counts.items():
                if count > 100:  # More than 100 requests
                    anomalies.append({
                        'type': 'high_frequency_ip',
                        'ip': ip,
                        'request_count': count,
                        'timestamp': datetime.now().isoformat(),
                        'severity': 'medium'
                    })
                    
            # Add suspicious requests
            for request in suspicious_requests:
                anomalies.append({
                    'type': 'suspicious_request',
                    'ip': request['ip'],
                    'uri': request['uri'],
                    'method': request['method'],
                    'status': request['status'],
                    'user_agent': request['user_agent'],
                    'timestamp': request['timestamp'],
                    'severity': 'high'
                })
                
        except Exception as e:
            self.logger.error(f"Error analyzing network logs: {e}")
            
        return anomalies
        
    def detect_security_anomalies(self) -> List[Dict[str, Any]]:
        """Detect security-related anomalies"""
        anomalies = []
        
        if not os.path.exists(self.website_path):
            return anomalies
            
        # Malware patterns to detect
        malware_patterns = [
            r'eval\s*\(',
            r'base64_decode\s*\(',
            r'shell_exec\s*\(',
            r'exec\s*\(',
            r'system\s*\(',
            r'passthru\s*\(',
            r'assert\s*\(',
            r'create_function\s*\(',
            r'preg_replace.*\/e',
            r'include\s*\(\s*[\'"]https?:\/\/',
            r'require\s*\(\s*[\'"]https?:\/\/',
            r'fsockopen\s*\(',
            r'popen\s*\(',
            r'proc_open\s*\(',
            r'file_get_contents\s*\(\s*[\'"]https?:\/\/',
            r'curl_exec\s*\('
        ]
        
        try:
            for root, dirs, files in os.walk(self.website_path):
                for file in files:
                    if file.endswith('.php'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                
                            for pattern in malware_patterns:
                                if re.search(pattern, content, re.IGNORECASE):
                                    anomalies.append({
                                        'type': 'malware_detected',
                                        'file': file_path,
                                        'pattern': pattern,
                                        'timestamp': datetime.now().isoformat(),
                                        'severity': 'critical'
                                    })
                                    
                        except Exception as e:
                            self.logger.error(f"Error scanning file {file_path}: {e}")
                            
        except Exception as e:
            self.logger.error(f"Error scanning for security anomalies: {e}")
            
        return anomalies
        
    def detect_performance_anomalies(self) -> List[Dict[str, Any]]:
        """Detect performance-related anomalies"""
        anomalies = []
        
        try:
            # Check disk space
            disk_usage = os.statvfs('/')
            free_space = disk_usage.f_frsize * disk_usage.f_bavail
            total_space = disk_usage.f_frsize * disk_usage.f_blocks
            used_percent = ((total_space - free_space) / total_space) * 100
            
            if used_percent > 90:
                anomalies.append({
                    'type': 'disk_space_critical',
                    'used_percent': round(used_percent, 2),
                    'free_space': free_space,
                    'total_space': total_space,
                    'timestamp': datetime.now().isoformat(),
                    'severity': 'critical'
                })
            elif used_percent > 80:
                anomalies.append({
                    'type': 'disk_space_warning',
                    'used_percent': round(used_percent, 2),
                    'free_space': free_space,
                    'total_space': total_space,
                    'timestamp': datetime.now().isoformat(),
                    'severity': 'medium'
                })
                
            # Check memory usage
            try:
                with open('/proc/meminfo', 'r') as f:
                    meminfo = f.read()
                    
                mem_total = int(re.search(r'MemTotal:\s+(\d+)', meminfo).group(1))
                mem_available = int(re.search(r'MemAvailable:\s+(\d+)', meminfo).group(1))
                mem_used_percent = ((mem_total - mem_available) / mem_total) * 100
                
                if mem_used_percent > 90:
                    anomalies.append({
                        'type': 'memory_usage_critical',
                        'used_percent': round(mem_used_percent, 2),
                        'total_memory': mem_total,
                        'available_memory': mem_available,
                        'timestamp': datetime.now().isoformat(),
                        'severity': 'critical'
                    })
                elif mem_used_percent > 80:
                    anomalies.append({
                        'type': 'memory_usage_warning',
                        'used_percent': round(mem_used_percent, 2),
                        'total_memory': mem_total,
                        'available_memory': mem_available,
                        'timestamp': datetime.now().isoformat(),
                        'severity': 'medium'
                    })
                    
            except Exception as e:
                self.logger.error(f"Error checking memory usage: {e}")
                
            # Check CPU load
            try:
                with open('/proc/loadavg', 'r') as f:
                    load_avg = f.read().split()
                    
                load_1min = float(load_avg[0])
                load_5min = float(load_avg[1])
                load_15min = float(load_avg[2])
                
                if load_1min > 2.0:
                    anomalies.append({
                        'type': 'high_cpu_load',
                        'load_1min': load_1min,
                        'load_5min': load_5min,
                        'load_15min': load_15min,
                        'timestamp': datetime.now().isoformat(),
                        'severity': 'medium'
                    })
                    
            except Exception as e:
                self.logger.error(f"Error checking CPU load: {e}")
                
        except Exception as e:
            self.logger.error(f"Error detecting performance anomalies: {e}")
            
        return anomalies
        
    def _is_suspicious_file(self, file_path: str) -> bool:
        """Check if file is suspicious"""
        suspicious_extensions = ['.php.suspected', '.bak', '.old', '.backup']
        suspicious_names = ['wp-', 'eval', 'shell', 'backdoor', 'hack', 'exploit']
        
        filename = os.path.basename(file_path)
        
        # Check extensions
        for ext in suspicious_extensions:
            if filename.endswith(ext):
                return True
                
        # Check names
        for name in suspicious_names:
            if name in filename.lower():
                return True
                
        return False
        
    def _is_suspicious_request(self, uri: str, method: str, status: str, user_agent: str) -> bool:
        """Check if request is suspicious"""
        suspicious_patterns = [
            r'/wp-admin/',
            r'/wp-login/',
            r'/xmlrpc/',
            r'/admin/',
            r'/administrator/',
            r'/phpmyadmin/',
            r'/cpanel/',
            r'/\.env',
            r'/config/',
            r'/backup/',
            r'/\.git/',
            r'/\.svn/',
            r'/\.htaccess',
            r'/\.htpasswd',
            r'/\.DS_Store',
            r'/Thumbs\.db'
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, uri, re.IGNORECASE):
                return True
                
        # Check for suspicious status codes
        if status in ['403', '404', '500', '502', '503']:
            return True
            
        # Check for suspicious user agents
        suspicious_user_agents = [
            'sqlmap',
            'nikto',
            'nmap',
            'masscan',
            'zap',
            'burp',
            'w3af',
            'acunetix',
            'nessus',
            'openvas'
        ]
        
        for agent in suspicious_user_agents:
            if agent.lower() in user_agent.lower():
                return True
                
        return False
        
    def run_detection(self) -> List[Dict[str, Any]]:
        """Run all anomaly detection"""
        all_anomalies = []
        
        self.logger.info("Starting anomaly detection...")
        
        # File changes
        file_anomalies = self.detect_file_changes()
        all_anomalies.extend(file_anomalies)
        self.logger.info(f"Detected {len(file_anomalies)} file anomalies")
        
        # Network anomalies
        network_anomalies = self.detect_network_anomalies()
        all_anomalies.extend(network_anomalies)
        self.logger.info(f"Detected {len(network_anomalies)} network anomalies")
        
        # Security anomalies
        security_anomalies = self.detect_security_anomalies()
        all_anomalies.extend(security_anomalies)
        self.logger.info(f"Detected {len(security_anomalies)} security anomalies")
        
        # Performance anomalies
        performance_anomalies = self.detect_performance_anomalies()
        all_anomalies.extend(performance_anomalies)
        self.logger.info(f"Detected {len(performance_anomalies)} performance anomalies")
        
        self.logger.info(f"Total anomalies detected: {len(all_anomalies)}")
        
        return all_anomalies
        
    def send_telegram_alert(self, anomalies: List[Dict[str, Any]]) -> bool:
        """Send encrypted anomaly alerts to Telegram"""
        if not self.telegram_bot_token or not self.telegram_chat_id:
            self.logger.warning("Telegram credentials not configured")
            return False
            
        try:
            # Create alert message
            alert_message = self._create_alert_message(anomalies)
            
            # Encrypt message
            encrypted_message = self._encrypt_message(alert_message)
            
            # Send to Telegram
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
            data = {
                'chat_id': self.telegram_chat_id,
                'text': f"🔒 ENCRYPTED ALERT\n{encrypted_message}",
                'parse_mode': 'HTML'
            }
            
            response = requests.post(url, data=data, timeout=10)
            return response.status_code == 200
            
        except Exception as e:
            self.logger.error(f"Error sending Telegram alert: {e}")
            return False
            
    def _create_alert_message(self, anomalies: List[Dict[str, Any]]) -> str:
        """Create alert message from anomalies"""
        message = "🚨 KOPMA WEBSITE ANOMALY DETECTED\n\n"
        
        for anomaly in anomalies:
            severity_emoji = {
                'critical': '🔴',
                'high': '🟠',
                'medium': '🟡',
                'low': '🟢'
            }
            
            emoji = severity_emoji.get(anomaly.get('severity', 'low'), '⚪')
            message += f"{emoji} {anomaly.get('type', 'Unknown').upper()}\n"
            message += f"Time: {anomaly.get('timestamp', 'Unknown')}\n"
            
            if 'file' in anomaly:
                message += f"File: {anomaly['file']}\n"
            if 'ip' in anomaly:
                message += f"IP: {anomaly['ip']}\n"
            if 'pattern' in anomaly:
                message += f"Pattern: {anomaly['pattern']}\n"
                
            message += "\n"
            
        return message
        
    def _encrypt_message(self, message: str) -> str:
        """Encrypt message for security"""
        try:
            from cryptography.fernet import Fernet
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
            import base64
            
            # Derive key from encryption key
            salt = b'kopma_ultimate_salt_2024'
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(self.encryption_key.encode()))
            
            # Encrypt message
            cipher = Fernet(key)
            encrypted = cipher.encrypt(message.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
            
        except Exception as e:
            self.logger.error(f"Error encrypting message: {e}")
            return message  # Return unencrypted if encryption fails

if __name__ == "__main__":
    # Configuration
    config = {
        'encryption_key': os.getenv('ENCRYPTION_KEY', 'default_key_change_me'),
        'telegram_bot_token': os.getenv('TELEGRAM_BOT_TOKEN', ''),
        'telegram_chat_id': os.getenv('TELEGRAM_CHAT_ID', ''),
        'website_path': os.getenv('WEBSITE_PATH', '/usr/share/nginx/html'),
        'log_file': os.getenv('LOG_FILE', '/var/log/nginx/access.log')
    }
    
    # Run anomaly detection
    detector = AnomalyDetector(config)
    anomalies = detector.run_detection()
    
    if anomalies:
        detector.send_telegram_alert(anomalies)
        print(f"Detected {len(anomalies)} anomalies")
    else:
        print("No anomalies detected")




