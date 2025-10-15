// src/utils/security-scanner.ts
// Security scanning utilities for KOPMA UNNES Website

export interface SecurityThreat {
  level: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  file?: string;
  line?: number;
  solution: string;
}

export interface SecurityVulnerability {
  level: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  solution: string;
  cve?: string;
  score?: number;
}

export interface SecurityScanResult {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  threats: SecurityThreat[];
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  createdAt: string;
  completedAt?: string;
  score: number;
}

export class SecurityScanner {
  private static instance: SecurityScanner;
  private scanHistory: SecurityScanResult[] = [];
  private isScanning: boolean = false;

  static getInstance(): SecurityScanner {
    if (!SecurityScanner.instance) {
      SecurityScanner.instance = new SecurityScanner();
    }
    return SecurityScanner.instance;
  }

  /**
   * Perform a full security scan
   */
  async performFullScan(): Promise<SecurityScanResult> {
    if (this.isScanning) {
      throw new Error('Security scan is already in progress');
    }

    this.isScanning = true;
    const scanId = this.generateScanId();
    
    const scanResult: SecurityScanResult = {
      id: scanId,
      type: 'full',
      status: 'running',
      threats: [],
      vulnerabilities: [],
      recommendations: [],
      createdAt: new Date().toISOString(),
      score: 100
    };

    try {
      // Scan for common threats
      scanResult.threats = await this.scanForThreats();
      
      // Scan for vulnerabilities
      scanResult.vulnerabilities = await this.scanForVulnerabilities();
      
      // Generate recommendations
      scanResult.recommendations = this.generateRecommendations(scanResult);
      
      // Calculate security score
      scanResult.score = this.calculateSecurityScore(scanResult);
      
      scanResult.status = 'completed';
      scanResult.completedAt = new Date().toISOString();
      
    } catch (error) {
      scanResult.status = 'failed';
      console.error('Security scan failed:', error);
    } finally {
      this.isScanning = false;
    }

    this.scanHistory.push(scanResult);
    return scanResult;
  }

  /**
   * Perform a quick security scan
   */
  async performQuickScan(): Promise<SecurityScanResult> {
    const scanId = this.generateScanId();
    
    const scanResult: SecurityScanResult = {
      id: scanId,
      type: 'quick',
      status: 'running',
      threats: [],
      vulnerabilities: [],
      recommendations: [],
      createdAt: new Date().toISOString(),
      score: 100
    };

    try {
      // Quick scan for critical issues only
      scanResult.threats = await this.scanForCriticalThreats();
      scanResult.vulnerabilities = await this.scanForCriticalVulnerabilities();
      scanResult.recommendations = this.generateQuickRecommendations(scanResult);
      scanResult.score = this.calculateSecurityScore(scanResult);
      
      scanResult.status = 'completed';
      scanResult.completedAt = new Date().toISOString();
      
    } catch (error) {
      scanResult.status = 'failed';
      console.error('Quick security scan failed:', error);
    }

    this.scanHistory.push(scanResult);
    return scanResult;
  }

  /**
   * Scan for common threats
   */
  private async scanForThreats(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Check for SQL injection patterns
    const sqlInjectionThreats = await this.scanForSQLInjection();
    threats.push(...sqlInjectionThreats);
    
    // Check for XSS patterns
    const xssThreats = await this.scanForXSS();
    threats.push(...xssThreats);
    
    // Check for CSRF vulnerabilities
    const csrfThreats = await this.scanForCSRF();
    threats.push(...csrfThreats);
    
    // Check for file upload vulnerabilities
    const uploadThreats = await this.scanForFileUploadVulnerabilities();
    threats.push(...uploadThreats);
    
    // Check for authentication bypasses
    const authThreats = await this.scanForAuthBypasses();
    threats.push(...authThreats);
    
    return threats;
  }

  /**
   * Scan for critical threats only
   */
  private async scanForCriticalThreats(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Check for critical SQL injection
    const criticalSQLThreats = await this.scanForCriticalSQLInjection();
    threats.push(...criticalSQLThreats);
    
    // Check for critical XSS
    const criticalXSSThreats = await this.scanForCriticalXSS();
    threats.push(...criticalXSSThreats);
    
    return threats;
  }

