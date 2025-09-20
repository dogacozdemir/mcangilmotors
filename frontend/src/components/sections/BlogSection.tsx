'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';

interface BlogPost {
  id: number;
  slug: string;
  imgUrl?: string;
  createdAt: string;
  translations: Array<{
    lang: string;
    title: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }>;
  images: Array<{
    id: number;
    imagePath: string;
    isMain: boolean;
  }>;
}

export function BlogSection() {
  const t = useTranslations('blog.section');
  const locale = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.getBlogPosts({ limit: 6, lang: locale }) as { posts?: BlogPost[] };
        setPosts(response.posts || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [locale]);

  const getPostTranslation = (post: BlogPost) => {
    return post.translations.find(t => t.lang === locale) || post.translations[0] || {
      title: 'Untitled',
      content: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ''
    };
  };


  if (loading) {
    return (
      <section className="py-16 bg-section-secondary relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-80 mx-auto"></div>
            </div>
          </div>
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 animate-pulse">
                <div className="h-48 bg-gray-300 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-section-secondary relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern-grid"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Carwow-style Header */}
        <div className="text-center mb-12">
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-prestige-black" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-proxima-nova font-bold text-prestige-black">
              {t('title')}
            </h2>
          </motion.div>
          <motion.p
            className="text-base text-prestige-gray-600 max-w-2xl mx-auto font-proxima-nova"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Compact Blog Grid */}
        <div className="relative">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {posts.slice(0, 3).map((post, index) => {
              const translation = getPostTranslation(post);
              const mainImage = post.imgUrl || (post.images.find(img => img.isMain)?.imagePath);
              const imageUrl = mainImage?.startsWith('http') ? mainImage : mainImage ? `http://localhost:3001${mainImage}` : null;
              
              return (
                <motion.article
                  key={post.id}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/${locale}/blog/${post.slug}`} className="block">
                    {/* Compact Card */}
                    <div className="bg-prestige-card rounded-lg shadow-prestige border border-prestige-border hover:shadow-prestige-md transition-all duration-300 group-hover:scale-105">
                      {/* Image Container - Smaller */}
                      <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={translation.title || 'Blog Image'}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-gold flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-prestige-black/50" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content - Compact */}
                      <div className="p-3">
                        <h3 className="text-sm font-proxima-nova font-semibold text-prestige-black group-hover:text-prestige-gold transition-colors duration-300 line-clamp-2">
                          {translation.title || 'Untitled'}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>

        </div>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Button asChild className="premium-button bg-gradient-gold text-prestige-black px-8 py-3 text-base font-proxima-nova font-bold rounded-xl shadow-prestige-lg">
            <Link href={`/${locale}/blog`}>
              <span className="flex items-center space-x-2">
                <span>{t('viewAllPosts')}</span>
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}