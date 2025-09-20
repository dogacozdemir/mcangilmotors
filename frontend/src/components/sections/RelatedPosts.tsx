'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';

interface RelatedPost {
  id: number;
  slug: string;
  imgUrl?: string;
  createdAt: string;
  translations: Array<{
    lang: string;
    title: string;
    content: string;
  }>;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentPostId: number;
  locale: string;
  title?: string;
  maxItems?: number;
}

export function RelatedPosts({ 
  posts, 
  currentPostId, 
  locale, 
  title = "İlgili Yazılar",
  maxItems = 3 
}: RelatedPostsProps) {
  // Filter out current post and limit results
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, maxItems);

  if (relatedPosts.length === 0) return null;

  const getPostTranslation = (post: RelatedPost) => {
    return post.translations.find(t => t.lang === locale) || post.translations[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US');
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Benzer konulardaki diğer blog yazılarımızı keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedPosts.map((post) => {
            const translation = getPostTranslation(post);
            return (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-primary/20"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.imgUrl || '/blog/placeholder.jpg'}
                    alt={translation.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      5 dk okuma
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors mb-3 line-clamp-2">
                    {translation.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {translation.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold group-hover:underline">
                      Devamını Oku
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Tüm Blog Yazılarını Görüntüle
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Related posts by category/tags
export function RelatedPostsByCategory({ 
  posts, 
  currentPostId, 
  category, 
  locale, 
  maxItems = 3 
}: {
  posts: RelatedPost[];
  currentPostId: number;
  category: string;
  locale: string;
  maxItems?: number;
}) {
  // This would need category field in the post data
  const categoryPosts = posts.filter(post => 
    post.id !== currentPostId
    // Add category filtering logic here when category field is available
  ).slice(0, maxItems);

  if (categoryPosts.length === 0) return null;

  return (
    <RelatedPosts
      posts={categoryPosts}
      currentPostId={currentPostId}
      locale={locale}
      title={`${category} Kategorisindeki Diğer Yazılar`}
      maxItems={maxItems}
    />
  );
}
