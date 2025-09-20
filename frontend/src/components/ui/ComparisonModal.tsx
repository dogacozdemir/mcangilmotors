'use client';

import { X, Trash2, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

interface ComparisonModalProps {
  cars: Car[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveCar: (carId: number) => void;
  locale: string;
}

export function ComparisonModal({ cars, isOpen, onClose, onRemoveCar, locale }: ComparisonModalProps) {
  const formatPrice = (price: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (car: Car) => {
    if (car.coverImage) {
      return car.coverImage.startsWith('http')
        ? car.coverImage
        : `http://localhost:3001${car.coverImage}`;
    }
    if (car.images && car.images.length > 0) {
      const mainImage = car.images.find(img => img.isMain) || car.images[0];
      return mainImage.imagePath.startsWith('http')
        ? mainImage.imagePath
        : `http://localhost:3001${mainImage.imagePath}`;
    }
    return '/cars/placeholder.svg';
  };

  const comparisonData = [
    { label: 'Fiyat', key: 'price', format: (value: any) => (value ? formatPrice(value) : '-') },
    { label: 'Yıl', key: 'year', format: (value: any) => (value ? value.toString() : '-') },
    { label: 'Kilometre', key: 'mileage', format: (value: any) => (value ? `${value.toLocaleString()} km` : '-') },
    { label: 'Yakıt Türü', key: 'fuelType', format: (value: any) => value || '-' },
    { label: 'Şanzıman', key: 'transmission', format: (value: any) => value || '-' },
    { label: 'Renk', key: 'color', format: (value: any) => value || '-' },
    { label: 'Motor', key: 'engine', format: (value: any) => value || '-' },
    { label: 'Kasa Tipi', key: 'bodyType', format: (value: any) => value || '-' },
    { label: 'Plaka Durumu', key: 'plateStatus', format: (value: any) =>
        value === 'plakalı' ? 'Plakalı' :
        value === 'plakasız' ? 'Plakasız' : '-'
    },
    { label: 'Kategori', key: 'category', format: (value: any) => value?.name || '-' },
  ];

  if (!isOpen || cars.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Araç Karşılaştırması</h2>
              <p className="text-gray-600 mt-1">{cars.length} araç karşılaştırılıyor</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <div className="min-w-full">
              {/* Comparison Table */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detaylı Karşılaştırma</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50">
                      {/* Image Row */}
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/4">
                          Araç
                        </th>
                        {cars.map((car) => (
                          <th key={car.id} className="px-6 py-4 text-center align-top">
                            <div className="relative aspect-[4/3] mb-2 rounded-lg overflow-hidden w-48 mx-auto">
                              <Image
                                src={getImageUrl(car)}
                                alt={`${car.year} ${car.make} ${car.model}`}
                                fill
                                className="object-cover"
                              />
                              {/* Remove Button */}
                              <button
                                onClick={() => onRemoveCar(car.id)}
                                className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {car.featured && (
                                <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  Featured
                                </div>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>

                      {/* Basic Info Row */}
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/4">
                          Bilgiler
                        </th>
                        {cars.map((car) => (
                          <th key={car.id} className="px-6 py-4 text-center">
                            <div className="text-center">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {car.make} {car.model}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">{car.year}</p>
                              <div className="text-xl font-bold text-amber-600 mb-4">
                                {formatPrice(car.price)}
                              </div>

                              {/* Quick Actions */}
                              <div className="space-y-2">
                                <Link
                                  href={`/${locale}/cars/${car.id}`}
                                  className="block w-full bg-amber-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200 text-center"
                                >
                                  Detayları Gör
                                </Link>
                                <div className="flex space-x-2">
                                  <a
                                    href="tel:+905338551166"
                                    className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 text-center text-sm"
                                  >
                                    <Phone className="h-4 w-4 inline mr-1" />
                                    Ara
                                  </a>
                                  <a
                                    href="https://wa.me/905338551166"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 text-center text-sm"
                                  >
                                    <MessageCircle className="h-4 w-4 inline mr-1" />
                                    WhatsApp
                                  </a>
                                </div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {comparisonData.map((item, rowIndex) => (
                        <tr key={item.key} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.label}
                          </td>
                          {cars.map((car) => (
                            <td key={car.id} className="px-6 py-4 text-sm text-gray-600 text-center">
                              {item.format((car as any)[item.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Maksimum 3 araç karşılaştırabilirsiniz
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Kapat
              </button>
              <Link
                href={`/${locale}/inventory`}
                className="flex items-center bg-amber-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200"
              >
                Daha Fazla Araç Gör
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
