#!/usr/bin/env python3
# monitoring/security_scanner.py

import os
import re
import json
import time
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import subprocess
import requests

class SecurityScanner:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.website_path = config.get('website_path', '/usr/share/nginx/html')
        self.scan_interval = config.get('scan_interval', 3600)  # 1 hour
        self.logger = self.setup_logger()
        self.malware_patterns = self.setup_malware_patterns()
        self.vulnerability_patterns = self.setup_vulnerability_patterns()
        
    def setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('security_scanner')
        logger.setLevel(logging.INFO)
        
        # Create logs directory if it doesn't exist
        os.makedirs('/app/logs', exist_ok=True)
        
        handler = logging.FileHandler('/app/logs/security_scanner.log')
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
        
    def setup_malware_patterns(self) -> Dict[str, List[str]]:
        """Setup malware detection patterns"""
        return {
            'php_backdoors': [
                r'eval\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[',
                r'assert\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[',
                r'system\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[',
                r'shell_exec\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[',
                r'passthru\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[',
                r'exec\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[',
                r'\${\s*\$_(?:GET|POST|REQUEST|COOKIE)',
                r'preg_replace.*\/e[\"\\\']',
                r'create_function\s*\(',
                r'call_user_func\s*\(',
                r'call_user_func_array\s*\(',
                r'array_map\s*\(\s*[\"\\\']eval[\"\\\']',
                r'array_filter\s*\(\s*[\"\\\']eval[\"\\\']',
                r'array_walk\s*\(\s*[\"\\\']eval[\"\\\']'
            ],
            'obfuscated_code': [
                r'eval\s*\(\s*base64_decode\s*\(',
                r'eval\s*\(\s*gzinflate\s*\(',
                r'eval\s*\(\s*gzuncompress\s*\(',
                r'eval\s*\(\s*str_rot13\s*\(',
                r'eval\s*\(\s*strrev\s*\(',
                r'\$[a-z0-9]{1,2}\s*=\s*[\"\\\'][a-zA-Z0-9+/]{50,}={0,2}[\"\\\']',
                r'chr\s*\(\s*\d+\s*\)\s*\.\s*chr\s*\(\s*\d+\s*\)',
                r'\\x[0-9a-f]{2}(?:\\x[0-9a-f]{2}){10,}',
                r'pack\s*\(\s*[\"\\\']H\*[\"\\\']',
                r'hex2bin\s*\(',
                r'str_replace\s*\(\s*[\"\\\']\w+[\"\\\']\s*,\s*[\"\\\']\w+[\"\\\']\s*,\s*[\"\\\'][a-zA-Z0-9+/]{50,}[\"\\\']',
                r'strtr\s*\(\s*[\"\\\'][a-zA-Z0-9+/]{50,}[\"\\\']\s*,\s*[\"\\\'][a-zA-Z0-9+/]{50,}[\"\\\']'
            ],
            'gambling_content': [
                r'slot\s*gacor',
                r'judi\s*online',
                r'togel',
                r'casino',
                r'sbobet',
                r'pragmatic\s*play',
                r'joker123',
                r'maxwin',
                r'scatter',
                r'bonus\s*deposit',
                r'agen\s*slot',
                r'situs\s*slot',
                r'jackpot',
                r'bet365',
                r'dewa88',
                r'raja88',
                r'poker\s*online',
                r'domino\s*online',
                r'bandar\s*togel',
                r'prediksi\s*togel'
            ],
            'suspicious_functions': [
                r'@?include\s*\(\s*[\"\\\']https?:\/\/',
                r'@?require\s*\(\s*[\"\\\']https?:\/\/',
                r'fsockopen\s*\(',
                r'popen\s*\(',
                r'proc_open\s*\(',
                r'file_get_contents\s*\(\s*[\"\\\']https?:\/\/',
                r'curl_exec\s*\(',
                r'curl_multi_exec\s*\(',
                r'fopen\s*\(\s*[\"\\\']https?:\/\/',
                r'fread\s*\(\s*[\"\\\']https?:\/\/',
                r'fwrite\s*\(\s*[\"\\\']https?:\/\/',
                r'fputs\s*\(\s*[\"\\\']https?:\/\/',
                r'fgets\s*\(\s*[\"\\\']https?:\/\/',
                r'fscanf\s*\(\s*[\"\\\']https?:\/\/',
                r'fgetc\s*\(\s*[\"\\\']https?:\/\/',
                r'fputc\s*\(\s*[\"\\\']https?:\/\/'
            ],
            'file_inclusions': [
                r'wp-[a-z0-9]+\.php',
                r'\.php\.suspected',
                r'\.bak$',
                r'\.old$',
                r'\.backup$',
                r'\.tmp$',
                r'\.temp$',
                r'\.log$',
                r'\.txt$',
                r'\.dat$',
                r'\.db$',
                r'\.sql$',
                r'\.zip$',
                r'\.rar$',
                r'\.tar$',
                r'\.gz$'
            ]
        }
        
    def setup_vulnerability_patterns(self) -> Dict[str, List[str]]:
        """Setup vulnerability detection patterns"""
        return {
            'sql_injection': [
                r'SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\s*\+',
                r'INSERT\s+INTO\s+.*\s+VALUES\s*\(.*\s*\+',
                r'UPDATE\s+.*\s+SET\s+.*\s*\+',
                r'DELETE\s+FROM\s+.*\s+WHERE\s+.*\s*\+',
                r'UNION\s+SELECT',
                r'OR\s+1\s*=\s*1',
                r'AND\s+1\s*=\s*1',
                r'OR\s+\'1\'\s*=\s*\'1\'',
                r'AND\s+\'1\'\s*=\s*\'1\'',
                r'OR\s+\"1\"\s*=\s*\"1\"',
                r'AND\s+\"1\"\s*=\s*\"1\"',
                r'OR\s+true',
                r'AND\s+true',
                r'OR\s+false',
                r'AND\s+false'
            ],
            'xss_attacks': [
                r'<script[^>]*>.*?<\/script>',
                r'javascript:',
                r'on\w+\s*=',
                r'<iframe[^>]*>.*?<\/iframe>',
                r'<object[^>]*>.*?<\/object>',
                r'<embed[^>]*>.*?<\/embed>',
                r'<applet[^>]*>.*?<\/applet>',
                r'<form[^>]*>.*?<\/form>',
                r'<input[^>]*>',
                r'<textarea[^>]*>.*?<\/textarea>',
                r'<select[^>]*>.*?<\/select>',
                r'<option[^>]*>.*?<\/option>',
                r'<button[^>]*>.*?<\/button>',
                r'<a[^>]*>.*?<\/a>',
                r'<img[^>]*>',
                r'<link[^>]*>',
                r'<meta[^>]*>',
                r'<style[^>]*>.*?<\/style>',
                r'<link[^>]*>',
                r'<script[^>]*>'
            ],
            'command_injection': [
                r'[;&|`$]',
                r'\b(exec|system|shell_exec|passthru|proc_open|popen)\s*\(',
                r'\b(eval|assert|create_function)\s*\(',
                r'\b(include|require|include_once|require_once)\s*\(\s*[\"\\\']https?:\/\/',
                r'\b(file_get_contents|fopen|fread|fwrite)\s*\(\s*[\"\\\']https?:\/\/',
                r'\b(curl_exec|curl_multi_exec)\s*\(',
                r'\b(fsockopen|popen|proc_open)\s*\(',
                r'\b(exec|system|shell_exec|passthru)\s*\(\s*[\"\\\']\w+[\"\\\']',
                r'\b(eval|assert|create_function)\s*\(\s*[\"\\\']\w+[\"\\\']',
                r'\b(include|require|include_once|require_once)\s*\(\s*[\"\\\']\w+[\"\\\']'
            ],
            'path_traversal': [
                r'\.\.\/',
                r'\.\.\\\\',
                r'%2e%2e%2f',
                r'%2e%2e%5c',
                r'\.\.%2f',
                r'\.\.%5c',
                r'\.\.%252f',
                r'\.\.%255c',
                r'\.\.%25252f',
                r'\.\.%25255c',
                r'\.\.%2525252f',
                r'\.\.%2525255c'
            ],
            'file_inclusion': [
                r'\b(include|require|include_once|require_once)\s*\(\s*[\"\\\']\w+[\"\\\']',
                r'\b(file_get_contents|fopen|fread|fwrite)\s*\(\s*[\"\\\']\w+[\"\\\']',
                r'\b(include|require|include_once|require_once)\s*\(\s*[\"\\\']\w+[\"\\\']',
                r'\b(file_get_contents|fopen|fread|fwrite)\s*\(\s*[\"\\\']\w+[\"\\\']',
                r'\b(include|require|include_once|require_once)\s*\(\s*[\"\\\']\w+[\"\\\']',
                r'\b(file_get_contents|fopen|fread|fwrite)\s*\(\s*[\"\\\']\w+[\"\\\']'
            ]
        }
        
    def scan_file(self, file_path: str) -> Dict[str, Any]:
        """Scan individual file for security issues"""
        scan_results = {
            'file': file_path,
            'malware_detected': [],
            'vulnerabilities': [],
            'suspicious_patterns': [],
            'file_hash': '',
            'scan_timestamp': datetime.now().isoformat(),
            'file_size': 0,
            'file_permissions': '',
            'last_modified': ''
        }
        
        try:
            # Get file information
            stat = os.stat(file_path)
            scan_results['file_size'] = stat.st_size
            scan_results['file_permissions'] = oct(stat.st_mode)[-3:]
            scan_results['last_modified'] = datetime.fromtimestamp(stat.st_mtime).isoformat()
            
            # Calculate file hash
            with open(file_path, 'rb') as f:
                content = f.read()
                scan_results['file_hash'] = hashlib.sha256(content).hexdigest()
                
            # Read file content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            # Check for malware patterns
            for category, patterns in self.malware_patterns.items():
                for pattern in patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE | re.MULTILINE)
                    if matches:
                        scan_results['malware_detected'].append({
                            'category': category,
                            'pattern': pattern,
                            'matches': matches,
                            'count': len(matches)
                        })
                        
            # Check for vulnerability patterns
            for category, patterns in self.vulnerability_patterns.items():
                for pattern in patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE | re.MULTILINE)
                    if matches:
                        scan_results['vulnerabilities'].append({
                            'category': category,
                            'pattern': pattern,
                            'matches': matches,
                            'count': len(matches)
                        })
                        
            # Check for suspicious patterns
            suspicious_patterns = [
                r'password\s*=\s*[\"\\\'][^\"\\\']+[\"\\\']',
                r'api_key\s*=\s*[\"\\\'][^\"\\\']+[\"\\\']',
                r'secret\s*=\s*[\"\\\'][^\"\\\']+[\"\\\']',
                r'token\s*=\s*[\"\\\'][^\"\\\']+[\"\\\']',
                r'key\s*=\s*[\"\\\'][^\"\\\']+[\"\\\']',
                r'pass\s*=\s*[\"\\\'][^\"\\\']+[\"\\\']',
                r'pwd\s*=\s*[\"\\\'][^\"\\\']+[\"\\\']',
                r'pwd\s*=\s*[\"\\\'][^\"\\\']+[\"\\\']'
            ]
            
            for pattern in suspicious_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    scan_results['suspicious_patterns'].append({
                        'pattern': pattern,
                        'matches': matches,
                        'count': len(matches)
                    })
                    
        except Exception as e:
            self.logger.error(f"Error scanning file {file_path}: {e}")
            scan_results['error'] = str(e)
            
        return scan_results
        
    def scan_directory(self, directory: str) -> Dict[str, Any]:
        """Scan directory for security issues"""
        scan_results = {
            'directory': directory,
            'total_files': 0,
            'scanned_files': 0,
            'malware_files': [],
            'vulnerable_files': [],
            'suspicious_files': [],
            'scan_timestamp': datetime.now().isoformat(),
            'scan_duration': 0
        }
        
        start_time = time.time()
        
        try:
            # Walk through directory
            for root, dirs, files in os.walk(directory):
                for file in files:
                    file_path = os.path.join(root, file)
                    scan_results['total_files'] += 1
                    
                    # Skip certain file types
                    if self.should_skip_file(file_path):
                        continue
                        
                    # Scan file
                    file_scan = self.scan_file(file_path)
                    scan_results['scanned_files'] += 1
                    
                    # Categorize results
                    if file_scan['malware_detected']:
                        scan_results['malware_files'].append(file_scan)
                        
                    if file_scan['vulnerabilities']:
                        scan_results['vulnerable_files'].append(file_scan)
                        
                    if file_scan['suspicious_patterns']:
                        scan_results['suspicious_files'].append(file_scan)
                        
        except Exception as e:
            self.logger.error(f"Error scanning directory {directory}: {e}")
            scan_results['error'] = str(e)
            
        scan_results['scan_duration'] = time.time() - start_time
        
        return scan_results
        
    def should_skip_file(self, file_path: str) -> bool:
        """Check if file should be skipped during scan"""
        skip_extensions = ['.log', '.tmp', '.temp', '.cache', '.bak', '.old', '.backup']
        skip_directories = ['.git', '.svn', '.hg', '.bzr', 'node_modules', 'vendor', 'cache', 'logs']
        
        # Check file extension
        for ext in skip_extensions:
            if file_path.endswith(ext):
                return True
                
        # Check directory
        for dir_name in skip_directories:
            if f'/{dir_name}/' in file_path or f'\\{dir_name}\\' in file_path:
                return True
                
        return False
        
    def check_file_permissions(self, file_path: str) -> Dict[str, Any]:
        """Check file permissions for security issues"""
        permission_results = {
            'file': file_path,
            'permissions': '',
            'owner': '',
            'group': '',
            'is_writable': False,
            'is_executable': False,
            'is_readable': False,
            'security_issues': []
        }
        
        try:
            stat = os.stat(file_path)
            permission_results['permissions'] = oct(stat.st_mode)[-3:]
            permission_results['owner'] = stat.st_uid
            permission_results['group'] = stat.st_gid
            permission_results['is_writable'] = os.access(file_path, os.W_OK)
            permission_results['is_executable'] = os.access(file_path, os.X_OK)
            permission_results['is_readable'] = os.access(file_path, os.R_OK)
            
            # Check for security issues
            if permission_results['is_writable'] and file_path.endswith('.php'):
                permission_results['security_issues'].append('PHP file is writable')
                
            if permission_results['is_executable'] and not file_path.endswith(('.php', '.py', '.sh', '.exe')):
                permission_results['security_issues'].append('Non-executable file has execute permissions')
                
            if stat.st_mode & 0o002:  # World writable
                permission_results['security_issues'].append('File is world writable')
                
            if stat.st_mode & 0o004:  # World readable
                permission_results['security_issues'].append('File is world readable')
                
        except Exception as e:
            self.logger.error(f"Error checking permissions for {file_path}: {e}")
            permission_results['error'] = str(e)
            
        return permission_results
        
    def run_security_scan(self) -> Dict[str, Any]:
        """Run complete security scan"""
        self.logger.info("Starting security scan...")
        
        scan_results = {
            'scan_timestamp': datetime.now().isoformat(),
            'website_path': self.website_path,
            'directory_scan': {},
            'permission_scan': {},
            'summary': {},
            'recommendations': [],
            'alerts': []
        }
        
        # Scan directory
        if os.path.exists(self.website_path):
            scan_results['directory_scan'] = self.scan_directory(self.website_path)
        else:
            self.logger.warning(f"Website path not found: {self.website_path}")
            scan_results['directory_scan']['error'] = 'Website path not found'
            
        # Check file permissions
        if os.path.exists(self.website_path):
            permission_results = []
            for root, dirs, files in os.walk(self.website_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    if not self.should_skip_file(file_path):
                        permission_results.append(self.check_file_permissions(file_path))
            scan_results['permission_scan'] = permission_results
            
        # Generate summary
        scan_results['summary'] = {
            'total_files': scan_results['directory_scan'].get('total_files', 0),
            'scanned_files': scan_results['directory_scan'].get('scanned_files', 0),
            'malware_files': len(scan_results['directory_scan'].get('malware_files', [])),
            'vulnerable_files': len(scan_results['directory_scan'].get('vulnerable_files', [])),
            'suspicious_files': len(scan_results['directory_scan'].get('suspicious_files', [])),
            'permission_issues': len([p for p in scan_results['permission_scan'] if p.get('security_issues')])
        }
        
        # Generate recommendations
        if scan_results['summary']['malware_files'] > 0:
            scan_results['recommendations'].append("Remove or quarantine malware files immediately")
            
        if scan_results['summary']['vulnerable_files'] > 0:
            scan_results['recommendations'].append("Fix vulnerabilities in affected files")
            
        if scan_results['summary']['suspicious_files'] > 0:
            scan_results['recommendations'].append("Review suspicious files for security issues")
            
        if scan_results['summary']['permission_issues'] > 0:
            scan_results['recommendations'].append("Fix file permission issues")
            
        # Generate alerts
        if scan_results['summary']['malware_files'] > 0:
            scan_results['alerts'].append({
                'type': 'malware',
                'severity': 'critical',
                'message': f"{scan_results['summary']['malware_files']} malware files detected"
            })
            
        if scan_results['summary']['vulnerable_files'] > 0:
            scan_results['alerts'].append({
                'type': 'vulnerability',
                'severity': 'high',
                'message': f"{scan_results['summary']['vulnerable_files']} vulnerable files detected"
            })
            
        if scan_results['summary']['suspicious_files'] > 0:
            scan_results['alerts'].append({
                'type': 'suspicious',
                'severity': 'medium',
                'message': f"{scan_results['summary']['suspicious_files']} suspicious files detected"
            })
            
        self.logger.info("Security scan completed")
        
        return scan_results

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Security Scanner for KOPMA UNNES Website')
    parser.add_argument('--config', help='Configuration file path')
    parser.add_argument('--website-path', help='Website path to scan')
    parser.add_argument('--output', help='Output file for scan results')
    args = parser.parse_args()
    
    # Configuration
    config = {
        'website_path': args.website_path or '/usr/share/nginx/html',
        'scan_interval': 3600
    }
    
    # Create scanner instance
    scanner = SecurityScanner(config)
    
    # Run security scan
    results = scanner.run_security_scan()
    
    # Output results
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"Security scan results saved to: {args.output}")
    else:
        print(json.dumps(results, indent=2))


