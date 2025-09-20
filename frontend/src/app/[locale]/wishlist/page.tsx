'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWishlist } from '@/contexts/WishlistContext';
import { CarCard } from '@/components/ui/CarCard';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const { wishlist, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-amber-400 mr-4" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                Favori Araçlarım
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Beğendiğiniz araçları burada saklayabilir, istediğiniz zaman inceleyebilirsiniz.
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{wishlistCount}</div>
                <div className="text-gray-300">Favori Araç</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {wishlist.reduce((total, car) => total + car.price, 0) > 0 
                    ? formatPrice(wishlist.reduce((total, car) => total + car.price, 0))
                    : '0 £'
                  }
                </div>
                <div className="text-gray-300">Toplam Değer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href={`/${locale}/inventory`}
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Araç Galerisine Dön
          </Link>
        </div>

        {/* Actions */}
        {wishlistCount > 0 && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Favori Araçlarınız ({wishlistCount})
              </h2>
            </div>
            <button
              onClick={clearWishlist}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tümünü Temizle
            </button>
          </div>
        )}

        {/* Wishlist Content */}
        {wishlistCount === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Henüz favori araç yok
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Beğendiğiniz araçları favorilere ekleyerek burada saklayabilirsiniz.
            </p>
            <Link
              href={`/${locale}/inventory`}
              className="inline-flex items-center bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200"
            >
              Araç Galerisini İncele
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((car) => (
              <div key={car.id} className="relative">
                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => removeFromWishlist(car.id)}
                  className="absolute top-3 right-3 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
                  title="Favorilerden Çıkar"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>

                <CarCard 
                  car={car} 
                  locale={locale}
                  viewMode="grid"
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {wishlistCount > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Hızlı İşlemler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Favori Araçlar</h4>
                <p className="text-sm text-gray-600">
                  {wishlistCount} araç favorilerinizde
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">📊</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Karşılaştırma</h4>
                <p className="text-sm text-gray-600">
                  En fazla 3 araç karşılaştırabilirsiniz
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">💬</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">İletişim</h4>
                <p className="text-sm text-gray-600">
                  Detaylı bilgi için bizimle iletişime geçin
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


