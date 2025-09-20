'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Car, ArrowRight, Star } from 'lucide-react';

interface RelatedCar {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  coverImage?: string;
  featured?: boolean;
  category?: {
    name: string;
  };
}

interface RelatedCarsProps {
  cars: RelatedCar[];
  currentCarId: number;
  locale: string;
  title?: string;
  maxItems?: number;
}

export function RelatedCars({ 
  cars, 
  currentCarId, 
  locale, 
  title = "İlgili Araçlar",
  maxItems = 4 
}: RelatedCarsProps) {
  // Filter out current car and limit results
  const relatedCars = cars
    .filter(car => car.id !== currentCarId)
    .slice(0, maxItems);

  if (relatedCars.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Benzer özelliklere sahip diğer araçlarımızı inceleyin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedCars.map((car) => (
            <Link
              key={car.id}
              href={`/${locale}/cars/${car.id}`}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-primary/20"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={car.coverImage || '/cars/placeholder.svg'}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {car.featured && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Öne Çıkan
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                
                {car.category && (
                  <p className="text-sm text-gray-500 mb-2">
                    {car.category.name}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    €{car.price.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-sm text-gray-500">
                    Detayları Gör
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href={`/${locale}/inventory`}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Tüm Araçları Görüntüle
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Related cars by category
export function RelatedCarsByCategory({ 
  cars, 
  currentCarId, 
  category, 
  locale, 
  maxItems = 4 
}: {
  cars: RelatedCar[];
  currentCarId: number;
  category: string;
  locale: string;
  maxItems?: number;
}) {
  const categoryCars = cars.filter(car => 
    car.id !== currentCarId && 
    car.category?.name === category
  ).slice(0, maxItems);

  if (categoryCars.length === 0) return null;

  return (
    <RelatedCars
      cars={categoryCars}
      currentCarId={currentCarId}
      locale={locale}
      title={`${category} Kategorisindeki Diğer Araçlar`}
      maxItems={maxItems}
    />
  );
}

// Related cars by price range
export function RelatedCarsByPrice({ 
  cars, 
  currentCarId, 
  currentPrice, 
  locale, 
  maxItems = 4 
}: {
  cars: RelatedCar[];
  currentCarId: number;
  currentPrice: number;
  locale: string;
  maxItems?: number;
}) {
  const priceRange = currentPrice * 0.2; // 20% price range
  const priceCars = cars.filter(car => 
    car.id !== currentCarId && 
    Math.abs(car.price - currentPrice) <= priceRange
  ).slice(0, maxItems);

  if (priceCars.length === 0) return null;

  return (
    <RelatedCars
      cars={priceCars}
      currentCarId={currentCarId}
      locale={locale}
      title="Benzer Fiyat Aralığındaki Araçlar"
      maxItems={maxItems}
    />
  );
}
