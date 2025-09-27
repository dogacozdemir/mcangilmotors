'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import apiClient from '@/lib/api';
import { BlogBreadcrumb } from '@/components/ui/Breadcrumb';
import { getImageUrl } from '@/lib/urlUtils';

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

export default function BlogPageClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('blog.page');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('Fetching blog posts...');
        const response = await apiClient.getBlogPosts({ limit: 100 }) as any; // Get more posts
        console.log('Blog posts response:', response);
        // Backend returns { posts: [...], pagination: {...} }
        const posts = response.posts || response;
        console.log('Posts to set:', posts);
        setPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getBlogImageUrl = (post: any) => {
    // Check for imgUrl first
    if (post.imgUrl) {
      return getImageUrl(post.imgUrl);
    }
    
    // Check for main image in images array
    if (post.images && post.images.length > 0) {
      const mainImage = post.images.find((img: any) => img.isMain) || post.images[0];
      if (mainImage?.imagePath) {
        return getImageUrl(mainImage.imagePath);
      }
    }
    
    // Fallback to placeholder
    return '/blog/placeholder.jpg';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPosts = posts.filter(post => {
    const translation = post.translations.find(t => t.lang === locale) || post.translations[0];
    return translation?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           translation?.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogBreadcrumb locale={params.locale as string} />
        </div>
      </div>
      
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle').split(t('hero.subtitleHighlight'))[0]}
              <span className="text-amber-400 font-semibold">{t('hero.subtitleHighlight')}</span>
              {t('hero.subtitle').split(t('hero.subtitleHighlight'))[1]}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-base sm:text-lg">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400">{posts.length}</div>
                <div className="text-gray-300 text-sm sm:text-base">{t('hero.stats.blogPosts')}</div>
              </div>
              <div className="hidden sm:block w-px h-8 lg:h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400">{t('hero.stats.weeklyUpdate')}</div>
              </div>
              <div className="hidden sm:block w-px h-8 lg:h-12 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400">{t('hero.stats.expertContent')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-300"
            />
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('noResults.title')}</h3>
              <p className="text-gray-600 text-lg mb-6">
                {searchTerm ? t('noResults.noSearchResults') : t('noResults.noPosts')}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  {t('noResults.clearSearch')}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredPosts.length} {t('results.title')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {searchTerm ? t('results.searchResults') : t('results.allPosts')}
                </p>
              </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                const translation = post.translations.find(t => t.lang === locale) || post.translations[0];
                
                return (
                  <article 
                    key={post.id}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {(post.imgUrl || (post.images && post.images.length > 0)) ? (
                        <Image
                          src={getBlogImageUrl(post)}
                          alt={translation?.title || 'Blog yazısı'}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-4xl">📝</span>
                        </div>
                      )}
                      
                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {formatDate(post.createdAt)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors duration-300">
                        {translation?.title || t('post.noTitle')}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {translation?.content?.replace(/<[^>]*>/g, '').substring(0, 150) || t('post.noContent')}...
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        
                        <Link
                          href={`/${locale}/blog/${post.slug}`}
                          className="inline-flex items-center text-amber-500 hover:text-amber-600 font-semibold transition-colors duration-300"
                        >
                          {t('post.readMore')}
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}