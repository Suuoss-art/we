// src/types/common.types.ts
// Common type definitions for KOPMA UNNES Website

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timestamp {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin';
  value: any;
}

export interface Search {
  query: string;
  fields: string[];
  operator: 'and' | 'or';
}

export interface Select {
  fields: string[];
  exclude?: string[];
}

export interface Include {
  relations: string[];
  select?: string[];
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: Sort;
  filter?: Filter[];
  search?: Search;
  select?: Select;
  include?: Include;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface FileInfo {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface ImageInfo extends FileInfo {
  width: number;
  height: number;
  alt?: string;
  caption?: string;
}

export interface VideoInfo extends FileInfo {
  duration: number;
  width: number;
  height: number;
  thumbnailUrl: string;
}

export interface AudioInfo extends FileInfo {
  duration: number;
  bitrate: number;
  sampleRate: number;
}

export interface DocumentInfo extends FileInfo {
  pageCount?: number;
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
  permissions: string[];
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Session {
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

export interface AuditLog {
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

export interface Notification {
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

export interface Cache {
  key: string;
  value: any;
  expiresAt: string;
  createdAt: string;
}

export interface HealthCheck {
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

export interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  publishedContent: number;
  totalViews: number;
  monthlyViews: number;
  totalStorage: number;
  usedStorage: number;
}

export interface Theme {
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

export interface Menu {
  id: string;
  title: string;
  url: string;
  order: number;
  parentId?: string;
  isActive: boolean;
  children?: Menu[];
}

export interface Banner {
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

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  content: string;
  image?: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export interface Gallery {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface Partnership {
  id: string;
  name: string;
  description: string;
  logo: string;
  website?: string;
  type: 'sponsor' | 'partner' | 'supporter';
  isActive: boolean;
  order: number;
}

export interface Award {
  id: string;
  title: string;
  description: string;
  image: string;
  year: number;
  category: string;
  isActive: boolean;
}

export interface History {
  id: string;
  year: number;
  title: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface Vision {
  id: string;
  title: string;
  content: string;
  type: 'vision' | 'mission' | 'values';
  order: number;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  image?: string;
  year: number;
  category: string;
  isActive: boolean;
  order: number;
}

export interface Program {
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

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'link' | 'document' | 'video' | 'image';
  category: string;
  isActive: boolean;
  order: number;
}

export interface Feedback {
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

export interface Subscription {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  source: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface Backup {
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

export interface Log {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Maintenance {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Analytics {
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

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  url: string;
  score: number;
}

export interface Contact {
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

export interface Settings {
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

export interface SecurityScan {
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

export interface Monitoring {
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

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  charset: string;
  timezone: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database: number;
  ttl: number;
}

export interface StorageConfig {
  type: 'local' | 's3' | 'gcs' | 'azure';
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
  replyTo?: string;
}

export interface SMTPConfig extends EmailConfig {
  tls: boolean;
  ssl: boolean;
  auth: boolean;
}

export interface NotificationConfig {
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook: boolean;
}

export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keySize: number;
    iterations: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
  };
}

export interface LogConfig {
  level: string;
  format: string;
  transports: string[];
  maxFiles: number;
  maxSize: string;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  algorithm: string;
}

export interface BackupConfig {
  schedule: string;
  retention: number;
  compression: boolean;
  encryption: boolean;
  storage: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
  metrics: string[];
  alerts: {
    email: string[];
    webhook: string[];
  };
}

export interface APIConfig {
  version: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export interface WebhookConfig {
  secret: string;
  timeout: number;
  retries: number;
  events: string[];
}

export interface IntegrationConfig {
  enabled: boolean;
  config: Record<string, any>;
  sync: {
    enabled: boolean;
    interval: number;
  };
}

export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  startTime: string;
  endTime: string;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  conditions?: Record<string, any>;
}

export interface Environment {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  API_KEY: string;
  WEBHOOK_SECRET: string;
}

export interface Config {
  database: DatabaseConfig;
  redis: RedisConfig;
  storage: StorageConfig;
  email: EmailConfig;
  security: SecurityConfig;
  logging: LogConfig;
  cache: CacheConfig;
  backup: BackupConfig;
  monitoring: MonitoringConfig;
  api: APIConfig;
  webhook: WebhookConfig;
  integration: IntegrationConfig;
  maintenance: MaintenanceConfig;
  features: FeatureFlag[];
  environment: Environment;
}




