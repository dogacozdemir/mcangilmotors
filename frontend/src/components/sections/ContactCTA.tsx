'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Phone, Mail, MessageCircle, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function ContactCTA() {
  const t = useTranslations();
  const locale = useLocale();

  const contactMethods = [
    {
      icon: Phone,
      title: 'Telefon',
      description: '+90 533 855 11 66',
      action: 'tel:+905338551166',
      color: 'text-green-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Hemen mesaj atın',
      action: 'https://wa.me/905338551166',
      color: 'text-green-500'
    },
    {
      icon: Mail,
      title: 'E-posta',
      description: 'm.cangilmotors@gmail.com',
      action: 'mailto:m.cangilmotors@gmail.com',
      color: 'text-blue-600'
    },
    {
      icon: MapPin,
      title: 'Adres',
      description: 'KKTC, Alsancak',
      action: '#',
      color: 'text-red-600'
    }
  ];

  return (
    <section className="py-20 bg-section-tertiary relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern-lines"></div>
      
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-gold rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-gold rounded-full blur-3xl opacity-8"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.12, 0.08]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-gold rounded-full blur-3xl opacity-5"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Premium Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-6 w-6 text-prestige-gold" />
            <span className="text-prestige-gold font-proxima-nova font-semibold text-sm uppercase tracking-wider">
              Get In Touch
            </span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-proxima-nova font-bold text-prestige-black mb-4 prestige-text-glow">
            Bizimle İletişime Geçin
          </h2>
          <p className="text-base sm:text-lg text-prestige-gray-600 max-w-3xl mx-auto leading-relaxed font-proxima-nova font-light">
            Aradığınız aracı bulamadınız mı? Size yardımcı olmaktan mutluluk duyarız.
          </p>
        </motion.div>

        {/* Premium Contact Methods Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {contactMethods.map((method, index) => (
            <motion.a
              key={index}
              href={method.action}
              className="group premium-card rounded-2xl p-6 text-center shadow-prestige-lg border border-prestige-gold/20 h-[160px] flex flex-col justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              viewport={{ once: true }}
            >
              <div className="relative mb-6">
                <motion.div
                  className="absolute inset-0 bg-gradient-gold rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-20"
                  whileHover={{ scale: 1.1 }}
                />
                <motion.div
                  className="relative bg-gradient-gold p-3 rounded-full w-12 h-12 mx-auto border-2 border-prestige-gold/30 group-hover:border-prestige-gold/60 transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <method.icon className={`h-6 w-6 mx-auto text-prestige-black group-hover:scale-110 transition-transform duration-300`} />
                </motion.div>
              </div>
              <h3 className="text-lg font-proxima-nova font-bold text-prestige-black mb-2 group-hover:text-prestige-gold transition-colors duration-300">
                {method.title}
              </h3>
              <p className="text-xs text-prestige-gray-600 group-hover:text-prestige-black transition-colors duration-300 font-proxima-nova">
                {method.description}
              </p>
            </motion.a>
          ))}
        </motion.div>

        {/* Premium Action Buttons */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="group relative premium-button bg-gradient-gold text-prestige-black px-8 py-3 text-base font-proxima-nova font-bold rounded-xl shadow-prestige-lg">
                <Link href={`/${locale}/inventory`}>
                  <span className="relative z-10 flex items-center space-x-3">
                    <Phone className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Araçları İncele</span>
                  </span>
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" variant="outline" className="group premium-button border-2 border-prestige-gold text-prestige-gold hover:bg-prestige-gold hover:text-prestige-black px-8 py-3 text-base font-proxima-nova font-bold rounded-xl bg-prestige-card backdrop-blur-sm shadow-prestige">
                <Link href={`/${locale}/contact`}>
                  <span className="flex items-center space-x-3">
                    <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    <span>İletişim Formu</span>
                  </span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Compact Business Hours */}
        <motion.div
          className="premium-card rounded-2xl shadow-prestige-lg border border-prestige-gold/20 p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-gold rounded-full blur-xl"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-gold rounded-full blur-lg"></div>
          </div>
          
          <div className="text-center relative z-10">
            {/* Compact Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-proxima-nova font-bold text-prestige-black">
                Çalışma Saatleri
              </h3>
            </motion.div>

            {/* Compact Hours Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-prestige-gold/5 to-prestige-gold-light/10 rounded-xl p-4 border border-prestige-gold/20 group-hover:border-prestige-gold/40 transition-all duration-300 group-hover:shadow-prestige-md">
                  <div className="text-center">
                    <div className="text-sm font-proxima-nova font-bold text-prestige-black mb-1 group-hover:text-prestige-gold transition-colors duration-300">
                      Hafta İçi
                    </div>
                    <div className="text-xs font-proxima-nova text-prestige-gray-600 group-hover:text-prestige-black transition-colors duration-300">
                      08:00 - 17:00
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-prestige-gold/5 to-prestige-gold-light/10 rounded-xl p-4 border border-prestige-gold/20 group-hover:border-prestige-gold/40 transition-all duration-300 group-hover:shadow-prestige-md">
                  <div className="text-center">
                    <div className="text-sm font-proxima-nova font-bold text-prestige-black mb-1 group-hover:text-prestige-gold transition-colors duration-300">
                      Cumartesi
                    </div>
                    <div className="text-xs font-proxima-nova text-prestige-gray-600 group-hover:text-prestige-black transition-colors duration-300">
                      08:00 - 17:00
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-prestige-gray-100 to-prestige-gray-200 rounded-xl p-4 border border-prestige-gray-300 group-hover:border-prestige-gray-400 transition-all duration-300 group-hover:shadow-prestige-md">
                  <div className="text-center">
                    <div className="text-sm font-proxima-nova font-bold text-prestige-gray-700 mb-1 group-hover:text-prestige-gray-900 transition-colors duration-300">
                      Pazar
                    </div>
                    <div className="text-xs font-proxima-nova text-prestige-gray-600 group-hover:text-prestige-gray-800 transition-colors duration-300">
                      Kapalı
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
