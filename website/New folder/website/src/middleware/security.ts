import type { MiddlewareHandler } from 'astro';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Security middleware configuration for KOPMA UNNES Website
 * Implements security headers, rate limiting, and input validation
 */

// Rate limiter configuration
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet security configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.tiny.cloud'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.kopmaukmunnes.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
};

// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://kopmaukmunnes.com', 'https://www.kopmaukmunnes.com']
    : ['http://localhost:4321', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// Input sanitization helper
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (Indonesian)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// Security headers middleware
export const securityHeaders: MiddlewareHandler = async (context, next) => {
  const response = await next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS header for HTTPS
  if (context.url.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  return response;
};

// Request validation middleware
export const validateRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /../i, // Path traversal
    /\.\./i,
  ];
  
  const fullUrl = url.pathname + url.search;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      return new Response('Bad Request', { status: 400 });
    }
  }
  
  return next();
};

export default securityHeaders;
