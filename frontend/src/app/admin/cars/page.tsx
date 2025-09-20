'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CarImageUpload } from '@/components/ui/CarImageUpload';
import apiClient from '@/lib/api';
import { FrontendXSSProtection } from '@/lib/sanitizer';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  engine: string;
  price: number;
  featured: boolean;
  categoryId: number;
  status: string;
  isSold?: boolean;
  isIncoming?: boolean;
  isReserved?: boolean;
  soldAt?: string;
  soldPrice?: number;
  expectedArrival?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  images?: Array<{
    id: number;
    imagePath: string;
    isMain: boolean;
    sortOrder: number;
    altText?: string;
  }>;
  translations?: Array<{
    lang: string;
    title: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
  }>;
}

interface Category {
  id: number;
  name: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [groupByMake, setGroupByMake] = useState(false);
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    color: '',
    engine: '',
    price: '',
    featured: false,
    categoryId: '',
    status: 'available',
    isSold: false,
    isIncoming: false,
    isReserved: false,
    soldAt: '',
    soldPrice: '',
    expectedArrival: '',
    coverImage: '',
    galleryImages: [] as Array<{
      id?: number;
      imagePath: string;
      sortOrder: number;
      altText?: string;
    }>,
    translations: {
      tr: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
      en: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
      ar: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
      ru: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' }
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadCars();
      loadCategories();
    }
  }, [router]);

  const loadCars = async () => {
    try {
      const data = await apiClient.getCars({ limit: 100 });
      setCars(data.cars || []);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories() as Category[];
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Group cars by make
  const groupCarsByMake = (cars: Car[]) => {
    const grouped = cars.reduce((acc, car) => {
      const make = car.make || 'Diğer';
      if (!acc[make]) {
        acc[make] = [];
      }
      acc[make].push(car);
      return acc;
    }, {} as Record<string, Car[]>);

    // Sort makes alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((acc, make) => {
        acc[make] = grouped[make].sort((a, b) => a.model.localeCompare(b.model));
        return acc;
      }, {} as Record<string, Car[]>);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // XSS Protection - Sanitize all string inputs
      const sanitizedFormData = {
        ...formData,
        make: FrontendXSSProtection.sanitizeByContext(formData.make || '', 'text'),
        model: FrontendXSSProtection.sanitizeByContext(formData.model || '', 'text'),
        fuelType: FrontendXSSProtection.sanitizeByContext(formData.fuelType || '', 'text'),
        transmission: FrontendXSSProtection.sanitizeByContext(formData.transmission || '', 'text'),
        color: FrontendXSSProtection.sanitizeByContext(formData.color || '', 'text'),
        engine: FrontendXSSProtection.sanitizeByContext(formData.engine || '', 'text'),
      };

      // Check for XSS patterns
      const formString = JSON.stringify(sanitizedFormData);
      if (FrontendXSSProtection.detectXSS(formString)) {
        alert('Potentially malicious content detected. Please check your input.');
        return;
      }

      // Convert string values to appropriate types for API
      const submitData = {
        ...sanitizedFormData,
        year: sanitizedFormData.year ? parseInt(sanitizedFormData.year) : undefined,
        mileage: sanitizedFormData.mileage ? parseInt(sanitizedFormData.mileage) : undefined,
        categoryId: sanitizedFormData.categoryId ? parseInt(sanitizedFormData.categoryId) : undefined,
        soldPrice: sanitizedFormData.soldPrice ? parseFloat(sanitizedFormData.soldPrice) : undefined,
        soldAt: sanitizedFormData.soldAt || undefined,
        expectedArrival: sanitizedFormData.expectedArrival || undefined,
        // Send boolean status fields
        isSold: sanitizedFormData.isSold,
        isIncoming: sanitizedFormData.isIncoming,
        isReserved: false, // Not implemented yet
        // Keep status for backward compatibility
        status: sanitizedFormData.isSold ? 'sold' : sanitizedFormData.isIncoming ? 'incoming' : 'available',
        // Update main price if car is sold and sold price is provided, otherwise use original price
        price: sanitizedFormData.isSold && sanitizedFormData.soldPrice ? parseFloat(sanitizedFormData.soldPrice) : (sanitizedFormData.price ? parseFloat(sanitizedFormData.price) : undefined),
      };

      if (editingCar) {
        // For updates, map galleryImages to images array and include coverImage
        // Cover image should be first (isMain: true) if it exists
        const allImages = [];
        if (formData.coverImage) {
          allImages.push(formData.coverImage);
        }
        allImages.push(...formData.galleryImages.map(img => img.imagePath));
        
        const updateData = {
          ...submitData,
          images: allImages,
          translations: formData.translations
        };
        
        console.log('Updating car with data:', updateData);
        await apiClient.updateCar(editingCar.id, updateData);
        setShowModal(false);
        setEditingCar(null);
        setFormData({
          make: '',
          model: '',
          year: '',
          mileage: '',
          fuelType: '',
          transmission: '',
          color: '',
          engine: '',
          price: '',
          featured: false,
          categoryId: '',
          status: 'available',
          isSold: false,
          isIncoming: false,
          isReserved: false,
          soldAt: '',
          soldPrice: '',
          expectedArrival: '',
          coverImage: '',
          galleryImages: [],
          translations: {
            tr: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
            en: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
            ar: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
            ru: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' }
          }
        });
      } else {
        const newCar = await apiClient.createCar(submitData) as Car;
        // Yeni araç oluşturulduktan sonra edit moduna geç
        setEditingCar(newCar);
        // Form data'yı temizleme, edit modunda kalacak
      }
      
      loadCars(); // Reload cars list
    } catch (error) {
      console.error('Error saving car:', error);
      alert('Araç kaydedilirken bir hata oluştu');
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    
    // Convert translations array to object format
    const translationsObj: any = {
      tr: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
      en: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
      ar: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
      ru: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' }
    };
    
    if (car.translations) {
      car.translations.forEach((translation: any) => {
        if (translationsObj[translation.lang]) {
          translationsObj[translation.lang] = {
            title: translation.title || '',
            description: translation.description || '',
            seo_title: translation.seoTitle || '',
            seo_description: translation.seoDescription || '',
            seo_keywords: translation.seoKeywords || ''
          };
        }
      });
    }
    
    // Find the main image (cover image) and separate gallery images
    const mainImage = car.images?.find(img => img.isMain);
    const galleryImages = car.images?.filter(img => !img.isMain) || [];
    
    setFormData({
      make: car.make || '',
      model: car.model || '',
      year: car.year ? car.year.toString() : '',
      mileage: car.mileage ? car.mileage.toString() : '',
      fuelType: car.fuelType || '',
      transmission: car.transmission || '',
      color: car.color || '',
      engine: car.engine || '',
      price: car.price ? car.price.toString() : '',
      featured: car.featured,
      categoryId: car.categoryId ? car.categoryId.toString() : '',
      status: car.status || 'available',
      isSold: car.isSold || false,
      isIncoming: car.isIncoming || false,
      isReserved: car.isReserved || false,
      soldAt: car.soldAt ? new Date(car.soldAt).toISOString().slice(0, 16) : '',
      soldPrice: car.soldPrice ? car.soldPrice.toString() : '',
      expectedArrival: car.expectedArrival ? new Date(car.expectedArrival).toISOString().slice(0, 16) : '',
      coverImage: mainImage?.imagePath || '',
      galleryImages: galleryImages.map(img => ({
        id: img.id,
        imagePath: img.imagePath,
        sortOrder: img.sortOrder,
        altText: img.altText
      })),
      translations: translationsObj
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      try {
        await apiClient.deleteCar(id);
        loadCars(); // Reload cars list
      } catch (error) {
        console.error('Error deleting car:', error);
        alert('Araç silinirken bir hata oluştu');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-75"></div>
                <Image
                  src="/logo.png"
                  alt="Mustafa Cangil Auto Trading Ltd."
                  width={80}
                  height={53}
                  className="relative h-12 w-auto"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Araç Yönetimi
                </h1>
                <p className="text-sm text-gray-600 font-medium">Araçları ekleyin, düzenleyin ve yönetin</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Yeni Araç Ekle</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-amber-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-600">Araçlar yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group Toggle */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Araçlar ({cars.length})
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">Marka Gruplama:</span>
                  <button
                    onClick={() => setGroupByMake(!groupByMake)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      groupByMake ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        groupByMake ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {cars.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz araç yok</h3>
                  <p className="text-gray-600 mb-6">İlk aracınızı eklemek için yukarıdaki butona tıklayın</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>İlk Aracı Ekle</span>
                  </button>
                </div>
              ) : groupByMake ? (
                // Grouped view by make
                <div className="space-y-8">
                  {Object.entries(groupCarsByMake(cars)).map(([make, makeCars]) => (
                    <div key={make} className="space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-1 w-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-gray-900">{make}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {makeCars.length} araç
                        </span>
                      </div>
                      <div className="grid gap-4">
                        {makeCars.map((car, index) => (
                    <div
                      key={car.id}
                      className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/20 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              {(() => {
                                // Cover image'ı bul (isMain: true olan veya ilk image)
                                const coverImage = car.images?.find(img => img.isMain) || car.images?.[0];
                                const imageUrl = coverImage?.imagePath ? 
                                  (coverImage.imagePath.startsWith('http') ? coverImage.imagePath : `http://localhost:3001${coverImage.imagePath}`) : 
                                  null;
                                
                                return imageUrl ? (
                                  <Image
                                    className="h-20 w-32 object-cover rounded-xl shadow-lg"
                                    src={imageUrl}
                                    alt={car.make + ' ' + car.model}
                                    width={128}
                                    height={80}
                                    unoptimized
                                  />
                                ) : (
                                <div className="h-20 w-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-lg">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                );
                              })()}
                              {car.featured && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                  ⭐ Öne Çıkan
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {car.make} {car.model} ({car.year})
                              </h3>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  <span>{car.mileage.toLocaleString()} km</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{car.fuelType}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{car.transmission}</span>
                                </div>
                                {car.engine && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>{car.engine}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-3">
                                <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                  £{car.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEdit(car)}
                              className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                              title="Düzenle"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(car.id)}
                              className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                              title="Sil"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Normal view
                <div className="grid gap-6">
                  {cars.map((car, index) => (
                    <div
                      key={car.id}
                      className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/20 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              {(() => {
                                // Cover image'ı bul (isMain: true olan veya ilk image)
                                const coverImage = car.images?.find(img => img.isMain) || car.images?.[0];
                                const imageUrl = coverImage?.imagePath ? 
                                  (coverImage.imagePath.startsWith('http') ? coverImage.imagePath : `http://localhost:3001${coverImage.imagePath}`) : 
                                  null;
                                
                                return imageUrl ? (
                                  <Image
                                    className="h-20 w-32 object-cover rounded-xl shadow-lg"
                                    src={imageUrl}
                                    alt={car.make + ' ' + car.model}
                                    width={128}
                                    height={80}
                                    unoptimized
                                  />
                                ) : (
                                <div className="h-20 w-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-lg">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                );
                              })()}
                              {car.featured && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                  ⭐ Öne Çıkan
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {car.make} {car.model} ({car.year})
                              </h3>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  <span>{car.mileage.toLocaleString()} km</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{car.fuelType}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{car.transmission}</span>
                                </div>
                                {car.engine && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>{car.engine}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-3">
                                <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                  £{car.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEdit(car)}
                              className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                              title="Düzenle"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(car.id)}
                              className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                              title="Sil"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingCar ? 'Araç Düzenle' : 'Yeni Araç Ekle'}
                    </h3>
                    <p className="text-amber-100 text-sm">
                      {editingCar ? 'Mevcut aracı güncelleyin' : 'Yeni bir araç oluşturun'}
                    </p>
                    {editingCar && !editingCar.id && (
                      <p className="text-green-200 text-xs mt-1">
                        ✅ Araç oluşturuldu! Şimdi görselleri yükleyebilirsiniz
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCar(null);
                    setFormData({
                      make: '',
                      model: '',
                      year: '',
                      mileage: '',
                      fuelType: '',
                      transmission: '',
                      color: '',
                      engine: '',
                      price: '',
                      featured: false,
                      categoryId: '',
                      status: 'available',
                      isSold: false,
                      isIncoming: false,
                      isReserved: false,
                      soldAt: '',
                      soldPrice: '',
                      expectedArrival: '',
                      coverImage: '',
                      galleryImages: [],
                      translations: {
                        tr: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
                        en: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
                        ar: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' },
                        ru: { title: '', description: '', seo_title: '', seo_description: '', seo_keywords: '' }
                      }
                    });
                  }}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Temel Bilgiler */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Temel Bilgiler</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>Marka</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.make}
                        onChange={(e) => setFormData({...formData, make: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="Marka (opsiyonel)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Model</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="Model (opsiyonel)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Yıl</span>
                        </span>
                      </label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        min="1990"
                        max="2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Kilometre</span>
                        </span>
                      </label>
                      <input
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="Kilometre (opsiyonel)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          <span>Yakıt Türü</span>
                        </span>
                      </label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      >
                        <option value="Benzin">Benzin</option>
                        <option value="Dizel">Dizel</option>
                        <option value="Hibrit">Hibrit</option>
                        <option value="Elektrik">Elektrik</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Vites</span>
                        </span>
                      </label>
                      <select
                        value={formData.transmission}
                        onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      >
                        <option value="Manuel">Manuel</option>
                        <option value="Otomatik">Otomatik</option>
                        <option value="Yarı Otomatik">Yarı Otomatik</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                          </svg>
                          <span>Renk</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="Renk (opsiyonel)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Motor</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.engine}
                        onChange={(e) => setFormData({...formData, engine: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="Motor (opsiyonel)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span>Fiyat (£)</span>
                        </span>
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="Kilometre (opsiyonel)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span>Kategori</span>
                        </span>
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Checkboxes */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Durum</span>
                        </span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Sold Status */}
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <input
                            type="checkbox"
                            checked={formData.isSold}
                            onChange={(e) => setFormData({...formData, isSold: e.target.checked})}
                            className="h-5 w-5 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Satıldı</span>
                          </label>
                        </div>

                        {/* Incoming Status */}
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <input
                            type="checkbox"
                            checked={formData.isIncoming}
                            onChange={(e) => setFormData({...formData, isIncoming: e.target.checked})}
                            className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Yolda Gelen</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Sold Price - Only show if sold checkbox is checked */}
                    {formData.isSold && (
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span>Satış Fiyatı</span>
                          </span>
                        </label>
                        <input
                          type="number"
                          value={formData.soldPrice}
                          onChange={(e) => setFormData({...formData, soldPrice: e.target.value})}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                          placeholder="Satış fiyatını girin"
                        />
                      </div>
                    )}

                    {/* Sold Date - Only show if sold checkbox is checked */}
                    {formData.isSold && (
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Satış Tarihi</span>
                          </span>
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.soldAt}
                          onChange={(e) => setFormData({...formData, soldAt: e.target.value})}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>
                    )}

                    {/* Expected Arrival - Only show if incoming checkbox is checked */}
                    {formData.isIncoming && (
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Beklenen Varış Tarihi</span>
                          </span>
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.expectedArrival}
                          onChange={(e) => setFormData({...formData, expectedArrival: e.target.value})}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>
                    )}
                  </div>
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="h-5 w-5 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>Öne Çıkan Araç</span>
                      </label>
                    </div>
                  </div>

                {/* Çok Dilli İçerik */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>Çok Dilli İçerik</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['tr', 'en', 'ar', 'ru'].map((lang) => (
                      <div key={lang} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                        <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            lang === 'tr' ? 'bg-red-500' : 
                            lang === 'en' ? 'bg-blue-500' : 
                            lang === 'ar' ? 'bg-green-500' : 'bg-purple-500'
                          }`}>
                            {lang.toUpperCase()}
                          </div>
                          <span>{lang.toUpperCase()} İçerik</span>
                        </h5>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder={`${lang.toUpperCase()} Başlık`}
                            value={formData.translations[lang as keyof typeof formData.translations].title}
                            onChange={(e) => setFormData({
                              ...formData,
                              translations: {
                                ...formData.translations,
                                [lang]: {
                                  ...formData.translations[lang as keyof typeof formData.translations],
                                  title: e.target.value
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                          <textarea
                            placeholder={`${lang.toUpperCase()} Açıklama`}
                            value={formData.translations[lang as keyof typeof formData.translations].description}
                            onChange={(e) => setFormData({
                              ...formData,
                              translations: {
                                ...formData.translations,
                                [lang]: {
                                  ...formData.translations[lang as keyof typeof formData.translations],
                                  description: e.target.value
                                }
                              }
                            })}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                          />
                          <input
                            type="text"
                            placeholder={`${lang.toUpperCase()} SEO Başlık`}
                            value={formData.translations[lang as keyof typeof formData.translations].seo_title}
                            onChange={(e) => setFormData({
                              ...formData,
                              translations: {
                                ...formData.translations,
                                [lang]: {
                                  ...formData.translations[lang as keyof typeof formData.translations],
                                  seo_title: e.target.value
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                          <input
                            type="text"
                            placeholder={`${lang.toUpperCase()} SEO Açıklama`}
                            value={formData.translations[lang as keyof typeof formData.translations].seo_description}
                            onChange={(e) => setFormData({
                              ...formData,
                              translations: {
                                ...formData.translations,
                                [lang]: {
                                  ...formData.translations[lang as keyof typeof formData.translations],
                                  seo_description: e.target.value
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                          <input
                            type="text"
                            placeholder={`${lang.toUpperCase()} SEO Anahtar Kelimeler`}
                            value={formData.translations[lang as keyof typeof formData.translations].seo_keywords}
                            onChange={(e) => setFormData({
                              ...formData,
                              translations: {
                                ...formData.translations,
                                [lang]: {
                                  ...formData.translations[lang as keyof typeof formData.translations],
                                  seo_keywords: e.target.value
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Görsel Yönetimi</span>
                  </h4>
                  {editingCar ? (
                    <CarImageUpload
                      carId={editingCar.id}
                      coverImage={formData.coverImage}
                      galleryImages={formData.galleryImages}
                      onCoverImageChange={(imagePath) => setFormData({...formData, coverImage: imagePath})}
                      onGalleryImagesChange={(images) => setFormData({...formData, galleryImages: images})}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                        <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h5 className="text-lg font-semibold text-gray-700 mb-2">Görsel Yönetimi</h5>
                        <p className="text-gray-500 text-sm mb-4">
                          Önce aracı kaydedin, sonra görselleri yükleyebilirsiniz
                        </p>
                        <div className="text-xs text-gray-400">
                          Araç kaydedildikten sonra bu bölümde görsel yükleme seçenekleri görünecektir
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {editingCar ? (editingCar.id ? 'Güncelle' : 'Araç Oluştur') : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
