import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle, Clock, Award } from 'lucide-react';

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
    { name: t('footer.servicesList.carSales') },
    { name: t('footer.servicesList.service') },
    { name: t('footer.servicesList.cleaning') },
    { name: t('footer.servicesList.insurance') },
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
                width={80}
                height={80}
                quality={100}
                unoptimized={true}
                sizes="(max-width: 768px) 60px, 80px"
                className="h-10 w-auto"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <div>
                <h3 className="text-xl font-bold text-white">{t('footer.companyName')}</h3>
                <p className="text-amber-400 text-sm font-medium">{t('footer.companyTagline')}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('footer.companyDescription')}
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
            <h4 className="text-lg font-semibold text-white">{t('footer.quickLinks')}</h4>
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
            <h4 className="text-lg font-semibold text-white">{t('footer.services')}</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <span className="text-gray-300 text-sm">
                    {service.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">{t('footer.contact')}</h4>
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
                  {t('footer.whatsapp')}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amber-400" />
                <a
                  href="mailto:m.cangilmotors@gmail.com"
                  className="text-gray-300 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  m.cangilmotors@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-amber-400" />
                <span className="text-gray-300 text-sm">Sakarya Sk No:10, Alsancak 2435</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-gray-300 text-sm">{t('footer.workingHours')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-gray-400 text-sm">
                © 2025 <a href="https://www.nerdyreptile.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors duration-300">Nerdy Reptile Digital Solutions Hub</a>. {t('footer.allRightsReserved')}.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Award className="h-4 w-4" />
                <span>{t('footer.stats.yearsExperience')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}