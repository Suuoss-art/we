// src/types/kopma.types.ts
// TypeScript type definitions for KOPMA UNNES Website

export interface KopmaMember {
  id: string;
  name: string;
  position: string;
  level: number;
  parentId?: string;
  image?: string;
  bio?: string;
  contact?: {
    email?: string;
    phone?: string;
    social?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  children?: KopmaMember[];
}

export interface OrganizationalStructure {
  id: string;
  name: string;
  description: string;
  members: KopmaMember[];
  lastUpdated: string;
}

export interface KopmaService {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price?: {
    amount: number;
    currency: string;
    period: string;
  };
  category: 'financial' | 'educational' | 'social' | 'other';
  isActive: boolean;
}

export interface KopmaEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  category: 'meeting' | 'training' | 'social' | 'other';
  isActive: boolean;
  attendees?: number;
  maxAttendees?: number;
}

export interface KopmaNews {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  image?: string;
  category: 'announcement' | 'news' | 'update' | 'other';
  tags: string[];
  isPublished: boolean;
  views: number;
}

export interface KopmaDocument {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  category: 'constitution' | 'regulation' | 'report' | 'other';
  uploadedAt: string;
  uploadedBy: string;
  isPublic: boolean;
  downloadCount: number;
}

export interface KopmaContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

export interface KopmaSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  features: {
    enableNews: boolean;
    enableEvents: boolean;
    enableDocuments: boolean;
    enableContact: boolean;
    enableMemberDirectory: boolean;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  lastUpdated: string;
}

export interface KopmaUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'editor' | 'member' | 'guest';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: string;
  };
  permissions: string[];
}

export interface KopmaStatistics {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalNews: number;
  publishedNews: number;
  totalDocuments: number;
  publicDocuments: number;
  totalContacts: number;
  newContacts: number;
  totalViews: number;
  monthlyViews: number;
}

export interface KopmaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface KopmaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface KopmaSearchResult {
  id: string;
  title: string;
  content: string;
  type: 'member' | 'service' | 'event' | 'news' | 'document';
  url: string;
  score: number;
}

export interface KopmaAnalytics {
  pageViews: {
    date: string;
    views: number;
  }[];
  topPages: {
    page: string;
    views: number;
  }[];
  referrers: {
    source: string;
    visits: number;
  }[];
  devices: {
    type: string;
    percentage: number;
  }[];
  browsers: {
    name: string;
    percentage: number;
  }[];
}

export interface KopmaBackup {
  id: string;
  name: string;
  description: string;
  size: number;
  createdAt: string;
  type: 'full' | 'database' | 'files' | 'media';
  status: 'pending' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
}

export interface KopmaLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface KopmaNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  userId?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface KopmaTheme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  isActive: boolean;
  preview?: string;
}

export interface KopmaMenu {
  id: string;
  title: string;
  url: string;
  order: number;
  parentId?: string;
  isActive: boolean;
  children?: KopmaMenu[];
}

export interface KopmaBanner {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface KopmaTestimonial {
  id: string;
  name: string;
  position: string;
  content: string;
  image?: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export interface KopmaFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export interface KopmaGallery {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface KopmaPartnership {
  id: string;
  name: string;
  description: string;
  logo: string;
  website?: string;
  type: 'sponsor' | 'partner' | 'supporter';
  isActive: boolean;
  order: number;
}

export interface KopmaAward {
  id: string;
  title: string;
  description: string;
  image: string;
  year: number;
  category: string;
  isActive: boolean;
}

export interface KopmaHistory {
  id: string;
  year: number;
  title: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface KopmaVision {
  id: string;
  title: string;
  content: string;
  type: 'vision' | 'mission' | 'values';
  order: number;
  isActive: boolean;
}

export interface KopmaAchievement {
  id: string;
  title: string;
  description: string;
  image?: string;
  year: number;
  category: string;
  isActive: boolean;
  order: number;
}

export interface KopmaProgram {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  participants?: number;
  maxParticipants?: number;
}

export interface KopmaResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'link' | 'document' | 'video' | 'image';
  category: string;
  isActive: boolean;
  order: number;
}

export interface KopmaFeedback {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  rating: number;
  status: 'new' | 'read' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

export interface KopmaSubscription {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  source: string;
}

export interface KopmaIntegration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface KopmaWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface KopmaCache {
  key: string;
  value: any;
  expiresAt: string;
  createdAt: string;
}

export interface KopmaSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface KopmaAudit {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  changes: Record<string, any>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface KopmaMaintenance {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface KopmaHealth {
  status: 'healthy' | 'warning' | 'error';
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    storage: 'up' | 'down';
    api: 'up' | 'down';
  };
  metrics: {
    uptime: number;
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  lastChecked: string;
}