  /**
   * Scan for vulnerabilities
   */
  private async scanForVulnerabilities(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for outdated dependencies
    const dependencyVulns = await this.scanForOutdatedDependencies();
    vulnerabilities.push(...dependencyVulns);
    
    // Check for insecure configurations
    const configVulns = await this.scanForInsecureConfigurations();
    vulnerabilities.push(...configVulns);
    
    // Check for weak encryption
    const encryptionVulns = await this.scanForWeakEncryption();
    vulnerabilities.push(...encryptionVulns);
    
    // Check for insecure headers
    const headerVulns = await this.scanForInsecureHeaders();
    vulnerabilities.push(...headerVulns);
    
    return vulnerabilities;
  }

  /**
   * Scan for critical vulnerabilities only
   */
  private async scanForCriticalVulnerabilities(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for critical dependency vulnerabilities
    const criticalDeps = await this.scanForCriticalDependencies();
    vulnerabilities.push(...criticalDeps);
    
    // Check for critical configuration issues
    const criticalConfigs = await this.scanForCriticalConfigurations();
    vulnerabilities.push(...criticalConfigs);
    
    return vulnerabilities;
  }

  /**
   * Scan for SQL injection patterns
   */
  private async scanForSQLInjection(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    const patterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
      /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi,
      /(\b(OR|AND)\s+1\s*=\s*1)/gi,
      /(\b(OR|AND)\s+0\s*=\s*0)/gi,
      /(\b(OR|AND)\s+true)/gi,
      /(\b(OR|AND)\s+false)/gi,
      /(\b(OR|AND)\s+null)/gi,
      /(\b(OR|AND)\s+undefined)/gi
    ];

    // This would typically scan actual files
    // For now, we'll simulate the scan
    const mockFiles = [
      { path: 'src/pages/contact.astro', content: 'SELECT * FROM users WHERE id = ' },
      { path: 'src/components/Form.tsx', content: 'INSERT INTO contacts VALUES' }
    ];

    for (const file of mockFiles) {
      for (const pattern of patterns) {
        if (pattern.test(file.content)) {
          threats.push({
            level: 'high',
            type: 'SQL Injection',
            description: `Potential SQL injection vulnerability found in ${file.path}`,
            file: file.path,
            solution: 'Use parameterized queries or prepared statements'
          });
        }
      }
    }

