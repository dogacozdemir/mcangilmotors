import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Car, Phone, Mail, MapPin, Facebook, Instagram, MessageCircle, Clock, Award } from 'lucide-react';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  const quickLinks = [
    { name: t('navigation.home'), href: `/${locale}` },
    { name: t('navigation.inventory'), href: `/${locale}/inventory` },
    { name: t('navigation.about'), href: `/${locale}/about` },
    { name: t('navigation.contact'), href: `/${locale}/contact` },
    { name: t('navigation.blog'), href: `/${locale}/blog` },
  ];

  const services = [
    { name: 'Araç Satışı', href: `/${locale}/inventory` },
    { name: 'Araç Kiralama', href: `/${locale}/inventory` },
    { name: 'Araç Değerlendirme', href: `/${locale}/contact` },
    { name: 'Finansman Desteği', href: `/${locale}/contact` },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="Mustafa Cangil Auto Trading Ltd. Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Mustafa Cangil Auto Trading Ltd.</h3>
                <p className="text-amber-400 text-sm font-medium">Premium Araç Galerisi</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              KKTC&apos;nin en prestijli araç galerisi olarak 25 yılı aşkın süredir 
              premium araç deneyimi sunuyoruz. Kaliteli, güvenilir ve uygun fiyatlı 
              seçeneklerimizle hayalinizdeki aracı bulun.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/mustafacangilmotors/?locale=tr_TR"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/mcangilmotors"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Hızlı Linkler</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-amber-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Hizmetlerimiz</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-gray-300 hover:text-amber-400 transition-colors duration-300 text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">İletişim</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-amber-400" />
                <a
                  href="tel:+905338551166"
                  className="text-gray-300 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  +90 533 855 11 66
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-amber-400" />
                <a
                  href="https://wa.me/905338551166"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  WhatsApp
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amber-400" />
                <a
                  href="mailto:info@mcangilmotors.com"
                  className="text-gray-300 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  info@mcangilmotors.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-amber-400" />
                <span className="text-gray-300 text-sm">Sakarya Sk No:10, Alsancak 2435</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-gray-300 text-sm">Pazartesi - Cumartesi: 09:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-gray-400 text-sm">
                © 2025 Nerdy Reptile Digital Solutions Hub. Tüm hakları saklıdır.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Award className="h-4 w-4" />
                <span>25+ Yıl Deneyim</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Car className="h-4 w-4" />
                <span>1000+ Satılan Araç</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}