'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import CarCard from '@/components/ui/CarCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { Grid, List, SlidersHorizontal, Scale, Search, X, Filter, Zap, Truck, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api';

// Lazy load heavy components
const ModernFilters = dynamic(() => import('@/components/inventory/ModernFilters'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
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
  status?: string;
  expectedArrival?: string;
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

export default function IncomingCarsPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useWishlist();

  const [cars, setCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [plateStatuses, setPlateStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewCar, setQuickViewCar] = useState<Car | null>(null);
  const [comparisonCars, setComparisonCars] = useState<Car[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [sortBy, setSortBy] = useState('expected_arrival');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false);
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
    sortBy: searchParams.get('sortBy') || 'expectedArrival',
    sortOrder: searchParams.get('sortOrder') || 'asc'
  });

  // URL'den filtreleri yükle
  const loadFiltersFromURL = useCallback(() => {
    const urlFilters = {
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
      sortBy: searchParams.get('sortBy') || 'expectedArrival',
      sortOrder: searchParams.get('sortOrder') || 'asc'
    };
    setFilters(urlFilters);
    setSearchTerm(searchParams.get('search') || '');
    setSortBy(searchParams.get('sortBy') || 'expectedArrival');
    setSortOrder((searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc');
    setViewMode((searchParams.get('view') as 'grid' | 'list') || 'grid');
  }, [searchParams]);

  // URL'i güncelle
  const updateURL = useCallback((newFilters: any, newSearch: string, newSort: string, newOrder: string, newView: string) => {
    const params = new URLSearchParams();
    
    // Filtreleri URL'e ekle (inventory sayfasıyla aynı format)
    if (newSearch) params.set('search', newSearch);
    if (newFilters.make) params.set('make', newFilters.make);
    if (newFilters.model) params.set('model', newFilters.model);
    if (newFilters.yearFrom) params.set('yearFrom', newFilters.yearFrom);
    if (newFilters.yearTo) params.set('yearTo', newFilters.yearTo);
    if (newFilters.priceFrom) params.set('priceFrom', newFilters.priceFrom);
    if (newFilters.priceTo) params.set('priceTo', newFilters.priceTo);
    if (newFilters.mileageFrom) params.set('mileageFrom', newFilters.mileageFrom);
    if (newFilters.mileageTo) params.set('mileageTo', newFilters.mileageTo);
    if (newFilters.fuelType) params.set('fuelType', newFilters.fuelType);
    if (newFilters.transmission) params.set('transmission', newFilters.transmission);
    if (newFilters.bodyType) params.set('bodyType', newFilters.bodyType);
    if (newFilters.color) params.set('color', newFilters.color);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.featured) params.set('featured', 'true');
    
    if (newSort !== 'expectedArrival') params.set('sortBy', newSort);
    if (newOrder !== 'asc') params.set('sortOrder', newOrder);
    if (newView !== 'grid') params.set('view', newView);
    
    const newURL = `/${locale}/incoming-cars${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  }, [locale, router]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [carsRes, categoriesRes, makesRes, bodyTypesRes, plateStatusesRes] = await Promise.all([
        apiClient.getIncomingCars({ limit: 100, lang: locale }),
        apiClient.getCategories(),
        apiClient.getCarMakes(),
        apiClient.getCarBodyTypes(),
        apiClient.getCarPlateStatuses()
      ]);

      console.log('Incoming cars data:', carsRes);
      console.log('Categories data:', categoriesRes);
      console.log('Makes data:', makesRes);

      // Ana sayfa gibi data.cars ile eriş
      const carsData = Array.isArray((carsRes as any)?.cars) ? (carsRes as any).cars : [];
      setCars(carsData);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setMakes(Array.isArray(makesRes) ? makesRes : []);
      setBodyTypes(Array.isArray(bodyTypesRes) ? bodyTypesRes : []);
      setPlateStatuses(Array.isArray(plateStatusesRes) ? plateStatusesRes : []);
      
      // Models array'ini başlangıçta boş bırak, marka seçildiğinde yüklenecek
      setModels([]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  // Load models based on selected make (inventory sayfasıyla aynı mantık)
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

  useEffect(() => {
    loadFiltersFromURL();
    loadData();
  }, [loadFiltersFromURL, loadData]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    updateURL(filters, searchTerm, newSortBy, sortOrder, viewMode);
  };

  const handleSortOrderChange = (newSortOrder: 'asc' | 'desc') => {
    setSortOrder(newSortOrder);
    updateURL(filters, searchTerm, sortBy, newSortOrder, viewMode);
  };

  const handleViewModeChange = (newViewMode: 'grid' | 'list') => {
    setViewMode(newViewMode);
    updateURL(filters, searchTerm, sortBy, sortOrder, newViewMode);
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
    
    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', searchTerm.trim());
    router.push(`/${locale}/incoming-cars?${params.toString()}`);
  }, [searchTerm, searchParams, router, locale]);

  const handleSearchChange = (newSearchQuery: string) => {
    setSearchTerm(newSearchQuery);
    setCurrentPage(1);
    updateURL(filters, newSearchQuery, sortBy, sortOrder, viewMode);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, searchTerm, sortBy, sortOrder, viewMode);
  };

  const addToComparison = (car: Car) => {
    if (comparisonCars.length >= 3) {
      alert('En fazla 3 araç karşılaştırabilirsiniz');
      return;
    }
    if (!comparisonCars.find(c => c.id === car.id)) {
      setComparisonCars([...comparisonCars, car]);
    }
  };

  const removeFromComparison = (carId: number) => {
    setComparisonCars(comparisonCars.filter(car => car.id !== carId));
  };

  const openComparison = () => {
    if (comparisonCars.length < 2) {
      alert('En az 2 araç seçmelisiniz');
      return;
    }
    setShowComparison(true);
  };

  // Wishlist fonksiyonları
  const handleWishlistToggle = (car: Car) => {
    if (isInWishlist(car.id)) {
      removeFromWishlist(car.id);
    } else {
      addToWishlist(car);
    }
  };

  // Quick view fonksiyonu
  const handleQuickView = (car: Car) => {
    setQuickViewCar(car);
  };

  // Karşılaştırma toggle fonksiyonu
  const handleComparisonToggle = (car: Car) => {
    if (comparisonCars.find(c => c.id === car.id)) {
      removeFromComparison(car.id);
    } else {
      addToComparison(car);
    }
  };

  const onClearFilters = () => {
    const clearedFilters = {
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
      sortBy: 'expectedArrival',
      sortOrder: 'asc'
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    setCurrentPage(1);
    setSortBy('expectedArrival');
    setSortOrder('asc');
    updateURL(clearedFilters, '', 'expectedArrival', 'asc', 'grid');
  };

  // Aktif filtre sayısını hesapla
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.yearFrom) count++;
    if (filters.yearTo) count++;
    if (filters.priceFrom) count++;
    if (filters.priceTo) count++;
    if (filters.mileageFrom) count++;
    if (filters.mileageTo) count++;
    if (filters.fuelType) count++;
    if (filters.transmission) count++;
    if (filters.bodyType) count++;
    if (filters.color) count++;
    if (filters.category) count++;
    if (filters.featured) count++;
    return count;
  }, [filters]);

  // Gelişmiş filtreleme mantığı
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Arama sorgusu kontrolü
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const searchMatch = (
          car.make.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.year.toString().includes(query) ||
          car.color.toLowerCase().includes(query) ||
          car.fuelType.toLowerCase().includes(query) ||
          car.transmission.toLowerCase().includes(query) ||
          car.engine?.toLowerCase().includes(query) ||
          car.bodyType?.toLowerCase().includes(query) ||
          car.plateStatus?.toLowerCase().includes(query)
        );
        if (!searchMatch) return false;
      }

      // Filtre kontrolleri (inventory sayfasıyla aynı format)
      if (filters.make && car.make !== filters.make) return false;
      if (filters.model && car.model !== filters.model) return false;
      if (filters.yearFrom && car.year < parseInt(filters.yearFrom)) return false;
      if (filters.yearTo && car.year > parseInt(filters.yearTo)) return false;
      if (filters.priceFrom && car.price && car.price < parseInt(filters.priceFrom)) return false;
      if (filters.priceTo && car.price && car.price > parseInt(filters.priceTo)) return false;
      if (filters.mileageFrom && car.mileage && car.mileage < parseInt(filters.mileageFrom)) return false;
      if (filters.mileageTo && car.mileage && car.mileage > parseInt(filters.mileageTo)) return false;
      if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
      if (filters.color && car.color !== filters.color) return false;
      if (filters.category && car.category?.name !== filters.category) return false;
      if (filters.featured && !car.featured) return false;

      return true;
    });
  }, [cars, searchTerm, filters]);

  // Sıralama mantığı
  const sortedCars = useMemo(() => {
    return [...filteredCars].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const aPrice = a.price || 0;
          const bPrice = b.price || 0;
          return sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
        case 'year':
          return sortOrder === 'asc' ? a.year - b.year : b.year - a.year;
        case 'mileage':
          return sortOrder === 'asc' ? a.mileage - b.mileage : b.mileage - a.mileage;
        case 'make':
          return sortOrder === 'asc' 
            ? a.make.localeCompare(b.make)
            : b.make.localeCompare(a.make);
        case 'expected_arrival':
        default:
          // Beklenen varış tarihine göre sırala
          const aArrival = a.expectedArrival ? new Date(a.expectedArrival).getTime() : 0;
          const bArrival = b.expectedArrival ? new Date(b.expectedArrival).getTime() : 0;
          return sortOrder === 'asc' ? aArrival - bArrival : bArrival - aArrival;
      }
    });
  }, [filteredCars, sortBy, sortOrder]);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(sortedCars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCars = sortedCars.slice(startIndex, endIndex);

  // Sayfa değiştirme
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-amber-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-amber-500 border-t-transparent mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-xl text-gray-300 font-medium">Yolda gelen araçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('incomingCars.hero.title')} - Mustafa Cangil Auto Trading Ltd. | KKTC 2. El Ve Plakasız Araç Alım & Satım</title>
        <meta name="description" content={t('incomingCars.hero.subtitle')} />
        <meta name="keywords" content="yolda gelen araçlar, KKTC araç, Mustafa Cangil Auto Trading Ltd., yurt dışı araç, lüks araç, Lefkoşa araç galerisi, Girne araç galerisi, beklenen araçlar" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${t('incomingCars.hero.title')} - Mustafa Cangil Auto Trading Ltd.`} />
        <meta property="og:description" content={t('incomingCars.hero.subtitle')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mcangilmotors.com/${locale}/incoming-cars`} />
        <meta property="og:image" content="https://mcangilmotors.com/hero-bg.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('incomingCars.hero.title')} - Mustafa Cangil Auto Trading Ltd.`} />
        <meta name="twitter:description" content={t('incomingCars.hero.subtitle')} />
        <meta name="twitter:image" content="https://mcangilmotors.com/hero-bg.jpg" />
        
        {/* Hreflang */}
        <link rel="alternate" hrefLang="tr" href="https://mcangilmotors.com/tr/incoming-cars" />
        <link rel="alternate" hrefLang="en" href="https://mcangilmotors.com/en/incoming-cars" />
        <link rel="alternate" hrefLang="ar" href="https://mcangilmotors.com/ar/incoming-cars" />
        <link rel="alternate" hrefLang="ru" href="https://mcangilmotors.com/ru/incoming-cars" />
        <link rel="alternate" hrefLang="x-default" href="https://mcangilmotors.com/tr/incoming-cars" />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://mcangilmotors.com/${locale}/incoming-cars`} />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": `${t('incomingCars.hero.title')} - Mustafa Cangil Auto Trading Ltd.`,
              "description": t('incomingCars.hero.subtitle'),
              "url": `https://mcangilmotors.com/${locale}/incoming-cars`,
              "mainEntity": {
                "@type": "ItemList",
                "name": t('incomingCars.hero.title'),
                "description": t('incomingCars.hero.subtitle'),
                "numberOfItems": sortedCars.length
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": `https://mcangilmotors.com/${locale}`
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": t('incomingCars.hero.title'),
                    "item": `https://mcangilmotors.com/${locale}/incoming-cars`
                  }
                ]
              },
              "publisher": {
                "@type": "AutoDealer",
                "name": "Mustafa Cangil Auto Trading Ltd.",
                "url": "https://mcangilmotors.com",
                "logo": "https://mcangilmotors.com/logo.png",
                "telephone": "+90 533 855 11 66",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "TR",
                  "addressRegion": "KKTC",
                  "addressLocality": "Alsancak"
                }
              }
            })
          }}
        />
      </Head>
      
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4">
                <Truck className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                {t('incomingCars.hero.title')}
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('incomingCars.hero.subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('incomingCars.hero.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={`w-full pl-12 pr-14 py-4 text-lg rounded-2xl border-0 shadow-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-gray-900 ${
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
          </div>
        </div>
      </div>

      {/* Advanced Filters - Always Visible */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white shadow-lg rounded-2xl">
          {/* Filter Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-gray-900">{t('incomingCars.filters.title')}</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={onClearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>{t('incomingCars.filters.clearAll')}</span>
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {sortedCars.length} {t('incomingCars.filters.resultsFound')}
            </div>
          </div>

          {/* Filter Content - Always Visible */}
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
              if (filter === 'make') {
                handleFilterChange('make', value);
                // when make changes, clear the model selection
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
              } else if (filter === 'fuelType') {
                handleFilterChange('fuelType', value);
              } else if (filter === 'transmission') {
                handleFilterChange('transmission', value);
              } else if (filter === 'color') {
                handleFilterChange('color', value);
              } else if (filter === 'category') {
                handleFilterChange('category', value);
              } else if (filter === 'priceFrom') {
                handleFilterChange('priceFrom', value);
              } else if (filter === 'priceTo') {
                handleFilterChange('priceTo', value);
              } else if (filter === 'mileageFrom') {
                handleFilterChange('mileageFrom', value);
              } else if (filter === 'mileageTo') {
                handleFilterChange('mileageTo', value);
              }
            }}
            onApplyFilters={() => {}}
            onClearFilters={onClearFilters}
            makes={makes}
            models={models}
            cars={cars}
            bodyTypes={bodyTypes}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sortedCars.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Yolda gelen araç bulunamadı</h3>
            <p className="text-gray-600 mb-6">Arama kriterlerinize uygun yolda gelen araç bulunamadı.</p>
            <button
              onClick={onClearFilters}
              className="bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {sortedCars.length} Yolda Gelen Araç Bulundu
                </h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {currentPage > 1 ? `Sayfa ${currentPage} - ` : ''}
                  {startIndex + 1}-{Math.min(endIndex, sortedCars.length)} arası gösteriliyor
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                {/* Sort Dropdown */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="expected_arrival">Beklenen Varış</option>
                    <option value="price">Fiyat</option>
                    <option value="year">Yıl</option>
                    <option value="mileage">Kilometre</option>
                    <option value="make">Marka</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Sort Order */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortOrder}
                    onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="asc">Artan</option>
                    <option value="desc">Azalan</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Comparison Button */}
                {comparisonCars.length > 0 && (
                  <button
                    onClick={openComparison}
                    className="flex items-center bg-amber-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200"
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      Karşılaştır ({comparisonCars.length})
                    </span>
                  </button>
                )}
                
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                  <button 
                    onClick={() => handleViewModeChange('grid')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="w-4 h-4 inline mr-1" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button 
                    onClick={() => handleViewModeChange('list')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4 inline mr-1" />
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                </div>

                {/* Virtual Scrolling Toggle */}
                {sortedCars.length > 50 && (
                  <button
                    onClick={() => setUseVirtualScrolling(!useVirtualScrolling)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      useVirtualScrolling
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {useVirtualScrolling ? 'Normal' : 'Hızlı'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Cars Display */}
            {useVirtualScrolling ? (
              <VirtualizedGrid
                cars={sortedCars}
                locale={locale}
                viewMode={viewMode}
                itemsPerPage={itemsPerPage}
                onQuickView={handleQuickView}
                onCompare={handleComparisonToggle}
                onWishlist={handleWishlistToggle}
                isInComparison={(car: Car) => !!comparisonCars.find(c => c.id === car.id)}
                isInWishlist={(car: Car) => isInWishlist(car.id)}
              />
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {paginatedCars.map((car, index) => (
                  <CarCard 
                    key={car.id} 
                    car={car} 
                    locale={locale}
                    viewMode={viewMode}
                    onQuickView={handleQuickView}
                    onCompare={handleComparisonToggle}
                    isInComparison={!!comparisonCars.find(c => c.id === car.id)}
                    onWishlist={handleWishlistToggle}
                    isInWishlist={isInWishlist(car.id)}
                    showIncomingBadge={true}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!useVirtualScrolling && totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first 3 pages, last 3 pages, and current page with context
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            page === currentPage
                              ? 'bg-amber-500 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {quickViewCar && (
        <QuickViewModal
          isOpen={!!quickViewCar}
          car={quickViewCar}
          locale={locale}
          onClose={() => setQuickViewCar(null)}
        />
      )}

      {showComparison && (
        <ComparisonModal
          isOpen={showComparison}
          cars={comparisonCars}
          locale={locale}
          onClose={() => setShowComparison(false)}
          onRemoveCar={removeFromComparison}
        />
      )}
      </div>
    </>
  );
}

