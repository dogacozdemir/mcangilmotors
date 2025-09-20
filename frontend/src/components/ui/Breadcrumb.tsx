'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  locale?: string;
}

export function Breadcrumb({ 
  items, 
  className = '', 
  showHome = true,
  locale = 'tr'
}: BreadcrumbProps) {
  // Sort items by position
  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      {showHome && (
        <>
          <Link 
            href={`/${locale}`}
            className="flex items-center hover:text-primary transition-colors duration-200"
            aria-label="Ana Sayfa"
          >
            <Home className="w-4 h-4" />
          </Link>
          {sortedItems.length > 0 && (
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          )}
        </>
      )}
      
      {sortedItems.map((item, index) => (
        <React.Fragment key={item.position}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          )}
          
          {index === sortedItems.length - 1 ? (
            // Last item - not clickable
            <span 
              className="font-medium text-gray-900 dark:text-white"
              aria-current="page"
            >
              {item.name}
            </span>
          ) : (
            // Clickable items
            <Link 
              href={item.url}
              className="hover:text-primary transition-colors duration-200"
            >
              {item.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Breadcrumb for specific pages
export function HomeBreadcrumb({ locale = 'tr' }: { locale?: string }) {
  return (
    <Breadcrumb 
      items={[]} 
      showHome={true}
      locale={locale}
    />
  );
}

export function InventoryBreadcrumb({ locale = 'tr' }: { locale?: string }) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'Araç Galerisi' : 
                locale === 'en' ? 'Vehicle Gallery' :
                locale === 'ar' ? 'معرض المركبات' : 'Галерея автомобилей',
          url: `/${locale}/inventory`,
          position: 1
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}

export function CarDetailBreadcrumb({ 
  make, 
  model, 
  year, 
  locale = 'tr' 
}: { 
  make: string; 
  model: string; 
  year: number; 
  locale?: string;
}) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'Araç Galerisi' : 
                locale === 'en' ? 'Vehicle Gallery' :
                locale === 'ar' ? 'معرض المركبات' : 'Галерея автомобилей',
          url: `/${locale}/inventory`,
          position: 1
        },
        {
          name: `${year} ${make} ${model}`,
          url: '#',
          position: 2
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}

export function BlogBreadcrumb({ locale = 'tr' }: { locale?: string }) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'Blog' : 
                locale === 'en' ? 'Blog' :
                locale === 'ar' ? 'المدونة' : 'Блог',
          url: `/${locale}/blog`,
          position: 1
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}

export function BlogPostBreadcrumb({ 
  title, 
  locale = 'tr' 
}: { 
  title: string; 
  locale?: string;
}) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'Blog' : 
                locale === 'en' ? 'Blog' :
                locale === 'ar' ? 'المدونة' : 'Блог',
          url: `/${locale}/blog`,
          position: 1
        },
        {
          name: title,
          url: '#',
          position: 2
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}

export function ContactBreadcrumb({ locale = 'tr' }: { locale?: string }) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'İletişim' : 
                locale === 'en' ? 'Contact' :
                locale === 'ar' ? 'اتصل بنا' : 'Контакты',
          url: `/${locale}/contact`,
          position: 1
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}

export function AboutBreadcrumb({ locale = 'tr' }: { locale?: string }) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'Hakkımızda' : 
                locale === 'en' ? 'About Us' :
                locale === 'ar' ? 'من نحن' : 'О нас',
          url: `/${locale}/about`,
          position: 1
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}

export function SoldCarsBreadcrumb({ locale = 'tr' }: { locale?: string }) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'Satılan Araçlar' : 
                locale === 'en' ? 'Sold Vehicles' :
                locale === 'ar' ? 'المركبات المباعة' : 'Проданные автомобили',
          url: `/${locale}/sold-cars`,
          position: 1
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}

export function IncomingCarsBreadcrumb({ locale = 'tr' }: { locale?: string }) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'Gelen Araçlar' : 
                locale === 'en' ? 'Incoming Vehicles' :
                locale === 'ar' ? 'المركبات القادمة' : 'Входящие автомобили',
          url: `/${locale}/incoming-cars`,
          position: 1
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}

export function FAQBreadcrumb({ locale = 'tr' }: { locale?: string }) {
  return (
    <Breadcrumb 
      items={[
        {
          name: locale === 'tr' ? 'Sık Sorulan Sorular' : 
                locale === 'en' ? 'Frequently Asked Questions' :
                locale === 'ar' ? 'الأسئلة الشائعة' : 'Часто задаваемые вопросы',
          url: `/${locale}/faq`,
          position: 1
        }
      ]}
      showHome={true}
      locale={locale}
    />
  );
}
