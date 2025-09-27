'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Offer {
  id: number;
  carId: number;
  customerId: number;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt: string;
  car?: {
    id: number;
    make: string;
    model: string;
    year: number;
    price: number;
  };
  customer?: {
    id: number;
    fullName: string;
    phone: string;
    email: string;
  };
}

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
}

interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    carId: '',
    customerId: '',
    message: '',
    status: 'pending' as 'pending' | 'contacted' | 'closed',
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadData();
    }
  }, [router]);

  const loadData = async () => {
    try {
      const [offersRes, carsRes, customersRes] = await Promise.all([
        fetch('/api/offers'),
        fetch('/api/cars?limit=100'),
        fetch('/api/customers?limit=100')
      ]);

      const [offersData, carsData, customersData] = await Promise.all([
        offersRes.json(),
        carsRes.json(),
        customersRes.json()
      ]);

      setOffers(offersData.offers || []);
      setCars(carsData.cars || []);
      setCustomers(customersData.customers || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setFormData({
      carId: '',
      customerId: '',
      message: '',
      status: 'pending',
      customerName: '',
      customerPhone: '',
      customerEmail: ''
    });
    setShowModal(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      carId: offer.carId?.toString() || '',
      customerId: offer.customerId?.toString() || '',
      message: offer.message,
      status: offer.status,
      customerName: offer.customer?.fullName || '',
      customerPhone: offer.customer?.phone || '',
      customerEmail: offer.customer?.email || ''
    });
    setShowModal(true);
  };

  const handleDeleteOffer = async (id: number) => {
    if (confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
      try {
        await fetch(`/api/offers/${id}`, { method: 'DELETE' });
        setOffers(offers.filter(offer => offer.id !== id));
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const offerData = {
        carId: formData.carId ? Number(formData.carId) : null,
        customerId: formData.customerId ? Number(formData.customerId) : null,
        message: formData.message,
        status: formData.status,
        customer: formData.customerId ? null : {
          fullName: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail
        }
      };

      const url = editingOffer ? `/api/offers/${editingOffer.id}` : '/api/offers';
      const method = editingOffer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        setShowModal(false);
        loadData();
      }
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const updateStatus = async (id: number, newStatus: 'pending' | 'contacted' | 'closed') => {
    try {
      await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setOffers(offers.map(offer => 
        offer.id === id ? { ...offer, status: newStatus } : offer
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOffer(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showModal]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'contacted': return 'İletişim Kuruldu';
      case 'closed': return 'Kapatıldı';
      default: return status;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Teklif Yönetimi
              </h1>
              <p className="text-sm text-gray-600 font-medium">Gelen teklifleri yönetin ve takip edin</p>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Teklifler</h2>
              <p className="text-gray-600">Tüm teklifleri görüntüleyin ve yönetin</p>
            </div>
            <button
              onClick={handleCreateOffer}
              className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Yeni Teklif Ekle</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-amber-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-600">Teklifler yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {offers.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz teklif yok</h3>
                  <p className="text-gray-600 mb-6">İlk teklifinizi eklemek için yukarıdaki butona tıklayın</p>
                  <button
                    onClick={handleCreateOffer}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>İlk Teklifi Ekle</span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {offers.map((offer, index) => (
                    <div
                      key={offer.id}
                      className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/20 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                              {offer.car ? 
                                (offer.car.make?.charAt(0) || 'A') : 
                                '📝'
                              }
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {offer.car ? 
                                  `${offer.car.make} ${offer.car.model} (${offer.car.year})` : 
                                  'Online Form'
                                }
                              </h3>
                              <p className="text-sm text-gray-600 font-medium">
                                {offer.car?.price ? `${offer.car.price.toLocaleString('en-GB')} £` : 'İletişim Formu'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(offer.status)}`}>
                              {getStatusText(offer.status)}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditOffer(offer)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                title="Düzenle"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Sil"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{offer.customer?.fullName}</p>
                                <p className="text-sm text-gray-600">{offer.customer?.phone}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Mesaj</p>
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">{offer.message}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-4">
                            <select
                              value={offer.status}
                              onChange={(e) => updateStatus(offer.id, e.target.value as 'pending' | 'contacted' | 'closed')}
                              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                            >
                              <option value="pending">Beklemede</option>
                              <option value="contacted">İletişim Kuruldu</option>
                              <option value="closed">Kapatıldı</option>
                            </select>
                            <span className="text-xs text-gray-500">
                              {new Date(offer.createdAt).toLocaleDateString('tr-TR')} {new Date(offer.createdAt).toLocaleTimeString('tr-TR')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleCall(offer.customer?.phone || '')}
                              className="group flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>Ara</span>
                            </button>
                            <button
                              onClick={() => handleWhatsApp(offer.customer?.phone || '')}
                              className="group flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.445 4.436-9.87 9.888-9.87 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.445-4.437 9.87-9.885 9.87m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                              <span>WhatsApp</span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div 
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingOffer ? 'Teklifi Düzenle' : 'Yeni Teklif Ekle'}
                    </h3>
                    <p className="text-amber-100 text-sm">
                      {editingOffer ? 'Mevcut teklifi güncelleyin' : 'Yeni bir teklif oluşturun'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Araç Seçimi</span>
                      </span>
                    </label>
                    <select
                      value={formData.carId}
                      onChange={(e) => setFormData({...formData, carId: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      required
                    >
                      <option value="">Araç seçin</option>
                      {cars.map(car => (
                        <option key={car.id} value={car.id}>
                          {car.make} {car.model} ({car.year}) - {car.price ? `${car.price.toLocaleString('en-GB')} £` : 'Fiyat Belirtilmemiş'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Mevcut Müşteri</span>
                      </span>
                    </label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Müşteri seçin (opsiyonel)</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.fullName} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!formData.customerId && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Yeni Müşteri Bilgileri</span>
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Müşteri Adı</label>
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required={!formData.customerId}
                          placeholder="Ad Soyad"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Telefon</label>
                        <input
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required={!formData.customerId}
                          placeholder="+90 5XX XXX XX XX"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">E-posta</label>
                        <input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Mesaj</span>
                    </span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 resize-none"
                    required
                    placeholder="Teklif mesajınızı buraya yazın..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Durum</span>
                    </span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'pending' | 'contacted' | 'closed'})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="contacted">İletişim Kuruldu</option>
                    <option value="closed">Kapatıldı</option>
                  </select>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {editingOffer ? 'Güncelle' : 'Oluştur'}
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

