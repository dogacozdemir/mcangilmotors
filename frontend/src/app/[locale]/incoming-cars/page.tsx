'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { CarCard } from '@/components/ui/CarCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { Grid, List, SlidersHorizontal, Scale, Search, X, Filter, Zap, Truck } from 'lucide-react';
import apiClient from '@/lib/api';

// Lazy load heavy components
const AdvancedFilters = dynamic(() => import('@/components/inventory/AdvancedFilters').then(mod => ({ default: mod.AdvancedFilters })), {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    year_min: '',
    year_max: '',
    price_min: '',
    price_max: '',
    mileage_min: '',
    mileage_max: '',
    expected_arrival_from: '',
    expected_arrival_to: '',
    fuel_type: '',
    transmission: '',
    color: '',
    body_type: '',
    plate_status: '',
    category_id: '',
    featured: ''
  });

  // URL'den filtreleri yükle
  const loadFiltersFromURL = useCallback(() => {
    const urlFilters = {
      make: searchParams.get('make') || '',
      model: searchParams.get('model') || '',
      year_min: searchParams.get('year_min') || '',
      year_max: searchParams.get('year_max') || '',
      price_min: searchParams.get('price_min') || '',
      price_max: searchParams.get('price_max') || '',
      mileage_min: searchParams.get('mileage_min') || '',
      mileage_max: searchParams.get('mileage_max') || '',
      expected_arrival_from: searchParams.get('expected_arrival_from') || '',
      expected_arrival_to: searchParams.get('expected_arrival_to') || '',
      fuel_type: searchParams.get('fuel_type') || '',
      transmission: searchParams.get('transmission') || '',
      color: searchParams.get('color') || '',
      body_type: searchParams.get('body_type') || '',
      plate_status: searchParams.get('plate_status') || '',
      category_id: searchParams.get('category_id') || '',
      featured: searchParams.get('featured') || ''
    };
    setFilters(urlFilters);
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'expected_arrival');
    setSortOrder((searchParams.get('order') as 'asc' | 'desc') || 'asc');
    setViewMode((searchParams.get('view') as 'grid' | 'list') || 'grid');
  }, [searchParams]);

  // URL'i güncelle
  const updateURL = useCallback((newFilters: any, newSearch: string, newSort: string, newOrder: string, newView: string) => {
    const params = new URLSearchParams();
    
    // Filtreleri URL'e ekle
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value as string);
    });
    
    if (newSearch) params.set('search', newSearch);
    if (newSort !== 'expected_arrival') params.set('sort', newSort);
    if (newOrder !== 'asc') params.set('order', newOrder);
    if (newView !== 'grid') params.set('view', newView);
    
    const newURL = `/${locale}/incoming-cars${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  }, [locale, router]);

  const loadData = async () => {
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
      
      // Models array'ini cars'dan oluştur
      const uniqueModels = Array.from(new Set(carsData.map((car: any) => car.model).filter(Boolean))) as string[];
      setModels(uniqueModels);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiltersFromURL();
    loadData();
  }, [loadFiltersFromURL]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    updateURL(filters, searchQuery, newSortBy, sortOrder, viewMode);
  };

  const handleSortOrderChange = (newSortOrder: 'asc' | 'desc') => {
    setSortOrder(newSortOrder);
    updateURL(filters, searchQuery, sortBy, newSortOrder, viewMode);
  };

  const handleViewModeChange = (newViewMode: 'grid' | 'list') => {
    setViewMode(newViewMode);
    updateURL(filters, searchQuery, sortBy, sortOrder, newViewMode);
  };

  const handleSearchChange = (newSearchQuery: string) => {
    setSearchQuery(newSearchQuery);
    setCurrentPage(1);
    updateURL(filters, newSearchQuery, sortBy, sortOrder, viewMode);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, searchQuery, sortBy, sortOrder, viewMode);
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
      make: '',
      model: '',
      year_min: '',
      year_max: '',
      price_min: '',
      price_max: '',
      mileage_min: '',
      mileage_max: '',
      expected_arrival_from: '',
      expected_arrival_to: '',
      fuel_type: '',
      transmission: '',
      color: '',
      body_type: '',
      plate_status: '',
      category_id: '',
      featured: ''
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    setCurrentPage(1);
    updateURL(clearedFilters, '', sortBy, sortOrder, viewMode);
  };

  // Aktif filtre sayısını hesapla
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '').length + (searchQuery ? 1 : 0);
  }, [filters, searchQuery]);

  // Gelişmiş filtreleme mantığı
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Arama sorgusu kontrolü
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
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

      // Filtre kontrolleri
      if (filters.make && car.make !== filters.make) return false;
      if (filters.year_min && car.year < parseInt(filters.year_min)) return false;
      if (filters.year_max && car.year > parseInt(filters.year_max)) return false;
      if (filters.price_min && car.price && car.price < parseInt(filters.price_min)) return false;
      if (filters.price_max && car.price && car.price > parseInt(filters.price_max)) return false;
      if (filters.fuel_type && car.fuelType !== filters.fuel_type) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.body_type && car.bodyType !== filters.body_type) return false;
      if (filters.plate_status && car.plateStatus !== filters.plate_status) return false;
      if (filters.category_id && car.category?.name !== filters.category_id) return false;

      return true;
    });
  }, [cars, searchQuery, filters]);

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
        <title>{t('incomingCars.hero.title')} - Mustafa Cangil Auto Trading Ltd. | KKTC Premium Araç Galerisi</title>
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
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 shadow-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-gray-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
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
          <AdvancedFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={() => {}}
            onClearFilters={onClearFilters}
            makes={makes}
            models={models}
            cars={cars}
            bodyTypes={bodyTypes}
            plateStatuses={plateStatuses}
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

