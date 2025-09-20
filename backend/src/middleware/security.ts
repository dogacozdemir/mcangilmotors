import { Request, Response, NextFunction } from 'express';

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  // Strict Transport Security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy - Strict XSS Protection
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://fonts.googleapis.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.mcangilmotors.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
    "require-trusted-types-for 'script'",
    "trusted-types 'none'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  // Cross-Origin policies
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  next();
}

// CSRF Protection middleware
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for API routes that don't need it (public endpoints)
  if (req.path.startsWith('/api/public/') || req.path.startsWith('/api/health')) {
    return next();
  }
  
  // Check for CSRF token in headers
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;
  
  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      error: 'CSRF token mismatch',
      message: 'Invalid or missing CSRF token'
    });
  }
  
  next();
}

// Generate CSRF token
export function generateCSRFToken(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    return next();
  }
  
  if (!req.session.csrfToken) {
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
  }
  
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

// Request size limiter
export function requestSizeLimiter(maxSize: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        message: `Request size exceeds ${maxSize / 1024 / 1024}MB limit`
      });
    }
    
    next();
  };
}

// IP whitelist for admin routes
export function adminIPWhitelist(allowedIPs: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if no IPs specified (allow all)
    if (allowedIPs.length === 0) {
      return next();
    }
    
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (!clientIP || !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized to access this resource'
      });
    }
    
    next();
  };
}

// Rate limiting per IP
export function rateLimitPerIP(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const clientData = requests.get(clientIP);
    
    if (!clientData || now > clientData.resetTime) {
      requests.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (clientData.count >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((clientData.resetTime - now) / 1000)} seconds`
      });
    }
    
    clientData.count++;
    next();
  };
}
