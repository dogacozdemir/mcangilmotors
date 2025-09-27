'use client';

import { useState, useEffect } from 'react';
import { Car, Heart, ArrowRight, ChevronLeft, ChevronRight, Eye, Scale, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { OptimizedImage } from './OptimizedImage';
import { getCarImageUrl } from '@/lib/urlUtils';
import { PhotoModal } from './PhotoModal';

interface CarCardProps {
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
    translations?: Array<{
      title: string;
      description: string;
    }>;
  };
  locale: string;
  viewMode?: 'grid' | 'list';
  onQuickView?: (car: any) => void;
  onCompare?: (car: any) => void;
  isInComparison?: boolean;
  onWishlist?: (car: any) => void;
  isInWishlist?: boolean;
  isSoldCar?: boolean;
  showIncomingBadge?: boolean;
}

function CarCard({ car, locale, viewMode = 'grid', onQuickView, onCompare, isInComparison = false, onWishlist, isInWishlist = false, isSoldCar = false, showIncomingBadge = false }: CarCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const t = useTranslations('common');
  
  // Debug: Log car price to see what value we're getting
  console.log('CarCard - Car price:', car.price, 'Type:', typeof car.price, 'Is 0:', car.price === 0, 'Is null:', car.price === null, 'Is undefined:', car.price === undefined);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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
        imagePath: getCarImageUrl(car),
        isMain: true,
        sortOrder: 0,
        altText: `${car.year} ${car.make} ${car.model}`
      });
    }
    
    // Add other images
    if (car.images && car.images.length > 0) {
      car.images.forEach((img) => {
        const imagePath = getCarImageUrl({ ...car, coverImage: img.imagePath });
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

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Touch/swipe handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe && images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPhotoModal(true);
  };

  // Grid View
  if (viewMode === 'grid') {
    return (
      <article 
        className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 
          hover:shadow-2xl hover:scale-105 hover:border-amber-300
          transition-all duration-300 ease-out cursor-pointer
          w-full h-full flex flex-col overflow-hidden" 
        aria-label={`${car.year} ${car.make} ${car.model}`}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <Link href={`/${locale}/cars/${car.id}`}>
            <div 
              className="relative aspect-[4/3] overflow-hidden cursor-pointer"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleImageClick}
            >
              <OptimizedImage
                src={currentImage.imagePath}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                quality={85}
              />
              
              {/* Photo Count Badge */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                  {images.length} 📷
                </div>
              )}
            </div>
          </Link>

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
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex space-x-1 sm:space-x-2">
            {onQuickView && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(car);
                }}
                className="bg-white p-1.5 sm:p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
                title="Hızlı Görünüm"
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
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 sm:px-3 rounded-full">
              Featured
            </span>
          )}
          
          {/* Incoming Badge */}
          {showIncomingBadge && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 sm:px-3 rounded-full">
              Incoming
            </span>
          )}
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <Link href={`/${locale}/cars/${car.id}`}>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 hover:text-amber-600 transition-colors duration-200 line-clamp-1">
                  {car.make} {car.model}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{car.year} • {car.mileage ? car.mileage.toLocaleString() : 'N/A'} km</p>
              </Link>

              {/* Grid View - Sadece temel bilgiler */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900">{car.fuelType}/{car.transmission}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  {isSoldCar && car.soldPrice ? (
                    <div className="flex flex-col">
                      <div className="text-lg font-bold text-green-600">{formatSoldPrice(car.soldPrice)}</div>
                      <div className="text-xs text-gray-500">Satış Fiyatı</div>
                    </div>
                  ) : (car.price === 0 || car.price === null || car.price === undefined) ? (
                    <a
                      href="tel:+905338551166"
                      className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors duration-200 group"
                      title={t('contactForPrice')}
                    >
                      <Phone className="h-5 w-5" />
                      <span className="text-lg font-bold">{t('contactUs')}</span>
                    </a>
                  ) : (
                    <div className="text-lg font-bold text-amber-600">{formatPrice(car.price)}</div>
                  )}
                  <Link 
                    href={`/${locale}/cars/${car.id}`} 
                    className="flex items-center bg-amber-500 text-white px-3 py-1.5 rounded-md font-medium 
                      hover:bg-amber-600 transition-colors duration-200 group text-xs whitespace-nowrap"
                  >
                    Detayları Gör
                    <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
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
        hover:shadow-xl hover:border-amber-300
        transition-all duration-300 ease-out cursor-pointer
        w-full overflow-hidden" 
      aria-label={`${car.year} ${car.make} ${car.model}`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-80 h-64 md:h-56 overflow-hidden flex-shrink-0">
          <Link href={`/${locale}/cars/${car.id}`}>
            <div 
              className="relative w-full h-full overflow-hidden cursor-pointer"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleImageClick}
            >
              <OptimizedImage
                src={currentImage.imagePath}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 320px"
                priority={false}
                quality={85}
              />
              
              {/* Photo Count Badge */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                  {images.length} 📷
                </div>
              )}
            </div>
          </Link>

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
          <div className="absolute top-2 right-2 flex space-x-1">
            {onQuickView && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(car);
                }}
                className="bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
                title="Hızlı Görünüm"
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
                className={`p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 ${
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
                className={`p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 ${
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
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Featured
            </span>
          )}
          
          {/* Incoming Badge */}
          {showIncomingBadge && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Incoming
            </span>
          )}
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link href={`/${locale}/cars/${car.id}`}>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 hover:text-amber-600 transition-colors duration-200">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-gray-600">{car.year} - {car.mileage ? car.mileage.toLocaleString() : 'N/A'} km</p>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  {isSoldCar && car.soldPrice ? (
                    <div className="flex flex-col">
                      <div className="text-2xl md:text-3xl font-bold text-green-600">{formatSoldPrice(car.soldPrice)}</div>
                      <div className="text-sm text-gray-500">Satış Fiyatı</div>
                    </div>
                  ) : (car.price === 0 || car.price === null || car.price === undefined) ? (
                    <a
                      href="tel:+905338551166"
                      className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors duration-200 group"
                      title={t('contactForPrice')}
                    >
                      <Phone className="h-6 w-6" />
                      <span className="text-2xl md:text-3xl font-bold">{t('contactUs')}</span>
                    </a>
                  ) : (
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{formatPrice(car.price)}</div>
                  )}
                  <Link 
                    href={`/${locale}/cars/${car.id}`} 
                    className="flex items-center bg-amber-500 text-white px-3 py-1.5 rounded-md font-medium 
                      hover:bg-amber-600 transition-colors duration-200 group text-xs whitespace-nowrap"
                  >
                    Detayları Gör
                    <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>

              {/* List View - Detaylı bilgiler başlıklı */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm mb-4">
                {/* Yakıt & Şanzıman */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Yakıt & Şanzıman</div>
                  <div className="text-gray-900 font-medium">{car.fuelType} / {car.transmission}</div>
                </div>

                {/* Renk & Kasa Tipi */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Görünüm/Tip</div>
                  <div className="text-gray-900 font-medium">
                    {car.color}{car.bodyType ? ` / ${car.bodyType}` : ''}
                  </div>
                </div>

                {/* Motor & Plaka */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teknik</div>
                  <div className="space-y-1">
                    {car.engine && (
                      <div className="text-gray-900 text-xs">{car.engine}</div>
                    )}
                    {car.plateStatus && (
                      <div className="text-gray-900 text-xs">
                        {car.plateStatus === 'plakalı' ? 'Plakalı' : 'Plakasız'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Kategori */}
                {car.category && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</div>
                    <div className="text-gray-900 font-medium">{car.category.name}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-start pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                {onQuickView && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onQuickView(car);
                    }}
                    className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium 
                      hover:bg-gray-200 transition-colors duration-200 text-sm"
                  >
                    <Eye size={16} className="mr-2" />
                    Hızlı Görünüm
                  </button>
                )}
                {onCompare && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCompare(car);
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm ${
                      isInComparison 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Scale size={16} className="mr-2" />
                    {isInComparison ? 'Karşılaştırmadan Çıkar' : 'Karşılaştır'}
                  </button>
                )}
                {onWishlist && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onWishlist(car);
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm ${
                      isInWishlist 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart size={16} className="mr-2" fill={isInWishlist ? 'currentColor' : 'none'} />
                    {isInWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        images={images.map(img => ({
          imagePath: img.imagePath,
          alt: `${car.year} ${car.make} ${car.model}`
        }))}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </article>
  );
}

export default CarCard;