/**
 * Advanced Security Scanner for KOPMA UNNES Website
 * Comprehensive security monitoring and threat detection
 */

interface SecurityScanConfig {
  scanInterval: number; // minutes
  deepScan: boolean;
  realTimeMonitoring: boolean;
  threatIntelligence: boolean;
  autoBlocking: boolean;
}

interface SecurityThreat {
  id: string;
  type: 'malware' | 'injection' | 'xss' | 'csrf' | 'brute_force' | 'ddos' | 'phishing' | 'backdoor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  timestamp: Date;
  blocked: boolean;
  metadata: Record<string, any>;
}

interface ScanResult {
  id: string;
  timestamp: Date;
  threats: SecurityThreat[];
  summary: {
    totalThreats: number;
    criticalThreats: number;
    highThreats: number;
    mediumThreats: number;
    lowThreats: number;
    blockedThreats: number;
  };
  recommendations: string[];
}

interface MalwarePattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

class SecurityScanner {
  private config: SecurityScanConfig;
  private scanResults: ScanResult[] = [];
  private threats: SecurityThreat[] = [];
  private scanInterval: NodeJS.Timeout | null = null;
  private malwarePatterns: MalwarePattern[] = [];

  constructor(config: SecurityScanConfig) {
    this.config = config;
    this.initializeMalwarePatterns();
  }

