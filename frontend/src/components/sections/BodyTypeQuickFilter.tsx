'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface BodyType {
  key: string;
  icon: string;
  label: {
    tr: string;
    en: string;
    ar: string;
    ru: string;
  };
}

const bodyTypes: BodyType[] = [
  {
    key: 'Sedan',
    icon: '/icons/sedan.png',
    label: {
      tr: 'Sedan',
      en: 'Sedan',
      ar: 'سيدان',
      ru: 'Седан'
    }
  },
  {
    key: 'Hatchback',
    icon: '/icons/hatchback.png',
    label: {
      tr: 'Hatchback',
      en: 'Hatchback',
      ar: 'هاتشباك',
      ru: 'Хэтчбек'
    }
  },
  {
    key: 'SUV',
    icon: '/icons/suv.png',
    label: {
      tr: 'SUV',
      en: 'SUV',
      ar: 'SUV',
      ru: 'SUV'
    }
  },
  {
    key: 'Coupe',
    icon: '/icons/coupe.png',
    label: {
      tr: 'Coupe',
      en: 'Coupe',
      ar: 'كوبيه',
      ru: 'Купе'
    }
  },
  {
    key: 'Klasik',
    icon: '/icons/klasik.png',
    label: {
      tr: 'Klasik',
      en: 'Classic',
      ar: 'كلاسيك',
      ru: 'Классический'
    }
  },
  {
    key: 'Sports Car',
    icon: '/icons/sports-car.png',
    label: {
      tr: 'Spor',
      en: 'Sports Car',
      ar: 'سيارة رياضية',
      ru: 'Спортивный автомобиль'
    }
  },
  {
    key: 'Pickup',
    icon: '/icons/pickup.png',
    label: {
      tr: 'Pickup',
      en: 'Pickup',
      ar: 'بيك أب',
      ru: 'Пикап'
    }
  },
  {
    key: 'Commercial',
    icon: '/icons/transport.png',
    label: {
      tr: 'Ticari',
      en: 'Commercial',
      ar: 'تجاري',
      ru: 'Коммерческий'
    }
  }
];

export function BodyTypeQuickFilter() {
  const locale = useLocale();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleBodyTypeClick = (bodyType: string) => {
    // Navigate to inventory page with body type filter
    router.push(`/${locale}/inventory?bodyType=${bodyType}`);
  };

  const getLabel = (bodyType: BodyType) => {
    return bodyType.label[locale as keyof typeof bodyType.label] || bodyType.label.en;
  };

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Body Type Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-3 sm:gap-4">
          {bodyTypes.map((bodyType, index) => (
            <motion.div
              key={bodyType.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <button
                onClick={() => handleBodyTypeClick(bodyType.key)}
                onMouseEnter={() => setHoveredItem(bodyType.key)}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-full p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group-hover:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100"
              >
                {/* Icon Container */}
                <div className="relative mb-2">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto relative">
                    <Image
                      src={bodyType.icon}
                      alt={getLabel(bodyType)}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 40px, 48px"
                    />
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: hoveredItem === bodyType.key ? 1 : 0,
                      scale: hoveredItem === bodyType.key ? 1 : 0.8
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Label */}
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                  {getLabel(bodyType)}
                </h3>

                {/* Hover Indicator */}
                <motion.div
                  className="w-6 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mx-auto mt-1"
                  initial={{ width: 0 }}
                  animate={{ width: hoveredItem === bodyType.key ? 24 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BodyTypeQuickFilter;
