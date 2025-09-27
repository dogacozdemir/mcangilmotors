'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Car, Heart, ChevronDown, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useWishlist } from '@/contexts/WishlistContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCarsDropdownOpen, setIsCarsDropdownOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const { wishlistCount } = useWishlist();

  const navigation = [
    { name: t('navigation.home'), href: `/${locale}` },
    { name: t('navigation.about'), href: `/${locale}/about` },
    { name: t('navigation.contact'), href: `/${locale}/contact` },
    { name: t('navigation.blog'), href: `/${locale}/blog` },
  ];

  const carsMenuItems = [
    { name: t('navigation.inventory'), href: `/${locale}/inventory` },
    { name: t('header.soldCars'), href: `/${locale}/sold-cars` },
    { name: t('header.incomingCars'), href: `/${locale}/incoming-cars` },
  ];

  return (
    <header className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md sticky top-0 z-50 shadow-2xl">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-between items-center py-3">
          <Link href={`/${locale}`} className="flex items-center group">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Mustafa Cangil Auto Trading Ltd. Logo"
                width={120}
                height={80}
                priority={true}
                quality={100}
                unoptimized={true}
                sizes="(max-width: 768px) 100px, 120px"
                className="h-10 w-auto"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </Link>

          <nav className="hidden lg:flex space-x-8">
            <Link
              href={`/${locale}`}
              className="text-gray-300 hover:text-amber-400 transition-colors duration-300 font-medium text-sm relative group"
            >
              {t('navigation.home')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>

            <div
              className="relative group"
              onMouseEnter={() => setIsCarsDropdownOpen(true)}
              onMouseLeave={() => setIsCarsDropdownOpen(false)}
            >
              <Link
                href={`/${locale}/inventory`}
                className="text-gray-300 hover:text-amber-400 transition-colors duration-300 font-medium text-sm relative group flex items-center space-x-1"
              >
                <span>{t('header.vehicles')}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isCarsDropdownOpen ? 'rotate-180' : ''}`} />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
              <div className={`absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-2xl border border-amber-500/30 overflow-hidden transition-all duration-300 transform ${isCarsDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                {carsMenuItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-gray-300 hover:text-amber-400 hover:bg-gray-700/50 transition-all duration-200 font-medium text-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {navigation.slice(1).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-amber-400 transition-colors duration-300 font-medium text-sm relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href={`/${locale}/wishlist`}
              className="relative p-2 text-gray-300 hover:text-amber-400 transition-colors duration-300"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <LanguageSwitcher />

            <button
              className="lg:hidden p-2 text-gray-300 hover:text-amber-400 transition-colors duration-300 relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'translate-y-0'}`}></span>
                <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out my-1 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Dropdown from Hamburger */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-amber-500/30 shadow-2xl mobile-menu-dropdown max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10"></div>
            </div>
            <div className="relative z-10 px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-[200px] flex flex-col">
              {/* Main Navigation */}
              <div className="space-y-2 sm:space-y-3 flex-shrink-0">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-base sm:text-lg font-semibold text-white hover:text-amber-400 transition-all duration-300 py-2 sm:py-3 border-b border-gray-700/50 mobile-menu-item"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Cars Section */}
              <div className="space-y-2 sm:space-y-3 flex-shrink-0">
                <h3 className="text-sm sm:text-base font-semibold text-amber-400 mb-2 sm:mb-3">Araçlar</h3>
                {carsMenuItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-gray-300 hover:text-amber-400 transition-all duration-300 py-1.5 sm:py-2 mobile-menu-item"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ animationDelay: `${(index + 4) * 50}ms` }}
                  >
                    <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Contact Info */}
              <div className="border-t border-gray-700/50 pt-3 sm:pt-4 space-y-2 sm:space-y-3 flex-shrink-0">
                <h3 className="text-sm sm:text-base font-semibold text-amber-400 mb-2 sm:mb-3">İletişim</h3>
                <a
                  href="tel:+905338551166"
                  className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-gray-300 hover:text-amber-400 transition-all duration-300 py-1.5 sm:py-2 mobile-menu-item"
                  style={{ animationDelay: '400ms' }}
                >
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>+90 533 855 11 66</span>
                </a>
                <Link
                  href={`/${locale}/contact#map`}
                  className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-gray-300 hover:text-amber-400 transition-all duration-300 py-1.5 sm:py-2 mobile-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ animationDelay: '450ms' }}
                >
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Sakarya Sk No:10, Alsancak 2435</span>
                </Link>
              </div>

              {/* Language Switcher */}
              <div className="border-t border-gray-700/50 pt-3 sm:pt-4 flex-shrink-0">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
