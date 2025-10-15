// src/utils/data-extractor.ts
// Data extraction utilities for KOPMA UNNES Website

import { KopmaMember, OrganizationalStructure, KopmaService, KopmaEvent, KopmaNews } from '../types/kopma.types';

export class DataExtractor {
  private static instance: DataExtractor;
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DataExtractor {
    if (!DataExtractor.instance) {
      DataExtractor.instance = new DataExtractor();
    }
    return DataExtractor.instance;
  }

  /**
   * Extract organizational structure from JSON data
   */
  extractOrganizationalStructure(data: any): OrganizationalStructure {
    const structure: OrganizationalStructure = {
      id: data.id || 'main',
      name: data.name || 'KOPMA UNNES',
      description: data.description || 'Koperasi Mahasiswa Universitas Negeri Semarang',
      members: this.extractMembers(data.members || []),
      lastUpdated: new Date().toISOString()
    };

    return structure;
  }

  /**
   * Extract members from data
   */
  extractMembers(membersData: any[]): KopmaMember[] {
    return membersData.map(member => ({
      id: member.id || this.generateId(),
      name: member.name || '',
      position: member.position || '',
      level: member.level || 0,
      parentId: member.parentId,
      image: member.image,
      bio: member.bio,
      contact: member.contact ? {
        email: member.contact.email,
        phone: member.contact.phone,
        social: member.contact.social
      } : undefined,
      children: member.children ? this.extractMembers(member.children) : []
    }));
  }

  /**
   * Extract services from data
   */
  extractServices(servicesData: any[]): KopmaService[] {
    return servicesData.map(service => ({
      id: service.id || this.generateId(),
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || 'default-icon',
      features: service.features || [],
      price: service.price ? {
        amount: service.price.amount || 0,
        currency: service.price.currency || 'IDR',
        period: service.price.period || 'monthly'
      } : undefined,
      category: service.category || 'other',
      isActive: service.isActive !== false
    }));
  }

  /**
   * Extract events from data
   */
  extractEvents(eventsData: any[]): KopmaEvent[] {
    return eventsData.map(event => ({
      id: event.id || this.generateId(),
      title: event.title || '',
      description: event.description || '',
      date: event.date || new Date().toISOString().split('T')[0],
      time: event.time || '00:00',
      location: event.location || '',
      image: event.image,
      category: event.category || 'other',
      isActive: event.isActive !== false,
      attendees: event.attendees || 0,
      maxAttendees: event.maxAttendees
    }));
  }

  /**
   * Extract news from data
   */
  extractNews(newsData: any[]): KopmaNews[] {
    return newsData.map(news => ({
      id: news.id || this.generateId(),
      title: news.title || '',
      content: news.content || '',
      excerpt: news.excerpt || this.generateExcerpt(news.content || ''),
      author: news.author || 'Admin',
      publishedAt: news.publishedAt || new Date().toISOString(),
      updatedAt: news.updatedAt || new Date().toISOString(),
      image: news.image,
      category: news.category || 'other',
      tags: news.tags || [],
      isPublished: news.isPublished !== false,
      views: news.views || 0
    }));
  }

