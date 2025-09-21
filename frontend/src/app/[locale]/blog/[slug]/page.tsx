'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/api';
import { RelatedPosts } from '@/components/sections/RelatedPosts';

interface BlogPost {
  id: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  imgUrl?: string;
  translations: Array<{
    lang: string;
    title: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
  }>;
}

export default function BlogPostPage() {
  const t = useTranslations('blog');
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPost = useCallback(async () => {
    try {
      const data = await apiClient.getBlogPost(slug, locale) as BlogPost;
      setPost(data);
      
      // Load related posts
      const relatedData = await apiClient.getBlogPosts({
        page: 1,
        limit: 6
      }) as { posts: BlogPost[] };
      setRelatedPosts(relatedData.posts || []);
    } catch (error) {
      console.error('Error loading blog post:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, locale]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Blog yazısı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Yazısı Bulunamadı</h1>
          <Link
            href={`/${locale}/blog`}
            className="text-brand-primary hover:text-brand-primary-dark"
          >
            ← Blog&apos;a Dön
          </Link>
        </div>
      </div>
    );
  }

  const translation = post.translations?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="mb-4">
            <Link
              href={`/${locale}/blog`}
              className="text-brand-primary hover:text-brand-primary-dark"
            >
              ← Blog&apos;a Dön
            </Link>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            {translation?.title || 'Blog Yazısı'}
          </h1>
          <p className="mt-2 text-gray-600">
            {new Date(post.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md p-8">
          {translation?.content ? (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: translation.content }}
            />
          ) : (
            <p className="text-gray-500">İçerik bulunamadı.</p>
          )}
        </article>
      </div>
      
      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <RelatedPosts
          posts={relatedPosts}
          currentPostId={post.id}
          locale={locale}
        />
      )}
    </div>
  );
}



