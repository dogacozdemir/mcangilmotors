import { Request, Response, NextFunction } from 'express';
import { XSSProtection } from '../utils/sanitizer';

// SQL Injection protection middleware
export function sqlInjectionProtection(req: Request, res: Response, next: NextFunction) {
  // Check request body
  if (req.body && typeof req.body === 'object') {
    const bodyString = JSON.stringify(req.body);
    if (XSSProtection.detectXSS(bodyString)) {
      return res.status(400).json({
        success: false,
        message: 'Potentially malicious content detected in request body'
      });
    }
  }

  // Check query parameters
  if (req.query && typeof req.query === 'object') {
    const queryString = JSON.stringify(req.query);
    if (XSSProtection.detectXSS(queryString)) {
      return res.status(400).json({
        success: false,
        message: 'Potentially malicious content detected in query parameters'
      });
    }
  }

  // Check route parameters
  if (req.params && typeof req.params === 'object') {
    const paramsString = JSON.stringify(req.params);
    if (XSSProtection.detectXSS(paramsString)) {
      return res.status(400).json({
        success: false,
        message: 'Potentially malicious content detected in route parameters'
      });
    }
  }

  // Check headers for suspicious content
  const suspiciousHeaders = ['user-agent', 'referer', 'x-forwarded-for'];
  for (const header of suspiciousHeaders) {
    const headerValue = req.headers[header];
    if (headerValue && typeof headerValue === 'string') {
      if (XSSProtection.detectXSS(headerValue)) {
        return res.status(400).json({
          success: false,
          message: 'Potentially malicious content detected in headers'
        });
      }
    }
  }

  next();
}

// Enhanced input validation for specific fields
export function validateNumericInput(req: Request, res: Response, next: NextFunction) {
  const numericFields = ['id', 'page', 'limit', 'year', 'price', 'mileage'];
  
  for (const field of numericFields) {
    if (req.query[field]) {
      const value = req.query[field] as string;
      if (!/^\d+$/.test(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid numeric value for ${field}`
        });
      }
    }
    
    if (req.body[field]) {
      const value = req.body[field];
      if (typeof value === 'string' && !/^\d+$/.test(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid numeric value for ${field}`
        });
      }
    }
  }

  next();
}

// Validate string inputs for SQL injection patterns
export function validateStringInput(req: Request, res: Response, next: NextFunction) {
  const stringFields = ['make', 'model', 'fuelType', 'transmission', 'color', 'engine'];
  
  for (const field of stringFields) {
    if (req.body[field]) {
      const value = req.body[field];
      if (typeof value === 'string') {
        // Check for SQL injection patterns
        if (XSSProtection.detectXSS(value)) {
          return res.status(400).json({
            success: false,
            message: `Potentially malicious content detected in ${field}`
          });
        }
        
        // Sanitize the value
        req.body[field] = XSSProtection.sanitizeByContext(value, 'text');
      }
    }
  }

  next();
}

// Rate limiting for suspicious queries
export function suspiciousQueryRateLimit(req: Request, res: Response, next: NextFunction) {
  // This would integrate with a rate limiting system
  // For now, we'll just log suspicious patterns
  const bodyString = JSON.stringify(req.body);
  const queryString = JSON.stringify(req.query);
  const paramsString = JSON.stringify(req.params);
  
  const allInput = bodyString + queryString + paramsString;
  
  if (XSSProtection.detectXSS(allInput)) {
    console.warn('🚨 SUSPICIOUS REQUEST DETECTED:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      timestamp: new Date().toISOString()
    });
  }

  next();
}
