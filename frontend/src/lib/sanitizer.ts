// Frontend XSS Protection utilities
export class FrontendXSSProtection {
  // HTML sanitization (client-side)
  static sanitizeHTML(html: string): string {
    // Create a temporary div element
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  // Text sanitization (remove all HTML)
  static sanitizeText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<') // Decode HTML entities
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=')
      .trim();
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

  // File name sanitization
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .substring(0, 255); // Limit length
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
  static sanitizeByContext(input: string, context: 'html' | 'text' | 'url' | 'email' | 'phone' | 'filename'): string {
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
      default:
        return this.sanitizeText(input);
    }
  }

  // Safe HTML rendering with React
  static createSafeHTML(html: string): { __html: string } {
    return {
      __html: this.sanitizeHTML(html)
    };
  }

  // Input validation with XSS check
  static validateInput(input: string, context: 'html' | 'text' | 'url' | 'email' | 'phone' | 'filename'): {
    isValid: boolean;
    sanitized: string;
    error?: string;
  } {
    if (this.detectXSS(input)) {
      return {
        isValid: false,
        sanitized: '',
        error: 'Potentially malicious content detected'
      };
    }

    const sanitized = this.sanitizeByContext(input, context);
    
    return {
      isValid: true,
      sanitized
    };
  }
}
