'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Car, Heart, ChevronDown } from 'lucide-react';
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
      {/* Background Elements - Same as Hero */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10">
        {/* Main header */}
        <div className="flex justify-between items-center py-3">
          {/* Logo - Only image, no text */}
          <Link href={`/${locale}`} className="flex items-center group">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Mustafa Cangil Auto Trading Ltd. Logo"
                width={60}
                height={40}
                className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex space-x-8">
            {/* Home */}
            <Link
              href={`/${locale}`}
              className="text-gray-300 hover:text-amber-400 transition-colors duration-300 font-medium text-sm relative group"
            >
              {t('navigation.home')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
            
            {/* Cars Dropdown */}
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
              
              {/* Dropdown Menu */}
              <div className={`absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-2xl border border-amber-500/30 overflow-hidden transition-all duration-300 transform ${
                isCarsDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}>
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
            
            {/* Other navigation items */}
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

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Wishlist Button */}
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
            
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-300 hover:text-amber-400 transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-3 bg-gray-800/95 backdrop-blur-sm rounded-b-2xl">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-700/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Cars Menu - Separate items */}
              <div className="pt-2 space-y-2">
                <Link
                  href={`/${locale}/inventory`}
                  className="flex items-center space-x-2 text-gray-300 hover:text-amber-400 transition-all duration-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-700/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Car className="h-4 w-4" />
                  <span>{t('navigation.inventory')}</span>
                </Link>
                <Link
                  href={`/${locale}/sold-cars`}
                  className="flex items-center space-x-2 text-gray-300 hover:text-amber-400 transition-all duration-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-700/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Car className="h-4 w-4" />
                  <span>{t('header.soldCars')}</span>
                </Link>
                <Link
                  href={`/${locale}/incoming-cars`}
                  className="flex items-center space-x-2 text-gray-300 hover:text-amber-400 transition-all duration-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-700/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Car className="h-4 w-4" />
                  <span>{t('header.incomingCars')}</span>
                </Link>
              </div>
              
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}