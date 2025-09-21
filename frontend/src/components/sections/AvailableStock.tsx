'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Car, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CarCard from '@/components/ui/CarCard';
import { useWishlist } from '@/contexts/WishlistContext';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';

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
}

export function AvailableStock() {
  const t = useTranslations();
  const locale = useLocale();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [displayedCars, setDisplayedCars] = useState<Car[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [carsPerPage] = useState(8); // Show only 2 rows (8 cars) on homepage
  const [additionalCars] = useState(8); // Show 2 more rows when "Show More" is clicked

  const loadCars = useCallback(async () => {
    try {
      const data = await apiClient.getCars({ 
        limit: 100, // Load all cars for filtering
        lang: locale,
        status: 'available' // Only show available cars on homepage
      });
      setAllCars(data.cars || []);
      
      // Markaları çıkar
      const uniqueMakes = Array.from(new Set((data.cars || []).map((car: Car) => car.make).filter(Boolean))) as string[];
      setMakes(uniqueMakes);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  const filterCars = useCallback(() => {
    if (selectedMake && selectedMake !== 'all') {
      const filtered = allCars.filter(car => car.make === selectedMake);
      setFilteredCars(filtered); // Show all cars of selected make
    } else {
      setFilteredCars(allCars); // Show all cars
    }
    setShowMore(false); // Reset show more when filtering
  }, [selectedMake, allCars]);

  const updateDisplayedCars = useCallback(() => {
    if (showMore) {
      const displayed = filteredCars.slice(0, carsPerPage + additionalCars);
      setDisplayedCars(displayed);
    } else {
      const displayed = filteredCars.slice(0, carsPerPage);
      setDisplayedCars(displayed);
    }
  }, [filteredCars, showMore, carsPerPage, additionalCars]);

  // Wishlist fonksiyonları
  const handleWishlistToggle = (car: Car) => {
    if (isInWishlist(car.id)) {
      removeFromWishlist(car.id);
    } else {
      addToWishlist(car);
    }
  };

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  useEffect(() => {
    filterCars();
  }, [filterCars]);

  useEffect(() => {
    updateDisplayedCars();
  }, [updateDisplayedCars]);

  if (loading) {
    return (
      <section className="py-8 bg-f1rst-light relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-amber-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-amber-500 border-t-transparent mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="mt-6 text-xl text-prestige-gray font-medium">{t('home.availableStock.loadingCars')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots"></div>
      
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-gold rounded-full blur-3xl opacity-10"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-gold rounded-full blur-3xl opacity-8"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.12, 0.08]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
          {/* Premium Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                        <span className="text-amber-500">{t('home.availableStock.title')}</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
                        {t('home.availableStock.subtitle')}
                    </p>
          </motion.div>

        {/* Premium Filter Section */}
        <motion.div 
          className="flex flex-col items-center justify-center gap-8 mb-16 mt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          
          {/* Premium Filter Buttons */}
          <div className="w-full max-w-7xl">
            <div className="premium-card bg-gradient-card rounded-3xl shadow-prestige-lg border border-prestige-border-light p-6 backdrop-blur-sm">
              <ul className="flex flex-wrap gap-3 p-2 list-none justify-center">
                <motion.li 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.button
                    onClick={() => setSelectedMake('all')}
                    className={`block !leading-none font-semibold whitespace-nowrap px-6 py-3 text-sm capitalize rounded-2xl transition-all duration-300 focus:outline-none ${
                      selectedMake === 'all'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-amber-100 border border-gray-200'
                    }`}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: selectedMake === 'all' ? "0 10px 25px -5px rgba(212, 175, 55, 0.3)" : "0 5px 15px -3px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    {t('home.availableStock.allCars')} ({allCars.length})
                  </motion.button>
                </motion.li>
                {makes.map((make, index) => {
                  const count = allCars.filter(car => car.make === make).length;
                  return (
                    <motion.li 
                      key={make} 
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      viewport={{ once: true }}
                    >
                      <motion.button
                        onClick={() => setSelectedMake(make)}
                        className={`block !leading-none font-semibold whitespace-nowrap px-6 py-3 text-sm capitalize rounded-2xl transition-all duration-300 focus:outline-none ${
                          selectedMake === make
                            ? 'bg-amber-500 text-white shadow-lg'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-amber-100 border border-gray-200'
                        }`}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: selectedMake === make ? "0 10px 25px -5px rgba(212, 175, 55, 0.3)" : "0 5px 15px -3px rgba(0, 0, 0, 0.1)"
                        }}
                      >
                        {make} ({count})
                      </motion.button>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Premium Cars Grid */}
        {displayedCars.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="premium-card bg-gradient-card rounded-3xl p-12 border border-prestige-gold/20 shadow-prestige-xl max-w-lg mx-auto">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Car className="h-16 w-16 text-prestige-gold mx-auto mb-6" />
              </motion.div>
              <p className="text-prestige-gray-600 text-lg font-proxima-nova font-medium">
                {selectedMake ? `${selectedMake} ${t('home.availableStock.noCarsForMake')}` : t('home.availableStock.noCarsFound')}
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {displayedCars.map((car, index) => (
                <motion.div 
                  key={car.id} 
                  className="premium-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  viewport={{ once: true }}
                >
                  <CarCard 
                    car={car} 
                    locale={locale}
                    onWishlist={handleWishlistToggle}
                    isInWishlist={isInWishlist(car.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
            
          </>
        )}

        {/* Premium Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Show More Button */}
          {!showMore && filteredCars.length > carsPerPage && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.button
                onClick={() => setShowMore(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Car className="mr-3 h-6 w-6" />
                {t('home.availableStock.showMore')} (+{Math.min(additionalCars, filteredCars.length - carsPerPage)} Cars)
              </motion.button>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Browse Full Inventory Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={`/${locale}/inventory`}>
                <motion.button
                  className="bg-gray-900 hover:bg-gray-800 text-white inline-flex items-center px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Car className="mr-3 h-6 w-6" />
                  {t('home.availableStock.browseFullInventory')}
                </motion.button>
              </Link>
            </motion.div>

            {/* View Sold Cars Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={`/${locale}/sold-cars`}>
                <motion.button
                  className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  {t('home.availableStock.viewSoldCars')}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
