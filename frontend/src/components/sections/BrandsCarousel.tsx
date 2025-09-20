'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Brand {
  name: string;
  logo: string;
  key: string;
}

const brands: Brand[] = [
  {
    name: 'BMW',
    logo: '/brands/bmw.png',
    key: 'BMW'
  },
  {
    name: 'Mercedes-Benz',
    logo: '/brands/mercedes.png',
    key: 'Mercedes-Benz'
  },
  {
    name: 'Audi',
    logo: '/brands/audi.png',
    key: 'Audi'
  },
  {
    name: 'Toyota',
    logo: '/brands/toyota.png',
    key: 'Toyota'
  },
  {
    name: 'Honda',
    logo: '/brands/honda.png',
    key: 'Honda'
  },
  {
    name: 'Volkswagen',
    logo: '/brands/volkswagen.png',
    key: 'Volkswagen'
  },
  {
    name: 'Ford',
    logo: '/brands/ford.png',
    key: 'Ford'
  },
  {
    name: 'Nissan',
    logo: '/brands/nissan.png',
    key: 'Nissan'
  },
  {
    name: 'Hyundai',
    logo: '/brands/hyundai.png',
    key: 'Hyundai'
  },
  {
    name: 'Kia',
    logo: '/brands/kia.png',
    key: 'Kia'
  },
  {
    name: 'Suzuki',
    logo: '/brands/suzuki.png',
    key: 'Suzuki'
  }
];

export function BrandsCarousel() {
  const locale = useLocale();
  const router = useRouter();
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  const handleBrandClick = (brandKey: string) => {
    router.push(`/${locale}/inventory?make=${brandKey}`);
  };

  // Create infinite loop by duplicating brands
  const infiniteBrands = [...brands, ...brands, ...brands, ...brands, ...brands];

  return (
    <section className="py-8 bg-gray-50">
      <div className="w-full">
        <div className="relative overflow-hidden">
          {/* Infinite Loop Container */}
          <div className="relative">
            <motion.div 
              className="flex"
              animate={{ 
                x: "-1100%"
              }}
              transition={{ 
                duration: 120,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {infiniteBrands.map((brand, index) => (
                <div
                  key={`${brand.key}-${index}`}
                  className="flex-shrink-0 px-4"
                >
                  <motion.button
                    onClick={() => handleBrandClick(brand.key)}
                    onMouseEnter={() => setHoveredBrand(brand.key)}
                    onMouseLeave={() => setHoveredBrand(null)}
                    className="w-24 h-16 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-amber-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={80}
                      height={64}
                      className="object-contain transition-all duration-300 group-hover:scale-110 max-h-16 max-w-20"
                      sizes="(max-width: 640px) 60px, 80px"
                      onError={(e) => {
                        console.log('Brand logo failed to load:', e.currentTarget.src);
                        e.currentTarget.src = '/brands/placeholder.png';
                      }}
                    />
                  </motion.button>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrandsCarousel;
