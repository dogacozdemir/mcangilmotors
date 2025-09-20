'use client';

import { useState } from 'react';
import { Car, Heart, ArrowRight, ChevronLeft, ChevronRight, Eye, Scale, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SoldCarCardProps {
  car: {
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
    soldAt?: string;
    soldPrice?: number;
    category?: {
      name: string;
    };
    images?: Array<{
      imagePath: string;
      isMain: boolean;
      sortOrder: number;
      altText?: string;
    }>;
  };
  locale: string;
  viewMode?: 'grid' | 'list';
  onQuickView?: (car: any) => void;
  onCompare?: (car: any) => void;
  isInComparison?: boolean;
  onWishlist?: (car: any) => void;
  isInWishlist?: boolean;
}

export function SoldCarCard({ car, locale, viewMode = 'grid', onQuickView, onCompare, isInComparison = false, onWishlist, isInWishlist = false }: SoldCarCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatSoldPrice = (soldPrice: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(soldPrice);
  };

  const formatSoldDate = (soldAt: string) => {
    return new Date(soldAt).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAllImages = () => {
    const images = [];
    
    // Add cover image if exists
    if (car.coverImage) {
      images.push({
        imagePath: car.coverImage.startsWith('http') ? car.coverImage : `http://localhost:3001${car.coverImage}`,
        isMain: true,
        sortOrder: 0,
        altText: `${car.year} ${car.make} ${car.model}`
      });
    }
    
    // Add other images
    if (car.images && car.images.length > 0) {
      car.images.forEach((img) => {
        const imagePath = img.imagePath.startsWith('http') ? img.imagePath : `http://localhost:3001${img.imagePath}`;
        images.push({
          imagePath,
          isMain: img.isMain,
          sortOrder: img.sortOrder,
          altText: img.altText || `${car.year} ${car.make} ${car.model}`
        });
      });
    }
    
    // If no images, add placeholder
    if (images.length === 0) {
      images.push({
        imagePath: '/cars/placeholder.svg',
        isMain: true,
        sortOrder: 0,
        altText: `${car.year} ${car.make} ${car.model}`
      });
    }
    
    return images.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const images = getAllImages();
  const currentImage = images[currentImageIndex] || { imagePath: '/cars/placeholder.svg', isMain: true };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Grid View
  if (viewMode === 'grid') {
    return (
      <article 
        className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 
          hover:shadow-2xl hover:scale-105 hover:border-green-300
          transition-all duration-300 ease-out cursor-pointer
          w-full max-w-sm mx-auto overflow-hidden" 
        aria-label={`${car.year} ${car.make} ${car.model} - Satıldı`}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <Link href={`/${locale}/cars/${car.id}`}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={currentImage.imagePath}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105 grayscale-[0.3]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            </div>
          </Link>

          {/* Sold Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Satıldı</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={prevImage}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full ml-2" 
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextImage}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full mr-2" 
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onQuickView && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(car);
                }}
                className="p-1.5 sm:p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 bg-white text-gray-600 hover:text-amber-600"
                title="Hızlı Görüntüle"
              >
                <Eye size={16} />
              </button>
            )}
            {onCompare && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCompare(car);
                }}
                className={`p-1.5 sm:p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 ${
                  isInComparison 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white text-gray-600 hover:text-amber-600'
                }`}
                title={isInComparison ? "Karşılaştırmadan Çıkar" : "Karşılaştırmaya Ekle"}
              >
                <Scale size={16} />
              </button>
            )}
            {onWishlist && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWishlist(car);
                }}
                className={`p-1.5 sm:p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 ${
                  isInWishlist 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-600 hover:text-red-500'
                }`}
                title={isInWishlist ? "Favorilerden Çıkar" : "Favorilere Ekle"}
              >
                <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Featured Badge */}
          {car.featured && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 sm:px-3 rounded-full">
              Featured
            </span>
          )}
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <Link href={`/${locale}/cars/${car.id}`}>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors duration-200 line-clamp-1">
                  {car.make} {car.model}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{car.year} • {car.mileage.toLocaleString()} km</p>
              </Link>

              {/* Grid View - Sadece temel bilgiler */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900">{car.fuelType}/{car.transmission}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  {car.soldPrice ? (
                    <div className="flex flex-col">
                      <div className="text-lg font-bold text-green-600">{formatSoldPrice(car.soldPrice)}</div>
                      <div className="text-xs text-gray-500">Satış Fiyatı</div>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-gray-600">Satış Fiyatı Belirtilmemiş</div>
                  )}
                  <Link 
                    href={`/${locale}/cars/${car.id}`} 
                    className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-md font-medium 
                      hover:bg-green-600 transition-colors duration-200 group text-xs whitespace-nowrap"
                  >
                    <span>Detayları Gör</span>
                    <ArrowRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                
                {/* Sold Date */}
                {car.soldAt && (
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Satış Tarihi: {formatSoldDate(car.soldAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // List View
  return (
    <article 
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 
        hover:shadow-2xl hover:border-green-300
        transition-all duration-300 ease-out cursor-pointer overflow-hidden" 
      aria-label={`${car.year} ${car.make} ${car.model} - Satıldı`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative w-full sm:w-80 h-48 sm:h-auto overflow-hidden">
          <Link href={`/${locale}/cars/${car.id}`}>
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={currentImage.imagePath}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105 grayscale-[0.3]"
                sizes="(max-width: 768px) 100vw, 320px"
                priority={false}
              />
            </div>
          </Link>

          {/* Sold Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Satıldı</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={prevImage}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full ml-2"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextImage}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full mr-2"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onQuickView && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(car);
                }}
                className="p-1.5 sm:p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 bg-white text-gray-600 hover:text-amber-600"
                title="Hızlı Görüntüle"
              >
                <Eye size={16} />
              </button>
            )}
            {onCompare && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCompare(car);
                }}
                className={`p-1.5 sm:p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 ${
                  isInComparison 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white text-gray-600 hover:text-amber-600'
                }`}
                title={isInComparison ? "Karşılaştırmadan Çıkar" : "Karşılaştırmaya Ekle"}
              >
                <Scale size={16} />
              </button>
            )}
            {onWishlist && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWishlist(car);
                }}
                className={`p-1.5 sm:p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 ${
                  isInWishlist 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-600 hover:text-red-500'
                }`}
                title={isInWishlist ? "Favorilerden Çıkar" : "Favorilere Ekle"}
              >
                <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Featured Badge */}
          {car.featured && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 sm:px-3 rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1">
                  <Link href={`/${locale}/cars/${car.id}`}>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors duration-200">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-gray-600">{car.year} - {car.mileage.toLocaleString()} km</p>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  {car.soldPrice ? (
                    <div className="flex flex-col">
                      <div className="text-2xl md:text-3xl font-bold text-green-600">{formatSoldPrice(car.soldPrice)}</div>
                      <div className="text-sm text-gray-500">Satış Fiyatı</div>
                    </div>
                  ) : (
                    <div className="text-2xl md:text-3xl font-bold text-gray-600">Satış Fiyatı Belirtilmemiş</div>
                  )}
                  <Link 
                    href={`/${locale}/cars/${car.id}`} 
                    className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-md font-medium 
                      hover:bg-green-600 transition-colors duration-200 group text-xs whitespace-nowrap"
                  >
                    <span>Detayları Gör</span>
                    <ArrowRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Yakıt</div>
                  <div className="font-semibold text-gray-900">{car.fuelType}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Vites</div>
                  <div className="font-semibold text-gray-900">{car.transmission}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Renk</div>
                  <div className="font-semibold text-gray-900">{car.color}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Kategori</div>
                  <div className="font-semibold text-gray-900">{car.category?.name || 'Belirtilmemiş'}</div>
                </div>
              </div>

              {/* Sold Date */}
              {car.soldAt && (
                <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <strong>Satış Tarihi:</strong> {formatSoldDate(car.soldAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

