'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CarCard from '@/components/ui/CarCard';
import Link from 'next/link';
import apiClient from '@/lib/api';

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
  engine?: string;
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
  const [allCars, setAllCars] = useState<FeaturedCar[]>([]);
  const [filteredCars, setFilteredCars] = useState<FeaturedCar[]>([]);
  const [displayedCars, setDisplayedCars] = useState<FeaturedCar[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [carsPerPage] = useState(12); // Show 12 cars initially

  const loadCars = useCallback(async () => {
    try {
      const data = await apiClient.getCars({ 
        limit: 100, // Show more cars - all available stock
        lang: locale 
      });
      setAllCars(data.cars || []);
      
      // Markaları çıkar
      const uniqueMakes = Array.from(new Set((data.cars || []).map((car: FeaturedCar) => car.make).filter(Boolean))) as string[];
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
    setShowAll(false); // Reset show all when filtering
  }, [selectedMake, allCars]);

  const updateDisplayedCars = useCallback(() => {
    if (showAll) {
      setDisplayedCars(filteredCars);
    } else {
      setDisplayedCars(filteredCars.slice(0, carsPerPage));
    }
  }, [filteredCars, showAll, carsPerPage]);

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
      <section className="py-20 bg-section-accent relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-amber-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-amber-500 border-t-transparent mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="mt-6 text-xl text-prestige-gray font-medium">Araçlar yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-section-accent relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots"></div>
      
      <div className="container mx-auto px-4 relative z-10">
          {/* Header - Kompakt Başlık */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-proxima-nova font-bold text-prestige-black mb-4 prestige-text-glow">
              Available Stock
            </h2>
            <p className="text-lg sm:text-xl text-prestige-gray max-w-3xl mx-auto leading-relaxed font-proxima-nova font-light">
              Mevcut stoklarımızdan seçin ve hayalinizdeki araca kavuşun
            </p>
          </div>

        {/* Filter Section - Horizontal Filter Buttons */}
        <div className="flex flex-col items-center justify-center gap-6 mb-12">
          {/* Horizontal Filter Buttons */}
          <div className="w-full max-w-6xl">
            <ul className="flex flex-wrap gap-2 p-2 list-none justify-center">
              <li className="relative">
                <button
                  onClick={() => setSelectedMake('all')}
                  className={`block !leading-none font-proxima-nova font-medium whitespace-nowrap px-4 py-2 text-sm capitalize rounded-2xl transition-all duration-300 focus:outline-none ${
                    selectedMake === 'all'
                      ? 'bg-prestige-gold text-prestige-black shadow-prestige'
                      : 'text-prestige-gray hover:text-prestige-black hover:bg-prestige-gold/20'
                  }`}
                >
                  Tümü ({allCars.length})
                </button>
              </li>
              {makes.map((make) => {
                const count = allCars.filter(car => car.make === make).length;
                return (
                  <li key={make} className="relative">
                    <button
                      onClick={() => setSelectedMake(make)}
                      className={`block !leading-none font-proxima-nova font-medium whitespace-nowrap px-4 py-2 text-sm capitalize rounded-2xl transition-all duration-300 focus:outline-none ${
                        selectedMake === make
                          ? 'bg-prestige-gold text-prestige-black shadow-prestige'
                          : 'text-prestige-gray hover:text-prestige-black hover:bg-prestige-gold/20'
                      }`}
                    >
                      {make} ({count})
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Cars Grid - Responsive Grid */}
        {displayedCars.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-prestige-card rounded-2xl p-8 border-2 border-prestige-gold/20 shadow-prestige max-w-md mx-auto">
              <Car className="h-12 w-12 text-prestige-gold mx-auto mb-4 prestige-loading" />
              <p className="text-prestige-gray text-base font-proxima-nova font-medium">
                {selectedMake ? `${selectedMake} markasına ait araç bulunamadı.` : 'Henüz araç bulunmuyor.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
              style={{ gridAutoRows: '1fr' }}
            >
              {displayedCars.map((car, index) => (
                <div 
                  key={car.id} 
                  className="prestige-grid-item prestige-card h-full flex flex-col"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CarCard 
                    car={car} 
                    locale={locale}
                  />
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {!showAll && filteredCars.length > carsPerPage && (
              <div className="text-center mb-8">
                <Button 
                  onClick={() => setShowAll(true)}
                  size="lg" 
                  className="group relative prestige-button bg-gradient-to-r from-prestige-gold to-prestige-gold-light hover:from-prestige-gold-dark hover:to-prestige-gold text-prestige-black px-8 py-3 text-base font-proxima-nova font-bold rounded-2xl shadow-prestige-hover transform hover:-translate-y-1 transition-all duration-300 border-2 border-prestige-gold/30"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <Car className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Show All ({filteredCars.length} Cars)</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-prestige-gold-light to-prestige-gold rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </Button>
              </div>
            )}
          </>
        )}

        {/* View Inventory Button */}
        <div className="text-center">
          <Button asChild size="lg" className="group relative prestige-button bg-gradient-to-r from-prestige-gold to-prestige-gold-light hover:from-prestige-gold-dark hover:to-prestige-gold text-prestige-black px-12 py-4 text-lg font-proxima-nova font-bold rounded-2xl shadow-prestige-hover transform hover:-translate-y-2 transition-all duration-500 border-2 border-prestige-gold/30">
            <Link href={`/${locale}/inventory`}>
              <span className="relative z-10 flex items-center space-x-3">
                <Car className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Browse Full Inventory</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-prestige-gold-light to-prestige-gold rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
