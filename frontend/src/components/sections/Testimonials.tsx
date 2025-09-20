'use client';

import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Testimonials() {
  const t = useTranslations('testimonials');

  const testimonials = [
    {
      name: t('testimonials.0.name'),
      location: t('testimonials.0.location'),
      text: t('testimonials.0.text')
    },
    {
      name: t('testimonials.1.name'),
      location: t('testimonials.1.location'),
      text: t('testimonials.1.text')
    },
    {
      name: t('testimonials.2.name'),
      location: t('testimonials.2.location'),
      text: t('testimonials.2.text')
    }
  ];

  return (
    <section className="py-12 bg-section-secondary relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern-lines"></div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-proxima-nova font-bold text-prestige-black mb-4 prestige-text-glow">
            {t('title')}
          </h2>
          <p className="text-lg sm:text-xl text-prestige-gray max-w-3xl mx-auto leading-relaxed font-proxima-nova font-light">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group prestige-card bg-prestige-card shadow-prestige border border-prestige-border hover:shadow-prestige-hover transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden h-[325px] flex flex-col" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-8 relative flex flex-col h-full">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6">
                  <Quote className="h-12 w-12 text-prestige-gold group-hover:text-prestige-gold-light transition-colors duration-300" />
                </div>
                
                {/* Rating */}
                <div className="flex items-center mb-6 h-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-prestige-gold fill-current group-hover:scale-110 transition-transform duration-200" style={{ animationDelay: `${i * 50}ms` }} />
                  ))}
                </div>

                {/* Testimonial Text - Fixed height area */}
                <div className="flex-1 mb-8">
                  <p className="text-prestige-gray leading-relaxed text-sm group-hover:text-prestige-black transition-colors duration-300 font-proxima-nova line-clamp-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>

                {/* Author Info - Fixed at bottom */}
                <div className="border-t border-prestige-border pt-6 group-hover:border-prestige-gold transition-colors duration-300 mt-auto">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-prestige-gold to-prestige-gold-light rounded-full flex items-center justify-center text-prestige-black font-proxima-nova font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-proxima-nova font-bold text-prestige-black text-base group-hover:text-prestige-gold transition-colors duration-300">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-prestige-gray group-hover:text-prestige-black transition-colors duration-300 font-proxima-nova">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}

