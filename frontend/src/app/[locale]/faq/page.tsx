'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { generateFAQPageSchema } from '@/lib/metaTags';

export default function FAQPage() {
  const t = useTranslations('faq');
  const params = useParams();
  const locale = params.locale as string;
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  // Generate FAQPage schema
  const questions = t.raw('questions') as Array<{ question: string; answer: string }>;
  const faqSchema = generateFAQPageSchema({
    title: t('title'),
    description: t('description'),
    url: `/${locale}/faq`,
    locale,
    faqs: questions.map(q => ({
      question: q.question,
      answer: q.answer
    }))
  });

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
        <meta name="keywords" content={t('keywords')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={t('title')} />
        <meta property="og:description" content={t('description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mcangilmotors.com/${locale}/faq`} />
        <meta property="og:image" content="https://mcangilmotors.com/hero-bg.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('title')} />
        <meta name="twitter:description" content={t('description')} />
        <meta name="twitter:image" content="https://mcangilmotors.com/hero-bg.jpg" />
        
        {/* Hreflang */}
        <link rel="alternate" hrefLang="tr" href="https://mcangilmotors.com/tr/faq" />
        <link rel="alternate" hrefLang="en" href="https://mcangilmotors.com/en/faq" />
        <link rel="alternate" hrefLang="ar" href="https://mcangilmotors.com/ar/faq" />
        <link rel="alternate" hrefLang="ru" href="https://mcangilmotors.com/ru/faq" />
        <link rel="alternate" hrefLang="x-default" href="https://mcangilmotors.com/tr/faq" />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://mcangilmotors.com/${locale}/faq`} />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-amber-500/20 rounded-full">
                  <HelpCircle className="w-12 h-12 text-amber-400" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                {t('hero.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-6">
            {questions.map((question, index: number) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {question.question}
                  </span>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed">
                        {question.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Sorunuzun cevabını bulamadınız mı?
            </h3>
            <p className="text-amber-100 mb-6">
              Uzman ekibimiz size yardımcı olmaktan mutluluk duyar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/${locale}/contact`}
                className="bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                İletişime Geç
              </a>
              <a
                href="tel:+905338551166"
                className="bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
              >
                Hemen Ara: +90 533 855 11 66
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