  private initializeMalwarePatterns(): void {
    this.malwarePatterns = [
      // PHP Backdoors
      {
        name: 'PHP Backdoor - eval()',
        pattern: /eval\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[/g,
        severity: 'critical',
        description: 'PHP backdoor using eval() function'
      },
      {
        name: 'PHP Backdoor - assert()',
        pattern: /assert\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[/g,
        severity: 'critical',
        description: 'PHP backdoor using assert() function'
      },
      {
        name: 'PHP Backdoor - system()',
        pattern: /system\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[/g,
        severity: 'critical',
        description: 'PHP backdoor using system() function'
      },
      {
        name: 'PHP Backdoor - shell_exec()',
        pattern: /shell_exec\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[/g,
        severity: 'critical',
        description: 'PHP backdoor using shell_exec() function'
      },
      {
        name: 'PHP Backdoor - exec()',
        pattern: /exec\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[/g,
        severity: 'critical',
        description: 'PHP backdoor using exec() function'
      },
      {
        name: 'PHP Backdoor - passthru()',
        pattern: /passthru\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)\[/g,
        severity: 'critical',
        description: 'PHP backdoor using passthru() function'
      },

      // Obfuscated Code
      {
        name: 'Obfuscated Code - base64_decode',
        pattern: /eval\s*\(\s*base64_decode/g,
        severity: 'high',
        description: 'Obfuscated code using base64_decode'
      },
      {
        name: 'Obfuscated Code - gzinflate',
        pattern: /eval\s*\(\s*gzinflate/g,
        severity: 'high',
        description: 'Obfuscated code using gzinflate'
      },
      {
        name: 'Obfuscated Code - str_rot13',
        pattern: /eval\s*\(\s*str_rot13/g,
        severity: 'high',
        description: 'Obfuscated code using str_rot13'
      },

      // Gambling Content
      {
        name: 'Gambling Content - Slot Gacor',
        pattern: /slot\s*gacor/gi,
        severity: 'medium',
        description: 'Gambling content detected'
      },
      {
        name: 'Gambling Content - Judi Online',
        pattern: /judi\s*online/gi,
        severity: 'medium',
        description: 'Online gambling content detected'
      },
      {
        name: 'Gambling Content - Togel',
        pattern: /togel/gi,
        severity: 'medium',
        description: 'Togel gambling content detected'
      },

      // Suspicious Functions
      {
        name: 'Suspicious Function - include()',
        pattern: /@?include\s*\(\s*["\']https?:\/\//g,
        severity: 'high',
        description: 'Suspicious include() with remote URL'
      },
      {
        name: 'Suspicious Function - require()',
        pattern: /@?require\s*\(\s*["\']https?:\/\//g,
        severity: 'high',
        description: 'Suspicious require() with remote URL'
      },
      {
        name: 'Suspicious Function - fsockopen()',
        pattern: /fsockopen\s*\(/g,
        severity: 'medium',
        description: 'Suspicious fsockopen() function'
      },
      {
        name: 'Suspicious Function - popen()',
        pattern: /popen\s*\(/g,
        severity: 'medium',
        description: 'Suspicious popen() function'
      },

      // File Inclusions
      {
        name: 'Suspicious File - wp-*.php',
        pattern: /wp-[a-z0-9]+\.php/g,
        severity: 'low',
        description: 'Suspicious WordPress file'
      },
      {
        name: 'Suspicious File - .php.suspected',
        pattern: /\.php\.suspected/g,
        severity: 'high',
        description: 'Suspected PHP file'
      },
      {
        name: 'Suspicious File - .bak',
        pattern: /\.bak$/g,
        severity: 'low',
        description: 'Backup file detected'
      }
    ];
  }

  // Start security scanning
  async start(): Promise<void> {
    console.log('🔒 Starting security scanner...');

    // Perform initial scan
    await this.performScan();

    // Start scan interval
    if (this.config.scanInterval > 0) {
      this.scanInterval = setInterval(async () => {
        await this.performScan();
      }, this.config.scanInterval * 60 * 1000);
    }

    console.log('✅ Security scanner started');
  }

  // Stop security scanning
  async stop(): Promise<void> {
    console.log('🛑 Stopping security scanner...');

    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }

    console.log('✅ Security scanner stopped');
  }

  // Perform security scan
  async performScan(): Promise<ScanResult> {
    console.log('🔍 Performing security scan...');

    const scanId = this.generateScanId();
    const timestamp = new Date();
    const threats: SecurityThreat[] = [];

    try {
      // Scan for malware
      const malwareThreats = await this.scanForMalware();
      threats.push(...malwareThreats);

      // Scan for injection attempts
      const injectionThreats = await this.scanForInjection();
      threats.push(...injectionThreats);

      // Scan for XSS attempts
      const xssThreats = await this.scanForXSS();
      threats.push(...xssThreats);

      // Scan for CSRF attempts
      const csrfThreats = await this.scanForCSRF();
      threats.push(...csrfThreats);

      // Scan for brute force attempts
      const bruteForceThreats = await this.scanForBruteForce();
      threats.push(...bruteForceThreats);

      // Scan for DDoS attempts
      const ddosThreats = await this.scanForDDoS();
      threats.push(...ddosThreats);

      // Scan for phishing attempts
      const phishingThreats = await this.scanForPhishing();
      threats.push(...phishingThreats);

      // Scan for backdoors
      const backdoorThreats = await this.scanForBackdoors();
      threats.push(...backdoorThreats);

      // Create scan result
      const scanResult: ScanResult = {
        id: scanId,
        timestamp,
        threats,
        summary: this.calculateSummary(threats),
        recommendations: this.generateRecommendations(threats)
      };

      // Store results
      this.scanResults.push(scanResult);
      this.threats.push(...threats);

      // Keep only last 100 scan results
      if (this.scanResults.length > 100) {
        this.scanResults = this.scanResults.slice(-100);
      }

      // Keep only last 1000 threats
      if (this.threats.length > 1000) {
        this.threats = this.threats.slice(-1000);
      }

      console.log(`✅ Security scan completed. Found ${threats.length} threats.`);
      return scanResult;
    } catch (error) {
      console.error('❌ Error during security scan:', error);
      throw error;
    }
  }

  // Scan for malware
  private async scanForMalware(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // This would scan actual files in a real implementation
    // For now, we'll simulate scanning
    const filesToScan = [
      '/var/www/html/index.php',
      '/var/www/html/wp-config.php',
      '/var/www/html/wp-content/themes/theme/functions.php'
    ];

    for (const file of filesToScan) {
      // Simulate file content scanning
      const fileContent = await this.readFileContent(file);
      
      for (const pattern of this.malwarePatterns) {
        if (pattern.pattern.test(fileContent)) {
          const threat: SecurityThreat = {
            id: this.generateThreatId(),
            type: 'malware',
            severity: pattern.severity,
            source: 'file_scan',
            target: file,
            description: pattern.description,
            timestamp: new Date(),
            blocked: false,
            metadata: {
              pattern: pattern.name,
              file: file,
              match: pattern.pattern.source
            }
          };
          
          threats.push(threat);
        }
      }
    }

    return threats;
  }

  // Scan for injection attempts
  private async scanForInjection(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // This would analyze request logs in a real implementation
    const injectionPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i
    ];

    // Simulate analyzing recent requests
    const recentRequests = await this.getRecentRequests();
    
    for (const request of recentRequests) {
      for (const pattern of injectionPatterns) {
        if (pattern.test(request.query) || pattern.test(request.body)) {
          const threat: SecurityThreat = {
            id: this.generateThreatId(),
            type: 'injection',
            severity: 'critical',
            source: request.ip,
            target: request.path,
            description: 'SQL injection attempt detected',
            timestamp: new Date(),
            blocked: true,
            metadata: {
              pattern: pattern.source,
              query: request.query,
              body: request.body
            }
          };
          
          threats.push(threat);
        }
      }
    }

    return threats;
  }

  // Scan for XSS attempts
  private async scanForXSS(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi
    ];

    const recentRequests = await this.getRecentRequests();
    
    for (const request of recentRequests) {
      for (const pattern of xssPatterns) {
        if (pattern.test(request.query) || pattern.test(request.body)) {
          const threat: SecurityThreat = {
            id: this.generateThreatId(),
            type: 'xss',
            severity: 'high',
            source: request.ip,
            target: request.path,
            description: 'XSS attempt detected',
            timestamp: new Date(),
            blocked: true,
            metadata: {
              pattern: pattern.source,
              query: request.query,
              body: request.body
            }
          };
          
          threats.push(threat);
        }
      }
    }

    return threats;
  }

  // Scan for CSRF attempts
  private async scanForCSRF(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // This would analyze CSRF tokens and referer headers
    const recentRequests = await this.getRecentRequests();
    
    for (const request of recentRequests) {
      if (request.method === 'POST' && !request.csrfToken) {
        const threat: SecurityThreat = {
          id: this.generateThreatId(),
          type: 'csrf',
          severity: 'medium',
          source: request.ip,
          target: request.path,
          description: 'Potential CSRF attack - missing CSRF token',
          timestamp: new Date(),
          blocked: false,
          metadata: {
            method: request.method,
            referer: request.referer
          }
        };
        
        threats.push(threat);
      }
    }

    return threats;
  }

  // Scan for brute force attempts
  private async scanForBruteForce(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Analyze login attempts
    const loginAttempts = await this.getLoginAttempts();
    const ipAttempts = new Map<string, number>();
    
    for (const attempt of loginAttempts) {
      const count = ipAttempts.get(attempt.ip) || 0;
      ipAttempts.set(attempt.ip, count + 1);
    }
    
    for (const [ip, count] of ipAttempts) {
      if (count > 10) { // More than 10 attempts
        const threat: SecurityThreat = {
          id: this.generateThreatId(),
          type: 'brute_force',
          severity: 'high',
          source: ip,
          target: 'login',
          description: `Brute force attack detected: ${count} attempts`,
          timestamp: new Date(),
          blocked: true,
          metadata: {
            attemptCount: count,
            timeWindow: '1 hour'
          }
        };
        
        threats.push(threat);
      }
    }

    return threats;
  }

  // Scan for DDoS attempts
  private async scanForDDoS(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Analyze request frequency
    const recentRequests = await this.getRecentRequests();
    const ipFrequency = new Map<string, number>();
    
    for (const request of recentRequests) {
      const count = ipFrequency.get(request.ip) || 0;
      ipFrequency.set(request.ip, count + 1);
    }
    
    for (const [ip, count] of ipFrequency) {
      if (count > 100) { // More than 100 requests
        const threat: SecurityThreat = {
          id: this.generateThreatId(),
          type: 'ddos',
          severity: 'critical',
          source: ip,
          target: 'website',
          description: `DDoS attack detected: ${count} requests`,
          timestamp: new Date(),
          blocked: true,
          metadata: {
            requestCount: count,
            timeWindow: '1 hour'
          }
        };
        
        threats.push(threat);
      }
    }

    return threats;
  }

  // Scan for phishing attempts
  private async scanForPhishing(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    const phishingPatterns = [
      /phishing/gi,
      /fake\s+login/gi,
      /credential\s+stealing/gi,
      /suspicious\s+link/gi
    ];

    const recentRequests = await this.getRecentRequests();
    
    for (const request of recentRequests) {
      for (const pattern of phishingPatterns) {
        if (pattern.test(request.query) || pattern.test(request.body)) {
          const threat: SecurityThreat = {
            id: this.generateThreatId(),
            type: 'phishing',
            severity: 'high',
            source: request.ip,
            target: request.path,
            description: 'Phishing attempt detected',
            timestamp: new Date(),
            blocked: true,
            metadata: {
              pattern: pattern.source,
              query: request.query,
              body: request.body
            }
          };
          
          threats.push(threat);
        }
      }
    }

    return threats;
  }

  // Scan for backdoors
  private async scanForBackdoors(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    const backdoorPatterns = [
      /backdoor/gi,
      /shell\s+access/gi,
      /remote\s+execution/gi,
      /unauthorized\s+access/gi
    ];

    const recentRequests = await this.getRecentRequests();
    
    for (const request of recentRequests) {
      for (const pattern of backdoorPatterns) {
        if (pattern.test(request.query) || pattern.test(request.body)) {
          const threat: SecurityThreat = {
            id: this.generateThreatId(),
            type: 'backdoor',
            severity: 'critical',
            source: request.ip,
            target: request.path,
            description: 'Backdoor attempt detected',
            timestamp: new Date(),
            blocked: true,
            metadata: {
              pattern: pattern.source,
              query: request.query,
              body: request.body
            }
          };
          
          threats.push(threat);
        }
      }
    }

    return threats;
  }

  // Helper methods
  private async readFileContent(filePath: string): Promise<string> {
    // This would read actual file content in a real implementation
    return 'Simulated file content';
  }

  private async getRecentRequests(): Promise<any[]> {
    // This would get actual request logs in a real implementation
    return [];
  }

  private async getLoginAttempts(): Promise<any[]> {
    // This would get actual login attempts in a real implementation
    return [];
  }

  private calculateSummary(threats: SecurityThreat[]): ScanResult['summary'] {
    return {
      totalThreats: threats.length,
      criticalThreats: threats.filter(t => t.severity === 'critical').length,
      highThreats: threats.filter(t => t.severity === 'high').length,
      mediumThreats: threats.filter(t => t.severity === 'medium').length,
      lowThreats: threats.filter(t => t.severity === 'low').length,
      blockedThreats: threats.filter(t => t.blocked).length
    };
  }

  private generateRecommendations(threats: SecurityThreat[]): string[] {
    const recommendations: string[] = [];
    
    if (threats.some(t => t.type === 'malware')) {
      recommendations.push('Remove malware files immediately');
    }
    
    if (threats.some(t => t.type === 'injection')) {
      recommendations.push('Implement SQL injection protection');
    }
    
    if (threats.some(t => t.type === 'xss')) {
      recommendations.push('Implement XSS protection');
    }
    
    if (threats.some(t => t.type === 'brute_force')) {
      recommendations.push('Implement rate limiting for login attempts');
    }
    
    if (threats.some(t => t.type === 'ddos')) {
      recommendations.push('Implement DDoS protection');
    }
    
    return recommendations;
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get scan results
  getScanResults(): ScanResult[] {
    return [...this.scanResults];
  }

  // Get threats
  getThreats(): SecurityThreat[] {
    return [...this.threats];
  }

  // Get threats by type
  getThreatsByType(type: string): SecurityThreat[] {
    return this.threats.filter(t => t.type === type);
  }

  // Get threats by severity
  getThreatsBySeverity(severity: string): SecurityThreat[] {
    return this.threats.filter(t => t.severity === severity);
  }

  // Get statistics
  getStatistics(): any {
    const totalThreats = this.threats.length;
    const blockedThreats = this.threats.filter(t => t.blocked).length;
    const criticalThreats = this.threats.filter(t => t.severity === 'critical').length;
    
    return {
      totalThreats,
      blockedThreats,
      criticalThreats,
      blockRate: (blockedThreats / totalThreats) * 100,
      lastScan: this.scanResults[this.scanResults.length - 1]?.timestamp
    };
  }
}

export default SecurityScanner;
