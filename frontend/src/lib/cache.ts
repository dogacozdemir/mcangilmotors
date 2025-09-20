// Simple in-memory cache for client-side data
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? Date.now() - item.timestamp <= item.ttl : false;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Cache with automatic key generation
  cacheWithKey(prefix: string, params: Record<string, any>, data: any, ttl?: number) {
    const key = `${prefix}:${JSON.stringify(params)}`;
    this.set(key, data, ttl);
  }

  getWithKey(prefix: string, params: Record<string, any>) {
    const key = `${prefix}:${JSON.stringify(params)}`;
    return this.get(key);
  }
}

export const cache = new CacheManager();

// Cache keys
export const CACHE_KEYS = {
  CARS: 'cars',
  CATEGORIES: 'categories',
  BLOG_POSTS: 'blog_posts',
  SETTINGS: 'settings',
  CAR_DETAIL: 'car_detail',
  BLOG_POST: 'blog_post',
} as const;

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
  CARS: 10 * 60 * 1000, // 10 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  BLOG_POSTS: 15 * 60 * 1000, // 15 minutes
  SETTINGS: 60 * 60 * 1000, // 1 hour
  CAR_DETAIL: 20 * 60 * 1000, // 20 minutes
  BLOG_POST: 30 * 60 * 1000, // 30 minutes
} as const;









