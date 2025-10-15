/**
 * Advanced Anomaly Detection System for KOPMA UNNES Website
 * AI-powered threat detection and security monitoring
 */

interface AnomalyPatterns {
  suspiciousAccess: {
    patterns: RegExp[];
    thresholds: number[];
  };
  performanceIssues: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  securityThreats: {
    injectionAttempts: RegExp[];
    bruteForce: number;
    suspiciousIPs: string[];
  };
}

interface Anomaly {
  id: string;
  type: 'suspicious_access' | 'performance_issue' | 'security_threat' | 'network_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  source: string;
  metadata: Record<string, any>;
  resolved: boolean;
}

interface AccessLog {
  timestamp: Date;
  ip: string;
  method: string;
  path: string;
  status: number;
  userAgent: string;
  referer?: string;
  responseTime: number;
}

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
  errorRate: number;
}

interface SecurityThreat {
  type: 'injection' | 'brute_force' | 'ddos' | 'malware' | 'phishing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  timestamp: Date;
  blocked: boolean;
}

class AnomalyDetector {
  private patterns: AnomalyPatterns;
  private anomalies: Anomaly[] = [];
  private accessLogs: AccessLog[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private securityThreats: SecurityThreat[] = [];
  private detectionInterval: any | null = null;

  constructor(patterns: AnomalyPatterns) {
    this.patterns = patterns;
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Initialize suspicious access patterns
    this.patterns.suspiciousAccess.patterns = [
      /\/wp-admin\/wp-login\.php/i,
      /\/admin\/login/i,
      /\/phpmyadmin/i,
      /\/\.env/i,
      /\/config\.php/i,
      /\/backup/i,
      /\/\.git/i,
      /\/\.svn/i,
      /\/\.htaccess/i,
      /\/wp-config\.php/i
    ];

    // Initialize injection attempt patterns
    this.patterns.securityThreats.injectionAttempts = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i,
      /script\s*>/i,
      /javascript:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
  }

  // Start anomaly detection
  async start(): Promise<void> {
    console.log('🔍 Starting anomaly detection system...');

    // Start detection interval
    this.detectionInterval = setInterval(async () => {
      await this.performDetection();
    }, 30 * 1000); // Every 30 seconds

    console.log('✅ Anomaly detection system started');
  }

  // Stop anomaly detection
  async stop(): Promise<void> {
    console.log('🛑 Stopping anomaly detection system...');

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    console.log('✅ Anomaly detection system stopped');
  }

  // Perform detection
  private async performDetection(): Promise<void> {
    try {
      // Detect suspicious access patterns
      await this.detectSuspiciousAccess();
      
      // Monitor performance anomalies
      await this.detectPerformanceIssues();
      
      // Detect security threats
      await this.detectSecurityThreats();
      
      // Detect network anomalies
      await this.detectNetworkAnomalies();
    } catch (error) {
      console.error('❌ Error during anomaly detection:', error);
    }
  }

  // Detect suspicious access patterns
  async detectSuspiciousAccess(logs: AccessLog[] = this.accessLogs): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    for (const log of logs) {
      // Check for suspicious paths
      for (const pattern of this.patterns.suspiciousAccess.patterns) {
        if (pattern.test(log.path)) {
          const anomaly: Anomaly = {
            id: this.generateAnomalyId(),
            type: 'suspicious_access',
            severity: 'high',
            description: `Suspicious access to ${log.path} from ${log.ip}`,
            timestamp: log.timestamp,
            source: log.ip,
            metadata: {
              path: log.path,
              method: log.method,
              userAgent: log.userAgent,
              status: log.status
            },
            resolved: false
          };
          
          anomalies.push(anomaly);
          this.anomalies.push(anomaly);
        }
      }

      // Check for brute force attempts
      const recentAttempts = logs.filter(l => 
        l.ip === log.ip && 
        l.timestamp.getTime() - log.timestamp.getTime() < 300000 // 5 minutes
      ).length;

      if (recentAttempts > this.patterns.suspiciousAccess.thresholds[0]) {
        const anomaly: Anomaly = {
          id: this.generateAnomalyId(),
          type: 'suspicious_access',
          severity: 'critical',
          description: `Brute force attempt detected from ${log.ip} (${recentAttempts} attempts)`,
          timestamp: log.timestamp,
          source: log.ip,
          metadata: {
            attemptCount: recentAttempts,
            timeWindow: '5 minutes'
          },
          resolved: false
        };
        
        anomalies.push(anomaly);
        this.anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  // Monitor performance anomalies
  async detectPerformanceIssues(metrics: PerformanceMetrics[] = this.performanceMetrics): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    for (const metric of metrics) {
      // Check response time
      if (metric.responseTime > this.patterns.performanceIssues.responseTime) {
        const anomaly: Anomaly = {
          id: this.generateAnomalyId(),
          type: 'performance_issue',
          severity: 'medium',
          description: `High response time detected: ${metric.responseTime}ms`,
          timestamp: new Date(),
          source: 'performance_monitor',
          metadata: {
            responseTime: metric.responseTime,
            threshold: this.patterns.performanceIssues.responseTime
          },
          resolved: false
        };
        
        anomalies.push(anomaly);
        this.anomalies.push(anomaly);
      }

      // Check memory usage
      if (metric.memoryUsage > this.patterns.performanceIssues.memoryUsage) {
        const anomaly: Anomaly = {
          id: this.generateAnomalyId(),
          type: 'performance_issue',
          severity: 'high',
          description: `High memory usage detected: ${metric.memoryUsage}%`,
          timestamp: new Date(),
          source: 'performance_monitor',
          metadata: {
            memoryUsage: metric.memoryUsage,
            threshold: this.patterns.performanceIssues.memoryUsage
          },
          resolved: false
        };
        
        anomalies.push(anomaly);
        this.anomalies.push(anomaly);
      }

      // Check CPU usage
      if (metric.cpuUsage > this.patterns.performanceIssues.cpuUsage) {
        const anomaly: Anomaly = {
          id: this.generateAnomalyId(),
          type: 'performance_issue',
          severity: 'high',
          description: `High CPU usage detected: ${metric.cpuUsage}%`,
          timestamp: new Date(),
          source: 'performance_monitor',
          metadata: {
            cpuUsage: metric.cpuUsage,
            threshold: this.patterns.performanceIssues.cpuUsage
          },
          resolved: false
        };
        
        anomalies.push(anomaly);
        this.anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  // Detect security threats
  async detectSecurityThreats(requests: any[] = []): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    for (const request of requests) {
      // Check for injection attempts
      for (const pattern of this.patterns.securityThreats.injectionAttempts) {
        if (pattern.test(request.query) || pattern.test(request.body)) {
          const threat: SecurityThreat = {
            type: 'injection',
            severity: 'critical',
            source: request.ip,
            target: request.path,
            description: `Injection attempt detected: ${pattern.source}`,
            timestamp: new Date(),
            blocked: true
          };
          
          this.securityThreats.push(threat);
          
          const anomaly: Anomaly = {
            id: this.generateAnomalyId(),
            type: 'security_threat',
            severity: 'critical',
            description: `Security threat detected: ${threat.description}`,
            timestamp: new Date(),
            source: request.ip,
            metadata: {
              threatType: threat.type,
              pattern: pattern.source,
              query: request.query,
              body: request.body
            },
            resolved: false
          };
          
          anomalies.push(anomaly);
          this.anomalies.push(anomaly);
        }
      }
    }

    return anomalies;
  }

  // Detect network anomalies
  async detectNetworkAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Check for unusual traffic patterns
    const trafficPatterns = this.analyzeTrafficPatterns();
    
    for (const pattern of trafficPatterns) {
      if (pattern.anomaly) {
        const anomaly: Anomaly = {
          id: this.generateAnomalyId(),
          type: 'network_anomaly',
          severity: pattern.severity,
          description: pattern.description,
          timestamp: new Date(),
          source: 'network_monitor',
          metadata: pattern.metadata,
          resolved: false
        };
        
        anomalies.push(anomaly);
        this.anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  // Analyze traffic patterns
  private analyzeTrafficPatterns(): any[] {
    const patterns: any[] = [];
    
    // Analyze IP frequency
    const ipCounts = new Map<string, number>();
    for (const log of this.accessLogs) {
      const count = ipCounts.get(log.ip) || 0;
      ipCounts.set(log.ip, count + 1);
    }
    
    // Check for DDoS patterns
    for (const [ip, count] of ipCounts) {
      if (count > 100) { // More than 100 requests
        patterns.push({
          anomaly: true,
          severity: 'high',
          description: `Potential DDoS from ${ip}: ${count} requests`,
          metadata: { ip, count, type: 'ddos' }
        });
      }
    }
    
    // Analyze response times
    const avgResponseTime = this.accessLogs.reduce((sum, log) => sum + log.responseTime, 0) / this.accessLogs.length;
    if (avgResponseTime > 5000) { // More than 5 seconds
      patterns.push({
        anomaly: true,
        severity: 'medium',
        description: `High average response time: ${avgResponseTime}ms`,
        metadata: { avgResponseTime, type: 'performance' }
      });
    }
    
    return patterns;
  }

  // Add access log
  addAccessLog(log: AccessLog): void {
    this.accessLogs.push(log);
    
    // Keep only last 10000 logs
    if (this.accessLogs.length > 10000) {
      this.accessLogs = this.accessLogs.slice(-10000);
    }
  }

  // Add performance metrics
  addPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  // Get anomalies
  getAnomalies(): Anomaly[] {
    return [...this.anomalies];
  }

  // Get unresolved anomalies
  getUnresolvedAnomalies(): Anomaly[] {
    return this.anomalies.filter(a => !a.resolved);
  }

  // Get anomalies by type
  getAnomaliesByType(type: string): Anomaly[] {
    return this.anomalies.filter(a => a.type === type);
  }

  // Get anomalies by severity
  getAnomaliesBySeverity(severity: string): Anomaly[] {
    return this.anomalies.filter(a => a.severity === severity);
  }

  // Resolve anomaly
  resolveAnomaly(id: string): boolean {
    const anomaly = this.anomalies.find(a => a.id === id);
    if (anomaly) {
      anomaly.resolved = true;
      return true;
    }
    return false;
  }

  // Get statistics
  getStatistics(): any {
    const totalAnomalies = this.anomalies.length;
    const unresolvedAnomalies = this.anomalies.filter(a => !a.resolved).length;
    const criticalAnomalies = this.anomalies.filter(a => a.severity === 'critical').length;
    const highAnomalies = this.anomalies.filter(a => a.severity === 'high').length;
    
    return {
      totalAnomalies,
      unresolvedAnomalies,
      criticalAnomalies,
      highAnomalies,
      resolutionRate: ((totalAnomalies - unresolvedAnomalies) / totalAnomalies) * 100
    };
  }

  // Generate anomaly ID
  private generateAnomalyId(): string {
    return `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default AnomalyDetector;
