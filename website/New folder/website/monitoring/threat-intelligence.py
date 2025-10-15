#!/usr/bin/env python3
"""
Advanced Threat Intelligence System for KOPMA UNNES Website
Real-time threat detection and intelligence gathering
"""

import os
import sys
import json
import time
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
import hashlib
import secrets
import re

class ThreatIntelligence:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self.setup_logger()
        self.threat_database = {}
        self.ioc_database = {}
        self.threat_feeds = []
        self.analysis_results = []
        self.initialize_threat_database()
        
    def setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('threat_intelligence')
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
    
    def initialize_threat_database(self):
        """Initialize threat database with known patterns"""
        self.threat_database = {
            'malware_signatures': [
                {
                    'name': 'PHP Backdoor',
                    'pattern': r'(eval\s*\(|assert\s*\(|system\s*\(|shell_exec\s*\(|exec\s*\(|passthru\s*\()',
                    'severity': 'critical',
                    'category': 'malware',
                    'description': 'PHP backdoor signature detected'
                },
                {
                    'name': 'Obfuscated Code',
                    'pattern': r'(base64_decode\s*\(|gzinflate\s*\(|gzuncompress\s*\(|str_rot13\s*\()',
                    'severity': 'high',
                    'category': 'malware',
                    'description': 'Obfuscated code signature detected'
                },
                {
                    'name': 'Suspicious Functions',
                    'pattern': r'(fsockopen\s*\(|popen\s*\(|proc_open\s*\(|create_function\s*\()',
                    'severity': 'medium',
                    'category': 'malware',
                    'description': 'Suspicious function usage detected'
                }
            ],
            'attack_patterns': [
                {
                    'name': 'SQL Injection',
                    'pattern': r'(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+set)',
                    'severity': 'critical',
                    'category': 'injection',
                    'description': 'SQL injection attack pattern detected'
                },
                {
                    'name': 'XSS Attack',
                    'pattern': r'(<script[^>]*>.*?</script>|javascript:|onload\s*=|onerror\s*=)',
                    'severity': 'high',
                    'category': 'xss',
                    'description': 'XSS attack pattern detected'
                },
                {
                    'name': 'Path Traversal',
                    'pattern': r'(\.\./|\.\.\\|%2e%2e%2f|%2e%2e%5c)',
                    'severity': 'high',
                    'category': 'traversal',
                    'description': 'Path traversal attack pattern detected'
                },
                {
                    'name': 'Command Injection',
                    'pattern': r'(;|\||&|\$\(|\`|exec\s*\(|system\s*\()',
                    'severity': 'critical',
                    'category': 'injection',
                    'description': 'Command injection attack pattern detected'
                }
            ],
            'bot_signatures': [
                {
                    'name': 'Scanner Bot',
                    'pattern': r'(sqlmap|nmap|nikto|dirb|gobuster|w3af|burp)',
                    'severity': 'medium',
                    'category': 'scanner',
                    'description': 'Scanner bot detected'
                },
                {
                    'name': 'Crawler Bot',
                    'pattern': r'(bot|crawler|spider|scraper|googlebot|bingbot)',
                    'severity': 'low',
                    'category': 'crawler',
                    'description': 'Crawler bot detected'
                },
                {
                    'name': 'Malicious Bot',
                    'pattern': r'(hack|exploit|attack|malware|virus)',
                    'severity': 'high',
                    'category': 'malicious',
                    'description': 'Malicious bot detected'
                }
            ],
            'ip_reputation': [
                {
                    'name': 'Known Malicious IP',
                    'pattern': r'^(192\.168\.1\.1|10\.0\.0\.1|172\.16\.0\.1)$',
                    'severity': 'high',
                    'category': 'reputation',
                    'description': 'Known malicious IP address detected'
                }
            ]
        }
        
        # Initialize IOC database
        self.ioc_database = {
            'ips': set(),
            'domains': set(),
            'urls': set(),
            'file_hashes': set(),
            'email_addresses': set()
        }
        
        self.logger.info("Threat database initialized")
    
    def analyze_content(self, content: str, content_type: str = 'text') -> List[Dict[str, Any]]:
        """Analyze content for threats"""
        try:
            threats = []
            
            # Check malware signatures
            for signature in self.threat_database['malware_signatures']:
                if re.search(signature['pattern'], content, re.IGNORECASE):
                    threat = {
                        'type': 'malware',
                        'name': signature['name'],
                        'severity': signature['severity'],
                        'category': signature['category'],
                        'description': signature['description'],
                        'content_type': content_type,
                        'timestamp': datetime.now().isoformat(),
                        'confidence': self.calculate_confidence(content, signature['pattern'])
                    }
                    threats.append(threat)
            
            # Check attack patterns
            for pattern in self.threat_database['attack_patterns']:
                if re.search(pattern['pattern'], content, re.IGNORECASE):
                    threat = {
                        'type': 'attack',
                        'name': pattern['name'],
                        'severity': pattern['severity'],
                        'category': pattern['category'],
                        'description': pattern['description'],
                        'content_type': content_type,
                        'timestamp': datetime.now().isoformat(),
                        'confidence': self.calculate_confidence(content, pattern['pattern'])
                    }
                    threats.append(threat)
            
            # Check bot signatures
            for signature in self.threat_database['bot_signatures']:
                if re.search(signature['pattern'], content, re.IGNORECASE):
                    threat = {
                        'type': 'bot',
                        'name': signature['name'],
                        'severity': signature['severity'],
                        'category': signature['category'],
                        'description': signature['description'],
                        'content_type': content_type,
                        'timestamp': datetime.now().isoformat(),
                        'confidence': self.calculate_confidence(content, signature['pattern'])
                    }
                    threats.append(threat)
            
            # Extract IOCs
            iocs = self.extract_iocs(content)
            if iocs:
                for ioc in iocs:
                    threat = {
                        'type': 'ioc',
                        'name': f'IOC: {ioc["type"]}',
                        'severity': 'medium',
                        'category': 'ioc',
                        'description': f'Indicator of Compromise detected: {ioc["value"]}',
                        'content_type': content_type,
                        'timestamp': datetime.now().isoformat(),
                        'confidence': 0.8,
                        'ioc': ioc
                    }
                    threats.append(threat)
            
            return threats
            
        except Exception as e:
            self.logger.error(f"Error analyzing content: {e}")
            return []
    
    def calculate_confidence(self, content: str, pattern: str) -> float:
        """Calculate confidence score for threat detection"""
        try:
            matches = len(re.findall(pattern, content, re.IGNORECASE))
            content_length = len(content)
            
            # Base confidence on match frequency and content length
            if content_length == 0:
                return 0.0
            
            match_ratio = matches / content_length
            confidence = min(1.0, match_ratio * 1000)  # Scale up for short content
            
            return round(confidence, 2)
            
        except Exception as e:
            self.logger.error(f"Error calculating confidence: {e}")
            return 0.0
    
    def extract_iocs(self, content: str) -> List[Dict[str, Any]]:
        """Extract Indicators of Compromise from content"""
        try:
            iocs = []
            
            # Extract IP addresses
            ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
            ips = re.findall(ip_pattern, content)
            for ip in ips:
                iocs.append({'type': 'ip', 'value': ip})
            
            # Extract domains
            domain_pattern = r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b'
            domains = re.findall(domain_pattern, content)
            for domain in domains:
                iocs.append({'type': 'domain', 'value': domain})
            
            # Extract URLs
            url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
            urls = re.findall(url_pattern, content)
            for url in urls:
                iocs.append({'type': 'url', 'value': url})
            
            # Extract email addresses
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, content)
            for email in emails:
                iocs.append({'type': 'email', 'value': email})
            
            # Extract file hashes
            hash_pattern = r'\b[a-fA-F0-9]{32,64}\b'
            hashes = re.findall(hash_pattern, content)
            for hash_value in hashes:
                iocs.append({'type': 'hash', 'value': hash_value})
            
            return iocs
            
        except Exception as e:
            self.logger.error(f"Error extracting IOCs: {e}")
            return []
    
    def analyze_ip_reputation(self, ip: str) -> Dict[str, Any]:
        """Analyze IP reputation"""
        try:
            reputation = {
                'ip': ip,
                'reputation_score': 0.5,  # Neutral
                'threat_level': 'unknown',
                'country': 'unknown',
                'isp': 'unknown',
                'last_seen': None,
                'threats': []
            }
            
            # Check against known malicious IPs
            if ip in self.ioc_database['ips']:
                reputation['reputation_score'] = 0.1
                reputation['threat_level'] = 'malicious'
                reputation['threats'].append('Known malicious IP')
            
            # Check against threat database
            for pattern in self.threat_database['ip_reputation']:
                if re.match(pattern['pattern'], ip):
                    reputation['reputation_score'] = 0.1
                    reputation['threat_level'] = 'malicious'
                    reputation['threats'].append(pattern['description'])
            
            # Simulate external reputation check
            reputation['country'] = self.get_ip_country(ip)
            reputation['isp'] = self.get_ip_isp(ip)
            reputation['last_seen'] = datetime.now().isoformat()
            
            return reputation
            
        except Exception as e:
            self.logger.error(f"Error analyzing IP reputation: {e}")
            return {'ip': ip, 'reputation_score': 0.5, 'threat_level': 'unknown'}
    
    def get_ip_country(self, ip: str) -> str:
        """Get country for IP address"""
        # This would be actual IP geolocation in a real implementation
        return 'Unknown'
    
    def get_ip_isp(self, ip: str) -> str:
        """Get ISP for IP address"""
        # This would be actual ISP lookup in a real implementation
        return 'Unknown'
    
    def analyze_domain_reputation(self, domain: str) -> Dict[str, Any]:
        """Analyze domain reputation"""
        try:
            reputation = {
                'domain': domain,
                'reputation_score': 0.5,  # Neutral
                'threat_level': 'unknown',
                'registrar': 'unknown',
                'creation_date': None,
                'threats': []
            }
            
            # Check against known malicious domains
            if domain in self.ioc_database['domains']:
                reputation['reputation_score'] = 0.1
                reputation['threat_level'] = 'malicious'
                reputation['threats'].append('Known malicious domain')
            
            # Check for suspicious patterns
            suspicious_patterns = [
                r'[0-9]{8,}',  # Long number sequences
                r'[a-z]{1,3}[0-9]{4,}',  # Short letters + long numbers
                r'[0-9]{4,}[a-z]{1,3}',  # Long numbers + short letters
            ]
            
            for pattern in suspicious_patterns:
                if re.search(pattern, domain):
                    reputation['reputation_score'] = 0.3
                    reputation['threat_level'] = 'suspicious'
                    reputation['threats'].append('Suspicious domain pattern')
            
            return reputation
            
        except Exception as e:
            self.logger.error(f"Error analyzing domain reputation: {e}")
            return {'domain': domain, 'reputation_score': 0.5, 'threat_level': 'unknown'}
    
    def analyze_file_hash(self, file_hash: str) -> Dict[str, Any]:
        """Analyze file hash reputation"""
        try:
            reputation = {
                'hash': file_hash,
                'reputation_score': 0.5,  # Neutral
                'threat_level': 'unknown',
                'file_type': 'unknown',
                'threats': []
            }
            
            # Check against known malicious hashes
            if file_hash in self.ioc_database['file_hashes']:
                reputation['reputation_score'] = 0.1
                reputation['threat_level'] = 'malicious'
                reputation['threats'].append('Known malicious file hash')
            
            # Determine file type from hash length
            if len(file_hash) == 32:
                reputation['file_type'] = 'MD5'
            elif len(file_hash) == 40:
                reputation['file_type'] = 'SHA1'
            elif len(file_hash) == 64:
                reputation['file_type'] = 'SHA256'
            
            return reputation
            
        except Exception as e:
            self.logger.error(f"Error analyzing file hash: {e}")
            return {'hash': file_hash, 'reputation_score': 0.5, 'threat_level': 'unknown'}
    
    def update_threat_database(self, new_threats: List[Dict[str, Any]]):
        """Update threat database with new threats"""
        try:
            for threat in new_threats:
                if threat['type'] == 'malware':
                    self.threat_database['malware_signatures'].append(threat)
                elif threat['type'] == 'attack':
                    self.threat_database['attack_patterns'].append(threat)
                elif threat['type'] == 'bot':
                    self.threat_database['bot_signatures'].append(threat)
            
            self.logger.info(f"Updated threat database with {len(new_threats)} new threats")
            
        except Exception as e:
            self.logger.error(f"Error updating threat database: {e}")
    
    def update_ioc_database(self, new_iocs: List[Dict[str, Any]]):
        """Update IOC database with new indicators"""
        try:
            for ioc in new_iocs:
                if ioc['type'] == 'ip':
                    self.ioc_database['ips'].add(ioc['value'])
                elif ioc['type'] == 'domain':
                    self.ioc_database['domains'].add(ioc['value'])
                elif ioc['type'] == 'url':
                    self.ioc_database['urls'].add(ioc['value'])
                elif ioc['type'] == 'hash':
                    self.ioc_database['file_hashes'].add(ioc['value'])
                elif ioc['type'] == 'email':
                    self.ioc_database['email_addresses'].add(ioc['value'])
            
            self.logger.info(f"Updated IOC database with {len(new_iocs)} new indicators")
            
        except Exception as e:
            self.logger.error(f"Error updating IOC database: {e}")
    
    def generate_threat_report(self, analysis_results: List[Dict[str, Any]]) -> str:
        """Generate threat intelligence report"""
        try:
            report = []
            report.append("# Threat Intelligence Report")
            report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            report.append("")
            
            # Summary
            total_threats = len(analysis_results)
            critical_threats = len([r for r in analysis_results if r.get('severity') == 'critical'])
            high_threats = len([r for r in analysis_results if r.get('severity') == 'high'])
            medium_threats = len([r for r in analysis_results if r.get('severity') == 'medium'])
            low_threats = len([r for r in analysis_results if r.get('severity') == 'low'])
            
            report.append("## Summary")
            report.append(f"- Total threats: {total_threats}")
            report.append(f"- Critical: {critical_threats}")
            report.append(f"- High: {high_threats}")
            report.append(f"- Medium: {medium_threats}")
            report.append(f"- Low: {low_threats}")
            report.append("")
            
            # Threat breakdown by category
            threat_categories = defaultdict(int)
            for result in analysis_results:
                threat_categories[result.get('category', 'unknown')] += 1
            
            report.append("## Threat Categories")
            for category, count in sorted(threat_categories.items(), key=lambda x: x[1], reverse=True):
                report.append(f"- {category}: {count}")
            report.append("")
            
            # Detailed threats
            report.append("## Detailed Threats")
            for result in analysis_results:
                report.append(f"### {result.get('name', 'Unknown Threat')}")
                report.append(f"- Severity: {result.get('severity', 'unknown')}")
                report.append(f"- Category: {result.get('category', 'unknown')}")
                report.append(f"- Description: {result.get('description', 'No description')}")
                report.append(f"- Confidence: {result.get('confidence', 0.0)}")
                report.append(f"- Timestamp: {result.get('timestamp', 'Unknown')}")
                report.append("")
            
            return "\n".join(report)
            
        except Exception as e:
            self.logger.error(f"Error generating threat report: {e}")
            return "Error generating threat report"
    
    def save_analysis_results(self, file_path: str):
        """Save analysis results to file"""
        try:
            results = {
                'analysis_timestamp': datetime.now().isoformat(),
                'results': self.analysis_results,
                'threat_database': self.threat_database,
                'ioc_database': {
                    'ips': list(self.ioc_database['ips']),
                    'domains': list(self.ioc_database['domains']),
                    'urls': list(self.ioc_database['urls']),
                    'file_hashes': list(self.ioc_database['file_hashes']),
                    'email_addresses': list(self.ioc_database['email_addresses'])
                }
            }
            
            with open(file_path, 'w') as f:
                json.dump(results, f, indent=2)
            
            self.logger.info(f"Analysis results saved to: {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error saving analysis results: {e}")
    
    def load_analysis_results(self, file_path: str):
        """Load analysis results from file"""
        try:
            if not os.path.exists(file_path):
                self.logger.warning(f"Analysis results file not found: {file_path}")
                return
            
            with open(file_path, 'r') as f:
                results = json.load(f)
            
            self.analysis_results = results.get('results', [])
            self.threat_database = results.get('threat_database', {})
            
            # Restore IOC database
            ioc_data = results.get('ioc_database', {})
            self.ioc_database = {
                'ips': set(ioc_data.get('ips', [])),
                'domains': set(ioc_data.get('domains', [])),
                'urls': set(ioc_data.get('urls', [])),
                'file_hashes': set(ioc_data.get('file_hashes', [])),
                'email_addresses': set(ioc_data.get('email_addresses', []))
            }
            
            self.logger.info(f"Analysis results loaded from: {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error loading analysis results: {e}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Advanced Threat Intelligence System')
    parser.add_argument('--content', help='Content to analyze')
    parser.add_argument('--ip', help='IP address to analyze')
    parser.add_argument('--domain', help='Domain to analyze')
    parser.add_argument('--hash', help='File hash to analyze')
    parser.add_argument('--output', help='Output file for analysis results')
    parser.add_argument('--report', help='Generate report file')
    parser.add_argument('--config', help='Configuration file')
    args = parser.parse_args()
    
    # Load configuration
    config = {}
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config = json.load(f)
    
    # Create threat intelligence instance
    ti = ThreatIntelligence(config)
    
    if args.content:
        # Analyze content
        threats = ti.analyze_content(args.content)
        print(f"Threats detected: {len(threats)}")
        for threat in threats:
            print(f"- {threat['name']}: {threat['severity']} ({threat['confidence']})")
        
        # Save results
        if args.output:
            ti.analysis_results = threats
            ti.save_analysis_results(args.output)
        
        # Generate report
        if args.report:
            report = ti.generate_threat_report(threats)
            with open(args.report, 'w') as f:
                f.write(report)
            print(f"Report saved to: {args.report}")
    
    elif args.ip:
        # Analyze IP
        reputation = ti.analyze_ip_reputation(args.ip)
        print(f"IP reputation: {reputation}")
    
    elif args.domain:
        # Analyze domain
        reputation = ti.analyze_domain_reputation(args.domain)
        print(f"Domain reputation: {reputation}")
    
    elif args.hash:
        # Analyze file hash
        reputation = ti.analyze_file_hash(args.hash)
        print(f"File hash reputation: {reputation}")
    
    else:
        print("🛡️ Advanced Threat Intelligence System")
        print("Use --content to analyze content for threats")
        print("Use --ip to analyze IP reputation")
        print("Use --domain to analyze domain reputation")
        print("Use --hash to analyze file hash reputation")
        print("Use --output to save analysis results")
        print("Use --report to generate report file")

if __name__ == '__main__':
    main()
