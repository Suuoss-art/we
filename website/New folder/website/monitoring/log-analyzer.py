#!/usr/bin/env python3
"""
Advanced Log Analyzer for KOPMA UNNES Website Monitoring
Comprehensive log analysis and threat detection
"""

import os
import sys
import json
import time
import re
import gzip
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
import hashlib
import secrets

class LogAnalyzer:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self.setup_logger()
        self.patterns = self.initialize_patterns()
        self.analysis_results = []
        self.threats_detected = []
        self.performance_metrics = []
        
    def setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('log_analyzer')
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
    
    def initialize_patterns(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialize analysis patterns"""
        return {
            'security_threats': [
                {
                    'name': 'SQL Injection',
                    'pattern': r'(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+set)',
                    'severity': 'critical',
                    'description': 'SQL injection attempt detected'
                },
                {
                    'name': 'XSS Attack',
                    'pattern': r'(<script[^>]*>.*?</script>|javascript:|onload\s*=|onerror\s*=)',
                    'severity': 'high',
                    'description': 'XSS attack attempt detected'
                },
                {
                    'name': 'Path Traversal',
                    'pattern': r'(\.\./|\.\.\\|%2e%2e%2f|%2e%2e%5c)',
                    'severity': 'high',
                    'description': 'Path traversal attempt detected'
                },
                {
                    'name': 'Command Injection',
                    'pattern': r'(;|\||&|\$\(|\`|exec\s*\(|system\s*\()',
                    'severity': 'critical',
                    'description': 'Command injection attempt detected'
                },
                {
                    'name': 'File Inclusion',
                    'pattern': r'(include\s*\(|require\s*\(|include_once\s*\(|require_once\s*\()',
                    'severity': 'medium',
                    'description': 'File inclusion attempt detected'
                }
            ],
            'malware_patterns': [
                {
                    'name': 'PHP Backdoor',
                    'pattern': r'(eval\s*\(|assert\s*\(|system\s*\(|shell_exec\s*\(|exec\s*\(|passthru\s*\()',
                    'severity': 'critical',
                    'description': 'PHP backdoor detected'
                },
                {
                    'name': 'Obfuscated Code',
                    'pattern': r'(base64_decode\s*\(|gzinflate\s*\(|gzuncompress\s*\(|str_rot13\s*\()',
                    'severity': 'high',
                    'description': 'Obfuscated code detected'
                },
                {
                    'name': 'Suspicious Functions',
                    'pattern': r'(fsockopen\s*\(|popen\s*\(|proc_open\s*\(|create_function\s*\()',
                    'severity': 'medium',
                    'description': 'Suspicious function usage detected'
                }
            ],
            'access_patterns': [
                {
                    'name': 'Brute Force',
                    'pattern': r'(wp-login\.php|admin|login)',
                    'severity': 'high',
                    'description': 'Brute force attack detected'
                },
                {
                    'name': 'Scanner Bot',
                    'pattern': r'(sqlmap|nmap|nikto|dirb|gobuster)',
                    'severity': 'medium',
                    'description': 'Scanner bot detected'
                },
                {
                    'name': 'Crawler Bot',
                    'pattern': r'(bot|crawler|spider|scraper)',
                    'severity': 'low',
                    'description': 'Crawler bot detected'
                }
            ],
            'performance_issues': [
                {
                    'name': 'Slow Response',
                    'pattern': r'(\d{4,})',  # Response time > 1000ms
                    'severity': 'medium',
                    'description': 'Slow response time detected'
                },
                {
                    'name': 'High Memory Usage',
                    'pattern': r'(memory|Memory)',
                    'severity': 'low',
                    'description': 'High memory usage detected'
                }
            ]
        }
    
    def analyze_log_file(self, file_path: str) -> Dict[str, Any]:
        """Analyze a single log file"""
        try:
            self.logger.info(f"Analyzing log file: {file_path}")
            
            # Check if file exists
            if not os.path.exists(file_path):
                self.logger.error(f"Log file not found: {file_path}")
                return {}
            
            # Determine if file is compressed
            is_compressed = file_path.endswith('.gz')
            
            # Open file
            if is_compressed:
                file_handle = gzip.open(file_path, 'rt', encoding='utf-8', errors='ignore')
            else:
                file_handle = open(file_path, 'r', encoding='utf-8', errors='ignore')
            
            # Analyze file
            analysis_result = {
                'file_path': file_path,
                'file_size': os.path.getsize(file_path),
                'is_compressed': is_compressed,
                'analysis_timestamp': datetime.now().isoformat(),
                'total_lines': 0,
                'threats': [],
                'performance_issues': [],
                'access_patterns': [],
                'statistics': {}
            }
            
            line_count = 0
            ip_counts = Counter()
            status_codes = Counter()
            user_agents = Counter()
            response_times = []
            
            with file_handle:
                for line in file_handle:
                    line_count += 1
                    
                    # Parse log line
                    parsed_line = self.parse_log_line(line)
                    if parsed_line:
                        # Extract IP
                        if 'ip' in parsed_line:
                            ip_counts[parsed_line['ip']] += 1
                        
                        # Extract status code
                        if 'status' in parsed_line:
                            status_codes[parsed_line['status']] += 1
                        
                        # Extract user agent
                        if 'user_agent' in parsed_line:
                            user_agents[parsed_line['user_agent']] += 1
                        
                        # Extract response time
                        if 'response_time' in parsed_line:
                            response_times.append(parsed_line['response_time'])
                        
                        # Check for threats
                        threats = self.detect_threats(line, parsed_line)
                        analysis_result['threats'].extend(threats)
                        
                        # Check for performance issues
                        performance_issues = self.detect_performance_issues(line, parsed_line)
                        analysis_result['performance_issues'].extend(performance_issues)
                        
                        # Check for access patterns
                        access_patterns = self.detect_access_patterns(line, parsed_line)
                        analysis_result['access_patterns'].extend(access_patterns)
            
            # Update analysis result
            analysis_result['total_lines'] = line_count
            analysis_result['statistics'] = {
                'top_ips': dict(ip_counts.most_common(10)),
                'status_codes': dict(status_codes),
                'top_user_agents': dict(user_agents.most_common(10)),
                'avg_response_time': sum(response_times) / len(response_times) if response_times else 0,
                'max_response_time': max(response_times) if response_times else 0,
                'min_response_time': min(response_times) if response_times else 0
            }
            
            self.analysis_results.append(analysis_result)
            self.logger.info(f"Analysis completed for {file_path}: {line_count} lines processed")
            
            return analysis_result
            
        except Exception as e:
            self.logger.error(f"Error analyzing log file {file_path}: {e}")
            return {}
    
    def parse_log_line(self, line: str) -> Optional[Dict[str, Any]]:
        """Parse a single log line"""
        try:
            # Common log formats
            # Apache Common Log Format: IP - - [timestamp] "method path protocol" status size
            # Nginx: IP - - [timestamp] "method path protocol" status size "referer" "user_agent"
            
            # Try Apache Common Log Format first
            apache_pattern = r'^(\S+) - - \[([^\]]+)\] "([^"]+)" (\d+) (\d+)'
            match = re.match(apache_pattern, line)
            if match:
                ip, timestamp, request, status, size = match.groups()
                
                # Parse request
                request_parts = request.split()
                method = request_parts[0] if request_parts else ''
                path = request_parts[1] if len(request_parts) > 1 else ''
                protocol = request_parts[2] if len(request_parts) > 2 else ''
                
                return {
                    'ip': ip,
                    'timestamp': timestamp,
                    'method': method,
                    'path': path,
                    'protocol': protocol,
                    'status': int(status),
                    'size': int(size)
                }
            
            # Try Nginx format
            nginx_pattern = r'^(\S+) - - \[([^\]]+)\] "([^"]+)" (\d+) (\d+) "([^"]*)" "([^"]*)"'
            match = re.match(nginx_pattern, line)
            if match:
                ip, timestamp, request, status, size, referer, user_agent = match.groups()
                
                # Parse request
                request_parts = request.split()
                method = request_parts[0] if request_parts else ''
                path = request_parts[1] if len(request_parts) > 1 else ''
                protocol = request_parts[2] if len(request_parts) > 2 else ''
                
                # Extract response time if available
                response_time = None
                if 'rt=' in line:
                    rt_match = re.search(r'rt=([\d.]+)', line)
                    if rt_match:
                        response_time = float(rt_match.group(1))
                
                return {
                    'ip': ip,
                    'timestamp': timestamp,
                    'method': method,
                    'path': path,
                    'protocol': protocol,
                    'status': int(status),
                    'size': int(size),
                    'referer': referer,
                    'user_agent': user_agent,
                    'response_time': response_time
                }
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error parsing log line: {e}")
            return None
    
    def detect_threats(self, line: str, parsed_line: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect security threats in log line"""
        threats = []
        
        try:
            for category, patterns in self.patterns.items():
                if category == 'security_threats':
                    for pattern in patterns:
                        if re.search(pattern['pattern'], line, re.IGNORECASE):
                            threat = {
                                'type': 'security_threat',
                                'name': pattern['name'],
                                'severity': pattern['severity'],
                                'description': pattern['description'],
                                'line': line.strip(),
                                'timestamp': datetime.now().isoformat(),
                                'ip': parsed_line.get('ip', 'unknown'),
                                'path': parsed_line.get('path', 'unknown')
                            }
                            threats.append(threat)
                            self.threats_detected.append(threat)
            
            return threats
            
        except Exception as e:
            self.logger.error(f"Error detecting threats: {e}")
            return []
    
    def detect_performance_issues(self, line: str, parsed_line: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect performance issues in log line"""
        issues = []
        
        try:
            for pattern in self.patterns['performance_issues']:
                if re.search(pattern['pattern'], line, re.IGNORECASE):
                    issue = {
                        'type': 'performance_issue',
                        'name': pattern['name'],
                        'severity': pattern['severity'],
                        'description': pattern['description'],
                        'line': line.strip(),
                        'timestamp': datetime.now().isoformat(),
                        'ip': parsed_line.get('ip', 'unknown'),
                        'path': parsed_line.get('path', 'unknown')
                    }
                    issues.append(issue)
                    self.performance_metrics.append(issue)
            
            return issues
            
        except Exception as e:
            self.logger.error(f"Error detecting performance issues: {e}")
            return []
    
    def detect_access_patterns(self, line: str, parsed_line: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect access patterns in log line"""
        patterns = []
        
        try:
            for pattern in self.patterns['access_patterns']:
                if re.search(pattern['pattern'], line, re.IGNORECASE):
                    access_pattern = {
                        'type': 'access_pattern',
                        'name': pattern['name'],
                        'severity': pattern['severity'],
                        'description': pattern['description'],
                        'line': line.strip(),
                        'timestamp': datetime.now().isoformat(),
                        'ip': parsed_line.get('ip', 'unknown'),
                        'path': parsed_line.get('path', 'unknown')
                    }
                    patterns.append(access_pattern)
            
            return patterns
            
        except Exception as e:
            self.logger.error(f"Error detecting access patterns: {e}")
            return []
    
    def analyze_multiple_files(self, file_paths: List[str]) -> Dict[str, Any]:
        """Analyze multiple log files"""
        try:
            self.logger.info(f"Analyzing {len(file_paths)} log files...")
            
            combined_analysis = {
                'total_files': len(file_paths),
                'analysis_timestamp': datetime.now().isoformat(),
                'files': [],
                'combined_statistics': {
                    'total_lines': 0,
                    'total_threats': 0,
                    'total_performance_issues': 0,
                    'total_access_patterns': 0
                },
                'threats_summary': defaultdict(int),
                'performance_summary': defaultdict(int),
                'access_patterns_summary': defaultdict(int)
            }
            
            for file_path in file_paths:
                analysis_result = self.analyze_log_file(file_path)
                if analysis_result:
                    combined_analysis['files'].append(analysis_result)
                    
                    # Update combined statistics
                    combined_analysis['combined_statistics']['total_lines'] += analysis_result['total_lines']
                    combined_analysis['combined_statistics']['total_threats'] += len(analysis_result['threats'])
                    combined_analysis['combined_statistics']['total_performance_issues'] += len(analysis_result['performance_issues'])
                    combined_analysis['combined_statistics']['total_access_patterns'] += len(analysis_result['access_patterns'])
                    
                    # Update summaries
                    for threat in analysis_result['threats']:
                        combined_analysis['threats_summary'][threat['name']] += 1
                    
                    for issue in analysis_result['performance_issues']:
                        combined_analysis['performance_summary'][issue['name']] += 1
                    
                    for pattern in analysis_result['access_patterns']:
                        combined_analysis['access_patterns_summary'][pattern['name']] += 1
            
            self.logger.info(f"Analysis completed for {len(file_paths)} files")
            return combined_analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing multiple files: {e}")
            return {}
    
    def generate_report(self, analysis_results: List[Dict[str, Any]]) -> str:
        """Generate analysis report"""
        try:
            report = []
            report.append("# Log Analysis Report")
            report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            report.append("")
            
            # Summary
            total_files = len(analysis_results)
            total_lines = sum(result.get('total_lines', 0) for result in analysis_results)
            total_threats = sum(len(result.get('threats', [])) for result in analysis_results)
            total_performance_issues = sum(len(result.get('performance_issues', [])) for result in analysis_results)
            
            report.append("## Summary")
            report.append(f"- Files analyzed: {total_files}")
            report.append(f"- Total lines: {total_lines:,}")
            report.append(f"- Threats detected: {total_threats}")
            report.append(f"- Performance issues: {total_performance_issues}")
            report.append("")
            
            # Threats summary
            if total_threats > 0:
                report.append("## Security Threats")
                threat_counts = defaultdict(int)
                for result in analysis_results:
                    for threat in result.get('threats', []):
                        threat_counts[threat['name']] += 1
                
                for threat_name, count in sorted(threat_counts.items(), key=lambda x: x[1], reverse=True):
                    report.append(f"- {threat_name}: {count}")
                report.append("")
            
            # Performance issues summary
            if total_performance_issues > 0:
                report.append("## Performance Issues")
                performance_counts = defaultdict(int)
                for result in analysis_results:
                    for issue in result.get('performance_issues', []):
                        performance_counts[issue['name']] += 1
                
                for issue_name, count in sorted(performance_counts.items(), key=lambda x: x[1], reverse=True):
                    report.append(f"- {issue_name}: {count}")
                report.append("")
            
            # File details
            report.append("## File Details")
            for result in analysis_results:
                report.append(f"### {result.get('file_path', 'Unknown')}")
                report.append(f"- Lines: {result.get('total_lines', 0):,}")
                report.append(f"- Size: {result.get('file_size', 0):,} bytes")
                report.append(f"- Threats: {len(result.get('threats', []))}")
                report.append(f"- Performance issues: {len(result.get('performance_issues', []))}")
                report.append("")
            
            return "\n".join(report)
            
        except Exception as e:
            self.logger.error(f"Error generating report: {e}")
            return "Error generating report"
    
    def save_analysis_results(self, file_path: str):
        """Save analysis results to file"""
        try:
            results = {
                'analysis_timestamp': datetime.now().isoformat(),
                'results': self.analysis_results,
                'threats_detected': self.threats_detected,
                'performance_metrics': self.performance_metrics
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
            self.threats_detected = results.get('threats_detected', [])
            self.performance_metrics = results.get('performance_metrics', [])
            
            self.logger.info(f"Analysis results loaded from: {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error loading analysis results: {e}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Advanced Log Analyzer')
    parser.add_argument('--files', nargs='+', help='Log files to analyze')
    parser.add_argument('--output', help='Output file for analysis results')
    parser.add_argument('--report', help='Generate report file')
    parser.add_argument('--config', help='Configuration file')
    args = parser.parse_args()
    
    # Load configuration
    config = {}
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config = json.load(f)
    
    # Create analyzer instance
    analyzer = LogAnalyzer(config)
    
    if args.files:
        # Analyze files
        if len(args.files) == 1:
            result = analyzer.analyze_log_file(args.files[0])
        else:
            result = analyzer.analyze_multiple_files(args.files)
        
        print(f"Analysis completed: {result}")
        
        # Save results
        if args.output:
            analyzer.save_analysis_results(args.output)
        
        # Generate report
        if args.report:
            report = analyzer.generate_report(analyzer.analysis_results)
            with open(args.report, 'w') as f:
                f.write(report)
            print(f"Report saved to: {args.report}")
    else:
        print("📊 Advanced Log Analyzer")
        print("Use --files to specify log files to analyze")
        print("Use --output to save analysis results")
        print("Use --report to generate report file")

if __name__ == '__main__':
    main()
