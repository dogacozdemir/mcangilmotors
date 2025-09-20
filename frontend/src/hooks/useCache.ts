import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  storage?: 'localStorage' | 'sessionStorage';
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function useCache<T>(
  key: string,
  options: CacheOptions = {}
): [T | null, (data: T) => void, () => void, boolean] {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    storage = 'localStorage'
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const storageAPI = storage === 'localStorage' ? localStorage : sessionStorage;

  // Get data from cache
  const getCachedData = useCallback((): T | null => {
    try {
      const cached = storageAPI.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        storageAPI.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }, [key, storageAPI]);

  // Set data to cache
  const setCachedData = useCallback((newData: T) => {
    try {
      const cacheItem: CacheItem<T> = {
        data: newData,
        timestamp: Date.now(),
        ttl
      };

      storageAPI.setItem(key, JSON.stringify(cacheItem));
      setData(newData);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }, [key, ttl, storageAPI]);

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      storageAPI.removeItem(key);
      setData(null);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key, storageAPI]);

  // Load data from cache on mount
  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
    }
  }, [getCachedData]);

  return [data, setCachedData, clearCache, isLoading];
}

// Hook for API caching
export function useAPICache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): [T | null, () => Promise<void>, () => void, boolean, Error | null] {
  const [data, setCachedData, clearCache] = useCache<T>(key, options);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (data) return; // Data already cached

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setCachedData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [data, fetcher, setCachedData]);

  const refresh = useCallback(async () => {
    clearCache();
    await fetchData();
  }, [clearCache, fetchData]);

  return [data, fetchData, clearCache, isLoading, error];
}

// Hook for image caching
export function useImageCache(src: string): [string | null, boolean] {
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!src) return;

    // Check if image is already cached
    const cached = localStorage.getItem(`img_${src}`);
    if (cached) {
      setCachedSrc(cached);
      return;
    }

    // Load and cache image
    setIsLoading(true);
    const img = new Image();
    
    img.onload = () => {
      // Store base64 in cache
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        localStorage.setItem(`img_${src}`, base64);
        setCachedSrc(base64);
      }
      
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    img.src = src;
  }, [src]);

  return [cachedSrc, isLoading];
}

// Hook for service worker registration
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered successfully:', reg);
          setIsRegistered(true);
          setRegistration(reg);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (registration) {
      registration.update();
    }
  }, [registration]);

  return {
    isSupported,
    isRegistered,
    registration,
    updateServiceWorker
  };
}

