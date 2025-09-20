'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/api';

interface BlogPost {
  id: number;
  slug: string;
  imgUrl?: string;
  createdAt: string;
  translations: Array<{
    title: string;
    content: string;
    lang: string;
  }>;
  images: Array<{
    imagePath: string;
    isMain: boolean;
  }>;
}

export function BlogCarousel() {
  const locale = useLocale();
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Load blog posts
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const data = await apiClient.getBlogPosts({ limit: 10, lang: locale });
        const posts = (data as any).posts || [];
        console.log('Blog posts loaded:', posts);
        console.log('First post details:', posts[0]);
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, [locale]);


  const getPostImage = (post: BlogPost) => {
    console.log('Getting image for post:', post.id, 'imgUrl:', post.imgUrl, 'images:', post.images);
    
    // Önce imgUrl'i kontrol et
    if (post.imgUrl) {
      // Eğer relative path ise, olduğu gibi döndür (backend'den serve edilecek)
      if (post.imgUrl.startsWith('/')) {
        return post.imgUrl;
      }
      // Eğer full URL ise, olduğu gibi döndür
      return post.imgUrl;
    }
    
    // Images tablosundan resim al
    if (post.images && post.images.length > 0) {
      const mainImage = post.images.find(img => img.isMain);
      const imagePath = mainImage ? mainImage.imagePath : post.images[0].imagePath;
      
      console.log('Using image from images table:', imagePath);
      
      // Eğer relative path ise, olduğu gibi döndür (backend'den serve edilecek)
      if (imagePath.startsWith('/')) {
        return imagePath;
      }
      // Eğer full URL ise, olduğu gibi döndür
      return imagePath;
    }
    
    // Fallback placeholder
    console.log('Using fallback placeholder');
    return '/blog/placeholder.jpg';
  };

  const getPostTitle = (post: BlogPost) => {
    const translation = post.translations.find(t => t.lang === locale);
    return translation?.title || post.translations[0]?.title || 'Blog Post';
  };


  if (loading) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 mx-auto mb-4"></div>
            <p className="text-gray-600">Blog yazıları yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  if (blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="w-full">
        <div className="relative overflow-hidden">
          {/* Infinite Loop Container */}
          <div className="relative">
            <motion.div 
              className="flex"
              animate={{ 
                x: "-100%"
              }}
              transition={{ 
                duration: 40,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[...blogPosts, ...blogPosts, ...blogPosts, ...blogPosts, ...blogPosts].map((post, index) => {
                const isEven = index % 2 === 0;
                const marginClass = isEven ? 'mt-24 mb-4' : 'mb-24 mt-4';
                
                return (
                  <div
                    key={`${post.id}-${index}`}
                    className="flex-shrink-0 px-4"
                  >
                    <div className={`relative group rounded-xl overflow-hidden mx-2 xl:mx-4 ${marginClass}
                      hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200
                      hover:bg-gradient-to-br hover:from-white hover:to-amber-50/30
                      transition-all duration-500 ease-out cursor-pointer
                      w-80 h-96`}
                    >
                      <Link href={`/${locale}/blog/${post.slug}`}>
                        <div className="group-hover:scale-105 group-hover:brightness-110 transition-all duration-500 ease-out h-full">
                          <Image
                            src={getPostImage(post)}
                            alt={getPostTitle(post)}
                            width={320}
                            height={384}
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300 w-full h-full"
                            sizes="(max-width: 640px) 300px, 320px"
                            onError={(e) => {
                              e.currentTarget.src = '/blog/placeholder.jpg';
                            }}
                          />
                        </div>
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
                        
                        {/* Bottom Gradient */}
                        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black"></div>
                        
                        {/* Content Overlay */}
                        <div className="absolute bottom-0 group-hover:bg-gradient-to-t group-hover:from-black w-full group-hover:translate-y-[-2px] transition-all duration-300 ease-out">
                          <div className="flex flex-col text-xs text-neutral-300 p-4">
                            <div className="block mb-2">
                              <h2 className="font-proxima-nova whitespace-normal text-sm md:text-base font-medium text-white line-clamp-2">
                                {getPostTitle(post)}
                              </h2>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogCarousel;
