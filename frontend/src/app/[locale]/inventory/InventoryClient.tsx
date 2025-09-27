'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import CarCard from '@/components/ui/CarCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { Grid, List, SlidersHorizontal, Scale, Search, X, Filter, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api';
import { InventoryBreadcrumb } from '@/components/ui/Breadcrumb';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchCache } from '@/hooks/useSearchCache';

// Lazy load heavy components
const AdvancedFilters = dynamic(() => import('@/components/inventory/AdvancedFilters').then(mod => ({ default: mod.AdvancedFilters })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
});

const ModernFilters = dynamic(() => import('@/components/inventory/ModernFilters'), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
});

const VirtualizedGrid = dynamic(() => import('@/components/inventory/VirtualizedGrid').then(mod => ({ default: mod.VirtualizedGrid })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
});

const QuickViewModal = dynamic(() => import('@/components/ui/QuickViewModal').then(mod => ({ default: mod.QuickViewModal })), {
  loading: () => null
});

const ComparisonModal = dynamic(() => import('@/components/ui/ComparisonModal').then(mod => ({ default: mod.ComparisonModal })), {
  loading: () => null
});

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  engine?: string;
  bodyType?: string;
  plateStatus?: string;
  featured: boolean;
  coverImage?: string;
  category?: {
    name: string;
  };
  images?: Array<{
    imagePath: string;
    isMain: boolean;
    sortOrder: number;
    altText?: string;
  }>;
  translations?: Array<{
    title: string;
    description: string;
  }>;
}

interface Category {
  id: number;
  name: string;
}

interface InventoryClientProps {
  params: { locale: string };
}

