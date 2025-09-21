'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import CarCard from '@/components/ui/CarCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { Grid, List, SlidersHorizontal, Scale, Search, X, Filter, Zap } from 'lucide-react';
import apiClient from '@/lib/api';
import { InventoryBreadcrumb } from '@/components/ui/Breadcrumb';

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
  const [error, setError] = useState<string | null>(null);
  const [totalCars, setTotalCars] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCars, setSelectedCars] = useState<number[]>([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewCar, setQuickViewCar] = useState<Car | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || '',
    priceFrom: searchParams.get('priceFrom') || '',
    priceTo: searchParams.get('priceTo') || '',
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

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '12');

      // Direct API call to avoid caching issues
      const response = await fetch(`/api/cars?${queryParams.toString()}`);
      const carsResponse = await response.json();
      
      console.log('Direct API Response:', carsResponse);
      console.log('Total Cars:', carsResponse.pagination?.total);
      console.log('Cars Array:', carsResponse.cars);

      setCars(carsResponse.cars || []);
      setTotalCars(carsResponse.pagination?.total || 0);
      setTotalPages(Math.ceil((carsResponse.pagination?.total || 0) / 12));
      
      // Load categories separately if needed
      if (categories.length === 0) {
        try {
          const categoriesResponse = await fetch('/api/categories');
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData || []);
        } catch (err) {
          console.error('Error loading categories:', err);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, categories.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update URL when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const newUrl = `/${locale}/inventory?${queryParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, locale, router]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      yearFrom: '',
      yearTo: '',
      priceFrom: '',
      priceTo: '',
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
    setCurrentPage(1);
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tekrar Dene
          </button>
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
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full h-14 px-6 pr-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300"
                />
              </div>
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
        {/* Filters and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Gelişmiş Filtreler
              </button>
              
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gelişmiş Filtreler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                  <input
                    type="text"
                    value={filters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                    placeholder="Marka ara..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={filters.model}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                    placeholder="Model ara..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yakıt Türü</label>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Tümü</option>
                    <option value="Benzin">Benzin</option>
                    <option value="Dizel">Dizel</option>
                    <option value="Hibrit">Hibrit</option>
                    <option value="Elektrikli">Elektrikli</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vites</label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Tümü</option>
                    <option value="Manuel">Manuel</option>
                    <option value="Otomatik">Otomatik</option>
                    <option value="Yarı Otomatik">Yarı Otomatik</option>
                  </select>
                </div>
              </div>
            </div>
          )}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Araç Bulunamadı</h3>
            <p className="text-gray-600 mb-4">Arama kriterlerinize uygun araç bulunamadı.</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}

        {/* Comparison Button */}
        {selectedCars.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
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
