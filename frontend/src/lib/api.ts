import { cache, CACHE_KEYS, CACHE_TTL } from './cache';
import { useAPICache } from '@/hooks/useCache';
import { getApiUrl } from './urlUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getCSRFToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }
    
    // Fallback to localStorage
    return localStorage.getItem('csrfToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get CSRF token from meta tag or localStorage
    const csrfToken = this.getCSRFToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Cars API
  async getCars(params: any = {}) {
    // Check cache first
    const cacheKey = cache.getWithKey(CACHE_KEYS.CARS, params);
    if (cacheKey) {
      return cacheKey;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const data = await this.request(`/cars?${searchParams.toString()}`);
    
    console.log('API Response for cars:', data);
    console.log('API URL:', `/cars?${searchParams.toString()}`);
    
    // Cache the result
    cache.cacheWithKey(CACHE_KEYS.CARS, params, data, CACHE_TTL.CARS);
    
    return data;
  }

  async getCar(id: number, lang = 'tr') {
    return this.request(`/cars/${id}?lang=${lang}`);
  }

  async createCar(data: any) {
    return this.request('/cars', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCar(id: number, data: any) {
    return this.request(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCar(id: number) {
    return this.request(`/cars/${id}`, {
      method: 'DELETE',
    });
  }

  async getCarMakes() {
    return this.request('/cars/meta/makes');
  }

  async getCarModels(make?: string) {
    const params = make ? `?make=${encodeURIComponent(make)}` : '';
    return this.request(`/cars/meta/models${params}`);
  }

  async getCarBodyTypes() {
    return this.request('/cars/meta/body-types');
  }

  async getCarPlateStatuses() {
    return this.request('/cars/meta/plate-statuses');
  }

  async getSoldCars(params: any = {}) {
    // Check cache first
    const cacheKey = cache.getWithKey(CACHE_KEYS.CARS, { ...params, sold: true });
    if (cacheKey) {
      return cacheKey;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const data = await this.request(`/cars/sold?${searchParams.toString()}`);
    
    // Cache the result
    cache.cacheWithKey(CACHE_KEYS.CARS, { ...params, sold: true }, data, CACHE_TTL.CARS);
    
    return data;
  }

  async getIncomingCars(params: any = {}) {
    // Check cache first
    const cacheKey = cache.getWithKey(CACHE_KEYS.CARS, { ...params, incoming: true });
    if (cacheKey) {
      return cacheKey;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const data = await this.request(`/cars/incoming?${searchParams.toString()}`);
    
    // Cache the result
    cache.cacheWithKey(CACHE_KEYS.CARS, { ...params, incoming: true }, data, CACHE_TTL.CARS);
    
    return data;
  }

  async getFeaturedCars(params: any = {}) {
    // Check cache first
    const cacheKey = cache.getWithKey(CACHE_KEYS.CARS, { ...params, featured: true });
    if (cacheKey) {
      return cacheKey;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const data = await this.request(`/cars/featured?${searchParams.toString()}`);
    
    // Cache the result
    cache.cacheWithKey(CACHE_KEYS.CARS, { ...params, featured: true }, data, CACHE_TTL.CARS);
    
    return data;
  }

  async searchCars(query: string, params: any = {}) {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request(`/cars/search?${searchParams.toString()}`);
  }

  // Categories API
  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(id: number) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Blog API
  async getBlogPosts(params: any = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request(`/blog?${searchParams.toString()}`);
  }

  async getBlogPost(slug: string, lang = 'tr') {
    return this.request(`/blog/${slug}?lang=${lang}`);
  }

  async createBlogPost(data: any) {
    return this.request('/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlogPost(id: number, data: any) {
    return this.request(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBlogPost(id: number) {
    return this.request(`/blog/${id}`, {
      method: 'DELETE',
    });
  }

  // Pages API
  async getPages(lang = 'tr') {
    return this.request(`/pages?lang=${lang}`);
  }

  async getPage(slug: string, lang = 'tr') {
    return this.request(`/pages/${slug}?lang=${lang}`);
  }

  async createPage(data: any) {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePage(id: number, data: any) {
    return this.request(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePage(id: number) {
    return this.request(`/pages/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers API
  async getCustomers(params: any = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request(`/customers?${searchParams.toString()}`);
  }

  async getCustomer(id: number) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: number, data: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: number) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Offers API
  async getOffers(params: any = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request(`/offers?${searchParams.toString()}`);
  }

  async getOffer(id: number) {
    return this.request(`/offers/${id}`);
  }

  async createOffer(data: any) {
    return this.request('/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOffer(id: number, data: any) {
    return this.request(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOffer(id: number) {
    return this.request(`/offers/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Upload API
  async uploadImage(file: File, type: string) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/upload/${type}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async uploadBlogImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/upload/blog`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async uploadCarImage(file: File, carId: number) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/car-images/${carId}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async validateImageUrl(url: string) {
    return this.request('/upload/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Car Images API
  async uploadCarCoverImage(carId: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/car-images/${carId}/cover-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }


  async reorderCarImages(carId: number, imageIds: number[]) {
    return this.request(`/car-images/${carId}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ imageIds }),
    });
  }

  async deleteCarImage(carId: number, imageId: number) {
    return this.request(`/car-images/${carId}/images/${imageId}`, {
      method: 'DELETE',
    });
  }


  async getCarImages(carId: number) {
    return this.request(`/car-images/${carId}/images`);
  }

  async setMainCarImage(imageId: number) {
    return this.request(`/car-images/${imageId}/set-main`, {
      method: 'PUT',
    });
  }

  // Section methods
  async getAboutSections(lang = 'tr') {
    return this.request(`/pages/about/sections?lang=${lang}`);
  }

  async getContactSections(lang = 'tr') {
    return this.request(`/pages/contact/sections?lang=${lang}`);
  }

  async getHomeSections(lang = 'tr') {
    return this.request(`/pages/home/sections?lang=${lang}`);
  }

  async uploadCarGalleryImage(carId: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/car-images/${carId}/gallery`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async uploadCarGalleryImages(carId: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const response = await fetch(`${this.baseUrl}/car-images/${carId}/gallery/batch`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

// Create API client instance
const cleanApiBase = API_BASE_URL.replace(/\/api\/?$/, '');
const apiClientInstance = new ApiClient(`${cleanApiBase}/api`);

// Export modular API client
export const apiClient = {
  cars: {
    getAll: (params: any = {}) => apiClientInstance.getCars(params),
    getById: (id: number, lang = 'tr') => apiClientInstance.getCar(id, lang),
    create: (data: any) => apiClientInstance.createCar(data),
    update: (id: number, data: any) => apiClientInstance.updateCar(id, data),
    delete: (id: number) => apiClientInstance.deleteCar(id),
    getSoldCars: (params: any = {}) => apiClientInstance.getSoldCars(params),
    getIncomingCars: (params: any = {}) => apiClientInstance.getIncomingCars(params),
    getFeatured: (params: any = {}) => apiClientInstance.getFeaturedCars(params),
    search: (query: string, params: any = {}) => apiClientInstance.searchCars(query, params)
  },
  categories: {
    getAll: () => apiClientInstance.getCategories(),
    getById: (id: number) => apiClientInstance.getCategory(id),
    create: (data: any) => apiClientInstance.createCategory(data),
    update: (id: number, data: any) => apiClientInstance.updateCategory(id, data),
    delete: (id: number) => apiClientInstance.deleteCategory(id)
  },
  blog: {
    getAll: (params: any = {}) => apiClientInstance.getBlogPosts(params),
    getBySlug: (slug: string, lang = 'tr') => apiClientInstance.getBlogPost(slug, lang),
    create: (data: any) => apiClientInstance.createBlogPost(data),
    update: (id: number, data: any) => apiClientInstance.updateBlogPost(id, data),
    delete: (id: number) => apiClientInstance.deleteBlogPost(id)
  },
  settings: {
    get: () => apiClientInstance.getSettings(),
    update: (data: any) => apiClientInstance.updateSettings(data)
  },
  pages: {
    getAll: () => apiClientInstance.getPages(),
    getBySlug: (slug: string, lang = 'tr') => apiClientInstance.getPage(slug, lang),
    getPage: (slug: string, lang = 'tr') => apiClientInstance.getPage(slug, lang),
    create: (data: any) => apiClientInstance.createPage(data),
    update: (id: number, data: any) => apiClientInstance.updatePage(id, data),
    delete: (id: number) => apiClientInstance.deletePage(id)
  },
  offers: {
    getAll: (params: any = {}) => apiClientInstance.getOffers(params),
    getById: (id: number) => apiClientInstance.getOffer(id),
    create: (data: any) => apiClientInstance.createOffer(data),
    update: (id: number, data: any) => apiClientInstance.updateOffer(id, data),
    delete: (id: number) => apiClientInstance.deleteOffer(id)
  },
  customers: {
    getAll: (params: any = {}) => apiClientInstance.getCustomers(params),
    getById: (id: number) => apiClientInstance.getCustomer(id),
    create: (data: any) => apiClientInstance.createCustomer(data),
    update: (id: number, data: any) => apiClientInstance.updateCustomer(id, data),
    delete: (id: number) => apiClientInstance.deleteCustomer(id)
  },
  upload: {
    uploadImage: (file: File, type: string) => apiClientInstance.uploadImage(file, type),
    uploadCarImage: (file: File, carId: number) => apiClientInstance.uploadCarImage(file, carId),
    uploadBlogImage: (file: File) => apiClientInstance.uploadBlogImage(file)
  },
  carImages: {
    getAll: (carId: number) => apiClientInstance.getCarImages(carId),
    upload: (file: File, carId: number) => apiClientInstance.uploadCarImage(file, carId),
    delete: (carId: number, imageId: number) => apiClientInstance.deleteCarImage(carId, imageId),
    setMain: (id: number) => apiClientInstance.setMainCarImage(id)
  },
  // Additional methods for compatibility
  getPage: (slug: string, lang = 'tr') => apiClientInstance.getPage(slug, lang),
  getBlogPost: (slug: string, lang = 'tr') => apiClientInstance.getBlogPost(slug, lang),
  getBlogPosts: (params: any = {}) => apiClientInstance.getBlogPosts(params),
  getCar: (id: number, lang = 'tr') => apiClientInstance.getCar(id, lang),
  getCars: (params: any = {}) => apiClientInstance.getCars(params),
  getIncomingCars: (params: any = {}) => apiClientInstance.getIncomingCars(params),
  getSoldCars: (params: any = {}) => apiClientInstance.getSoldCars(params),
  getCategories: () => apiClientInstance.getCategories(),
  getCarMakes: () => apiClientInstance.getCarMakes(),
  getCarBodyTypes: () => apiClientInstance.getCarBodyTypes(),
  getCarPlateStatuses: () => apiClientInstance.getCarPlateStatuses(),
  createPage: (data: any) => apiClientInstance.createPage(data),
  updatePage: (id: number, data: any) => apiClientInstance.updatePage(id, data),
  deletePage: (id: number) => apiClientInstance.deletePage(id),
  uploadImage: (file: File, type: string) => apiClientInstance.uploadImage(file, type),
  uploadBlogImage: (file: File) => apiClientInstance.uploadBlogImage(file),
  uploadCarImage: (file: File, carId: number) => apiClientInstance.uploadCarImage(file, carId),
  uploadCarCoverImage: (carId: number, file: File) => apiClientInstance.uploadCarCoverImage(carId, file),
  uploadCarGalleryImage: (carId: number, file: File) => apiClientInstance.uploadCarGalleryImage(carId, file),
  uploadCarGalleryImages: (carId: number, files: File[]) => apiClientInstance.uploadCarGalleryImages(carId, files),
  deleteCarImage: (carId: number, imageId: number) => apiClientInstance.deleteCarImage(carId, imageId),
  setMainCarImage: (imageId: number) => apiClientInstance.setMainCarImage(imageId),
  reorderCarImages: (carId: number, imageIds: number[]) => apiClientInstance.reorderCarImages(carId, imageIds),
  createBlogPost: (data: any) => apiClientInstance.createBlogPost(data),
  updateBlogPost: (id: number, data: any) => apiClientInstance.updateBlogPost(id, data),
  deleteBlogPost: (id: number) => apiClientInstance.deleteBlogPost(id),
  createCar: (data: any) => apiClientInstance.createCar(data),
  updateCar: (id: number, data: any) => apiClientInstance.updateCar(id, data),
  deleteCar: (id: number) => apiClientInstance.deleteCar(id),
  createCategory: (data: any) => apiClientInstance.createCategory(data),
  updateCategory: (id: number, data: any) => apiClientInstance.updateCategory(id, data),
  deleteCategory: (id: number) => apiClientInstance.deleteCategory(id),
  getPages: () => apiClientInstance.getPages(),
  getAboutSections: (lang = 'tr') => apiClientInstance.getAboutSections(lang),
  getContactSections: (lang = 'tr') => apiClientInstance.getContactSections(lang),
  getHomeSections: (lang = 'tr') => apiClientInstance.getHomeSections(lang)
};

export default apiClient;

