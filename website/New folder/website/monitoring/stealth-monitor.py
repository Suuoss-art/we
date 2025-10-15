#!/usr/bin/env python3
"""
Stealth Monitoring System for KOPMA UNNES Website
Advanced anomaly detection and security monitoring
"""

import os
import sys
import json
import time
import hashlib
import logging
import requests
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import secrets

class StealthMonitor:
    def __init__(self, config_file: str = None):
        self.config = self.load_config(config_file)
        self.encryption_key = self.derive_key(self.config['encryption_key'])
        self.cipher = Fernet(self.encryption_key)
        self.logger = self.setup_logger()
        self.running = False
        self.threads = []
        self.anomalies = []
        self.threats = []
        self.performance_metrics = []
        
    def load_config(self, config_file: str = None) -> Dict[str, Any]:
        """Load configuration from file or environment variables"""
        if config_file and os.path.exists(config_file):
            with open(config_file, 'r') as f:
                return json.load(f)
        
        # Default configuration from environment variables
        return {
            'telegram': {
                'bot_token': os.getenv('TELEGRAM_BOT_TOKEN', ''),
                'chat_id': os.getenv('TELEGRAM_CHAT_ID', ''),
                'webhook': os.getenv('TELEGRAM_WEBHOOK', '')
            },
            'security': {
                'encryption': 'AES-256-GCM',
                'obfuscation': True,
                'stealth': True
            },
            'events': {
                'file_changes': True,
                'access_attempts': True,
                'errors': True,
                'performance': True,
                'security': True
            },
            'monitoring': {
                'interval': 30,  # seconds
                'deep_scan': True,
                'real_time': True,
                'threat_intelligence': True
            },
            'encryption_key': os.getenv('ENCRYPTION_KEY', ''),
            'log_file': '/var/log/kopma-website/stealth-monitor.log',
            'data_dir': '/opt/kopma-website/monitoring/data'
        }
    
    def derive_key(self, password: str) -> bytes:
        """Derive encryption key from password"""
        if not password:
            password = 'default_password_change_me'
        
        salt = b'kopma_ultimate_salt_2024'
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
        logger = logging.getLogger('stealth_monitor')
        logger.setLevel(logging.INFO)
        
        # Create logs directory if it doesn't exist
        log_dir = os.path.dirname(self.config['log_file'])
        os.makedirs(log_dir, exist_ok=True)
        
        # File handler
        file_handler = logging.FileHandler(self.config['log_file'])
        file_handler.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.WARNING)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt data for secure transmission"""
        try:
            encrypted = self.cipher.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            self.logger.error(f"Encryption error: {e}")
            return data
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt data"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            self.logger.error(f"Decryption error: {e}")
            return encrypted_data
    
    def send_telegram_alert(self, message: str, severity: str = 'info') -> bool:
        """Send encrypted alert to Telegram"""
        try:
            if not self.config['telegram']['bot_token'] or not self.config['telegram']['chat_id']:
                return False
            
            # Encrypt message
            encrypted_message = self.encrypt_data(message)
            
            # Create alert payload
            alert_data = {
                'chat_id': self.config['telegram']['chat_id'],
                'text': f"🔒 KOPMA Alert [{severity.upper()}]\n{encrypted_message}",
                'parse_mode': 'HTML'
            }
            
            # Send to Telegram
            url = f"https://api.telegram.org/bot{self.config['telegram']['bot_token']}/sendMessage"
            response = requests.post(url, data=alert_data, timeout=10)
            
            if response.status_code == 200:
                self.logger.info(f"Telegram alert sent: {severity}")
                return True
            else:
                self.logger.error(f"Telegram API error: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error sending Telegram alert: {e}")
            return False
    
    def monitor_file_changes(self) -> List[Dict[str, Any]]:
        """Monitor file changes in the website"""
        anomalies = []
        website_path = '/usr/share/nginx/html'
        
        try:
            for root, dirs, files in os.walk(website_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    
                    # Check for suspicious files
                    if self.is_suspicious_file(file_path):
                        anomaly = {
                            'type': 'suspicious_file',
                            'file': file_path,
                            'timestamp': datetime.now().isoformat(),
                            'severity': 'high',
                            'description': f'Suspicious file detected: {file_path}'
                        }
                        anomalies.append(anomaly)
                        self.anomalies.append(anomaly)
                    
                    # Check for large files
                    try:
                        size = os.path.getsize(file_path)
                        if size > 10 * 1024 * 1024:  # 10MB
                            anomaly = {
                                'type': 'large_file',
                                'file': file_path,
                                'size': size,
                                'timestamp': datetime.now().isoformat(),
                                'severity': 'medium',
                                'description': f'Large file detected: {file_path} ({size} bytes)'
                            }
                            anomalies.append(anomaly)
                            self.anomalies.append(anomaly)
                    except OSError:
                        pass
                        
        except Exception as e:
            self.logger.error(f"Error monitoring file changes: {e}")
        
        return anomalies
    
    def is_suspicious_file(self, file_path: str) -> bool:
        """Check if file is suspicious"""
        suspicious_extensions = ['.php.suspected', '.bak', '.old', '.backup']
        suspicious_names = ['wp-', 'eval', 'shell', 'backdoor', 'hack']
        
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
    
    def monitor_network_anomalies(self) -> List[Dict[str, Any]]:
        """Monitor network anomalies"""
        anomalies = []
        
        try:
            # Check nginx access logs
            log_file = '/var/log/nginx/access.log'
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    lines = f.readlines()
                    recent_lines = lines[-100:]  # Last 100 lines
                    
                    # Analyze IP patterns
                    ip_counts = {}
                    for line in recent_lines:
                        parts = line.split()
                        if len(parts) > 0:
                            ip = parts[0]
                            ip_counts[ip] = ip_counts.get(ip, 0) + 1
                    
                    # Check for suspicious IPs
                    for ip, count in ip_counts.items():
                        if count > 50:  # More than 50 requests
                            anomaly = {
                                'type': 'suspicious_ip',
                                'ip': ip,
                                'request_count': count,
                                'timestamp': datetime.now().isoformat(),
                                'severity': 'high',
                                'description': f'Suspicious IP detected: {ip} ({count} requests)'
                            }
                            anomalies.append(anomaly)
                            self.anomalies.append(anomaly)
                            
        except Exception as e:
            self.logger.error(f"Error monitoring network anomalies: {e}")
        
        return anomalies
    
    def monitor_security_threats(self) -> List[Dict[str, Any]]:
        """Monitor security threats"""
        threats = []
        
        try:
            # Check for malware patterns
            website_path = '/usr/share/nginx/html'
            malware_patterns = [
                r'eval\s*\(',
                r'base64_decode\s*\(',
                r'shell_exec\s*\(',
                r'exec\s*\(',
                r'system\s*\(',
                r'passthru\s*\(',
                r'fsockopen\s*\(',
                r'popen\s*\(',
                r'proc_open\s*\(',
                r'assert\s*\(',
                r'create_function\s*\(',
                r'preg_replace.*\/e',
                r'include\s*\(\s*[\'"]https?:\/\/',
                r'require\s*\(\s*[\'"]https?:\/\/'
            ]
            
            for root, dirs, files in os.walk(website_path):
                for file in files:
                    if file.endswith('.php'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                
                            for pattern in malware_patterns:
                                import re
                                if re.search(pattern, content, re.IGNORECASE):
                                    threat = {
                                        'type': 'malware_detected',
                                        'file': file_path,
                                        'pattern': pattern,
                                        'timestamp': datetime.now().isoformat(),
                                        'severity': 'critical',
                                        'description': f'Malware pattern detected in {file_path}: {pattern}'
                                    }
                                    threats.append(threat)
                                    self.threats.append(threat)
                                    
                        except Exception as e:
                            self.logger.error(f"Error scanning file {file_path}: {e}")
                            
        except Exception as e:
            self.logger.error(f"Error monitoring security threats: {e}")
        
        return threats
    
    def monitor_performance(self) -> Dict[str, Any]:
        """Monitor system performance"""
        try:
            import psutil
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent,
                'load_average': os.getloadavg() if hasattr(os, 'getloadavg') else [0, 0, 0]
            }
            
            self.performance_metrics.append(metrics)
            
            # Keep only last 1000 metrics
            if len(self.performance_metrics) > 1000:
                self.performance_metrics = self.performance_metrics[-1000:]
            
            return metrics
            
        except ImportError:
            self.logger.warning("psutil not available, performance monitoring disabled")
            return {}
        except Exception as e:
            self.logger.error(f"Error monitoring performance: {e}")
            return {}
    
    def run_monitoring_cycle(self):
        """Run one monitoring cycle"""
        try:
            self.logger.info("Running monitoring cycle...")
            
            # Monitor file changes
            if self.config['events']['file_changes']:
                file_anomalies = self.monitor_file_changes()
                if file_anomalies:
                    self.logger.warning(f"File anomalies detected: {len(file_anomalies)}")
                    for anomaly in file_anomalies:
                        self.send_telegram_alert(
                            f"File anomaly: {anomaly['description']}",
                            anomaly['severity']
                        )
            
            # Monitor network anomalies
            if self.config['events']['access_attempts']:
                network_anomalies = self.monitor_network_anomalies()
                if network_anomalies:
                    self.logger.warning(f"Network anomalies detected: {len(network_anomalies)}")
                    for anomaly in network_anomalies:
                        self.send_telegram_alert(
                            f"Network anomaly: {anomaly['description']}",
                            anomaly['severity']
                        )
            
            # Monitor security threats
            if self.config['events']['security']:
                security_threats = self.monitor_security_threats()
                if security_threats:
                    self.logger.warning(f"Security threats detected: {len(security_threats)}")
                    for threat in security_threats:
                        self.send_telegram_alert(
                            f"Security threat: {threat['description']}",
                            threat['severity']
                        )
            
            # Monitor performance
            if self.config['events']['performance']:
                performance = self.monitor_performance()
                if performance:
                    # Check for performance issues
                    if performance.get('cpu_percent', 0) > 80:
                        self.send_telegram_alert(
                            f"High CPU usage: {performance['cpu_percent']}%",
                            'high'
                        )
                    
                    if performance.get('memory_percent', 0) > 80:
                        self.send_telegram_alert(
                            f"High memory usage: {performance['memory_percent']}%",
                            'high'
                        )
            
            # Save monitoring data
            self.save_monitoring_data()
            
        except Exception as e:
            self.logger.error(f"Error in monitoring cycle: {e}")
    
    def save_monitoring_data(self):
        """Save monitoring data to file"""
        try:
            data_dir = self.config['data_dir']
            os.makedirs(data_dir, exist_ok=True)
            
            data = {
                'anomalies': self.anomalies[-100:],  # Keep last 100
                'threats': self.threats[-100:],      # Keep last 100
                'performance_metrics': self.performance_metrics[-100:],  # Keep last 100
                'last_updated': datetime.now().isoformat()
            }
            
            data_file = os.path.join(data_dir, 'monitoring_data.json')
            with open(data_file, 'w') as f:
                json.dump(data, f, indent=2)
                
        except Exception as e:
            self.logger.error(f"Error saving monitoring data: {e}")
    
    def start(self):
        """Start the stealth monitoring system"""
        self.logger.info("Starting stealth monitoring system...")
        self.running = True
        
        # Start monitoring thread
        monitor_thread = threading.Thread(target=self.monitoring_loop, daemon=True)
        monitor_thread.start()
        self.threads.append(monitor_thread)
        
        self.logger.info("Stealth monitoring system started")
    
    def stop(self):
        """Stop the stealth monitoring system"""
        self.logger.info("Stopping stealth monitoring system...")
        self.running = False
        
        # Wait for threads to finish
        for thread in self.threads:
            thread.join(timeout=5)
        
        self.logger.info("Stealth monitoring system stopped")
    
    def monitoring_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                self.run_monitoring_cycle()
                time.sleep(self.config['monitoring']['interval'])
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
    
    def get_status(self) -> Dict[str, Any]:
        """Get monitoring system status"""
        return {
            'running': self.running,
            'anomalies_count': len(self.anomalies),
            'threats_count': len(self.threats),
            'performance_metrics_count': len(self.performance_metrics),
            'last_updated': datetime.now().isoformat()
        }

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Stealth Monitoring System')
    parser.add_argument('--config', help='Configuration file path')
    parser.add_argument('--daemon', action='store_true', help='Run as daemon')
    args = parser.parse_args()
    
    # Create monitoring instance
    monitor = StealthMonitor(args.config)
    
    # Handle signals
    import signal
    
    def signal_handler(signum, frame):
        print(f"Received signal {signum}, shutting down...")
        monitor.stop()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Start monitoring
        monitor.start()
        
        if args.daemon:
            # Run as daemon
            while True:
                time.sleep(1)
        else:
            # Run interactively
            print("Stealth monitoring system running. Press Ctrl+C to stop.")
            while True:
                time.sleep(1)
                
    except KeyboardInterrupt:
        print("Received interrupt signal, shutting down...")
        monitor.stop()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
