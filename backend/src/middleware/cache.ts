import { Request, Response, NextFunction } from 'express';

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
}

class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private maxSize = 1000; // Maximum number of items
  private cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Start cleanup interval
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? Date.now() - item.timestamp <= item.ttl : false;
  }

  size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize
    };
  }
}

// Global cache instance
const memoryCache = new MemoryCache();

// Cache middleware factory
export function createCacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    keyGenerator = (req: Request) => `${req.method}:${req.originalUrl}`,
    skipCache = () => false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if condition is met
    if (skipCache(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data: any) {
      // Cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`Caching response for key: ${cacheKey}`);
        memoryCache.set(cacheKey, data, ttl);
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

// Specific cache middlewares for different endpoints
export const carsCache = createCacheMiddleware({
  ttl: 10 * 60 * 1000, // 10 minutes
  keyGenerator: (req) => `cars:${req.query.page || 1}:${req.query.limit || 20}:${JSON.stringify(req.query)}`
});

export const categoriesCache = createCacheMiddleware({
  ttl: 30 * 60 * 1000, // 30 minutes
  keyGenerator: (req) => 'categories:all'
});

export const blogCache = createCacheMiddleware({
  ttl: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (req) => `blog:${req.query.page || 1}:${req.query.limit || 10}`
});

export const settingsCache = createCacheMiddleware({
  ttl: 60 * 60 * 1000, // 1 hour
  keyGenerator: (req) => 'settings:all'
});

// Cache invalidation functions
export function invalidateCache(pattern: string): void {
  const keysToDelete: string[] = [];
  
  for (const key of memoryCache['cache'].keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => memoryCache.delete(key));
  console.log(`Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
}

export function invalidateAllCache(): void {
  memoryCache.clear();
  console.log('All cache invalidated');
}

// Cache statistics endpoint
export function getCacheStats() {
  return memoryCache.getStats();
}

// Export cache instance for direct access
export { memoryCache };
