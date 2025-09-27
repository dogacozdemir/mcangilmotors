import { useState, useCallback } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
  total: number;
}

interface SearchCache {
  [key: string]: CacheEntry;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

export function useSearchCache() {
  const [cache, setCache] = useState<SearchCache>({});

  const getCacheKey = useCallback((filters: any): string => {
    // Create a consistent cache key from filters
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result: any, key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          result[key] = filters[key];
        }
        return result;
      }, {});
    
    return JSON.stringify(sortedFilters);
  }, []);

  const get = useCallback((filters: any): CacheEntry | null => {
    const key = getCacheKey(filters);
    const entry = cache[key];
    
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry;
    }
    
    // Remove expired entry
    if (entry) {
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
    }
    
    return null;
  }, [cache, getCacheKey]);

  const set = useCallback((filters: any, data: any, total: number) => {
    const key = getCacheKey(filters);
    
    setCache(prev => {
      // Remove oldest entries if cache is too large
      const entries = Object.entries(prev);
      if (entries.length >= MAX_CACHE_SIZE) {
        const sortedEntries = entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
        const toRemove = sortedEntries.slice(0, entries.length - MAX_CACHE_SIZE + 1);
        
        const newCache = { ...prev };
        toRemove.forEach(([key]) => delete newCache[key]);
        
        newCache[key] = {
          data,
          timestamp: Date.now(),
          total
        };
        
        return newCache;
      }
      
      return {
        ...prev,
        [key]: {
          data,
          timestamp: Date.now(),
          total
        }
      };
    });
  }, [getCacheKey]);

  const clear = useCallback(() => {
    setCache({});
  }, []);

  const clearExpired = useCallback(() => {
    const now = Date.now();
    setCache(prev => {
      const newCache: SearchCache = {};
      Object.entries(prev).forEach(([key, entry]) => {
        if (now - entry.timestamp < CACHE_DURATION) {
          newCache[key] = entry;
        }
      });
      return newCache;
    });
  }, []);

  return { get, set, clear, clearExpired };
}