export default function InventoryClient({ params }: InventoryClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useWishlist();

  // State management
  const [cars, setCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCars, setTotalCars] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCars, setSelectedCars] = useState<number[]>([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewCar, setQuickViewCar] = useState<Car | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  
  // Search term for hero search bar (separate from filters)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Search cache
  const { get: getCachedData, set: setCachedData, clear: clearCache } = useSearchCache();

  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filter options (populated from dedicated endpoints if available)
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [plateStatuses, setPlateStatuses] = useState<string[]>([]);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || '',
    priceFrom: searchParams.get('priceFrom') || '',
    priceTo: searchParams.get('priceTo') || '',
    priceSort: searchParams.get('priceSort') || '',
    mileageFrom: searchParams.get('mileageFrom') || '',
    mileageTo: searchParams.get('mileageTo') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    bodyType: searchParams.get('bodyType') || '',
    color: searchParams.get('color') || '',
    category: searchParams.get('category') || '',
    featured: searchParams.get('featured') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  // Load global makes only (models will be loaded when make is selected)
  useEffect(() => {
    let cancelled = false;
    const loadMakes = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const cleanApiBase = apiBase.replace(/\/api\/?$/, '');
        const makesRes = await fetch(`${cleanApiBase}/api/makes`).catch(() => null);

        if (!cancelled && makesRes && makesRes.ok) {
          const makesData = await makesRes.json();
          if (Array.isArray(makesData)) setMakes(makesData);
        }
      } catch (err) {
        console.warn('Could not load /api/makes:', err);
      }
    };
    loadMakes();
    return () => { cancelled = true; };
  }, []);

  // Load models based on selected make
  useEffect(() => {
    if (!filters.make) {
      setModels([]);
      return;
    }

    let cancelled = false;
    const loadModelsForMake = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const cleanApiBase = apiBase.replace(/\/api\/?$/, '');
        const response = await fetch(`${cleanApiBase}/api/models?make=${encodeURIComponent(filters.make)}`);
        if (!cancelled && response.ok) {
          const modelsData = await response.json();
          if (Array.isArray(modelsData)) {
            setModels(modelsData);
          }
        }
      } catch (err) {
        console.warn('Could not load models for make:', err);
      }
    };
    
    loadModelsForMake();
    return () => { cancelled = true; };
  }, [filters.make]);

  // Load categories once (if empty)
  useEffect(() => {
    if (categories.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const categoriesResponse = await fetch('/api/categories');
        if (!cancelled && categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData || []);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [categories.length]);

  // Load initial data with cache and error handling
  const loadInitialData = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCachedData(filters);
        if (cachedData) {
          setCars(cachedData.data);
          setTotalCars(cachedData.total);
          setHasMore(cachedData.data.length === 12);
          setLoading(false);
          setError(null);
          setSearchError(null);
          setRetryCount(0);
          return;
        }
      }

      // Prevent multiple simultaneous requests
      if (loading || isSearching) {
        return;
      }

      setLoading(true);
      setIsSearching(true);
      setError(null);
      setSearchError(null);
      setCars([]);
      setCurrentPage(1);
      setHasMore(true);

      const queryParams = new URLSearchParams();

      // Add filters to query params
      if (filters.yearFrom) queryParams.append('yearFrom', filters.yearFrom);
      if (filters.yearTo) queryParams.append('yearTo', filters.yearTo);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'yearFrom' || key === 'yearTo') return;
        
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            if (value) queryParams.append(key, 'true');
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      queryParams.append('page', '1');
      queryParams.append('limit', '12');

      // Add timeout to request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Remove trailing /api if it exists to avoid double /api/api/
      const cleanApiBase = apiBase.replace(/\/api\/?$/, '');
      const apiUrl = `${cleanApiBase}/api/cars?${queryParams.toString()}`;
      console.log('Search API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // No results found - show proper message
          setCars([]);
          setTotalCars(0);
          setHasMore(false);
          setError(null);
          setSearchError(null);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        const carsResponse = await response.json();
        
        setCars(carsResponse.cars || []);
        setTotalCars(carsResponse.pagination?.total || 0);
        setHasMore((carsResponse.cars || []).length === 12);

        // Cache the results
        setCachedData(filters, carsResponse.cars || [], carsResponse.pagination?.total || 0);

        // Extract unique body types & plate statuses from current result
        const uniqueBodyTypes = Array.from(new Set((carsResponse.cars || []).map((car: Car) => car.bodyType).filter(Boolean)));
        const uniquePlateStatuses = Array.from(new Set((carsResponse.cars || []).map((car: Car) => car.plateStatus).filter(Boolean)));

        setBodyTypes(uniqueBodyTypes as string[]);
        setPlateStatuses(uniquePlateStatuses as string[]);

        // Fallback: if global makes/models were not loaded earlier, derive them from the cars array
        const uniqueMakes = Array.from(new Set((carsResponse.cars || []).map((car: Car) => car.make).filter(Boolean))) as string[];
        const uniqueModels = Array.from(new Set((carsResponse.cars || []).map((car: Car) => car.model).filter(Boolean))) as string[];

        setMakes(prev => (prev && prev.length > 0 ? prev : uniqueMakes));
        setModels(prev => (prev && prev.length > 0 ? prev : uniqueModels));

        setRetryCount(0);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      
      if (err.name === 'AbortError') {
        setError('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
      } else if (err.message.includes('HTTP 500')) {
        setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.');
      } else {
        setError('Veriler yüklenirken bir hata oluştu.');
      }
      
      setSearchError('Arama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [filters, loading, isSearching, getCachedData, setCachedData]); // Keep dependencies but add safeguards

  // Load more data for infinite scroll with error handling
  const loadMoreData = useCallback(async () => {
    if (loadingMore || !hasMore || error || searchError) {
      return;
    }

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const queryParams = new URLSearchParams();

      if (filters.yearFrom) queryParams.append('yearFrom', filters.yearFrom);
      if (filters.yearTo) queryParams.append('yearTo', filters.yearTo);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'yearFrom' || key === 'yearTo') return;
        
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            if (value) queryParams.append(key, 'true');
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      queryParams.append('page', nextPage.toString());
      queryParams.append('limit', '12');

      // Add timeout to request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const cleanApiBase = apiBase.replace(/\/api\/?$/, '');
      const apiUrl = `${cleanApiBase}/api/cars?${queryParams.toString()}`;
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const carsResponse = await response.json();
      const newCars = carsResponse.cars || [];
      
      setCars(prev => [...prev, ...newCars]);
      setCurrentPage(nextPage);
      setHasMore(newCars.length === 12);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Error loading more data:', err);
      
      if (err.name === 'AbortError') {
        setError('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
      } else {
        setError('Daha fazla veri yüklenirken bir hata oluştu');
      }
      
      // Stop infinite scroll on error
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, filters, hasMore, loadingMore, error, searchError]);


  // Load filters from URL on mount and then load data
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlFilters: any = {};
    
    // Read filters from URL
    searchParams.forEach((value, key) => {
      if (key === 'featured') {
        urlFilters[key] = value === 'true';
      } else if (key !== 'page') { // Skip page parameter for infinite scroll
        urlFilters[key] = value;
      }
    });
    
    console.log('URL Filters:', urlFilters);
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    } else {
      // No URL filters, load data immediately
      loadInitialData();
    }
  }, [loadInitialData]);

  // Load data when filters change (with debounce to prevent infinite loops)
  useEffect(() => {
    // Skip if filters are empty (initial load)
    if (Object.values(filters).every(value => !value || value === '')) {
      return;
    }

    const timeoutId = setTimeout(() => {
      loadInitialData();
    }, 500); // Increased debounce to 500ms

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.make, filters.model, filters.yearFrom, filters.yearTo, filters.priceFrom, filters.priceTo, filters.mileageFrom, filters.mileageTo, filters.fuelType, filters.transmission, filters.color, filters.bodyType, filters.category]); // Only specific filter fields

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreData();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadingMore, loadMoreData]);


  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Sayfa pozisyonunu koru, sadece filtre state'ini güncelle
  };

  // Handle search from hero search bar with validation
  const handleSearch = useCallback(() => {
    // Validate search term
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchError('Lütfen en az 2 karakter girin');
      return;
    }

    // Clear previous errors
    setSearchError(null);
    
    // Update filters state with search term
    setFilters(prev => ({ ...prev, search: searchTerm.trim() }));
    
    // Update URL with search parameter (use replace to avoid navigation issues)
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', searchTerm.trim());
    router.replace(`/${locale}/inventory?${params.toString()}`);
  }, [searchTerm, searchParams, router, locale]);

  // Auto-search when debounced search term changes (only if different from current filter)
  useEffect(() => {
    const trimmedTerm = debouncedSearchTerm.trim();
    
    // Skip if search term is too short (but allow empty to clear search)
    if (trimmedTerm.length < 2 && trimmedTerm !== '') {
      return;
    }
    
    setFilters(prev => {
      // Only update if the search term is different from current
      if (trimmedTerm !== prev.search) {
        return { ...prev, search: trimmedTerm };
      }
      return prev; // No change needed
    });
    
    // Update URL without causing navigation issues
    const params = new URLSearchParams(searchParams.toString());
    if (trimmedTerm && trimmedTerm.length >= 2) {
      params.set('search', trimmedTerm);
    } else {
      params.delete('search');
    }
    
    // Use replace to avoid navigation stack issues
    router.replace(`/${locale}/inventory?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]); // Intentionally exclude filters.search to prevent circular dependency

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      make: '',
      model: '',
      yearFrom: '',
      yearTo: '',
      priceFrom: '',
      priceTo: '',
      priceSort: '',
      mileageFrom: '',
      mileageTo: '',
      fuelType: '',
      transmission: '',
      bodyType: '',
      color: '',
      category: '',
      featured: false,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchTerm('');
    setCars([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    setSearchError(null);
    setRetryCount(0);
    clearCache();
  }, [clearCache]);

  // Update URL with current filters
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add non-empty filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          if (value) params.append(key, 'true');
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(newURL, { scroll: false });
  }, [filters, router]);

  // Apply filters (explicit apply)
  const applyFilters = useCallback(async () => {
    updateURL(); // URL'i güncelle
    loadInitialData(true); // Yeni filtrelerle veriyi yükle (force refresh)
  }, [updateURL, loadInitialData]);

  // Retry function for failed requests
  const retryRequest = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setSearchError(null);
      loadInitialData(true); // Force refresh
    }
  }, [retryCount, maxRetries, loadInitialData]);

  // Handle car selection for comparison
  const handleCarSelect = (carId: number) => {
    setSelectedCars(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      } else if (prev.length < 3) {
        return [...prev, carId];
      }
      return prev;
    });
  };

  // Handle quick view
  const handleQuickView = (car: Car) => {
    setQuickViewCar(car);
    setShowQuickView(true);
  };

  // Memoized filtered cars count
  const filteredCarsCount = useMemo(() => {
    return totalCars;
  }, [totalCars]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Araçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && cars.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bir Hata Oluştu</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={retryRequest}
              disabled={retryCount >= maxRetries}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              {retryCount >= maxRetries ? 'Maksimum deneme sayısına ulaşıldı' : `Tekrar Dene (${retryCount}/${maxRetries})`}
            </button>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              type="button"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InventoryBreadcrumb locale={locale as string} />
        </div>
      </div>
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t('inventory.hero.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('inventory.hero.subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('inventory.hero.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={`w-full h-14 px-6 pr-14 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    searchError 
                      ? 'border-red-400 focus:ring-red-400' 
                      : 'border-white/20 focus:ring-amber-400'
                  }`}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-2 top-2 h-10 w-10 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors duration-300"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></div>
                  ) : (
                    <Search className="h-5 w-5 text-gray-900" />
                  )}
                </button>
              </div>
              
              {/* Search Error */}
              {searchError && (
                <div className="mt-2 text-red-300 text-sm text-center flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {searchError}
                </div>
              )}
              
              {/* Search Hint */}
              {searchTerm && searchTerm.length > 0 && searchTerm.length < 2 && (
                <div className="mt-2 text-yellow-300 text-sm text-center">
                  En az 2 karakter girin
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{totalCars || 0}</div>
                <div className="text-gray-300">Araç</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{categories.length || 0}</div>
                <div className="text-gray-300">Kategori</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">4.8</div>
                <div className="text-gray-300">Müşteri Puanı</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Modern Filters */}
        <div className="mb-8">
          <ModernFilters
            filters={{
              make: filters.make,
              model: filters.model,
              year: filters.yearFrom || filters.yearTo ? `${filters.yearFrom || ''}-${filters.yearTo || ''}` : undefined,
              yearFrom: filters.yearFrom,
              yearTo: filters.yearTo,
              priceSort: filters.priceSort,
              bodyType: filters.bodyType
            }}
            onFilterChange={(filter, value) => {
              if (filter === 'brand') {
                handleFilterChange('make', value);
                // when brand changes, clear the model selection
                handleFilterChange('model', '');
              } else if (filter === 'model') {
                handleFilterChange('model', value);
              } else if (filter === 'year') {
                const [yearFrom, yearTo] = (value || '').split('-');
                handleFilterChange('yearFrom', yearFrom || '');
                handleFilterChange('yearTo', yearTo || '');
              } else if (filter === 'yearFrom') {
                handleFilterChange('yearFrom', value);
              } else if (filter === 'yearTo') {
                handleFilterChange('yearTo', value);
              } else if (filter === 'priceSort') {
                handleFilterChange('priceSort', value);
              } else if (filter === 'bodyType') {
                handleFilterChange('bodyType', value);
              }
            }}
            onApplyFilters={applyFilters}
            onClearFilters={clearAllFilters}
            makes={makes}
            models={models}
            cars={cars}
            bodyTypes={bodyTypes}
          />
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
              Filtreleri Temizle
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {filteredCarsCount} araç bulundu
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                type="button"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                type="button"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        {cars.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                locale={locale}
                viewMode={viewMode}
                onQuickView={() => handleQuickView(car)}
                onCompare={() => handleCarSelect(car.id)}
                isInComparison={selectedCars.includes(car.id)}
                onWishlist={() => {
                  if (isInWishlist(car.id)) {
                    removeFromWishlist(car.id);
                  } else {
                    addToWishlist(car);
                  }
                }}
                isInWishlist={isInWishlist(car.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchError ? 'Arama Sırasında Hata' : 'Araç Bulunamadı'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchError 
                ? 'Arama yaparken bir sorun yaşandı. Lütfen tekrar deneyin.'
                : filters.search 
                  ? `"${filters.search}" araması için sonuç bulunamadı.`
                  : 'Arama kriterlerinize uygun araç bulunamadı.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchError ? (
                <button
                  onClick={retryRequest}
                  disabled={retryCount >= maxRetries}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  type="button"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tekrar Dene
                </button>
              ) : null}
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                type="button"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}

        {/* Infinite Scroll Loading */}
        {hasMore && !error && !searchError && (
          <div ref={loadMoreRef} className="mt-12 flex justify-center">
            {loadingMore ? (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                <span>Daha fazla araç yükleniyor...</span>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Aşağı kaydırarak daha fazla araç yükleyebilirsiniz
              </div>
            )}
          </div>
        )}

        {/* Error in infinite scroll */}
        {error && cars.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-2">{error}</div>
              <button
                onClick={retryRequest}
                disabled={retryCount >= maxRetries}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                type="button"
              >
                {retryCount >= maxRetries ? 'Maksimum deneme' : 'Tekrar Dene'}
              </button>
            </div>
          </div>
        )}

        {/* End of results */}
        {!hasMore && cars.length > 0 && (
          <div className="mt-12 text-center text-gray-500">
            <p>Tüm araçlar yüklendi ({cars.length} araç)</p>
          </div>
        )}

        {/* Comparison Button */}
        {selectedCars.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              type="button"
            >
              <Scale className="w-5 h-5" />
              Karşılaştır ({selectedCars.length})
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showQuickView && quickViewCar && (
        <QuickViewModal
          car={quickViewCar}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          locale={locale}
        />
      )}

      {showComparison && (
        <ComparisonModal
          cars={cars.filter(car => selectedCars.includes(car.id))}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          onRemoveCar={(carId) => setSelectedCars(prev => prev.filter(id => id !== carId))}
          locale={locale}
        />
      )}
    </div>
  );
}
