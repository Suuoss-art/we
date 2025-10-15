// src/utils/content-cleaner.ts
// Content cleaning utilities for KOPMA UNNES Website

export interface CleaningOptions {
  removeHtml?: boolean;
  removeScripts?: boolean;
  removeStyles?: boolean;
  removeComments?: boolean;
  removeEmptyTags?: boolean;
  removeAttributes?: boolean;
  sanitizeHtml?: boolean;
  removeMalware?: boolean;
  removeGambling?: boolean;
  removeSpam?: boolean;
  normalizeWhitespace?: boolean;
  removeDuplicateContent?: boolean;
  removeBrokenLinks?: boolean;
  fixEncoding?: boolean;
  removeTracking?: boolean;
}

export interface CleaningResult {
  original: string;
  cleaned: string;
  removed: {
    html: string[];
    scripts: string[];
    styles: string[];
    comments: string[];
    malware: string[];
    gambling: string[];
    spam: string[];
    tracking: string[];
  };
  statistics: {
    originalLength: number;
    cleanedLength: number;
    reductionPercentage: number;
    removedElements: number;
    securityIssues: number;
  };
  warnings: string[];
  errors: string[];
}

export class ContentCleaner {
  private static instance: ContentCleaner;
  private malwarePatterns: RegExp[] = [];
  private gamblingPatterns: RegExp[] = [];
  private spamPatterns: RegExp[] = [];
  private trackingPatterns: RegExp[] = [];

  static getInstance(): ContentCleaner {
    if (!ContentCleaner.instance) {
      ContentCleaner.instance = new ContentCleaner();
    }
    return ContentCleaner.instance;
  }

  constructor() {
    this.initializePatterns();
  }

