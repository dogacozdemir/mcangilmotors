'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/api';

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

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    imgUrl: '',
    translations: {
      tr: { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
      en: { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
      ar: { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
      ru: { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' }
    }
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      fetchPosts();
    }
  }, [router]);

  const fetchPosts = async () => {
    try {
      const response = await apiClient.getBlogPosts({ limit: 100 }) as { posts?: BlogPost[] };
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const response = await apiClient.uploadBlogImage(file);
    return response.image.optimized.large; // Use large size for admin preview
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPost) {
        await apiClient.updateBlogPost(editingPost.id, formData);
      } else {
        await apiClient.createBlogPost(formData);
      }
      
      setShowModal(false);
      setEditingPost(null);
      setFormData({
        slug: '',
        imgUrl: '',
        translations: {
          tr: { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
          en: { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
          ar: { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
          ru: { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' }
        }
      });
      fetchPosts();
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Blog yazısı kaydedilirken bir hata oluştu');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    const translationsObj: any = {};
    post.translations.forEach(t => {
      translationsObj[t.lang] = {
        title: t.title || '',
        content: t.content || '',
        seo_title: t.seoTitle || '',
        seo_description: t.seoDescription || '',
        seo_keywords: t.seoKeywords || ''
      };
    });
    
    setFormData({
      slug: post.slug,
      imgUrl: post.imgUrl || '',
      translations: {
        tr: translationsObj.tr || { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
        en: translationsObj.en || { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
        ar: translationsObj.ar || { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' },
        ru: translationsObj.ru || { title: '', content: '', seo_title: '', seo_description: '', seo_keywords: '' }
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      try {
        await apiClient.deleteBlogPost(id);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting blog post:', error);
        alert('Blog yazısı silinirken bir hata oluştu');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-prestige-gold mx-auto"></div>
          <p className="mt-4 text-prestige-gray font-prestige-sans">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-75"></div>
                <Image
                  src="/logo.png"
                  alt="Mustafa Cangil Auto Trading Ltd."
                  width={80}
                  height={53}
                  className="relative h-12 w-auto"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Blog Yönetimi
                </h1>
                <p className="text-sm text-gray-600 font-medium">Blog yazılarını ekleyin, düzenleyin ve yönetin</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Yeni Blog Yazısı</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const trTranslation = post.translations.find(t => t.lang === 'tr') || post.translations[0];
            const mainImage = post.imgUrl || (post.images.find(img => img.isMain)?.imagePath);
            const imageUrl = mainImage?.startsWith('http') ? mainImage : mainImage ? `http://localhost:3001${mainImage}` : null;
            
            return (
              <div key={post.id} className="bg-prestige-card rounded-2xl shadow-prestige border-2 border-prestige-gold/20 overflow-hidden hover:shadow-prestige-hover transition-all duration-300">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-prestige-gold/10 to-prestige-gold-light/10">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={trTranslation?.title || 'Blog Image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-prestige-gold/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-prestige-serif font-bold text-prestige-black mb-2 line-clamp-2">
                    {trTranslation?.title || 'Başlıksız'}
                  </h3>
                  
                  <p className="text-prestige-gray font-prestige-sans text-sm mb-4 line-clamp-3">
                    {trTranslation?.content?.substring(0, 120) + '...' || 'İçerik yok'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-prestige-gray font-prestige-sans mb-4">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="bg-prestige-gold/10 text-prestige-gold px-2 py-1 rounded-full text-xs">
                      {post.slug}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(post)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-prestige-gold/30 text-prestige-gold hover:bg-prestige-gold/10 font-prestige-sans"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Düzenle
                    </Button>
                    <Button
                      onClick={() => handleDelete(post.id)}
                      variant="outline"
                      size="sm"
                      className="border-2 border-red-300 text-red-500 hover:bg-red-50 font-prestige-sans"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-prestige-card rounded-3xl shadow-prestige-hover max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-prestige-serif font-bold text-prestige-black">
                    {editingPost ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
                  </h2>
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="ghost"
                    className="text-prestige-gray hover:text-prestige-black"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-2">
                      Kapak Resmi
                    </label>
                    <ImageUpload
                      value={formData.imgUrl}
                      onChange={(value) => setFormData({ ...formData, imgUrl: value })}
                      onImageUpload={handleImageUpload}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-2">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-prestige-border rounded-2xl focus:outline-none focus:border-prestige-gold text-prestige-black font-prestige-sans"
                      placeholder="blog-yazisi-url"
                      required
                    />
                  </div>

                  {/* Translations */}
                  <div className="space-y-6">
                    {Object.entries(formData.translations).map(([lang, translation]) => (
                      <div key={lang} className="border-2 border-prestige-gold/20 rounded-2xl p-6">
                        <h3 className="text-lg font-prestige-serif font-bold text-prestige-black mb-4">
                          {lang.toUpperCase()} Çevirisi
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-2">
                              Başlık
                            </label>
                            <input
                              type="text"
                              value={translation.title}
                              onChange={(e) => setFormData({
                                ...formData,
                                translations: {
                                  ...formData.translations,
                                  [lang]: { ...translation, title: e.target.value }
                                }
                              })}
                              className="w-full px-4 py-3 border-2 border-prestige-border rounded-2xl focus:outline-none focus:border-prestige-gold text-prestige-black font-prestige-sans"
                              placeholder="Blog yazısı başlığı"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-2">
                              İçerik
                            </label>
                            <textarea
                              value={translation.content}
                              onChange={(e) => setFormData({
                                ...formData,
                                translations: {
                                  ...formData.translations,
                                  [lang]: { ...translation, content: e.target.value }
                                }
                              })}
                              rows={6}
                              className="w-full px-4 py-3 border-2 border-prestige-border rounded-2xl focus:outline-none focus:border-prestige-gold text-prestige-black font-prestige-sans"
                              placeholder="Blog yazısı içeriği"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-2">
                                SEO Başlık
                              </label>
                              <input
                                type="text"
                                value={translation.seo_title}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  translations: {
                                    ...formData.translations,
                                    [lang]: { ...translation, seo_title: e.target.value }
                                  }
                                })}
                                className="w-full px-4 py-3 border-2 border-prestige-border rounded-2xl focus:outline-none focus:border-prestige-gold text-prestige-black font-prestige-sans"
                                placeholder="SEO başlığı"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-2">
                                SEO Açıklama
                              </label>
                              <textarea
                                value={translation.seo_description}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  translations: {
                                    ...formData.translations,
                                    [lang]: { ...translation, seo_description: e.target.value }
                                  }
                                })}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-prestige-border rounded-2xl focus:outline-none focus:border-prestige-gold text-prestige-black font-prestige-sans"
                                placeholder="SEO açıklaması"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-2">
                                SEO Anahtar Kelimeler
                              </label>
                              <input
                                type="text"
                                value={translation.seo_keywords}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  translations: {
                                    ...formData.translations,
                                    [lang]: { ...translation, seo_keywords: e.target.value }
                                  }
                                })}
                                className="w-full px-4 py-3 border-2 border-prestige-border rounded-2xl focus:outline-none focus:border-prestige-gold text-prestige-black font-prestige-sans"
                                placeholder="anahtar, kelimeler"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      onClick={() => setShowModal(false)}
                      variant="outline"
                      className="border-2 border-prestige-gold/30 text-prestige-gold hover:bg-prestige-gold/10 font-prestige-sans"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="prestige-button bg-gradient-to-r from-prestige-gold to-prestige-gold-light hover:from-prestige-gold-dark hover:to-prestige-gold text-prestige-black font-prestige-sans font-semibold rounded-2xl shadow-prestige hover:shadow-prestige-hover transform hover:-translate-y-1 transition-all duration-300"
                    >
                      {editingPost ? 'Güncelle' : 'Oluştur'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}