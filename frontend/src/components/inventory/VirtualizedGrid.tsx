'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import CarCard from '@/components/ui/CarCard';

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

interface VirtualizedGridProps {
  cars: Car[];
  locale: string;
  viewMode: 'grid' | 'list';
  itemsPerPage?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  onQuickView?: (car: Car) => void;
  onCompare?: (car: Car) => void;
  onWishlist?: (car: Car) => void;
  isInComparison?: (car: Car) => boolean;
  isInWishlist?: (car: Car) => boolean;
}

export function VirtualizedGrid({ 
  cars, 
  locale, 
  viewMode, 
  itemsPerPage = 12,
  onLoadMore,
  hasMore = false,
  loading = false,
  onQuickView,
  onCompare,
  onWishlist,
  isInComparison,
  isInWishlist
}: VirtualizedGridProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: itemsPerPage });
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Görünür araçları hesapla
  const visibleCars = useMemo(() => {
    return cars.slice(visibleRange.start, visibleRange.end);
  }, [cars, visibleRange]);

  // Intersection Observer ile lazy loading
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[entries.length - 1];
        if (lastEntry.isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;
    return () => observer?.disconnect();
  }, [onLoadMore, hasMore, loading]);

  // Scroll pozisyonunu takip et
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;

      // Sayfa değişikliği için hesaplama
      const itemHeight = viewMode === 'grid' ? 400 : 200; // Tahmini yükseklik
      const newStart = Math.floor(scrollTop / itemHeight);
      const newEnd = Math.min(newStart + itemsPerPage, cars.length);

      setVisibleRange({ start: newStart, end: newEnd });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [cars.length, itemsPerPage, viewMode]);

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {visibleCars.map((car) => (
          <CarCard 
            key={car.id} 
            car={car} 
            locale={locale}
            viewMode={viewMode}
            onQuickView={onQuickView}
            onCompare={onCompare}
            isInComparison={isInComparison?.(car) || false}
            onWishlist={onWishlist}
            isInWishlist={isInWishlist?.(car) || false}
          />
        ))}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      style={{ height: '80vh', overflowY: 'auto' }}
    >
      {visibleCars.map((car) => (
        <CarCard 
          key={car.id} 
          car={car} 
          locale={locale}
          viewMode={viewMode}
          onQuickView={onQuickView}
          onCompare={onCompare}
          isInComparison={isInComparison?.(car) || false}
          onWishlist={onWishlist}
          isInWishlist={isInWishlist?.(car) || false}
        />
      ))}
      {loading && (
        <div className="col-span-full flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      )}
    </div>
  );
}
