/**
 * Security Configuration for KOPMA UNNES Website
 * Centralized security settings and constants
 */

export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later.',
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'kopma-unnes-secret-change-in-production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'kopma-jwt-secret-change-in-production',
    expiresIn: '24h',
    algorithm: 'HS256' as const,
  },
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  
  // File upload limits
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
    allowedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  
  // CORS allowed origins
  cors: {
    production: [
      'https://kopmaukmunnes.com',
      'https://www.kopmaukmunnes.com',
    ],
    development: [
      'http://localhost:4321',
      'http://localhost:3000',
      'http://127.0.0.1:4321',
      'http://127.0.0.1:3000',
    ],
  },
  
  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdn.tiny.cloud',
        'https://cdn.jsdelivr.net',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
      ],
      connectSrc: [
        "'self'",
        'https://api.kopmaukmunnes.com',
        'wss://api.kopmaukmunnes.com',
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  },
  
  // Input validation
  validation: {
    maxInputLength: 1000,
    maxEmailLength: 254,
    maxNameLength: 100,
    maxPhoneLength: 20,
    maxMessageLength: 5000,
  },
  
  // Blocked patterns
  blockedPatterns: [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /\.\.\//, // Path traversal
    /\.\.\\/, // Windows path traversal
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ],
} as const;

// Environment validation
export function validateEnvironment(): void {
  const required = [
    'NODE_ENV',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }
  
  // Warn if using default secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SESSION_SECRET || !process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: Using default secrets in production!');
      console.error('Please set SESSION_SECRET and JWT_SECRET environment variables.');
    }
  }
}

export default SECURITY_CONFIG;