  /**
   * Clean content with specified options
   */
  async cleanContent(
    content: string,
    options: CleaningOptions = {}
  ): Promise<CleaningResult> {
    const defaultOptions: CleaningOptions = {
      removeHtml: false,
      removeScripts: true,
      removeStyles: true,
      removeComments: true,
      removeEmptyTags: true,
      removeAttributes: false,
      sanitizeHtml: true,
      removeMalware: true,
      removeGambling: true,
      removeSpam: true,
      normalizeWhitespace: true,
      removeDuplicateContent: false,
      removeBrokenLinks: true,
      fixEncoding: true,
      removeTracking: true
    };

    const mergedOptions = { ...defaultOptions, ...options };
    let cleanedContent = content;
    const removed: CleaningResult['removed'] = {
      html: [],
      scripts: [],
      styles: [],
      comments: [],
      malware: [],
      gambling: [],
      spam: [],
      tracking: []
    };
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Remove malware patterns
      if (mergedOptions.removeMalware) {
        const malwareResult = this.removeMalware(cleanedContent);
        cleanedContent = malwareResult.content;
        removed.malware = malwareResult.removed;
      }

      // Remove gambling content
      if (mergedOptions.removeGambling) {
        const gamblingResult = this.removeGambling(cleanedContent);
        cleanedContent = gamblingResult.content;
        removed.gambling = gamblingResult.removed;
      }

      // Remove spam content
      if (mergedOptions.removeSpam) {
        const spamResult = this.removeSpam(cleanedContent);
        cleanedContent = spamResult.content;
        removed.spam = spamResult.removed;
      }

      // Remove tracking code
      if (mergedOptions.removeTracking) {
        const trackingResult = this.removeTracking(cleanedContent);
        cleanedContent = trackingResult.content;
        removed.tracking = trackingResult.removed;
      }

      // Remove scripts
      if (mergedOptions.removeScripts) {
        const scriptResult = this.removeScripts(cleanedContent);
        cleanedContent = scriptResult.content;
        removed.scripts = scriptResult.removed;
      }

      // Remove styles
      if (mergedOptions.removeStyles) {
        const styleResult = this.removeStyles(cleanedContent);
        cleanedContent = styleResult.content;
        removed.styles = styleResult.removed;
      }

      // Remove comments
      if (mergedOptions.removeComments) {
        const commentResult = this.removeComments(cleanedContent);
        cleanedContent = commentResult.content;
        removed.comments = commentResult.removed;
      }

      // Remove empty tags
      if (mergedOptions.removeEmptyTags) {
        cleanedContent = this.removeEmptyTags(cleanedContent);
      }

      // Remove attributes
      if (mergedOptions.removeAttributes) {
        cleanedContent = this.removeAttributes(cleanedContent);
      }

      // Sanitize HTML
      if (mergedOptions.sanitizeHtml) {
        cleanedContent = this.sanitizeHtml(cleanedContent);
      }

      // Remove HTML completely
      if (mergedOptions.removeHtml) {
        cleanedContent = this.removeHtml(cleanedContent);
      }

      // Normalize whitespace
      if (mergedOptions.normalizeWhitespace) {
        cleanedContent = this.normalizeWhitespace(cleanedContent);
      }

      // Remove duplicate content
      if (mergedOptions.removeDuplicateContent) {
        cleanedContent = this.removeDuplicateContent(cleanedContent);
      }

      // Remove broken links
      if (mergedOptions.removeBrokenLinks) {
        cleanedContent = this.removeBrokenLinks(cleanedContent);
      }

      // Fix encoding
      if (mergedOptions.fixEncoding) {
        cleanedContent = this.fixEncoding(cleanedContent);
      }

      // Calculate statistics
      const statistics = this.calculateStatistics(content, cleanedContent, removed);

      return {
        original: content,
        cleaned: cleanedContent,
        removed,
        statistics,
        warnings,
        errors
      };

    } catch (error: unknown) {
      errors.push(`Content cleaning failed: ${(error as Error).message}`);
      return {
        original: content,
        cleaned: content,
        removed,
        statistics: {
          originalLength: content.length,
          cleanedLength: content.length,
          reductionPercentage: 0,
          removedElements: 0,
          securityIssues: 0
        },
        warnings,
        errors
      };
    }
  }

  /**
   * Remove malware patterns
   */
  private removeMalware(content: string): { content: string; removed: string[] } {
    const removed: string[] = [];
    let cleanedContent = content;

    for (const pattern of this.malwarePatterns) {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        removed.push(...matches);
        cleanedContent = cleanedContent.replace(pattern, '');
      }
    }

    return { content: cleanedContent, removed };
  }

  /**
   * Remove gambling content
   */
  private removeGambling(content: string): { content: string; removed: string[] } {
    const removed: string[] = [];
    let cleanedContent = content;

    for (const pattern of this.gamblingPatterns) {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        removed.push(...matches);
        cleanedContent = cleanedContent.replace(pattern, '');
      }
    }

    return { content: cleanedContent, removed };
  }

  /**
   * Remove spam content
   */
  private removeSpam(content: string): { content: string; removed: string[] } {
    const removed: string[] = [];
    let cleanedContent = content;

    for (const pattern of this.spamPatterns) {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        removed.push(...matches);
        cleanedContent = cleanedContent.replace(pattern, '');
      }
    }

    return { content: cleanedContent, removed };
  }

  /**
   * Remove tracking code
   */
  private removeTracking(content: string): { content: string; removed: string[] } {
    const removed: string[] = [];
    let cleanedContent = content;

    for (const pattern of this.trackingPatterns) {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        removed.push(...matches);
        cleanedContent = cleanedContent.replace(pattern, '');
      }
    }

    return { content: cleanedContent, removed };
  }

  /**
   * Remove scripts
   */
  private removeScripts(content: string): { content: string; removed: string[] } {
    const scriptPattern = /<script[^>]*>[\s\S]*?<\/script>/gi;
    const matches = content.match(scriptPattern) || [];
    const cleanedContent = content.replace(scriptPattern, '');
    
    return { content: cleanedContent, removed: matches };
  }

  /**
   * Remove styles
   */
  private removeStyles(content: string): { content: string; removed: string[] } {
    const stylePattern = /<style[^>]*>[\s\S]*?<\/style>/gi;
    const matches = content.match(stylePattern) || [];
    const cleanedContent = content.replace(stylePattern, '');
    
    return { content: cleanedContent, removed: matches };
  }

  /**
   * Remove comments
   */
  private removeComments(content: string): { content: string; removed: string[] } {
    const commentPattern = /<!--[\s\S]*?-->/g;
    const matches = content.match(commentPattern) || [];
    const cleanedContent = content.replace(commentPattern, '');
    
    return { content: cleanedContent, removed: matches };
  }

  /**
   * Remove empty tags
   */
  private removeEmptyTags(content: string): string {
    return content.replace(/<(\w+)[^>]*>\s*<\/\1>/gi, '');
  }

  /**
   * Remove attributes
   */
  private removeAttributes(content: string): string {
    return content.replace(/\s+[a-zA-Z][a-zA-Z0-9]*="[^"]*"/g, '');
  }

  /**
   * Sanitize HTML
   */
  private sanitizeHtml(content: string): string {
    // Remove dangerous tags and attributes
    const dangerousTags = /<(script|iframe|object|embed|form|input|textarea|select|button)[^>]*>/gi;
    const dangerousAttributes = /\s+(on\w+|javascript:|data:|vbscript:)/gi;
    
    let sanitized = content.replace(dangerousTags, '');
    sanitized = sanitized.replace(dangerousAttributes, '');
    
    return sanitized;
  }

  /**
   * Remove HTML completely
   */
  private removeHtml(content: string): string {
    return content.replace(/<[^>]*>/g, '');
  }

  /**
   * Normalize whitespace
   */
  private normalizeWhitespace(content: string): string {
    return content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Remove duplicate content
   */
  private removeDuplicateContent(content: string): string {
    const lines = content.split('\n');
    const uniqueLines = [...new Set(lines)];
    return uniqueLines.join('\n');
  }

  /**
   * Remove broken links
   */
  private removeBrokenLinks(content: string): string {
    // Remove links with invalid URLs
    const linkPattern = /<a[^>]*href="(?:javascript:|data:|vbscript:|#|mailto:)[^"]*"[^>]*>[\s\S]*?<\/a>/gi;
    return content.replace(linkPattern, '');
  }

  /**
   * Fix encoding
   */
  private fixEncoding(content: string): string {
    try {
      // Try to detect and fix encoding issues
      const decoder = new TextDecoder('utf-8', { fatal: true });
      const encoder = new TextEncoder();
      const bytes = encoder.encode(content);
      return decoder.decode(bytes);
    } catch (error) {
      // If encoding fails, return original content
      console.error('Encoding error:', error instanceof Error ? error.message : error);
      return content;
    }
  }

  /**
   * Calculate statistics
   */
  private calculateStatistics(
    original: string,
    cleaned: string,
    removed: CleaningResult['removed']
  ): CleaningResult['statistics'] {
    const originalLength = original.length;
    const cleanedLength = cleaned.length;
    const reductionPercentage = Math.round(((originalLength - cleanedLength) / originalLength) * 100);
    const removedElements = Object.values(removed).flat().length;
    const securityIssues = removed.malware.length + removed.gambling.length + removed.spam.length;

    return {
      originalLength,
      cleanedLength,
      reductionPercentage,
      removedElements,
      securityIssues
    };
  }

  /**
   * Initialize security patterns
   */
  private initializePatterns(): void {
    // Malware patterns
    this.malwarePatterns = [
      /eval\s*\(/gi,
      /base64_decode\s*\(/gi,
      /shell_exec\s*\(/gi,
      /exec\s*\(/gi,
      /system\s*\(/gi,
      /passthru\s*\(/gi,
      /assert\s*\(/gi,
      /create_function\s*\(/gi,
      /preg_replace.*\/e/gi,
      /include\s*\(/gi,
      /require\s*\(/gi,
      /file_get_contents\s*\(/gi,
      /curl_exec\s*\(/gi,
      /fsockopen\s*\(/gi,
      /popen\s*\(/gi,
      /proc_open\s*\(/gi
    ];

    // Gambling patterns
    this.gamblingPatterns = [
      /slot\s*gacor/gi,
      /judi\s*online/gi,
      /togel/gi,
      /casino/gi,
      /sbobet/gi,
      /pragmatic\s*play/gi,
      /joker123/gi,
      /maxwin/gi,
      /scatter/gi,
      /bonus\s*deposit/gi,
      /agen\s*slot/gi,
      /situs\s*slot/gi,
      /jackpot/gi,
      /bet365/gi,
      /dewa88/gi,
      /raja88/gi,
      /poker\s*online/gi,
      /domino\s*online/gi,
      /bandar\s*togel/gi,
      /prediksi\s*togel/gi
    ];

    // Spam patterns
    this.spamPatterns = [
      /click\s*here/gi,
      /free\s*money/gi,
      /make\s*money\s*fast/gi,
      /work\s*from\s*home/gi,
      /lose\s*weight\s*fast/gi,
      /get\s*rich\s*quick/gi,
      /viagra/gi,
      /cialis/gi,
      /pharmacy/gi,
      /prescription/gi,
      /medication/gi,
      /drug/gi,
      /pill/gi,
      /tablet/gi,
      /capsule/gi
    ];

    // Tracking patterns
    this.trackingPatterns = [
      /google-analytics/gi,
      /gtag/gi,
      /ga\s*\(/gi,
      /fbq\s*\(/gi,
      /facebook\s*pixel/gi,
      /hotjar/gi,
      /mixpanel/gi,
      /segment/gi,
      /amplitude/gi,
      /intercom/gi,
      /zendesk/gi,
      /freshchat/gi,
      /tawk/gi,
      /livechat/gi,
      /olark/gi
    ];
  }

  /**
   * Clean multiple content items
   */
  async cleanBatch(
    contents: string[],
    options: CleaningOptions = {}
  ): Promise<CleaningResult[]> {
    const results: CleaningResult[] = [];
    
    for (const content of contents) {
      try {
        const result = await this.cleanContent(content, options);
        results.push(result);
      } catch (error) {
        console.error('Content cleaning failed:', error instanceof Error ? error.message : error);
        results.push({
          original: content,
          cleaned: content,
          removed: {
            html: [],
            scripts: [],
            styles: [],
            comments: [],
            malware: [],
            gambling: [],
            spam: [],
            tracking: []
          },
          statistics: {
            originalLength: content.length,
            cleanedLength: content.length,
            reductionPercentage: 0,
            removedElements: 0,
            securityIssues: 0
          },
          warnings: [],
          errors: [`Content cleaning failed: ${(error as Error).message}`]
        });
      }
    }
    
    return results;
  }

  /**
   * Clean HTML content specifically
   */
  async cleanHtml(
    html: string,
    options: CleaningOptions = {}
  ): Promise<CleaningResult> {
    const htmlOptions: CleaningOptions = {
      removeScripts: true,
      removeStyles: true,
      removeComments: true,
      removeEmptyTags: true,
      sanitizeHtml: true,
      removeMalware: true,
      removeGambling: true,
      removeSpam: true,
      removeTracking: true,
      normalizeWhitespace: true,
      ...options
    };

    return this.cleanContent(html, htmlOptions);
  }

  /**
   * Clean text content specifically
   */
  async cleanText(
    text: string,
    options: CleaningOptions = {}
  ): Promise<CleaningResult> {
    const textOptions: CleaningOptions = {
      removeHtml: true,
      removeScripts: true,
      removeStyles: true,
      removeComments: true,
      removeEmptyTags: true,
      removeAttributes: true,
      sanitizeHtml: false,
      removeMalware: true,
      removeGambling: true,
      removeSpam: true,
      removeTracking: true,
      normalizeWhitespace: true,
      ...options
    };

    return this.cleanContent(text, textOptions);
  }

  /**
   * Clean JSON content specifically
   */
  async cleanJson(
    json: string,
    options: CleaningOptions = {}
  ): Promise<CleaningResult> {
    const jsonOptions: CleaningOptions = {
      removeHtml: false,
      removeScripts: true,
      removeStyles: true,
      removeComments: true,
      removeEmptyTags: false,
      removeAttributes: false,
      sanitizeHtml: false,
      removeMalware: true,
      removeGambling: true,
      removeSpam: true,
      removeTracking: true,
      normalizeWhitespace: false,
      ...options
    };

    return this.cleanContent(json, jsonOptions);
  }

  /**
   * Get cleaning statistics
   */
  getCleaningStats(): {
    totalPatterns: number;
    malwarePatterns: number;
    gamblingPatterns: number;
    spamPatterns: number;
    trackingPatterns: number;
  } {
    return {
      totalPatterns: this.malwarePatterns.length + this.gamblingPatterns.length + this.spamPatterns.length + this.trackingPatterns.length,
      malwarePatterns: this.malwarePatterns.length,
      gamblingPatterns: this.gamblingPatterns.length,
      spamPatterns: this.spamPatterns.length,
      trackingPatterns: this.trackingPatterns.length
    };
  }

  /**
   * Add custom pattern
   */
  addCustomPattern(
    type: 'malware' | 'gambling' | 'spam' | 'tracking',
    pattern: RegExp
  ): void {
    switch (type) {
      case 'malware':
        this.malwarePatterns.push(pattern);
        break;
      case 'gambling':
        this.gamblingPatterns.push(pattern);
        break;
      case 'spam':
        this.spamPatterns.push(pattern);
        break;
      case 'tracking':
        this.trackingPatterns.push(pattern);
        break;
    }
  }

  /**
   * Remove custom pattern
   */
  removeCustomPattern(
    type: 'malware' | 'gambling' | 'spam' | 'tracking',
    pattern: RegExp
  ): void {
    switch (type) {
      case 'malware':
        this.malwarePatterns = this.malwarePatterns.filter(p => p !== pattern);
        break;
      case 'gambling':
        this.gamblingPatterns = this.gamblingPatterns.filter(p => p !== pattern);
        break;
      case 'spam':
        this.spamPatterns = this.spamPatterns.filter(p => p !== pattern);
        break;
      case 'tracking':
        this.trackingPatterns = this.trackingPatterns.filter(p => p !== pattern);
        break;
    }
  }

  /**
   * Clear all patterns
   */
  clearPatterns(): void {
    this.malwarePatterns = [];
    this.gamblingPatterns = [];
    this.spamPatterns = [];
    this.trackingPatterns = [];
  }

  /**
   * Reset to default patterns
   */
  resetPatterns(): void {
    this.initializePatterns();
  }
}

export default ContentCleaner;


