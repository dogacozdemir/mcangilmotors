'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, ArrowRight, Phone, MessageCircle, Calendar, Gauge, Fuel, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/urlUtils';
import { FrontendXSSProtection } from '@/lib/sanitizer';
import { PhotoModal } from './PhotoModal';

interface QuickViewModalProps {
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
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function QuickViewModal({ car, isOpen, onClose, locale }: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getAllImages = () => {
    const images = [];
    if (car.coverImage) {
      images.push({
        imagePath: getImageUrl(car.coverImage),
        isMain: true,
      });
    }
    if (car.images && car.images.length > 0) {
      car.images.forEach((img) => {
        if (!car.coverImage || img.imagePath !== car.coverImage) {
          images.push({
            imagePath: getImageUrl(img.imagePath),
            isMain: img.isMain,
          });
        }
      });
    }
    if (images.length === 0) {
      images.push({
        imagePath: '/cars/placeholder.svg',
        isMain: true,
      });
    }
    return images;
  };

  const images = getAllImages();
  const currentImage = images[currentImageIndex] || { imagePath: '/cars/placeholder.svg', isMain: true };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
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
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  const handleImageClick = () => {
    setShowPhotoModal(true);
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>

          {/* Content Wrapper */}
          <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
            {/* Image Section */}
            <div className="lg:w-1/2 w-full relative">
              <div 
                className="relative aspect-[16/9] lg:aspect-auto h-64 lg:h-full cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleImageClick}
              >
                <Image
                  src={currentImage.imagePath}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                
                {/* Photo Count Badge */}
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    {images.length} 📷
                  </div>
                )}
                
                {/* Click to enlarge hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
                  Fotoğrafı büyütmek için tıklayın
                </div>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Image Pagination Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Featured Badge */}
                {car.featured && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="lg:w-1/2 w-full p-6 lg:p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {car.make} {car.model}
                  </h2>
                  <p className="text-xl text-gray-600 mb-4">
                    {car.year} • {car.mileage ? car.mileage.toLocaleString() : 'N/A'} km
                  </p>
                  <div className="text-3xl font-bold text-amber-600">{formatPrice(car.price)}</div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Calendar className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-gray-900">{car.year}</div>
                    <div className="text-sm text-gray-600">Model Yılı</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Gauge className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-gray-900">{car.mileage ? car.mileage.toLocaleString() : 'N/A'}</div>
                    <div className="text-sm text-gray-600">Kilometre</div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Özellikler</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Fuel className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-gray-600">Yakıt:</span>
                      <span className="ml-2 font-medium">{car.fuelType}</span>
                    </div>
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-gray-600">Şanzıman:</span>
                      <span className="ml-2 font-medium">{car.transmission}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600">Renk:</span>
                      <span className="ml-2 font-medium">{car.color}</span>
                    </div>
                    {car.bodyType && (
                      <div className="flex items-center">
                        <span className="text-gray-600">Kasa Tipi:</span>
                        <span className="ml-2 font-medium">{car.bodyType}</span>
                      </div>
                    )}
                    {car.plateStatus && (
                      <div className="flex items-center">
                        <span className="text-gray-600">Plaka Durumu:</span>
                        <span className="ml-2 font-medium">
                          {car.plateStatus === 'plakalı' ? 'Plakalı' : 'Plakasız'}
                        </span>
                      </div>
                    )}
                    {car.engine && (
                      <div className="flex items-center">
                        <span className="text-gray-600">Motor:</span>
                        <span className="ml-2 font-medium">{car.engine}</span>
                      </div>
                    )}
                    {car.category && (
                      <div className="flex items-center">
                        <span className="text-gray-600">Kategori:</span>
                        <span className="ml-2 font-medium">{car.category.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Car Description */}
                {car.translations && car.translations.length > 0 && car.translations[0].description && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">Açıklama</h3>
                    <div 
                      className="text-gray-700 text-sm leading-relaxed max-h-24 overflow-hidden relative"
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                      dangerouslySetInnerHTML={FrontendXSSProtection.createSafeHTML(
                        (car.translations[0].description.length > 150 
                          ? `${car.translations[0].description.substring(0, 150)}...` 
                          : car.translations[0].description).replace(/\n/g, '<br>')
                      )}
                    />
                    {car.translations[0].description.length > 150 && (
                      <div className="absolute bottom-0 right-0 bg-gradient-to-t from-white to-transparent h-6 w-full"></div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <button className="flex-1 flex items-center justify-center bg-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200">
                      <Heart className="h-5 w-5 mr-2" />
                      Favorilere Ekle
                    </button>
                    <button className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200">
                      <Settings className="h-5 w-5 mr-2" />
                      Karşılaştır
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      href={`/${locale}/cars/${car.id}`}
                      className="flex-1 flex items-center justify-center bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200"
                    >
                      Detayları Gör
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </div>

                  <div className="flex space-x-3">
                    <a
                      href="tel:+905338551166"
                      className="flex-1 flex items-center justify-center bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Hemen Ara
                    </a>
                    <a
                      href="https://wa.me/905338551166"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End Wrapper */}
        </div>
      </div>

      {/* Photo Modal */}
      {images.length > 0 && (
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
      )}
    </div>
  );
}
