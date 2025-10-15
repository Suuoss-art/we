// src/types/api.types.ts
// API type definitions for KOPMA UNNES Website

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthRequest {
  username: string;
  password: string;
  remember?: boolean;
  twoFactorCode?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ContentRequest {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ContentResponse {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  likes: number;
  comments: number;
}

export interface MediaUploadRequest {
  file: File;
  title?: string;
  description?: string;
  alt?: string;
  category?: string;
  tags?: string[];
}

export interface MediaUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  alt?: string;
  category?: string;
  tags: string[];
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
}

export interface MediaListResponse {
  media: MediaUploadResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  permissions?: string[];
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: string;
  };
}

export interface SettingsRequest {
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
}

export interface SettingsResponse {
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

export interface AnalyticsRequest {
  startDate: string;
  endDate: string;
  metrics: string[];
  groupBy?: string;
}

export interface AnalyticsResponse {
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
  countries: {
    country: string;
    visits: number;
  }[];
  operatingSystems: {
    os: string;
    percentage: number;
  }[];
}

export interface BackupRequest {
  name: string;
  description?: string;
  type: 'full' | 'database' | 'files' | 'media';
  includeMedia?: boolean;
  includeDatabase?: boolean;
  includeFiles?: boolean;
}

export interface BackupResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
  size: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  downloadUrl?: string;
  expiresAt?: string;
}

export interface LogRequest {
  level?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  userId?: string;
}

export interface LogResponse {
  id: string;
  level: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface NotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userIds?: string[];
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface HealthCheckResponse {
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

export interface SecurityScanRequest {
  type: 'full' | 'quick' | 'custom';
  includeFiles?: boolean;
  includeDatabase?: boolean;
  includeLogs?: boolean;
}

export interface SecurityScanResponse {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  threats: {
    level: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    description: string;
    file?: string;
    line?: number;
  }[];
  vulnerabilities: {
    level: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    description: string;
    solution: string;
  }[];
  recommendations: string[];
  createdAt: string;
  completedAt?: string;
}

export interface MonitoringRequest {
  type: 'performance' | 'security' | 'uptime' | 'all';
  startDate?: string;
  endDate?: string;
}

export interface MonitoringResponse {
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
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
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

export interface SearchRequest {
  query: string;
  type?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: {
    id: string;
    title: string;
    content: string;
    type: string;
    url: string;
    score: number;
  }[];
  total: number;
  query: string;
  took: number;
}

export interface FileUploadRequest {
  file: File;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category?: string;
  description?: string;
  isPublic: boolean;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
  downloadCount: number;
}

export interface CacheRequest {
  key: string;
  value: any;
  ttl?: number;
}

export interface CacheResponse {
  key: string;
  value: any;
  expiresAt: string;
  createdAt: string;
}

export interface SessionRequest {
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface SessionResponse {
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

export interface AuditRequest {
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
}

export interface AuditResponse {
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

export interface WebhookRequest {
  name: string;
  url: string;
  events: string[];
  secret: string;
}

export interface WebhookResponse {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface IntegrationRequest {
  name: string;
  type: string;
  config: Record<string, any>;
}

export interface IntegrationResponse {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface MaintenanceRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface MaintenanceResponse {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}




