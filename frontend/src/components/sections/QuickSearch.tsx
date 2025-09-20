'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ReactTyped } from 'react-typed';

export function QuickSearch() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);

    router.push(`/${locale}/inventory?${params.toString()}`);
  };

  return (
    <section className="py-16 bg-section-tertiary relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots"></div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-amber-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Search Container */}
          <div className="bg-prestige-card rounded-2xl shadow-prestige border border-prestige-border p-6">
            <div className="relative w-full">
              <input
                className="w-full h-16 px-20 border-2 border-prestige-border rounded-xl text-lg transition-all focus:outline-none focus:border-prestige-gold focus:shadow-prestige text-center font-proxima-nova"
                id="search-field"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder=""
              />

              {/* Typing Animation Label */}
              {!searchTerm && (
                <label
                  className="absolute inset-0 flex items-center justify-center pointer-events-none text-prestige-gray text-lg font-proxima-nova"
                  htmlFor="search-field"
                >
                  Search by&nbsp;
                  <span className="text-prestige-gold font-semibold">
                    <ReactTyped
                      strings={['model', 'make', 'body type', 'fuel type']}
                      typeSpeed={60}
                      backSpeed={40}
                      backDelay={1500}
                      loop
                    />
                  </span>
                </label>
              )}

              {/* Search Icon */}
              <div
                className="absolute top-1/2 right-6 transform -translate-y-1/2 text-prestige-gray hover:text-prestige-gold cursor-pointer transition"
                onClick={handleSearch}
              >
                <Search className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Alt Yazılar */}
          <div className="mt-8 text-center">
            <p className="text-lg sm:text-xl font-proxima-nova font-semibold text-prestige-black">
              Hayalinizdeki aracı kolayca bulun
            </p>
            <p className="text-lg sm:text-xl text-prestige-gray mt-2 font-proxima-nova font-light">
              Geniş araç yelpazemizle aradığınız model, marka ve kasa tipini keşfedin.
            </p>
            <div className="mt-4">
              <Link
                href={`/${locale}/inventory`}
                className="inline-block prestige-button bg-prestige-black text-prestige-white px-6 py-3 rounded-lg font-proxima-nova font-medium text-sm hover:bg-prestige-gold hover:text-prestige-black transition-all duration-300 transform hover:-translate-y-1 shadow-prestige hover:shadow-prestige-hover"
              >
                Tüm Araçları Gör
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
