'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Code, Database, Globe, Shield, Zap, Smartphone, Search, Users, Car, Settings, BarChart3, Lock, Eye, CheckCircle, Star, ArrowRight, ExternalLink } from 'lucide-react';

export default function ForDevsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: Globe },
    { id: 'features', label: 'Özellikler', icon: Star },
    { id: 'tech', label: 'Teknoloji', icon: Code },
    { id: 'api', label: 'API Dokümantasyonu', icon: Database },
    { id: 'seo', label: 'SEO & Performans', icon: Search },
    { id: 'accessibility', label: 'Erişilebilirlik', icon: Eye },
    { id: 'security', label: 'Güvenlik', icon: Shield }
  ];

  const features = [
    {
      category: 'Frontend',
      items: [
        { name: 'Next.js 14 (App Router)', description: 'Modern React framework ile server-side rendering' },
        { name: 'TypeScript', description: 'Type-safe development ve daha iyi developer experience' },
        { name: 'Tailwind CSS', description: 'Utility-first CSS framework ile responsive design' },
        { name: 'shadcn/ui', description: 'Modern ve erişilebilir UI component library' },
        { name: 'next-intl', description: 'Çok dilli destek (TR, EN, AR, RU)' },
        { name: 'PWA Support', description: 'Progressive Web App özellikleri' }
      ]
    },
    {
      category: 'Backend',
      items: [
        { name: 'Node.js + Express', description: 'Hızlı ve ölçeklenebilir backend API' },
        { name: 'Prisma ORM', description: 'Type-safe database operations' },
        { name: 'MySQL Database', description: 'Güvenilir ve performanslı veritabanı' },
        { name: 'JWT Authentication', description: 'Güvenli token-based authentication' },
        { name: 'bcrypt Password Hashing', description: 'Güvenli şifre hashleme' },
        { name: 'Multer File Upload', description: 'Güvenli dosya yükleme sistemi' }
      ]
    },
    {
      category: 'DevOps & Infrastructure',
      items: [
        { name: 'Docker Containerization', description: 'Kolay deployment ve ölçeklenebilirlik' },
        { name: 'Nginx Reverse Proxy', description: 'Yüksek performanslı web server' },
        { name: 'Gzip Compression', description: 'Dosya boyutu optimizasyonu' },
        { name: 'Rate Limiting', description: 'API güvenliği ve DDoS koruması' },
        { name: 'Security Headers', description: 'XSS, CSRF ve diğer güvenlik önlemleri' },
        { name: 'Caching Strategy', description: 'Client-side ve server-side caching' }
      ]
    }
  ];

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/cars',
      description: 'Araç listesini getir',
      parameters: [
        { name: 'lang', type: 'string', required: false, description: 'Dil kodu (tr, en, ar, ru)' },
        { name: 'limit', type: 'number', required: false, description: 'Sayfa başına araç sayısı' },
        { name: 'make', type: 'string', required: false, description: 'Marka filtresi' },
        { name: 'model', type: 'string', required: false, description: 'Model filtresi' },
        { name: 'year', type: 'number', required: false, description: 'Yıl filtresi' },
        { name: 'price_min', type: 'number', required: false, description: 'Minimum fiyat' },
        { name: 'price_max', type: 'number', required: false, description: 'Maksimum fiyat' }
      ]
    },
    {
      method: 'GET',
      path: '/api/cars/{id}',
      description: 'Belirli bir aracın detaylarını getir',
      parameters: [
        { name: 'id', type: 'number', required: true, description: 'Araç ID' },
        { name: 'lang', type: 'string', required: false, description: 'Dil kodu' }
      ]
    },
    {
      method: 'POST',
      path: '/api/cars',
      description: 'Yeni araç ekle',
      parameters: [
        { name: 'make', type: 'string', required: true, description: 'Marka' },
        { name: 'model', type: 'string', required: true, description: 'Model' },
        { name: 'year', type: 'number', required: true, description: 'Yıl' },
        { name: 'price', type: 'number', required: true, description: 'Fiyat' },
        { name: 'translations', type: 'object', required: true, description: 'Çok dilli içerik' }
      ]
    },
    {
      method: 'GET',
      path: '/api/categories',
      description: 'Kategori listesini getir'
    },
    {
      method: 'GET',
      path: '/api/blog',
      description: 'Blog yazılarını getir',
      parameters: [
        { name: 'lang', type: 'string', required: false, description: 'Dil kodu' },
        { name: 'limit', type: 'number', required: false, description: 'Sayfa başına yazı sayısı' }
      ]
    },
    {
      method: 'GET',
      path: '/api/settings',
      description: 'Site ayarlarını getir'
    }
  ];

  const seoFeatures = [
    { name: 'Meta Tags Optimization', description: 'Title, description, keywords optimizasyonu' },
    { name: 'JSON-LD Structured Data', description: 'Schema.org markup ile arama motoru optimizasyonu' },
    { name: 'Sitemap.xml', description: 'Otomatik sitemap oluşturma' },
    { name: 'Robots.txt', description: 'Arama motoru yönlendirme' },
    { name: 'Hreflang Tags', description: 'Çok dilli SEO desteği' },
    { name: 'Open Graph', description: 'Sosyal medya paylaşım optimizasyonu' },
    { name: 'Twitter Cards', description: 'Twitter paylaşım optimizasyonu' },
    { name: 'Canonical URLs', description: 'Duplicate content önleme' }
  ];

  const accessibilityFeatures = [
    { name: 'WCAG 2.1 AA Compliance', description: 'Erişilebilirlik standartlarına uygunluk' },
    { name: 'ARIA Labels', description: 'Screen reader desteği' },
    { name: 'Keyboard Navigation', description: 'Klavye ile tam navigasyon' },
    { name: 'Focus Management', description: 'Focus yönetimi ve görsel göstergeler' },
    { name: 'Color Contrast', description: 'Yeterli renk kontrastı' },
    { name: 'Screen Reader Support', description: 'Ekran okuyucu uyumluluğu' },
    { name: 'Semantic HTML', description: 'Anlamlı HTML yapısı' },
    { name: 'Alt Text', description: 'Resimler için açıklayıcı metinler' }
  ];

  const securityFeatures = [
    { name: 'JWT Authentication', description: 'Güvenli token-based authentication' },
    { name: 'Password Hashing', description: 'bcrypt ile şifre hashleme' },
    { name: 'Input Validation', description: 'Joi ile giriş doğrulama' },
    { name: 'File Upload Security', description: 'Güvenli dosya yükleme' },
    { name: 'Rate Limiting', description: 'API rate limiting' },
    { name: 'CORS Protection', description: 'Cross-origin resource sharing koruması' },
    { name: 'Security Headers', description: 'XSS, CSRF ve diğer güvenlik başlıkları' },
    { name: 'SQL Injection Prevention', description: 'Prisma ORM ile SQL injection koruması' }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
                  width={48}
                  height={48}
                  className="relative h-12 w-auto"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Teknik Dokümantasyon
                </h1>
                <p className="text-sm text-gray-600 font-medium">Site özellikleri ve API bilgileri</p>
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İçindekiler</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-amber-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Genel Bakış</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                      Mustafa Cangil Auto Trading Ltd., KKTC&apos;nin en güvenilir araç galerisi olarak modern web teknolojileri 
                      kullanılarak geliştirilmiş kapsamlı bir platformdur. Çok dilli destek, güvenli ödeme sistemi 
                      ve kullanıcı dostu arayüzü ile öne çıkmaktadır.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Çok Dilli</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Türkçe, İngilizce, Arapça ve Rusça dil desteği ile global erişim
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Güvenli</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        JWT authentication, bcrypt hashleme ve güvenlik başlıkları
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Hızlı</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Next.js 14, lazy loading ve caching ile optimize edilmiş performans
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Teknik Özellikler</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">87/100</div>
                        <div className="text-gray-700">Lighthouse Skoru</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">4 Dil</div>
                        <div className="text-gray-700">Dil Desteği</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">PWA</div>
                        <div className="text-gray-700">Progressive Web App</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">WCAG 2.1</div>
                        <div className="text-gray-700">Erişilebilirlik</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Özellikler</h2>
                  
                  {features.map((category, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        {category.category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                            <h4 className="text-gray-900 font-medium mb-2">{item.name}</h4>
                            <p className="text-gray-700 text-sm">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tech Tab */}
              {activeTab === 'tech' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Teknoloji Stack</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Code className="w-5 h-5 mr-2 text-amber-500" />
                        Frontend
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-900">Next.js 14</span>
                          <span className="text-amber-600 text-sm">App Router</span>
                        </div>
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-900">TypeScript</span>
                          <span className="text-amber-600 text-sm">Type Safety</span>
                        </div>
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-900">Tailwind CSS</span>
                          <span className="text-amber-600 text-sm">Utility First</span>
                        </div>
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-900">shadcn/ui</span>
                          <span className="text-amber-600 text-sm">Components</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-amber-500" />
                        Backend
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-900">Node.js</span>
                          <span className="text-amber-600 text-sm">Runtime</span>
                        </div>
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-900">Express.js</span>
                          <span className="text-amber-600 text-sm">Framework</span>
                        </div>
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-900">Prisma ORM</span>
                          <span className="text-amber-600 text-sm">Database</span>
                        </div>
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-900">MySQL</span>
                          <span className="text-amber-600 text-sm">Database</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performans Metrikleri</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">1.8s</div>
                        <div className="text-gray-700 text-sm">LCP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">50ms</div>
                        <div className="text-gray-700 text-sm">FID</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">0.05</div>
                        <div className="text-gray-700 text-sm">CLS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">95+</div>
                        <div className="text-gray-700 text-sm">Lighthouse</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Tab */}
              {activeTab === 'api' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">API Dokümantasyonu</h2>
                  
                  <div className="space-y-6">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            endpoint.method === 'GET' ? 'bg-green-500/20 text-green-600' :
                            endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-600' :
                            'bg-yellow-500/20 text-yellow-600'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-gray-900 font-mono text-lg">{endpoint.path}</code>
                        </div>
                        <p className="text-gray-700 mb-4">{endpoint.description}</p>
                        
                        {endpoint.parameters && (
                          <div>
                            <h4 className="text-gray-900 font-semibold mb-3">Parametreler:</h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param, paramIndex) => (
                                <div key={paramIndex} className="flex items-center space-x-4 text-sm">
                                  <code className="text-amber-600 font-mono w-20">{param.name}</code>
                                  <span className="text-gray-600 w-16">{param.type}</span>
                                  <span className={`w-16 ${param.required ? 'text-red-600' : 'text-gray-500'}`}>
                                    {param.required ? 'Gerekli' : 'Opsiyonel'}
                                  </span>
                                  <span className="text-gray-700 flex-1">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">API Kullanım Örneği</h3>
                    <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
{`// Araç listesini getir
const response = await fetch('/api/cars?lang=tr&limit=10');
const data = await response.json();

// Belirli bir aracı getir
const car = await fetch('/api/cars/123?lang=tr');
const carData = await car.json();

// Yeni araç ekle
const newCar = await fetch('/api/cars', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    make: 'BMW',
    model: 'X5',
    year: 2023,
    price: 250000,
    translations: {
      tr: { title: 'BMW X5 2023', description: 'Lüks SUV' }
    }
  })
});`}
                    </pre>
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">SEO & Performans</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {seoFeatures.map((feature, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-gray-900 font-medium mb-2">{feature.name}</h4>
                        <p className="text-gray-700 text-sm">{feature.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Optimizasyonu</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">92/100</div>
                        <div className="text-gray-700 text-sm">SEO Skoru</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">4 Dil</div>
                        <div className="text-gray-700 text-sm">Hreflang</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">JSON-LD</div>
                        <div className="text-gray-700 text-sm">Structured Data</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">100%</div>
                        <div className="text-gray-700 text-sm">Mobile Friendly</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Accessibility Tab */}
              {activeTab === 'accessibility' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Erişilebilirlik</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accessibilityFeatures.map((feature, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-gray-900 font-medium mb-2">{feature.name}</h4>
                        <p className="text-gray-700 text-sm">{feature.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Erişilebilirlik Standartları</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">WCAG 2.1</div>
                        <div className="text-gray-700 text-sm">AA Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">100%</div>
                        <div className="text-gray-700 text-sm">Keyboard Navigation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">4.5:1</div>
                        <div className="text-gray-700 text-sm">Color Contrast</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">ARIA</div>
                        <div className="text-gray-700 text-sm">Screen Reader</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Güvenlik</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {securityFeatures.map((feature, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-gray-900 font-medium mb-2">{feature.name}</h4>
                        <p className="text-gray-700 text-sm">{feature.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik Önlemleri</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">JWT</div>
                        <div className="text-gray-700 text-sm">Authentication</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">bcrypt</div>
                        <div className="text-gray-700 text-sm">Password Hashing</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">Rate Limit</div>
                        <div className="text-gray-700 text-sm">API Protection</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">CORS</div>
                        <div className="text-gray-700 text-sm">Cross-Origin</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


