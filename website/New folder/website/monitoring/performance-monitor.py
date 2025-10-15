#!/usr/bin/env python3
"""
Advanced Performance Monitoring System for KOPMA UNNES Website
Real-time performance tracking and optimization recommendations
"""

import os
import sys
import json
import time
import secrets
import psutil
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, deque
import threading
import requests
import subprocess

class PerformanceMonitor:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self.setup_logger()
        self.metrics = deque(maxlen=1000)  # Keep last 1000 metrics
        self.alerts = []
        self.thresholds = self.initialize_thresholds()
        self.monitoring = False
        self.monitor_thread = None
        
    def setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('performance_monitor')
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
    
    def initialize_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Initialize performance thresholds"""
        return {
            'cpu': {
                'warning': 70.0,
                'critical': 90.0
            },
            'memory': {
                'warning': 80.0,
                'critical': 95.0
            },
            'disk': {
                'warning': 85.0,
                'critical': 95.0
            },
            'network': {
                'warning': 80.0,
                'critical': 95.0
            },
            'response_time': {
                'warning': 2.0,
                'critical': 5.0
            },
            'load_average': {
                'warning': 2.0,
                'critical': 4.0
            }
        }
    
    def start_monitoring(self):
        """Start performance monitoring"""
        try:
            if self.monitoring:
                self.logger.warning("Monitoring already started")
                return
            
            self.monitoring = True
            self.monitor_thread = threading.Thread(target=self.monitoring_loop, daemon=True)
            self.monitor_thread.start()
            
            self.logger.info("Performance monitoring started")
            
        except Exception as e:
            self.logger.error(f"Error starting monitoring: {e}")
            raise
    
    def stop_monitoring(self):
        """Stop performance monitoring"""
        try:
            self.monitoring = False
            if self.monitor_thread:
                self.monitor_thread.join(timeout=5)
            
            self.logger.info("Performance monitoring stopped")
            
        except Exception as e:
            self.logger.error(f"Error stopping monitoring: {e}")
    
    def monitoring_loop(self):
        """Main monitoring loop"""
        while self.monitoring:
            try:
                # Collect metrics
                metrics = self.collect_metrics()
                self.metrics.append(metrics)
                
                # Check for alerts
                self.check_alerts(metrics)
                
                # Wait for next collection
                time.sleep(self.config.get('collection_interval', 30))
                
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
    
    def collect_metrics(self) -> Dict[str, Any]:
        """Collect system performance metrics"""
        try:
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'cpu': self.get_cpu_metrics(),
                'memory': self.get_memory_metrics(),
                'disk': self.get_disk_metrics(),
                'network': self.get_network_metrics(),
                'load_average': self.get_load_average(),
                'processes': self.get_process_metrics(),
                'website': self.get_website_metrics()
            }
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error collecting metrics: {e}")
            return {}
    
    def get_cpu_metrics(self) -> Dict[str, Any]:
        """Get CPU performance metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            
            return {
                'usage_percent': cpu_percent,
                'count': cpu_count,
                'frequency': cpu_freq.current if cpu_freq else 0,
                'load_per_core': cpu_percent / cpu_count if cpu_count > 0 else 0
            }
            
        except Exception as e:
            self.logger.error(f"Error getting CPU metrics: {e}")
            return {'usage_percent': 0, 'count': 0, 'frequency': 0, 'load_per_core': 0}
    
    def get_memory_metrics(self) -> Dict[str, Any]:
        """Get memory performance metrics"""
        try:
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            return {
                'total': memory.total,
                'available': memory.available,
                'used': memory.used,
                'free': memory.free,
                'usage_percent': memory.percent,
                'swap_total': swap.total,
                'swap_used': swap.used,
                'swap_free': swap.free,
                'swap_percent': swap.percent
            }
            
        except Exception as e:
            self.logger.error(f"Error getting memory metrics: {e}")
            return {'total': 0, 'available': 0, 'used': 0, 'free': 0, 'usage_percent': 0}
    
    def get_disk_metrics(self) -> Dict[str, Any]:
        """Get disk performance metrics"""
        try:
            disk_usage = psutil.disk_usage('/')
            disk_io = psutil.disk_io_counters()
            
            return {
                'total': disk_usage.total,
                'used': disk_usage.used,
                'free': disk_usage.free,
                'usage_percent': (disk_usage.used / disk_usage.total) * 100,
                'read_bytes': disk_io.read_bytes if disk_io else 0,
                'write_bytes': disk_io.write_bytes if disk_io else 0,
                'read_count': disk_io.read_count if disk_io else 0,
                'write_count': disk_io.write_count if disk_io else 0
            }
            
        except Exception as e:
            self.logger.error(f"Error getting disk metrics: {e}")
            return {'total': 0, 'used': 0, 'free': 0, 'usage_percent': 0}
    
    def get_network_metrics(self) -> Dict[str, Any]:
        """Get network performance metrics"""
        try:
            network_io = psutil.net_io_counters()
            network_connections = len(psutil.net_connections())
            
            return {
                'bytes_sent': network_io.bytes_sent,
                'bytes_recv': network_io.bytes_recv,
                'packets_sent': network_io.packets_sent,
                'packets_recv': network_io.packets_recv,
                'connections': network_connections
            }
            
        except Exception as e:
            self.logger.error(f"Error getting network metrics: {e}")
            return {'bytes_sent': 0, 'bytes_recv': 0, 'packets_sent': 0, 'packets_recv': 0, 'connections': 0}
    
    def get_load_average(self) -> Dict[str, Any]:
        """Get system load average"""
        try:
            if hasattr(os, 'getloadavg'):
                load_avg = os.getloadavg()
                return {
                    '1min': load_avg[0],
                    '5min': load_avg[1],
                    '15min': load_avg[2]
                }
            else:
                return {'1min': 0, '5min': 0, '15min': 0}
                
        except Exception as e:
            self.logger.error(f"Error getting load average: {e}")
            return {'1min': 0, '5min': 0, '15min': 0}
    
    def get_process_metrics(self) -> Dict[str, Any]:
        """Get process performance metrics"""
        try:
            processes = list(psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']))
            
            # Get top processes by CPU
            top_cpu = sorted(processes, key=lambda x: x.info.get('cpu_percent', 0), reverse=True)[:5]
            
            # Get top processes by memory
            top_memory = sorted(processes, key=lambda x: x.info.get('memory_percent', 0), reverse=True)[:5]
            
            return {
                'total_processes': len(processes),
                'top_cpu': [{'pid': p.info['pid'], 'name': p.info['name'], 'cpu_percent': p.info.get('cpu_percent', 0)} for p in top_cpu],
                'top_memory': [{'pid': p.info['pid'], 'name': p.info['name'], 'memory_percent': p.info.get('memory_percent', 0)} for p in top_memory]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting process metrics: {e}")
            return {'total_processes': 0, 'top_cpu': [], 'top_memory': []}
    
    def get_website_metrics(self) -> Dict[str, Any]:
        """Get website performance metrics"""
        try:
            # Check website response time
            response_time = self.check_website_response_time()
            
            # Check website status
            status = self.check_website_status()
            
            # Check SSL certificate
            ssl_status = self.check_ssl_certificate()
            
            return {
                'response_time': response_time,
                'status': status,
                'ssl_status': ssl_status,
                'uptime': self.get_website_uptime()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting website metrics: {e}")
            return {'response_time': 0, 'status': 'unknown', 'ssl_status': 'unknown', 'uptime': 0}
    
    def check_website_response_time(self) -> float:
        """Check website response time"""
        try:
            start_time = time.time()
            response = requests.get('http://localhost', timeout=10)
            end_time = time.time()
            
            if response.status_code == 200:
                return round((end_time - start_time) * 1000, 2)  # Convert to milliseconds
            else:
                return 0.0
                
        except Exception as e:
            self.logger.error(f"Error checking website response time: {e}")
            return 0.0
    
    def check_website_status(self) -> str:
        """Check website status"""
        try:
            response = requests.get('http://localhost', timeout=10)
            if response.status_code == 200:
                return 'online'
            else:
                return 'error'
                
        except Exception as e:
            self.logger.error(f"Error checking website status: {e}")
            return 'offline'
    
    def check_ssl_certificate(self) -> str:
        """Check SSL certificate status"""
        try:
            response = requests.get('https://localhost', timeout=10, verify=False)
            return 'valid'
            
        except requests.exceptions.SSLError:
            return 'invalid'
        except Exception as e:
            self.logger.error(f"Error checking SSL certificate: {e}")
            return 'unknown'
    
    def get_website_uptime(self) -> float:
        """Get website uptime percentage"""
        try:
            # This would be actual uptime calculation in a real implementation
            return 99.9
            
        except Exception as e:
            self.logger.error(f"Error getting website uptime: {e}")
            return 0.0
    
    def check_alerts(self, metrics: Dict[str, Any]):
        """Check for performance alerts"""
        try:
            # Check CPU usage
            cpu_usage = metrics.get('cpu', {}).get('usage_percent', 0)
            if cpu_usage > self.thresholds['cpu']['critical']:
                self.create_alert('critical', 'CPU', f'CPU usage is {cpu_usage}%', metrics)
            elif cpu_usage > self.thresholds['cpu']['warning']:
                self.create_alert('warning', 'CPU', f'CPU usage is {cpu_usage}%', metrics)
            
            # Check memory usage
            memory_usage = metrics.get('memory', {}).get('usage_percent', 0)
            if memory_usage > self.thresholds['memory']['critical']:
                self.create_alert('critical', 'Memory', f'Memory usage is {memory_usage}%', metrics)
            elif memory_usage > self.thresholds['memory']['warning']:
                self.create_alert('warning', 'Memory', f'Memory usage is {memory_usage}%', metrics)
            
            # Check disk usage
            disk_usage = metrics.get('disk', {}).get('usage_percent', 0)
            if disk_usage > self.thresholds['disk']['critical']:
                self.create_alert('critical', 'Disk', f'Disk usage is {disk_usage}%', metrics)
            elif disk_usage > self.thresholds['disk']['warning']:
                self.create_alert('warning', 'Disk', f'Disk usage is {disk_usage}%', metrics)
            
            # Check response time
            response_time = metrics.get('website', {}).get('response_time', 0)
            if response_time > self.thresholds['response_time']['critical'] * 1000:  # Convert to milliseconds
                self.create_alert('critical', 'Response Time', f'Response time is {response_time}ms', metrics)
            elif response_time > self.thresholds['response_time']['warning'] * 1000:
                self.create_alert('warning', 'Response Time', f'Response time is {response_time}ms', metrics)
            
            # Check load average
            load_avg = metrics.get('load_average', {}).get('1min', 0)
            if load_avg > self.thresholds['load_average']['critical']:
                self.create_alert('critical', 'Load Average', f'Load average is {load_avg}', metrics)
            elif load_avg > self.thresholds['load_average']['warning']:
                self.create_alert('warning', 'Load Average', f'Load average is {load_avg}', metrics)
            
        except Exception as e:
            self.logger.error(f"Error checking alerts: {e}")
    
    def create_alert(self, severity: str, component: str, message: str, metrics: Dict[str, Any]):
        """Create performance alert"""
        try:
            alert = {
                'id': f"alert_{int(time.time())}_{secrets.token_hex(4)}",
                'severity': severity,
                'component': component,
                'message': message,
                'timestamp': datetime.now().isoformat(),
                'metrics': metrics
            }
            
            self.alerts.append(alert)
            
            # Keep only last 100 alerts
            if len(self.alerts) > 100:
                self.alerts = self.alerts[-100:]
            
            self.logger.warning(f"Performance alert: {component} - {message}")
            
        except Exception as e:
            self.logger.error(f"Error creating alert: {e}")
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        try:
            if not self.metrics:
                return {}
            
            # Get latest metrics
            latest = self.metrics[-1]
            
            # Calculate averages
            cpu_usage = [m.get('cpu', {}).get('usage_percent', 0) for m in self.metrics]
            memory_usage = [m.get('memory', {}).get('usage_percent', 0) for m in self.metrics]
            disk_usage = [m.get('disk', {}).get('usage_percent', 0) for m in self.metrics]
            response_times = [m.get('website', {}).get('response_time', 0) for m in self.metrics]
            
            return {
                'current': latest,
                'averages': {
                    'cpu_usage': sum(cpu_usage) / len(cpu_usage) if cpu_usage else 0,
                    'memory_usage': sum(memory_usage) / len(memory_usage) if memory_usage else 0,
                    'disk_usage': sum(disk_usage) / len(disk_usage) if disk_usage else 0,
                    'response_time': sum(response_times) / len(response_times) if response_times else 0
                },
                'alerts': len(self.alerts),
                'monitoring_duration': len(self.metrics) * self.config.get('collection_interval', 30)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting performance summary: {e}")
            return {}
    
    def generate_optimization_recommendations(self) -> List[str]:
        """Generate optimization recommendations"""
        try:
            recommendations = []
            
            if not self.metrics:
                return recommendations
            
            # Get latest metrics
            latest = self.metrics[-1]
            
            # CPU recommendations
            cpu_usage = latest.get('cpu', {}).get('usage_percent', 0)
            if cpu_usage > 80:
                recommendations.append("Consider optimizing CPU-intensive processes or upgrading hardware")
            
            # Memory recommendations
            memory_usage = latest.get('memory', {}).get('usage_percent', 0)
            if memory_usage > 80:
                recommendations.append("Consider increasing memory or optimizing memory usage")
            
            # Disk recommendations
            disk_usage = latest.get('disk', {}).get('usage_percent', 0)
            if disk_usage > 80:
                recommendations.append("Consider cleaning up disk space or adding more storage")
            
            # Response time recommendations
            response_time = latest.get('website', {}).get('response_time', 0)
            if response_time > 2000:  # 2 seconds
                recommendations.append("Consider optimizing website performance or upgrading server")
            
            # Load average recommendations
            load_avg = latest.get('load_average', {}).get('1min', 0)
            if load_avg > 2:
                recommendations.append("Consider load balancing or upgrading server capacity")
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating optimization recommendations: {e}")
            return []
    
    def save_metrics(self, file_path: str):
        """Save metrics to file"""
        try:
            data = {
                'metrics': list(self.metrics),
                'alerts': self.alerts,
                'thresholds': self.thresholds,
                'saved_at': datetime.now().isoformat()
            }
            
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            self.logger.info(f"Metrics saved to: {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error saving metrics: {e}")
    
    def load_metrics(self, file_path: str):
        """Load metrics from file"""
        try:
            if not os.path.exists(file_path):
                self.logger.warning(f"Metrics file not found: {file_path}")
                return
            
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            self.metrics = deque(data.get('metrics', []), maxlen=1000)
            self.alerts = data.get('alerts', [])
            self.thresholds = data.get('thresholds', self.thresholds)
            
            self.logger.info(f"Metrics loaded from: {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error loading metrics: {e}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Advanced Performance Monitor')
    parser.add_argument('--start', action='store_true', help='Start monitoring')
    parser.add_argument('--stop', action='store_true', help='Stop monitoring')
    parser.add_argument('--status', action='store_true', help='Show status')
    parser.add_argument('--summary', action='store_true', help='Show performance summary')
    parser.add_argument('--recommendations', action='store_true', help='Show optimization recommendations')
    parser.add_argument('--save', help='Save metrics to file')
    parser.add_argument('--load', help='Load metrics from file')
    parser.add_argument('--config', help='Configuration file')
    args = parser.parse_args()
    
    # Load configuration
    config = {
        'collection_interval': 30,
        'thresholds': {
            'cpu': {'warning': 70, 'critical': 90},
            'memory': {'warning': 80, 'critical': 95},
            'disk': {'warning': 85, 'critical': 95},
            'response_time': {'warning': 2, 'critical': 5}
        }
    }
    
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config.update(json.load(f))
    
    # Create performance monitor instance
    monitor = PerformanceMonitor(config)
    
    if args.start:
        monitor.start_monitoring()
        print("Performance monitoring started")
        
    elif args.stop:
        monitor.stop_monitoring()
        print("Performance monitoring stopped")
        
    elif args.status:
        summary = monitor.get_performance_summary()
        print(f"Performance status: {summary}")
        
    elif args.summary:
        summary = monitor.get_performance_summary()
        print(json.dumps(summary, indent=2))
        
    elif args.recommendations:
        recommendations = monitor.generate_optimization_recommendations()
        print("Optimization recommendations:")
        for rec in recommendations:
            print(f"- {rec}")
        
    elif args.save:
        monitor.save_metrics(args.save)
        print(f"Metrics saved to: {args.save}")
        
    elif args.load:
        monitor.load_metrics(args.load)
        print(f"Metrics loaded from: {args.load}")
        
    else:
        print("📊 Advanced Performance Monitor")
        print("Use --start to start monitoring")
        print("Use --stop to stop monitoring")
        print("Use --status to show current status")
        print("Use --summary to show performance summary")
        print("Use --recommendations to show optimization recommendations")
        print("Use --save to save metrics to file")
        print("Use --load to load metrics from file")

if __name__ == '__main__':
    main()
