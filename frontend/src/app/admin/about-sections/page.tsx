'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

interface AboutSection {
  id: number;
  slug: string;
  translations?: Array<{
    lang: string;
    title: string;
    content: string;
  }>;
}

const sectionNames = {
  'about-mission': 'Misyon',
  'about-vision': 'Vizyon', 
  'about-values': 'Değerler',
  'about-experience': 'Deneyim',
  'about-service-area': 'Hizmet Alanı',
  'about-team': 'Ekip',
  'about-cta': 'İletişim Çağrısı'
};

export default function AdminAboutSectionsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [viewingSection, setViewingSection] = useState<AboutSection | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState('tr');

  // Form states
  const [formData, setFormData] = useState({
    slug: '',
    translations: {
      tr: { title: '', content: '' },
      en: { title: '', content: '' },
      ar: { title: '', content: '' },
      ru: { title: '', content: '' }
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadSections();
    }
  }, [router]);

  const loadSections = async () => {
    try {
      const data = await apiClient.getAboutSections('tr');
      setSections(data as AboutSection[]);
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSection(null);
    setFormData({
      slug: '',
      translations: {
        tr: { title: '', content: '' },
        en: { title: '', content: '' },
        ar: { title: '', content: '' },
        ru: { title: '', content: '' }
      }
    });
    setShowModal(true);
  };

  const handleEdit = (section: AboutSection) => {
    setEditingSection(section);
    setFormData({
      slug: section.slug,
      translations: {
        tr: { title: '', content: '' },
        en: { title: '', content: '' },
        ar: { title: '', content: '' },
        ru: { title: '', content: '' }
      }
    });

    // Fill form with existing translations
    section.translations?.forEach(translation => {
      if (translation.lang in formData.translations) {
        setFormData(prev => ({
          ...prev,
          translations: {
            ...prev.translations,
            [translation.lang]: {
              title: translation.title,
              content: translation.content
            }
          }
        }));
      }
    });

    setShowModal(true);
  };

  const handleView = (section: AboutSection) => {
    setViewingSection(section);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await apiClient.updatePage(editingSection.id, formData);
      } else {
        await apiClient.createPage(formData);
      }
      setShowModal(false);
      loadSections();
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu bölümü silmek istediğinizden emin misiniz?')) {
      try {
        await apiClient.deletePage(id);
        loadSections();
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Hakkımızda Bölümleri</h1>
              <p className="text-gray-300">Hakkımızda sayfasındaki bölümleri yönetin</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1 transition-all duration-300"
            >
              + Yeni Bölüm Ekle
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex space-x-4">
            {['tr', 'en', 'ar', 'ru'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  selectedLang === lang
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const translation = section.translations?.find(t => t.lang === selectedLang);
            return (
              <div key={section.id} className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {sectionNames[section.slug as keyof typeof sectionNames] || section.slug}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(section)}
                      className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-all duration-300"
                      title="Görüntüle"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleEdit(section)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-semibold text-amber-300 mb-2">
                      {translation?.title || 'Başlık Yok'}
                    </h4>
                    <div 
                      className="text-gray-300 text-sm line-clamp-3"
                      dangerouslySetInnerHTML={{ 
                        __html: translation?.content || 'İçerik Yok' 
                      }}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {section.translations?.map((t) => (
                      <span
                        key={t.lang}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          t.title ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {t.lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">
                  {editingSection ? 'Bölümü Düzenle' : 'Yeni Bölüm Ekle'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Slug</label>
                  <select
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="">Bölüm Seçin</option>
                    {Object.entries(sectionNames).map(([slug, name]) => (
                      <option key={slug} value={slug} className="bg-slate-800 text-white">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {['tr', 'en', 'ar', 'ru'].map((lang) => (
                  <div key={lang} className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">{lang.toUpperCase()} İçerik</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 font-semibold mb-2">Başlık</label>
                        <input
                          type="text"
                          value={formData.translations[lang as keyof typeof formData.translations].title}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            translations: {
                              ...prev.translations,
                              [lang]: {
                                ...prev.translations[lang as keyof typeof prev.translations],
                                title: e.target.value
                              }
                            }
                          }))}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-amber-500 focus:outline-none"
                          placeholder={`${lang.toUpperCase()} başlık`}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-semibold mb-2">İçerik</label>
                        <textarea
                          value={formData.translations[lang as keyof typeof formData.translations].content}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            translations: {
                              ...prev.translations,
                              [lang]: {
                                ...prev.translations[lang as keyof typeof prev.translations],
                                content: e.target.value
                              }
                            }
                          }))}
                          rows={6}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-amber-500 focus:outline-none"
                          placeholder={`${lang.toUpperCase()} içerik (HTML desteklenir)`}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold transition-all duration-300"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    {editingSection ? 'Güncelle' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewingSection && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">
                  {sectionNames[viewingSection.slug as keyof typeof sectionNames] || viewingSection.slug}
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {viewingSection.translations?.map((translation) => (
                  <div key={translation.lang} className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">{translation.lang.toUpperCase()} İçerik</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-amber-300 mb-2">Başlık</h4>
                        <p className="text-gray-300">{translation.title || 'Başlık yok'}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-amber-300 mb-2">İçerik</h4>
                        <div 
                          className="text-gray-300 prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: translation.content || 'İçerik yok' 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}









