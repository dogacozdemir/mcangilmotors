'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Calendar, Gauge, Fuel, Settings, Star, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import apiClient from '@/lib/api';
import { CarDetailBreadcrumb } from '@/components/ui/Breadcrumb';
import { RelatedCars, RelatedCarsByCategory, RelatedCarsByPrice } from '@/components/sections/RelatedCars';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  engine?: string;
  bodyType?: string;
  plateStatus?: string;
  price: number;
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

interface CarDetailClientProps {
  params: { id: string; locale: string };
}

export default function CarDetailClient({ params }: CarDetailClientProps) {
  const t = useTranslations('car');
  const { id, locale } = params;
  const carId = id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [relatedCars, setRelatedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadCar();
  }, [carId, locale]);

  const loadCar = async () => {
    try {
      const data = await apiClient.getCar(Number(carId), locale) as Car;
      setCar(data);
      
      // Load related cars
      const relatedData = await apiClient.getCars({
        page: 1,
        limit: 8,
        make: data.make
      }) as { cars: Car[] };
      setRelatedCars(relatedData.cars || []);
    } catch (error) {
      console.error('Error loading car:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Araç detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Araç Bulunamadı</h1>
          <Link
            href={`/${locale}/inventory`}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Envantere Dön
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('tr-TR').format(mileage) + ' km';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CarDetailBreadcrumb 
            make={car.make} 
            model={car.model} 
            year={car.year} 
            locale={locale as string} 
          />
        </div>
      </div>
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-6">
            <Link
              href={`/${locale}/inventory`}
              className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Envantere Dön
            </Link>
          </nav>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              {car.make} {car.model}
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              {car.year} • {formatMileage(car.mileage)} • {car.fuelType} • {car.transmission}
            </p>
            <div className="text-3xl font-bold text-amber-400 mb-8">
              {formatPrice(car.price)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden">
              <Image
                src={car.images && car.images.length > 0 ? car.images[selectedImage].imagePath : '/cars/placeholder.svg'}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
              {car.featured && (
                <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Öne Çıkan
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {car.images && car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 bg-gray-200 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImage ? 'border-amber-500' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.imagePath}
                      alt={`${car.year} ${car.make} ${car.model} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Araç Bilgileri</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Model Yılı</p>
                    <p className="font-semibold">{car.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Kilometre</p>
                    <p className="font-semibold">{formatMileage(car.mileage)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Yakıt Türü</p>
                    <p className="font-semibold">{car.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Vites</p>
                    <p className="font-semibold">{car.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-primary"></div>
                  <div>
                    <p className="text-sm text-gray-500">Renk</p>
                    <p className="font-semibold">{car.color}</p>
                  </div>
                </div>
                {car.engine && (
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Motor</p>
                      <p className="font-semibold">{car.engine}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">İletişim</h3>
              <div className="space-y-4">
                <a
                  href={`tel:+905338551166`}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Phone className="h-5 w-5" />
                  Hemen Ara
                </a>
                <a
                  href={`https://wa.me/905338551166?text=Merhaba, ${car.year} ${car.make} ${car.model} hakkında bilgi almak istiyorum.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Cars */}
      {relatedCars.length > 0 && (
        <RelatedCars
          cars={relatedCars}
          currentCarId={car.id}
          locale={locale}
        />
      )}
    </div>
  );
}
