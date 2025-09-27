'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { SoldCarCard } from '@/components/ui/SoldCarCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { Grid, List, Search } from 'lucide-react';
import apiClient from '@/lib/api';

// Lazy load heavy components
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
  sold: boolean;
  soldDate?: string;
  soldPrice?: number;
  coverImage?: string;
  category?: {
    name: string;
  };
  images?: Array<{
    id: number;
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

export default function SoldCarsPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wishlist, toggleWishlist } = useWishlist();
  const locale = params.locale as string;

  // State
  const [cars, setCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCars, setSelectedCars] = useState<number[]>([]);
  const [quickViewCar, setQuickViewCar] = useState<Car | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Search only
  const [search, setSearch] = useState('');

  // Sort options
  const [sortBy, setSortBy] = useState('soldDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [carsData, categoriesData] = await Promise.all([
        apiClient.getSoldCars({ locale }),
        apiClient.getCategories()
      ]);
      
      setCars((carsData as any).cars || []);
      setCategories((categoriesData as any).categories || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [locale]);

  // Load data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    let filtered = cars.filter(car => {
      const searchMatch = !search || 
        `${car.make} ${car.model} ${car.year}`.toLowerCase().includes(search.toLowerCase()) ||
        car.translations?.some(t => 
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
        );

      return searchMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'soldDate':
          aValue = new Date(a.soldDate || 0);
          bValue = new Date(b.soldDate || 0);
          break;
        case 'soldPrice':
          aValue = a.soldPrice || a.price;
          bValue = b.soldPrice || b.price;
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'mileage':
          aValue = a.mileage;
          bValue = b.mileage;
          break;
        case 'make':
          aValue = a.make;
          bValue = b.make;
          break;
        default:
          aValue = a.soldDate || 0;
          bValue = b.soldDate || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [cars, search, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCars = filteredAndSortedCars.slice(startIndex, endIndex);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompare = (carId: number) => {
    if (selectedCars.includes(carId)) {
      setSelectedCars(prev => prev.filter(id => id !== carId));
    } else if (selectedCars.length < 3) {
      setSelectedCars(prev => [...prev, carId]);
    }
  };

  const handleQuickView = (car: Car) => {
    setQuickViewCar(car);
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
          <p className="mt-6 text-xl text-gray-300 font-medium">Satılan araçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('soldCars.hero.title')} - Mustafa Cangil Auto Trading Ltd. | KKTC 2. El Ve Plakasız Araç Alım & Satım</title>
        <meta name="description" content={t('soldCars.hero.subtitle')} />
        <meta name="keywords" content="satılan araçlar, KKTC araç satışı, Mustafa Cangil Auto Trading Ltd., ikinci el araç, lüks araç, Lefkoşa araç galerisi, Girne araç galerisi" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${t('soldCars.hero.title')} - Mustafa Cangil Auto Trading Ltd.`} />
        <meta property="og:description" content={t('soldCars.hero.subtitle')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mcangilmotors.com/${locale}/sold-cars`} />
        <meta property="og:image" content="https://mcangilmotors.com/hero-bg.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('soldCars.hero.title')} - Mustafa Cangil Auto Trading Ltd.`} />
        <meta name="twitter:description" content={t('soldCars.hero.subtitle')} />
        <meta name="twitter:image" content="https://mcangilmotors.com/hero-bg.jpg" />
        
        {/* Hreflang */}
        <link rel="alternate" hrefLang="tr" href="https://mcangilmotors.com/tr/sold-cars" />
        <link rel="alternate" hrefLang="en" href="https://mcangilmotors.com/en/sold-cars" />
        <link rel="alternate" hrefLang="ar" href="https://mcangilmotors.com/ar/sold-cars" />
        <link rel="alternate" hrefLang="ru" href="https://mcangilmotors.com/ru/sold-cars" />
        <link rel="alternate" hrefLang="x-default" href="https://mcangilmotors.com/tr/sold-cars" />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://mcangilmotors.com/${locale}/sold-cars`} />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": `${t('soldCars.hero.title')} - Mustafa Cangil Auto Trading Ltd.`,
              "description": t('soldCars.hero.subtitle'),
              "url": `https://mcangilmotors.com/${locale}/sold-cars`,
              "mainEntity": {
                "@type": "ItemList",
                "name": t('soldCars.hero.title'),
                "description": t('soldCars.hero.subtitle'),
                "numberOfItems": filteredAndSortedCars.length
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
                    "name": t('soldCars.hero.title'),
                    "item": `https://mcangilmotors.com/${locale}/sold-cars`
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('soldCars.hero.title')}
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                {t('soldCars.hero.subtitle')}
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('soldCars.hero.searchPlaceholder')}
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-full border-0 focus:ring-2 focus:ring-amber-500 focus:outline-none text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* View Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="soldDate">{t('soldCars.sortOptions.soldDate')}</option>
                    <option value="soldPrice">{t('soldCars.sortOptions.soldPrice')}</option>
                    <option value="year">{t('soldCars.sortOptions.year')}</option>
                    <option value="mileage">{t('soldCars.sortOptions.mileage')}</option>
                    <option value="make">{t('soldCars.sortOptions.make')}</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredAndSortedCars.length}</span> {t('soldCars.filters.resultsFound')}
            </p>
          </div>

          {/* Cars Grid/List */}
          {filteredAndSortedCars.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedCars.map((car) => (
                    <SoldCarCard
                      key={car.id}
                      car={car}
                      locale={locale}
                      onCompare={() => handleCompare(car.id)}
                      onQuickView={() => handleQuickView(car)}
                      isInWishlist={wishlist.some(w => w.id === car.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedCars.map((car) => (
                    <SoldCarCard
                      key={car.id}
                      car={car}
                      locale={locale}
                      viewMode="list"
                      onCompare={() => handleCompare(car.id)}
                      onQuickView={() => handleQuickView(car)}
                      isInWishlist={wishlist.some(w => w.id === car.id)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('soldCars.pagination.previous')}
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('soldCars.pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('soldCars.results.noResults')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('soldCars.results.noResultsDesc')}
                </p>
                <button
                  onClick={() => setSearch('')}
                  className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Aramayı Temizle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {quickViewCar && (
          <QuickViewModal
            car={quickViewCar}
            isOpen={!!quickViewCar}
            onClose={() => setQuickViewCar(null)}
            locale={locale}
          />
        )}

        {showComparison && selectedCars.length > 0 && (
          <ComparisonModal
            cars={cars.filter(car => selectedCars.includes(car.id))}
            isOpen={showComparison}
            onClose={() => setShowComparison(false)}
            onRemoveCar={(carId) => setSelectedCars(prev => prev.filter(id => id !== carId))}
            locale={locale}
          />
        )}
      </div>
    </>
  );
}
