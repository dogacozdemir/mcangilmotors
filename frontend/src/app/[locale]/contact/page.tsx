'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { Phone, MessageCircle, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { generateLocalBusinessSchema } from '@/lib/metaTags';

export default function ContactPage() {
  const t = useTranslations('contact');
  const params = useParams();
  const locale = params.locale as string;

  // Static settings for now
  const settings = {
    phone: '+90 533 855 11 66',
    whatsapp: '+90 533 855 11 66',
    instagram: 'https://www.instagram.com/mcangilmotors',
    facebook: 'https://www.facebook.com/mustafacangilmotors/?locale=tr_TR'
  };

  // Generate LocalBusiness schema
  const localBusinessSchema = generateLocalBusinessSchema({
    title: t('hero.title'),
    description: t('hero.subtitle'),
    url: `/${locale}/contact`,
    locale,
    telephone: settings.phone,
    email: 'info@mcangilmotors.com',
    address: {
      streetAddress: 'Sakarya Sk No:10',
      addressLocality: 'Alsancak',
      addressRegion: 'KKTC',
      addressCountry: 'TR',
      postalCode: '99010'
    },
    openingHours: [
      'Mo-Fr 09:00-18:00',
      'Sa 09:00-16:00'
    ],
    socialMedia: {
      facebook: settings.facebook,
      instagram: settings.instagram
    },
    rating: 4.8,
    reviewCount: 127
  });

  return (
    <>
      <Head>
        <title>{t('hero.title')} - Mustafa Cangil Auto Trading Ltd. | KKTC Premium Araç Galerisi</title>
        <meta name="description" content={t('hero.subtitle')} />
        <meta name="keywords" content="iletişim, KKTC araç galerisi, Mustafa Cangil Auto Trading Ltd., Lefkoşa araba galerisi, Girne araba satış, contact, car dealership Cyprus" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${t('hero.title')} - Mustafa Cangil Auto Trading Ltd.`} />
        <meta property="og:description" content={t('hero.subtitle')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mcangilmotors.com/${locale}/contact`} />
        <meta property="og:image" content="https://mcangilmotors.com/hero-bg.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('hero.title')} - Mustafa Cangil Auto Trading Ltd.`} />
        <meta name="twitter:description" content={t('hero.subtitle')} />
        <meta name="twitter:image" content="https://mcangilmotors.com/hero-bg.jpg" />
        
        {/* Hreflang */}
        <link rel="alternate" hrefLang="tr" href="https://mcangilmotors.com/tr/contact" />
        <link rel="alternate" hrefLang="en" href="https://mcangilmotors.com/en/contact" />
        <link rel="alternate" hrefLang="ar" href="https://mcangilmotors.com/ar/contact" />
        <link rel="alternate" hrefLang="ru" href="https://mcangilmotors.com/ru/contact" />
        <link rel="alternate" hrefLang="x-default" href="https://mcangilmotors.com/tr/contact" />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://mcangilmotors.com/${locale}/contact`} />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema)
          }}
        />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">7/24</div>
                <div className="text-gray-300">{t('hero.support')}</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">25+</div>
                <div className="text-gray-300">{t('hero.experience')}</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">%100</div>
                <div className="text-gray-300">{t('hero.satisfaction')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {t('contactDetails.title')}
              </h2>
              
              <div className="space-y-6">
                {/* Sabit Telefon Numarası */}
                <div className="flex items-center group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                      {t('contactDetails.phone')}
                    </h3>
                    <a 
                      href="tel:+905338551166"
                      className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-lg font-medium"
                    >
                      {t('contactDetails.phoneNumber')}
                    </a>
                  </div>
                </div>

                {/* Sabit WhatsApp Linki */}
                <div className="flex items-center group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                      {t('contactDetails.whatsapp')}
                    </h3>
                    <a 
                      href="https://wa.me/905338551166"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-lg font-medium"
                    >
                      {t('contactDetails.whatsappText')}
                    </a>
                  </div>
                </div>

                {/* Dinamik Settings (Eğer varsa) */}
                {settings?.phone && settings.phone !== '+90 533 855 11 66' && (
                  <div className="flex items-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                        {t('contactDetails.phoneAlternative')}
                      </h3>
                      <a 
                        href={`tel:${settings.phone}`}
                        className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-lg font-medium"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.whatsapp && settings.whatsapp !== '+90 533 855 11 66' && (
                  <div className="flex items-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {t('contactDetails.whatsappAlternative')}
                      </h3>
                      <a 
                        href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-lg font-medium"
                      >
                        {settings.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
                      {t('contactDetails.email')}
                    </h3>
                    <a 
                      href="mailto:info@mcangilmotors.com"
                      className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-lg font-medium"
                    >
                      {t('contactDetails.emailAddress')}
                    </a>
                  </div>
                </div>

                <div className="flex items-center group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {t('contactDetails.address')}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-lg font-medium">
                      {t('contactDetails.addressText')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center group hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                      {t('contactDetails.workingHours')}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-lg font-medium">
                      {t('contactDetails.workingHoursText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('socialMedia.title')}</h3>
              <div className="flex space-x-4">
                {settings?.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full hover:scale-110 transition-transform duration-300"
                  >
                    <Instagram className="h-6 w-6 text-white" />
                  </a>
                )}
                {settings?.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:scale-110 transition-transform duration-300"
                  >
                    <Facebook className="h-6 w-6 text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">{t('form.title')}</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-300"
                    placeholder={t('form.namePlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-300"
                    placeholder={t('form.emailPlaceholder')}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-300"
                  placeholder={t('form.phonePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.subject')}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-300"
                  placeholder={t('form.subjectPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-300"
                  placeholder={t('form.messagePlaceholder')}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105"
              >
                {t('form.submit')}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('map.title')}</h3>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3254.3363944658895!2d33.189963011409795!3d35.34729707258294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14de0de5dddb75f7%3A0x54371314527aa538!2sM.%20Cangil%20Motors!5e0!3m2!1sen!2str!4v1758285673447!5m2!1sen!2str" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-96"
            />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}