  /**
   * Extract contact information from data
   */
  extractContactInfo(data: any): {
    address: string;
    phone: string;
    email: string;
    website: string;
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
    };
  } {
    return {
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      socialMedia: {
        facebook: data.socialMedia?.facebook,
        instagram: data.socialMedia?.instagram,
        twitter: data.socialMedia?.twitter,
        linkedin: data.socialMedia?.linkedin,
        youtube: data.socialMedia?.youtube
      }
    };
  }

  /**
   * Extract SEO data from content
   */
  extractSEOData(content: string, title: string): {
    title: string;
    description: string;
    keywords: string[];
  } {
    const description = this.generateExcerpt(content, 160);
    const keywords = this.extractKeywords(content, title);
    
    return {
      title: title || 'KOPMA UNNES',
      description: description,
      keywords: keywords
    };
  }

  /**
   * Extract statistics from data
   */
  extractStatistics(data: any): {
    totalMembers: number;
    activeMembers: number;
    totalEvents: number;
    upcomingEvents: number;
    totalNews: number;
    publishedNews: number;
  } {
    return {
      totalMembers: data.totalMembers || 0,
      activeMembers: data.activeMembers || 0,
      totalEvents: data.totalEvents || 0,
      upcomingEvents: data.upcomingEvents || 0,
      totalNews: data.totalNews || 0,
      publishedNews: data.publishedNews || 0
    };
  }

  /**
   * Extract media files from data
   */
  extractMediaFiles(data: any[]): {
    images: string[];
    documents: string[];
    videos: string[];
    audios: string[];
  } {
    const images: string[] = [];
    const documents: string[] = [];
    const videos: string[] = [];
    const audios: string[] = [];

    data.forEach(item => {
      if (item.type === 'image') {
      images.push(item.url);
    } else if (item.type === 'document') {
      documents.push(item.url);
    } else if (item.type === 'video') {
      videos.push(item.url);
    } else if (item.type === 'audio') {
      audios.push(item.url);
    }
    });

    return { images, documents, videos, audios };
  }

  /**
   * Extract search results from data
   */
  extractSearchResults(data: any[], query: string): {
    id: string;
    title: string;
    content: string;
    type: string;
    url: string;
    score: number;
  }[] {
    return data.map(item => ({
      id: item.id || this.generateId(),
      title: item.title || '',
      content: item.content || '',
      type: item.type || 'content',
      url: item.url || '#',
      score: this.calculateRelevanceScore(item, query)
    }));
  }

  /**
   * Extract analytics data from logs
   */
  extractAnalytics(logs: any[]): {
    pageViews: { date: string; views: number }[];
    topPages: { page: string; views: number }[];
    referrers: { source: string; visits: number }[];
    devices: { type: string; percentage: number }[];
    browsers: { name: string; percentage: number }[];
  } {
    const pageViews = this.aggregatePageViews(logs);
    const topPages = this.getTopPages(logs);
    const referrers = this.getReferrers(logs);
    const devices = this.getDevices(logs);
    const browsers = this.getBrowsers(logs);

    return {
      pageViews,
      topPages,
      referrers,
      devices,
      browsers
    };
  }

  /**
   * Extract user data from form submissions
   */
  extractUserData(formData: FormData): {
    name: string;
    email: string;
    phone?: string;
    message: string;
  } {
    return {
      name: formData.get('name') as string || '',
      email: formData.get('email') as string || '',
      phone: formData.get('phone') as string,
      message: formData.get('message') as string || ''
    };
  }

  /**
   * Extract configuration from environment
   */
  extractConfig(env: Record<string, string>): {
    database: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
    };
    api: {
      baseUrl: string;
      timeout: number;
    };
  } {
    return {
      database: {
        host: env.DB_HOST || 'localhost',
        port: parseInt(env.DB_PORT || '3306'),
        database: env.DB_NAME || 'kopma_db',
        username: env.DB_USER || 'root',
        password: env.DB_PASSWORD || ''
      },
      redis: {
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
        password: env.REDIS_PASSWORD
      },
      api: {
        baseUrl: env.API_URL || 'http://localhost:3000',
        timeout: parseInt(env.API_TIMEOUT || '5000')
      }
    };
  }

  /**
   * Extract backup data from system
   */
  extractBackupData(data: any): {
    id: string;
    name: string;
    size: number;
    createdAt: string;
    type: string;
    status: string;
  } {
    return {
      id: data.id || this.generateId(),
      name: data.name || 'backup',
      size: data.size || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      type: data.type || 'full',
      status: data.status || 'pending'
    };
  }

  /**
   * Extract security scan results
   */
  extractSecurityScanResults(data: any): {
    threats: {
      level: string;
      type: string;
      description: string;
      file?: string;
      line?: number;
    }[];
    vulnerabilities: {
      level: string;
      type: string;
      description: string;
      solution: string;
    }[];
    recommendations: string[];
  } {
    return {
      threats: data.threats || [],
      vulnerabilities: data.vulnerabilities || [],
      recommendations: data.recommendations || []
    };
  }

  /**
   * Extract monitoring data
   */
  extractMonitoringData(data: any): {
    performance: {
      averageResponseTime: number;
      maxResponseTime: number;
      minResponseTime: number;
      requestsPerSecond: number;
      errorRate: number;
    };
    security: {
      threatsBlocked: number;
      vulnerabilitiesFound: number;
      securityScore: number;
      lastScan: string;
    };
    uptime: {
      percentage: number;
      totalDowntime: number;
      lastIncident?: string;
    };
    system: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      networkUsage: number;
    };
  } {
    return {
      performance: data.performance || {
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0
      },
      security: data.security || {
        threatsBlocked: 0,
        vulnerabilitiesFound: 0,
        securityScore: 100,
        lastScan: new Date().toISOString()
      },
      uptime: data.uptime || {
        percentage: 100,
        totalDowntime: 0
      },
      system: data.system || {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkUsage: 0
      }
    };
  }

  // Helper methods

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateExcerpt(content: string, maxLength: number = 160): string {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  private extractKeywords(content: string, title: string): string[] {
    const text = (title + ' ' + content).toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    const wordCount: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private calculateRelevanceScore(item: any, query: string): number {
    const title = (item.title || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const searchQuery = query.toLowerCase();
    
    let score = 0;
    if (title.includes(searchQuery)) score += 10;
    if (content.includes(searchQuery)) score += 5;
    if (title.startsWith(searchQuery)) score += 5;
    
    return Math.min(score, 100);
  }

  private aggregatePageViews(logs: any[]): { date: string; views: number }[] {
    const views: Record<string, number> = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      views[date] = (views[date] || 0) + 1;
    });
    
    return Object.entries(views).map(([date, views]) => ({ date, views }));
  }

  private getTopPages(logs: any[]): { page: string; views: number }[] {
    const pages: Record<string, number> = {};
    logs.forEach(log => {
      const page = log.page || '/';
      pages[page] = (pages[page] || 0) + 1;
    });
    
    return Object.entries(pages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));
  }

  private getReferrers(logs: any[]): { source: string; visits: number }[] {
    const referrers: Record<string, number> = {};
    logs.forEach(log => {
      const source = log.referrer || 'direct';
      referrers[source] = (referrers[source] || 0) + 1;
    });
    
    return Object.entries(referrers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([source, visits]) => ({ source, visits }));
  }

  private getDevices(logs: any[]): { type: string; percentage: number }[] {
    const devices: Record<string, number> = {};
    logs.forEach(log => {
      const device = log.device || 'desktop';
      devices[device] = (devices[device] || 0) + 1;
    });
    
    const total = Object.values(devices).reduce((sum, count) => sum + count, 0);
    return Object.entries(devices).map(([type, count]) => ({
      type,
      percentage: Math.round((count / total) * 100)
    }));
  }

  private getBrowsers(logs: any[]): { name: string; percentage: number }[] {
    const browsers: Record<string, number> = {};
    logs.forEach(log => {
      const browser = log.browser || 'unknown';
      browsers[browser] = (browsers[browser] || 0) + 1;
    });
    
    const total = Object.values(browsers).reduce((sum, count) => sum + count, 0);
    return Object.entries(browsers).map(([name, count]) => ({
      name,
      percentage: Math.round((count / total) * 100)
    }));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cached data
   */
  getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set cached data
   */
  setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export default DataExtractor;




