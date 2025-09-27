'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Car, Search, ChevronLeft, ChevronRight, Star, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/lib/api';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { getImageUrl } from '@/lib/urlUtils';

interface FeaturedCar {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  bodyType?: string;
  plateStatus?: string;
  featured: boolean;
  coverImage?: string;
  images?: Array<{
    imagePath: string;
    isMain: boolean;
  }>;
}

type Props = {
  description?: string;
  viewAllText?: string;
  contactText?: string;
};

export function HeroSection({ description, viewAllText, contactText }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredCars, setFeaturedCars] = useState<FeaturedCar[]>([]);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load featured cars
  useEffect(() => {
    const loadFeaturedCars = async () => {
      try {
        const data = await apiClient.getCars({ 
          featured: true, 
          limit: 6, 
          lang: locale 
        });
        const cars = (data as any).cars || [];
        setFeaturedCars(cars);
      } catch (error) {
        console.error('Error loading featured cars:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCars();
  }, [locale]);

  // Auto-rotate cars every 5 seconds
  useEffect(() => {
    if (featuredCars.length > 1) {
      const interval = setInterval(() => {
        setCurrentCarIndex((prev) => (prev + 1) % featuredCars.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredCars.length]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    router.push(`/${locale}/inventory?${params.toString()}`);
  };

  const nextCar = () => {
    setCurrentCarIndex((prev) => (prev + 1) % featuredCars.length);
  };

  const prevCar = () => {
    setCurrentCarIndex((prev) => (prev - 1 + featuredCars.length) % featuredCars.length);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Fiyat Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const currentCar = featuredCars[currentCarIndex];

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 mx-auto mb-4"></div>
            <p className="text-white text-lg">{t('home.hero.loadingCars')}</p>
          </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10"></div>
        <OptimizedImage
          src="/hero-pattern.svg"
          alt=""
          fill
          className="opacity-5"
          priority={false}
          quality={50}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div 
            className="text-white"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t('home.hero.title')}
              <span className="block text-amber-400">{t('home.hero.titleHighlight')}</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('home.hero.subtitle')}
            </motion.p>


            {/* Search Bar */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('home.hero.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full h-14 px-6 pr-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-2 h-10 w-10 bg-amber-400 hover:bg-amber-500 rounded-xl flex items-center justify-center transition-colors duration-300"
                >
                  <Search className="h-5 w-5 text-gray-900" />
                </button>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href={`/${locale}/inventory`} className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                  <Car className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {t('home.hero.viewAllCars')}
                </Button>
              </Link>
              <Link href={`/${locale}/about`} className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300">
                  {t('home.hero.aboutUs')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side - Featured Car Showcase */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {currentCar && (
              <div className="relative">
                {/* Car Image */}
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentCar.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <OptimizedImage
                        src={
                          currentCar.coverImage ? 
                            getImageUrl(currentCar.coverImage) :
                          currentCar.images?.[0]?.imagePath ? 
                            getImageUrl(currentCar.images[0].imagePath) :
                          `/cars/${currentCar.make?.toLowerCase()}-${currentCar.model?.toLowerCase()}.jpg` ||
                          '/cars/placeholder.svg'
                        }
                        alt={`${currentCar.make} ${currentCar.model}`}
                        width={800}
                        height={320}
                        className="w-full h-80 object-cover rounded-2xl"
                        priority={true}
                        quality={90}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4 bg-amber-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                        {t('home.hero.featured')}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Car Info */}
                  <div className="mt-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      {currentCar.make} {currentCar.model}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {currentCar.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {currentCar.mileage ? currentCar.mileage.toLocaleString() : 'N/A'} km
                      </span>
                      {currentCar.bodyType && (
                        <span className="bg-white/10 px-2 py-1 rounded-full text-xs">
                          {currentCar.bodyType}
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-amber-400 mb-4">
                      {formatPrice(currentCar.price)}
                    </div>
                    <Link href={`/${locale}/cars/${currentCar.id}`}>
                      <Button className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-xl">
                        {t('home.hero.viewDetails')}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Navigation Arrows */}
                {featuredCars.length > 1 && (
                  <>
                    <button
                      onClick={prevCar}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextCar}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {featuredCars.length > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {featuredCars.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCarIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentCarIndex 
                            ? 'bg-amber-400 w-8' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}


export default HeroSection;
