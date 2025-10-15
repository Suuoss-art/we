#!/usr/bin/env python3
# monitoring/log_analyzer.py

import os
import re
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
import hashlib

class LogAnalyzer:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.log_files = config.get('log_files', [])
        self.analysis_interval = config.get('analysis_interval', 300)  # 5 minutes
        self.logger = self.setup_logger()
        self.patterns = self.setup_patterns()
        
    def setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('log_analyzer')
        logger.setLevel(logging.INFO)
        
        # Create logs directory if it doesn't exist
        os.makedirs('/app/logs', exist_ok=True)
        
        handler = logging.FileHandler('/app/logs/log_analyzer.log')
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
        
    def setup_patterns(self) -> Dict[str, List[str]]:
        """Setup analysis patterns"""
        return {
            'security_threats': [
                r'SQL injection',
                r'XSS attack',
                r'CSRF attack',
                r'Brute force',
                r'Directory traversal',
                r'File inclusion',
                r'Command injection',
                r'LDAP injection',
                r'NoSQL injection'
            ],
            'error_patterns': [
                r'ERROR',
                r'CRITICAL',
                r'FATAL',
                r'Exception',
                r'Failed',
                r'Timeout',
                r'Connection refused',
                r'Permission denied',
                r'Access denied'
            ],
            'performance_issues': [
                r'slow query',
                r'high memory usage',
                r'high CPU usage',
                r'disk space low',
                r'connection timeout',
                r'response time high'
            ],
            'access_patterns': [
                r'GET /',
                r'POST /',
                r'PUT /',
                r'DELETE /',
                r'HEAD /',
                r'OPTIONS /'
            ]
        }
        
    def analyze_nginx_logs(self, log_file: str) -> Dict[str, Any]:
        """Analyze Nginx access logs"""
        analysis = {
            'total_requests': 0,
            'unique_ips': set(),
            'status_codes': Counter(),
            'user_agents': Counter(),
            'referrers': Counter(),
            'endpoints': Counter(),
            'suspicious_requests': [],
            'error_requests': [],
            'top_ips': Counter(),
            'request_methods': Counter(),
            'response_times': []
        }
        
        if not os.path.exists(log_file):
            self.logger.warning(f"Log file not found: {log_file}")
            return analysis
            
        try:
            with open(log_file, 'r') as f:
                lines = f.readlines()
                recent_lines = lines[-10000:]  # Last 10,000 lines
                
            for line in recent_lines:
                try:
                    # Parse Nginx log format
                    parts = line.split()
                    if len(parts) >= 10:
                        ip = parts[0]
                        timestamp = parts[3] + ' ' + parts[4]
                        method = parts[5].strip('"')
                        uri = parts[6]
                        status = parts[8]
                        user_agent = ' '.join(parts[11:]) if len(parts) > 11 else ''
                        referrer = parts[10] if len(parts) > 10 else ''
                        
                        # Basic statistics
                        analysis['total_requests'] += 1
                        analysis['unique_ips'].add(ip)
                        analysis['status_codes'][status] += 1
                        analysis['user_agents'][user_agent] += 1
                        analysis['referrers'][referrer] += 1
                        analysis['endpoints'][uri] += 1
                        analysis['top_ips'][ip] += 1
                        analysis['request_methods'][method] += 1
                        
                        # Check for suspicious requests
                        if self.is_suspicious_request(uri, method, status, user_agent):
                            analysis['suspicious_requests'].append({
                                'ip': ip,
                                'uri': uri,
                                'method': method,
                                'status': status,
                                'user_agent': user_agent,
                                'timestamp': timestamp
                            })
                            
                        # Check for error requests
                        if status.startswith('4') or status.startswith('5'):
                            analysis['error_requests'].append({
                                'ip': ip,
                                'uri': uri,
                                'method': method,
                                'status': status,
                                'user_agent': user_agent,
                                'timestamp': timestamp
                            })
                            
                except Exception as e:
                    self.logger.error(f"Error parsing log line: {e}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error analyzing Nginx logs: {e}")
            
        return analysis
        
    def analyze_error_logs(self, log_file: str) -> Dict[str, Any]:
        """Analyze error logs"""
        analysis = {
            'total_errors': 0,
            'error_types': Counter(),
            'error_sources': Counter(),
            'critical_errors': [],
            'recent_errors': []
        }
        
        if not os.path.exists(log_file):
            self.logger.warning(f"Error log file not found: {log_file}")
            return analysis
            
        try:
            with open(log_file, 'r') as f:
                lines = f.readlines()
                recent_lines = lines[-5000:]  # Last 5,000 lines
                
            for line in recent_lines:
                try:
                    # Parse error log format
                    if 'ERROR' in line or 'CRITICAL' in line or 'FATAL' in line:
                        analysis['total_errors'] += 1
                        
                        # Extract error type
                        for error_type in self.patterns['error_patterns']:
                            if re.search(error_type, line, re.IGNORECASE):
                                analysis['error_types'][error_type] += 1
                                
                        # Check for critical errors
                        if 'CRITICAL' in line or 'FATAL' in line:
                            analysis['critical_errors'].append({
                                'line': line.strip(),
                                'timestamp': datetime.now().isoformat()
                            })
                            
                        # Add to recent errors
                        analysis['recent_errors'].append({
                            'line': line.strip(),
                            'timestamp': datetime.now().isoformat()
                        })
                        
                except Exception as e:
                    self.logger.error(f"Error parsing error log line: {e}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error analyzing error logs: {e}")
            
        return analysis
        
    def analyze_security_logs(self, log_file: str) -> Dict[str, Any]:
        """Analyze security logs"""
        analysis = {
            'total_security_events': 0,
            'threat_types': Counter(),
            'blocked_ips': Counter(),
            'threat_severity': Counter(),
            'recent_threats': []
        }
        
        if not os.path.exists(log_file):
            self.logger.warning(f"Security log file not found: {log_file}")
            return analysis
            
        try:
            with open(log_file, 'r') as f:
                lines = f.readlines()
                recent_lines = lines[-2000:]  # Last 2,000 lines
                
            for line in recent_lines:
                try:
                    # Parse security log format
                    if any(threat in line for threat in self.patterns['security_threats']):
                        analysis['total_security_events'] += 1
                        
                        # Extract threat type
                        for threat_type in self.patterns['security_threats']:
                            if re.search(threat_type, line, re.IGNORECASE):
                                analysis['threat_types'][threat_type] += 1
                                
                        # Extract IP if present
                        ip_match = re.search(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', line)
                        if ip_match:
                            ip = ip_match.group()
                            analysis['blocked_ips'][ip] += 1
                            
                        # Extract severity
                        if 'critical' in line.lower():
                            analysis['threat_severity']['critical'] += 1
                        elif 'high' in line.lower():
                            analysis['threat_severity']['high'] += 1
                        elif 'medium' in line.lower():
                            analysis['threat_severity']['medium'] += 1
                        else:
                            analysis['threat_severity']['low'] += 1
                            
                        # Add to recent threats
                        analysis['recent_threats'].append({
                            'line': line.strip(),
                            'timestamp': datetime.now().isoformat()
                        })
                        
                except Exception as e:
                    self.logger.error(f"Error parsing security log line: {e}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error analyzing security logs: {e}")
            
        return analysis
        
    def analyze_performance_logs(self, log_file: str) -> Dict[str, Any]:
        """Analyze performance logs"""
        analysis = {
            'total_performance_events': 0,
            'performance_issues': Counter(),
            'slow_queries': [],
            'high_memory_usage': [],
            'high_cpu_usage': [],
            'disk_space_issues': []
        }
        
        if not os.path.exists(log_file):
            self.logger.warning(f"Performance log file not found: {log_file}")
            return analysis
            
        try:
            with open(log_file, 'r') as f:
                lines = f.readlines()
                recent_lines = lines[-3000:]  # Last 3,000 lines
                
            for line in recent_lines:
                try:
                    # Parse performance log format
                    if any(issue in line for issue in self.patterns['performance_issues']):
                        analysis['total_performance_events'] += 1
                        
                        # Extract performance issue type
                        for issue_type in self.patterns['performance_issues']:
                            if re.search(issue_type, line, re.IGNORECASE):
                                analysis['performance_issues'][issue_type] += 1
                                
                        # Categorize specific issues
                        if 'slow query' in line.lower():
                            analysis['slow_queries'].append({
                                'line': line.strip(),
                                'timestamp': datetime.now().isoformat()
                            })
                        elif 'high memory usage' in line.lower():
                            analysis['high_memory_usage'].append({
                                'line': line.strip(),
                                'timestamp': datetime.now().isoformat()
                            })
                        elif 'high CPU usage' in line.lower():
                            analysis['high_cpu_usage'].append({
                                'line': line.strip(),
                                'timestamp': datetime.now().isoformat()
                            })
                        elif 'disk space' in line.lower():
                            analysis['disk_space_issues'].append({
                                'line': line.strip(),
                                'timestamp': datetime.now().isoformat()
                            })
                            
                except Exception as e:
                    self.logger.error(f"Error parsing performance log line: {e}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error analyzing performance logs: {e}")
            
        return analysis
        
    def is_suspicious_request(self, uri: str, method: str, status: str, user_agent: str) -> bool:
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
            r'/Thumbs\.db',
            r'\.php\?',
            r'\.asp\?',
            r'\.jsp\?',
            r'\.aspx\?'
        ]
        
        # Check URI patterns
        for pattern in suspicious_patterns:
            if re.search(pattern, uri, re.IGNORECASE):
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
            'openvas',
            'scanner',
            'bot',
            'crawler',
            'spider'
        ]
        
        for agent in suspicious_user_agents:
            if agent.lower() in user_agent.lower():
                return True
                
        # Check for suspicious status codes
        if status in ['403', '404', '500', '502', '503']:
            return True
            
        return False
        
    def generate_report(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate analysis report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {},
            'recommendations': [],
            'alerts': []
        }
        
        # Generate summary
        if 'nginx' in analysis_data:
            nginx_data = analysis_data['nginx']
            report['summary']['total_requests'] = nginx_data['total_requests']
            report['summary']['unique_ips'] = len(nginx_data['unique_ips'])
            report['summary']['suspicious_requests'] = len(nginx_data['suspicious_requests'])
            report['summary']['error_requests'] = len(nginx_data['error_requests'])
            
        if 'security' in analysis_data:
            security_data = analysis_data['security']
            report['summary']['security_events'] = security_data['total_security_events']
            report['summary']['blocked_ips'] = len(security_data['blocked_ips'])
            
        if 'performance' in analysis_data:
            performance_data = analysis_data['performance']
            report['summary']['performance_events'] = performance_data['total_performance_events']
            
        # Generate recommendations
        if report['summary'].get('suspicious_requests', 0) > 10:
            report['recommendations'].append("High number of suspicious requests detected. Consider implementing additional security measures.")
            
        if report['summary'].get('error_requests', 0) > 50:
            report['recommendations'].append("High number of error requests detected. Check server configuration and application health.")
            
        if report['summary'].get('security_events', 0) > 5:
            report['recommendations'].append("Multiple security events detected. Review security logs and consider blocking suspicious IPs.")
            
        if report['summary'].get('performance_events', 0) > 3:
            report['recommendations'].append("Performance issues detected. Check server resources and optimize application.")
            
        # Generate alerts
        if report['summary'].get('suspicious_requests', 0) > 20:
            report['alerts'].append({
                'type': 'security',
                'severity': 'high',
                'message': 'High number of suspicious requests detected'
            })
            
        if report['summary'].get('error_requests', 0) > 100:
            report['alerts'].append({
                'type': 'error',
                'severity': 'medium',
                'message': 'High number of error requests detected'
            })
            
        if report['summary'].get('security_events', 0) > 10:
            report['alerts'].append({
                'type': 'security',
                'severity': 'critical',
                'message': 'Multiple security events detected'
            })
            
        return report
        
    def run_analysis(self) -> Dict[str, Any]:
        """Run complete log analysis"""
        self.logger.info("Starting log analysis...")
        
        analysis_data = {}
        
        # Analyze Nginx logs
        nginx_log = '/var/log/nginx/access.log'
        if os.path.exists(nginx_log):
            analysis_data['nginx'] = self.analyze_nginx_logs(nginx_log)
            self.logger.info(f"Nginx logs analyzed: {analysis_data['nginx']['total_requests']} requests")
            
        # Analyze error logs
        error_log = '/var/log/nginx/error.log'
        if os.path.exists(error_log):
            analysis_data['error'] = self.analyze_error_logs(error_log)
            self.logger.info(f"Error logs analyzed: {analysis_data['error']['total_errors']} errors")
            
        # Analyze security logs
        security_log = '/app/logs/security.log'
        if os.path.exists(security_log):
            analysis_data['security'] = self.analyze_security_logs(security_log)
            self.logger.info(f"Security logs analyzed: {analysis_data['security']['total_security_events']} events")
            
        # Analyze performance logs
        performance_log = '/app/logs/performance.log'
        if os.path.exists(performance_log):
            analysis_data['performance'] = self.analyze_performance_logs(performance_log)
            self.logger.info(f"Performance logs analyzed: {analysis_data['performance']['total_performance_events']} events")
            
        # Generate report
        report = self.generate_report(analysis_data)
        
        self.logger.info("Log analysis completed")
        
        return {
            'analysis_data': analysis_data,
            'report': report
        }

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Log Analyzer for KOPMA UNNES Website')
    parser.add_argument('--config', help='Configuration file path')
    parser.add_argument('--log-file', help='Specific log file to analyze')
    parser.add_argument('--output', help='Output file for analysis results')
    args = parser.parse_args()
    
    # Configuration
    config = {
        'log_files': [
            '/var/log/nginx/access.log',
            '/var/log/nginx/error.log',
            '/app/logs/security.log',
            '/app/logs/performance.log'
        ],
        'analysis_interval': 300
    }
    
    # Create analyzer instance
    analyzer = LogAnalyzer(config)
    
    # Run analysis
    results = analyzer.run_analysis()
    
    # Output results
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"Analysis results saved to: {args.output}")
    else:
        print(json.dumps(results, indent=2))




