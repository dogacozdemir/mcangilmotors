import DOMPurify from 'isomorphic-dompurify';

// XSS Protection utilities
export class XSSProtection {
  // HTML sanitization with DOMPurify
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SANITIZE_DOM: true,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false
    });
  }

  // Text sanitization (remove all HTML)
  static sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  // URL sanitization
  static sanitizeURL(url: string): string {
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '';
      }
      return urlObj.toString();
    } catch {
      return '';
    }
  }

  // Email sanitization
  static sanitizeEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = this.sanitizeText(email).toLowerCase().trim();
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  // Phone number sanitization
  static sanitizePhone(phone: string): string {
    // Remove all non-digit characters except + at the beginning
    const sanitized = phone.replace(/[^\d+]/g, '');
    // Ensure it starts with + and has reasonable length
    if (sanitized.startsWith('+') && sanitized.length >= 10 && sanitized.length <= 15) {
      return sanitized;
    }
    return '';
  }

  // SQL injection prevention (additional layer)
  static sanitizeSQL(input: string): string {
    return input
      .replace(/['"\\]/g, '') // Remove quotes and backslashes
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
      .replace(/;/g, '') // Remove semicolons
      .replace(/union/gi, '') // Remove UNION
      .replace(/select/gi, '') // Remove SELECT
      .replace(/insert/gi, '') // Remove INSERT
      .replace(/update/gi, '') // Remove UPDATE
      .replace(/delete/gi, '') // Remove DELETE
      .replace(/drop/gi, '') // Remove DROP
      .replace(/create/gi, '') // Remove CREATE
      .replace(/alter/gi, '') // Remove ALTER
      .replace(/exec/gi, '') // Remove EXEC
      .replace(/execute/gi, '') // Remove EXECUTE
      .trim();
  }

  // File name sanitization
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .substring(0, 255); // Limit length
  }

  // JSON sanitization
  static sanitizeJSON(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeJSON(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeJSON(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  // Check for XSS patterns
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /expression\s*\(/gi,
      /url\s*\(/gi,
      /@import/gi,
      /vbscript:/gi,
      /data:/gi,
      /blob:/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Sanitize user input based on context
  static sanitizeByContext(input: string, context: 'html' | 'text' | 'url' | 'email' | 'phone' | 'filename' | 'sql'): string {
    switch (context) {
      case 'html':
        return this.sanitizeHTML(input);
      case 'text':
        return this.sanitizeText(input);
      case 'url':
        return this.sanitizeURL(input);
      case 'email':
        return this.sanitizeEmail(input);
      case 'phone':
        return this.sanitizePhone(input);
      case 'filename':
        return this.sanitizeFileName(input);
      case 'sql':
        return this.sanitizeSQL(input);
      default:
        return this.sanitizeText(input);
    }
  }
}
