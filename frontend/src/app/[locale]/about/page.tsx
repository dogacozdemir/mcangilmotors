'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Testimonials } from '@/components/sections/Testimonials';

interface Page {
  id: number;
  slug: string;
  translations?: Array<{
    title: string;
    content: string;
  }>;
}

interface AboutSection {
  id: number;
  slug: string;
  translations?: Array<{
    title: string;
    content: string;
  }>;
}

export default function AboutPage() {
  const t = useTranslations('about');
  const params = useParams();
  const locale = params.locale as string;

  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [locale]);

  const loadData = async () => {
    try {
      const [pageData, sectionsData] = await Promise.all([
        apiClient.getPage('hakkimizda', locale),
        apiClient.getAboutSections(locale)
      ]);
      setPage(pageData as Page);
      setSections(sectionsData as AboutSection[]);
    } catch (error) {
      console.error('Error loading about data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-primary border-t-transparent mx-auto"></div>
          <p className="mt-6 font-proxima-nova text-gray-600 font-medium text-lg">{t('hero.loading')}</p>
        </div>
      </div>
    );
  }

  const translation = page?.translations?.[0];

  // Helper function to get section by slug
  const getSection = (slug: string) => {
    return sections.find(section => section.slug === slug);
  };

  // Helper function to get section content
  const getSectionContent = (slug: string, field: 'title' | 'content' = 'content') => {
    const section = getSection(slug);
    return section?.translations?.[0]?.[field] || '';
  };

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {translation?.title || t('title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">25+</div>
                <div className="text-gray-300">{t('hero.yearsExperience')}</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">5000+</div>
                <div className="text-gray-300">{t('hero.happyCustomers')}</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">1000+</div>
                <div className="text-gray-300">{t('hero.soldCars')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <motion.section 
        className="py-8 bg-gray-50"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WhyChooseUs />
        </div>
      </motion.section>


      {/* Testimonials Section */}
      <motion.section 
        className="py-12 bg-section-secondary"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials />
        </div>
      </motion.section>
    </div>
  );
}