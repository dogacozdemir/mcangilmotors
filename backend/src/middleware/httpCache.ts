import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  maxAge?: number; // Max age in seconds
  sMaxAge?: number; // Shared max age in seconds
  mustRevalidate?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  private?: boolean;
  public?: boolean;
  immutable?: boolean;
  staleWhileRevalidate?: number; // Stale while revalidate in seconds
  staleIfError?: number; // Stale if error in seconds
}

// Default cache configurations
const CACHE_CONFIGS = {
  // Static assets (images, CSS, JS)
  static: {
    maxAge: 31536000, // 1 year
    immutable: true,
    public: true
  },
  
  // API responses
  api: {
    maxAge: 300, // 5 minutes
    sMaxAge: 600, // 10 minutes
    mustRevalidate: true,
    public: true,
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 300 // 5 minutes
  },
  
  // User-specific data
  private: {
    maxAge: 60, // 1 minute
    private: true,
    mustRevalidate: true
  },
  
  // No cache
  noCache: {
    noCache: true,
    noStore: true,
    mustRevalidate: true
  }
};

export function setCacheHeaders(options: CacheOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const {
      maxAge,
      sMaxAge,
      mustRevalidate,
      noCache,
      noStore,
      private: isPrivate,
      public: isPublic,
      immutable,
      staleWhileRevalidate,
      staleIfError
    } = options;

    // Set Cache-Control header
    const cacheControl: string[] = [];

    if (noCache) {
      cacheControl.push('no-cache');
    }

    if (noStore) {
      cacheControl.push('no-store');
    }

    if (isPrivate) {
      cacheControl.push('private');
    }

    if (isPublic) {
      cacheControl.push('public');
    }

    if (maxAge !== undefined) {
      cacheControl.push(`max-age=${maxAge}`);
    }

    if (sMaxAge !== undefined) {
      cacheControl.push(`s-maxage=${sMaxAge}`);
    }

    if (mustRevalidate) {
      cacheControl.push('must-revalidate');
    }

    if (immutable) {
      cacheControl.push('immutable');
    }

    if (staleWhileRevalidate !== undefined) {
      cacheControl.push(`stale-while-revalidate=${staleWhileRevalidate}`);
    }

    if (staleIfError !== undefined) {
      cacheControl.push(`stale-if-error=${staleIfError}`);
    }

    if (cacheControl.length > 0) {
      res.set('Cache-Control', cacheControl.join(', '));
    }

    // Set ETag for conditional requests
    if (req.method === 'GET' && !res.get('ETag')) {
      const etag = generateETag(req.originalUrl, Date.now());
      res.set('ETag', etag);
    }

    // Set Last-Modified
    if (req.method === 'GET' && !res.get('Last-Modified')) {
      res.set('Last-Modified', new Date().toUTCString());
    }

    // Set Vary header for proper caching
    const vary = res.get('Vary') || '';
    if (!vary.includes('Accept-Encoding')) {
      res.set('Vary', vary ? `${vary}, Accept-Encoding` : 'Accept-Encoding');
    }

    next();
  };
}

// Predefined cache middleware functions
export const staticCache = setCacheHeaders(CACHE_CONFIGS.static);
export const apiCache = setCacheHeaders(CACHE_CONFIGS.api);
export const privateCache = setCacheHeaders(CACHE_CONFIGS.private);
export const noCache = setCacheHeaders(CACHE_CONFIGS.noCache);

// Dynamic cache based on content type
export function dynamicCache(req: Request, res: Response, next: NextFunction) {
  const url = req.originalUrl;
  
  // Images and static assets
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)$/)) {
    return staticCache(req, res, next);
  }
  
  // API endpoints
  if (url.startsWith('/api/')) {
    // User-specific endpoints
    if (url.includes('/admin/') || url.includes('/user/')) {
      return privateCache(req, res, next);
    }
    
    // Public API endpoints
    return apiCache(req, res, next);
  }
  
  // Default to no cache for other requests
  return noCache(req, res, next);
}

// ETag generation
function generateETag(url: string, timestamp: number): string {
  const content = `${url}-${timestamp}`;
  let hash = 0;
  
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `"${Math.abs(hash).toString(16)}"`;
}

// Conditional request handling
export function handleConditionalRequest(req: Request, res: Response, next: NextFunction) {
  const ifNoneMatch = req.get('If-None-Match');
  const ifModifiedSince = req.get('If-Modified-Since');
  
  const etag = res.get('ETag');
  const lastModified = res.get('Last-Modified');
  
  // Check ETag
  if (ifNoneMatch && etag && ifNoneMatch === etag) {
    return res.status(304).end();
  }
  
  // Check Last-Modified
  if (ifModifiedSince && lastModified) {
    const ifModifiedSinceDate = new Date(ifModifiedSince);
    const lastModifiedDate = new Date(lastModified);
    
    if (lastModifiedDate <= ifModifiedSinceDate) {
      return res.status(304).end();
    }
  }
  
  next();
}

// Cache warming function
export function warmCache(urls: string[], baseUrl: string = '') {
  return async (req: Request, res: Response, next: NextFunction) => {
    // This would typically be called during application startup
    // or as a background job to pre-populate cache
    console.log('Cache warming not implemented in this middleware');
    next();
  };
}

