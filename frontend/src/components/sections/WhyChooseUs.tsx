'use client';

import { useTranslations } from 'next-intl';
import { Shield, Award, Users, Clock, Car, Wrench } from 'lucide-react';

export function WhyChooseUs() {
  const t = useTranslations('whyChooseUs');

  const features = [
    {
      icon: Shield,
      title: t('features.reliableService.title'),
      description: t('features.reliableService.description')
    },
    {
      icon: Award,
      title: t('features.qualityCars.title'),
      description: t('features.qualityCars.description')
    },
    {
      icon: Users,
      title: t('features.expertTeam.title'),
      description: t('features.expertTeam.description')
    },
    {
      icon: Car,
      title: t('features.wideRange.title'),
      description: t('features.wideRange.description')
    }
  ];

  return (
    <section className="py-12 bg-section-primary relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern-grid"></div>
      
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="group text-center prestige-card bg-prestige-card shadow-prestige rounded-3xl p-8 border border-prestige-border hover:shadow-prestige-hover transition-all duration-500 transform hover:-translate-y-2 hover:scale-105" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-prestige-gold/10 to-prestige-gold-light/10 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-r from-prestige-gold/10 to-prestige-gold-light/10 p-4 rounded-full w-20 h-20 mx-auto border border-prestige-gold/20 group-hover:border-prestige-gold/40 transition-all duration-300">
                  <feature.icon className="h-10 w-10 text-prestige-gold group-hover:text-prestige-gold-light mx-auto transition-colors duration-300" />
                </div>
              </div>
              <h3 className="text-lg font-proxima-nova font-bold text-prestige-black mb-4 group-hover:text-prestige-gold transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-prestige-gray leading-relaxed group-hover:text-prestige-black transition-colors duration-300 font-proxima-nova">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-prestige-card shadow-prestige rounded-3xl border border-prestige-border p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-prestige-gold via-prestige-gold-light to-prestige-gold"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group prestige-card">
              <div className="text-xl font-proxima-nova font-bold text-prestige-gold mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-prestige-gray text-sm font-proxima-nova font-medium group-hover:text-prestige-black transition-colors duration-300">{t('stats.happyCustomers')}</div>
            </div>
            <div className="group prestige-card">
              <div className="text-xl font-proxima-nova font-bold text-prestige-gold mb-2 group-hover:scale-110 transition-transform duration-300">5+</div>
              <div className="text-prestige-gray text-sm font-proxima-nova font-medium group-hover:text-prestige-black transition-colors duration-300">{t('stats.yearsExperience')}</div>
            </div>
            <div className="group prestige-card">
              <div className="text-xl font-proxima-nova font-bold text-prestige-gold mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-prestige-gray text-sm font-proxima-nova font-medium group-hover:text-prestige-black transition-colors duration-300">{t('stats.customerSupport')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