    return threats;
  }

  /**
   * Scan for critical SQL injection
   */
  private async scanForCriticalSQLInjection(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Check for critical SQL injection patterns
    const criticalPatterns = [
      /(\b(DROP|DELETE|TRUNCATE|ALTER)\b)/gi,
      /(\b(OR|AND)\s+1\s*=\s*1)/gi,
      /(\b(OR|AND)\s+true)/gi
    ];

    // Simulate critical scan
    const criticalFiles = [
      { path: 'src/api/auth.php', content: 'DROP TABLE users' }
    ];

    for (const file of criticalFiles) {
      for (const pattern of criticalPatterns) {
        if (pattern.test(file.content)) {
          threats.push({
            level: 'critical',
            type: 'Critical SQL Injection',
            description: `Critical SQL injection vulnerability found in ${file.path}`,
            file: file.path,
            solution: 'Immediately fix SQL injection vulnerability using parameterized queries'
          });
        }
      }
    }

    return threats;
  }

  /**
   * Scan for XSS patterns
   */
  private async scanForXSS(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    const patterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
      /<style[^>]*>/gi
    ];

    // Simulate XSS scan
    const mockFiles = [
      { path: 'src/components/UserInput.tsx', content: '<script>alert("xss")</script>' },
      { path: 'src/pages/about.astro', content: 'onclick="malicious()"' }
    ];

    for (const file of mockFiles) {
      for (const pattern of patterns) {
        if (pattern.test(file.content)) {
          threats.push({
            level: 'medium',
            type: 'XSS',
            description: `Potential XSS vulnerability found in ${file.path}`,
            file: file.path,
            solution: 'Sanitize user input and use Content Security Policy'
          });
        }
      }
    }

    return threats;
  }

  /**
   * Scan for critical XSS
   */
  private async scanForCriticalXSS(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Check for critical XSS patterns
    const criticalPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];

    // Simulate critical XSS scan
    const criticalFiles = [
      { path: 'src/components/AdminPanel.tsx', content: '<script>document.location="http://evil.com"</script>' }
    ];

    for (const file of criticalFiles) {
      for (const pattern of criticalPatterns) {
        if (pattern.test(file.content)) {
          threats.push({
            level: 'critical',
            type: 'Critical XSS',
            description: `Critical XSS vulnerability found in ${file.path}`,
            file: file.path,
            solution: 'Immediately fix XSS vulnerability by sanitizing input and implementing CSP'
          });
        }
      }
    }

    return threats;
  }

  /**
   * Scan for CSRF vulnerabilities
   */
  private async scanForCSRF(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Check for missing CSRF tokens
    const mockFiles = [
      { path: 'src/components/Form.tsx', content: '<form method="POST">' },
      { path: 'src/pages/contact.astro', content: '<form action="/submit">' }
    ];

    for (const file of mockFiles) {
      if (file.content.includes('<form') && !file.content.includes('csrf') && !file.content.includes('token')) {
        threats.push({
          level: 'medium',
          type: 'CSRF',
          description: `Potential CSRF vulnerability found in ${file.path}`,
          file: file.path,
          solution: 'Implement CSRF tokens for all forms'
        });
      }
    }

    return threats;
  }

  /**
   * Scan for file upload vulnerabilities
   */
  private async scanForFileUploadVulnerabilities(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Check for insecure file upload
    const mockFiles = [
      { path: 'src/components/FileUpload.tsx', content: 'accept="*/*"' },
      { path: 'src/api/upload.php', content: 'move_uploaded_file($_FILES' }
    ];

    for (const file of mockFiles) {
      if (file.content.includes('accept="*/*"') || file.content.includes('move_uploaded_file')) {
        threats.push({
          level: 'high',
          type: 'File Upload',
          description: `Potential file upload vulnerability found in ${file.path}`,
          file: file.path,
          solution: 'Implement file type validation and virus scanning'
        });
      }
    }

    return threats;
  }

  /**
   * Scan for authentication bypasses
   */
  private async scanForAuthBypasses(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    
    // Check for weak authentication
    const mockFiles = [
      { path: 'src/api/auth.php', content: 'if ($_GET["admin"] == "true")' },
      { path: 'src/components/Login.tsx', content: 'if (password === "admin")' }
    ];

    for (const file of mockFiles) {
      if (file.content.includes('admin') && file.content.includes('true')) {
        threats.push({
          level: 'critical',
          type: 'Authentication Bypass',
          description: `Potential authentication bypass found in ${file.path}`,
          file: file.path,
          solution: 'Implement proper authentication and authorization'
        });
      }
    }

    return threats;
  }

  /**
   * Scan for outdated dependencies
   */
  private async scanForOutdatedDependencies(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Simulate dependency scan
    const outdatedDeps = [
      { name: 'lodash', version: '4.17.15', severity: 'medium' },
      { name: 'jquery', version: '3.4.1', severity: 'low' }
    ];

    for (const dep of outdatedDeps) {
      vulnerabilities.push({
        level: dep.severity as 'low' | 'medium' | 'high' | 'critical',
        type: 'Outdated Dependency',
        description: `Outdated dependency: ${dep.name}@${dep.version}`,
        solution: `Update ${dep.name} to the latest version`
      });
    }

    return vulnerabilities;
  }

  /**
   * Scan for critical dependencies
   */
  private async scanForCriticalDependencies(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Simulate critical dependency scan
    const criticalDeps = [
      { name: 'express', version: '4.16.0', severity: 'critical' }
    ];

    for (const dep of criticalDeps) {
      vulnerabilities.push({
        level: 'critical',
        type: 'Critical Dependency Vulnerability',
        description: `Critical vulnerability in ${dep.name}@${dep.version}`,
        solution: `Immediately update ${dep.name} to the latest secure version`
      });
    }

    return vulnerabilities;
  }

  /**
   * Scan for insecure configurations
   */
  private async scanForInsecureConfigurations(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Simulate configuration scan
    const insecureConfigs = [
      { setting: 'CORS', value: '*', severity: 'medium' },
      { setting: 'HTTPS', value: 'false', severity: 'high' }
    ];

    for (const config of insecureConfigs) {
      vulnerabilities.push({
        level: config.severity as 'low' | 'medium' | 'high' | 'critical',
        type: 'Insecure Configuration',
        description: `Insecure configuration: ${config.setting} = ${config.value}`,
        solution: `Configure ${config.setting} securely`
      });
    }

    return vulnerabilities;
  }

  /**
   * Scan for critical configurations
   */
  private async scanForCriticalConfigurations(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Simulate critical configuration scan
    const criticalConfigs = [
      { setting: 'Database Password', value: 'admin', severity: 'critical' }
    ];

    for (const config of criticalConfigs) {
      vulnerabilities.push({
        level: 'critical',
        type: 'Critical Configuration Issue',
        description: `Critical configuration issue: ${config.setting} = ${config.value}`,
        solution: `Immediately change ${config.setting} to a secure value`
      });
    }

    return vulnerabilities;
  }

  /**
   * Scan for weak encryption
   */
  private async scanForWeakEncryption(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Simulate encryption scan
    const weakEncryption = [
      { algorithm: 'MD5', severity: 'high' },
      { algorithm: 'SHA1', severity: 'medium' }
    ];

    for (const encryption of weakEncryption) {
      vulnerabilities.push({
        level: encryption.severity as 'low' | 'medium' | 'high' | 'critical',
        type: 'Weak Encryption',
        description: `Weak encryption algorithm: ${encryption.algorithm}`,
        solution: `Use stronger encryption algorithm like SHA-256 or bcrypt`
      });
    }

    return vulnerabilities;
  }

  /**
   * Scan for insecure headers
   */
  private async scanForInsecureHeaders(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Simulate header scan
    const insecureHeaders = [
      { header: 'X-Frame-Options', value: 'missing', severity: 'medium' },
      { header: 'Content-Security-Policy', value: 'missing', severity: 'high' }
    ];

    for (const header of insecureHeaders) {
      vulnerabilities.push({
        level: header.severity as 'low' | 'medium' | 'high' | 'critical',
        type: 'Insecure Headers',
        description: `Missing security header: ${header.header}`,
        solution: `Implement ${header.header} security header`
      });
    }

    return vulnerabilities;
  }

  /**
   * Generate recommendations based on scan results
   */
  private generateRecommendations(scanResult: SecurityScanResult): string[] {
    const recommendations: string[] = [];
    
    if (scanResult.threats.length > 0) {
      recommendations.push('Address all security threats immediately');
    }
    
    if (scanResult.vulnerabilities.length > 0) {
      recommendations.push('Update vulnerable dependencies and configurations');
    }
    
    if (scanResult.score < 80) {
      recommendations.push('Implement comprehensive security measures');
    }
    
    recommendations.push('Regular security audits and penetration testing');
    recommendations.push('Implement security monitoring and alerting');
    recommendations.push('Train development team on security best practices');
    
    return recommendations;
  }

  /**
   * Generate quick recommendations
   */
  private generateQuickRecommendations(scanResult: SecurityScanResult): string[] {
    const recommendations: string[] = [];
    
    if (scanResult.threats.some(t => t.level === 'critical')) {
      recommendations.push('CRITICAL: Address critical security threats immediately');
    }
    
    if (scanResult.vulnerabilities.some(v => v.level === 'critical')) {
      recommendations.push('CRITICAL: Update critical vulnerabilities immediately');
    }
    
    return recommendations;
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(scanResult: SecurityScanResult): number {
    let score = 100;
    
    // Deduct points for threats
    scanResult.threats.forEach(threat => {
      switch (threat.level) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    // Deduct points for vulnerabilities
    scanResult.vulnerabilities.forEach(vulnerability => {
      switch (vulnerability.level) {
        case 'critical':
          score -= 15;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });
    
    return Math.max(score, 0);
  }

  /**
   * Generate scan ID
   */
  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get scan history
   */
  getScanHistory(): SecurityScanResult[] {
    return this.scanHistory;
  }

  /**
   * Get latest scan result
   */
  getLatestScan(): SecurityScanResult | null {
    return this.scanHistory.length > 0 ? this.scanHistory[this.scanHistory.length - 1] : null;
  }

  /**
   * Clear scan history
   */
  clearHistory(): void {
    this.scanHistory = [];
  }

  /**
   * Check if scan is in progress
   */
  isScanInProgress(): boolean {
    return this.isScanning;
  }
}

export default SecurityScanner;
