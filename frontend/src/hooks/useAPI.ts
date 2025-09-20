import { useAPICache } from './useCache';
import apiClient from '@/lib/api';

// Cars API hooks
export function useCars(filters: any = {}) {
  const cacheKey = `cars:${JSON.stringify(filters)}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.cars.getAll(filters),
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );
}

export function useCar(id: number) {
  const cacheKey = `car:${id}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.cars.getById(id),
    { ttl: 10 * 60 * 1000 } // 10 minutes
  );
}

export function useSoldCars(filters: any = {}) {
  const cacheKey = `sold-cars:${JSON.stringify(filters)}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.cars.getSoldCars(filters),
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );
}

export function useIncomingCars(filters: any = {}) {
  const cacheKey = `incoming-cars:${JSON.stringify(filters)}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.cars.getIncomingCars(filters),
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );
}

// Categories API hooks
export function useCategories() {
  const cacheKey = 'categories:all';
  
  return useAPICache(
    cacheKey,
    () => apiClient.categories.getAll(),
    { ttl: 30 * 60 * 1000 } // 30 minutes
  );
}

// Blog API hooks
export function useBlogPosts(filters: any = {}) {
  const cacheKey = `blog:${JSON.stringify(filters)}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.blog.getAll(filters),
    { ttl: 15 * 60 * 1000 } // 15 minutes
  );
}

export function useBlogPost(slug: string) {
  const cacheKey = `blog-post:${slug}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.blog.getBySlug(slug),
    { ttl: 30 * 60 * 1000 } // 30 minutes
  );
}

// Settings API hooks
export function useSettings() {
  const cacheKey = 'settings:all';
  
  return useAPICache(
    cacheKey,
    () => apiClient.settings.get(),
    { ttl: 60 * 60 * 1000 } // 1 hour
  );
}

// Pages API hooks
export function usePages() {
  const cacheKey = 'pages:all';
  
  return useAPICache(
    cacheKey,
    () => apiClient.pages.getAll(),
    { ttl: 30 * 60 * 1000 } // 30 minutes
  );
}

export function usePage(slug: string) {
  const cacheKey = `page:${slug}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.pages.getBySlug(slug),
    { ttl: 30 * 60 * 1000 } // 30 minutes
  );
}

// Offers API hooks
export function useOffers(filters: any = {}) {
  const cacheKey = `offers:${JSON.stringify(filters)}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.offers.getAll(filters),
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );
}

// Customers API hooks
export function useCustomers(filters: any = {}) {
  const cacheKey = `customers:${JSON.stringify(filters)}`;
  
  return useAPICache(
    cacheKey,
    () => apiClient.customers.getAll(filters),
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );
}

