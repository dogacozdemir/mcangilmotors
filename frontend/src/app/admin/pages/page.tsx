'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface Page {
  id: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  translations?: Array<{
    lang: string;
    title: string;
    content: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
  }>;
}

interface Section {
  id: string;
  name: string;
  component: string;
  description: string;
  icon: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'rich' | 'image' | 'number' | 'boolean';
    required: boolean;
    placeholder?: string;
    translationPath: string;
  }>;
}

// Define available sections for each page with translation paths
const PAGE_SECTIONS: Record<string, Section[]> = {
  'home': [
    {
      id: 'hero',
      name: 'Hero Section',
      component: 'HeroSection',
      description: 'Main banner with title, subtitle and search bar',
      icon: '🏠',
      fields: [
        { key: 'title', label: 'Main Title', type: 'text', required: true, placeholder: 'Main page title', translationPath: 'home.hero.title' },
        { key: 'titleHighlight', label: 'Title Highlight', type: 'text', required: false, placeholder: 'Highlighted part of title', translationPath: 'home.hero.titleHighlight' },
        { key: 'subtitle', label: 'Subtitle', type: 'textarea', required: true, placeholder: 'Page subtitle', translationPath: 'home.hero.subtitle' },
        { key: 'searchPlaceholder', label: 'Search Placeholder', type: 'text', required: false, placeholder: 'Search input placeholder', translationPath: 'home.hero.searchPlaceholder' },
        { key: 'viewAllText', label: 'View All Text', type: 'text', required: false, placeholder: 'View all button text', translationPath: 'home.hero.viewAllCars' },
        { key: 'contactText', label: 'Contact Text', type: 'text', required: false, placeholder: 'Contact button text', translationPath: 'home.hero.aboutUs' }
      ]
    },
    {
      id: 'bodyTypeFilter',
      name: 'Body Type Filter',
      component: 'BodyTypeQuickFilter',
      description: 'Quick filter buttons for car body types',
      icon: '🚗',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text', required: true, placeholder: 'Filter section title', translationPath: 'home.bodyTypeFilter.title' },
        { key: 'subtitle', label: 'Section Subtitle', type: 'text', required: false, placeholder: 'Filter section subtitle', translationPath: 'home.bodyTypeFilter.subtitle' }
      ]
    },
    {
      id: 'availableStock',
      name: 'Available Stock',
      component: 'AvailableStock',
      description: 'Featured cars showcase section',
      icon: '📋',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text', required: true, placeholder: 'Available stock title', translationPath: 'home.availableStock.title' },
        { key: 'subtitle', label: 'Section Subtitle', type: 'text', required: false, placeholder: 'Available stock subtitle', translationPath: 'home.availableStock.subtitle' },
        { key: 'viewAllText', label: 'View All Text', type: 'text', required: false, placeholder: 'View all cars text', translationPath: 'home.availableStock.allCars' }
      ]
    },
    {
      id: 'brandsCarousel',
      name: 'Brands Carousel',
      component: 'BrandsCarousel',
      description: 'Brand logos carousel section',
      icon: '🏷️',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text', required: true, placeholder: 'Brands section title', translationPath: 'home.brands.title' },
        { key: 'subtitle', label: 'Section Subtitle', type: 'text', required: false, placeholder: 'Brands section subtitle', translationPath: 'home.brands.subtitle' }
      ]
    },
    {
      id: 'blogCarousel',
      name: 'Blog Carousel',
      component: 'BlogCarousel',
      description: 'Latest blog posts carousel',
      icon: '📝',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text', required: true, placeholder: 'Blog section title', translationPath: 'home.blog.title' },
        { key: 'subtitle', label: 'Section Subtitle', type: 'text', required: false, placeholder: 'Blog section subtitle', translationPath: 'home.blog.subtitle' },
        { key: 'viewAllText', label: 'View All Text', type: 'text', required: false, placeholder: 'View all posts text', translationPath: 'home.blog.viewAll' }
      ]
    }
  ],
  'about': [
    {
      id: 'hero',
      name: 'About Hero',
      component: 'AboutHero',
      description: 'About page hero section',
      icon: 'ℹ️',
      fields: [
        { key: 'title', label: 'Page Title', type: 'text', required: true, placeholder: 'About us title', translationPath: 'about.hero.title' },
        { key: 'subtitle', label: 'Page Subtitle', type: 'textarea', required: true, placeholder: 'About us subtitle', translationPath: 'about.hero.subtitle' }
      ]
    },
    {
      id: 'whyChooseUs',
      name: 'Why Choose Us',
      component: 'WhyChooseUs',
      description: 'Features and benefits section',
      icon: '⭐',
      fields: [
        { key: 'title', label: 'Section Title', type: 'text', required: true, placeholder: 'Why choose us title', translationPath: 'whyChooseUs.title' },
        { key: 'subtitle', label: 'Section Subtitle', type: 'textarea', required: true, placeholder: 'Why choose us subtitle', translationPath: 'whyChooseUs.subtitle' }
      ]
    }
  ],
  'contact': [
    {
      id: 'hero',
      name: 'Contact Hero',
      component: 'ContactHero',
      description: 'Contact page hero section',
      icon: '📞',
      fields: [
        { key: 'title', label: 'Page Title', type: 'text', required: true, placeholder: 'Contact us title', translationPath: 'contact.hero.title' },
        { key: 'subtitle', label: 'Page Subtitle', type: 'textarea', required: true, placeholder: 'Contact us subtitle', translationPath: 'contact.hero.subtitle' }
      ]
    }
  ],
  'sold-cars': [
    {
      id: 'hero',
      name: 'Sold Cars Hero',
      component: 'SoldCarsHero',
      description: 'Sold cars page hero section',
      icon: '✅',
      fields: [
        { key: 'title', label: 'Page Title', type: 'text', required: true, placeholder: 'Sold cars title', translationPath: 'soldCars.hero.title' },
        { key: 'subtitle', label: 'Page Subtitle', type: 'textarea', required: true, placeholder: 'Sold cars subtitle', translationPath: 'soldCars.hero.subtitle' },
        { key: 'searchPlaceholder', label: 'Search Placeholder', type: 'text', required: false, placeholder: 'Search placeholder', translationPath: 'soldCars.hero.searchPlaceholder' }
      ]
    },
    {
      id: 'filters',
      name: 'Filters Section',
      component: 'SoldCarsFilters',
      description: 'Filters and sorting section',
      icon: '🔍',
      fields: [
        { key: 'title', label: 'Filters Title', type: 'text', required: true, placeholder: 'Filters title', translationPath: 'soldCars.filters.title' },
        { key: 'clearAll', label: 'Clear All Text', type: 'text', required: false, placeholder: 'Clear all text', translationPath: 'soldCars.filters.clearAll' },
        { key: 'resultsFound', label: 'Results Found Text', type: 'text', required: false, placeholder: 'Results found text', translationPath: 'soldCars.filters.resultsFound' }
      ]
    },
    {
      id: 'sorting',
      name: 'Sorting Section',
      component: 'SoldCarsSorting',
      description: 'Sorting options section',
      icon: '📊',
      fields: [
        { key: 'sortBy', label: 'Sort By Label', type: 'text', required: true, placeholder: 'Sort by label', translationPath: 'soldCars.sorting.sortBy' },
        { key: 'sortOrder', label: 'Sort Order Label', type: 'text', required: true, placeholder: 'Sort order label', translationPath: 'soldCars.sorting.sortOrder' },
        { key: 'compare', label: 'Compare Button', type: 'text', required: false, placeholder: 'Compare button text', translationPath: 'soldCars.sorting.compare' }
      ]
    }
  ],
  'incoming-cars': [
    {
      id: 'hero',
      name: 'Incoming Cars Hero',
      component: 'IncomingCarsHero',
      description: 'Incoming cars page hero section',
      icon: '🚛',
      fields: [
        { key: 'title', label: 'Page Title', type: 'text', required: true, placeholder: 'Incoming cars title', translationPath: 'incomingCars.hero.title' },
        { key: 'subtitle', label: 'Page Subtitle', type: 'textarea', required: true, placeholder: 'Incoming cars subtitle', translationPath: 'incomingCars.hero.subtitle' },
        { key: 'searchPlaceholder', label: 'Search Placeholder', type: 'text', required: false, placeholder: 'Search placeholder', translationPath: 'incomingCars.hero.searchPlaceholder' }
      ]
    },
    {
      id: 'filters',
      name: 'Filters Section',
      component: 'IncomingCarsFilters',
      description: 'Filters and sorting section',
      icon: '🔍',
      fields: [
        { key: 'title', label: 'Filters Title', type: 'text', required: true, placeholder: 'Filters title', translationPath: 'incomingCars.filters.title' },
        { key: 'clearAll', label: 'Clear All Text', type: 'text', required: false, placeholder: 'Clear all text', translationPath: 'incomingCars.filters.clearAll' },
        { key: 'resultsFound', label: 'Results Found Text', type: 'text', required: false, placeholder: 'Results found text', translationPath: 'incomingCars.filters.resultsFound' }
      ]
    },
    {
      id: 'sorting',
      name: 'Sorting Section',
      component: 'IncomingCarsSorting',
      description: 'Sorting options section',
      icon: '📊',
      fields: [
        { key: 'sortBy', label: 'Sort By Label', type: 'text', required: true, placeholder: 'Sort by label', translationPath: 'incomingCars.sorting.sortBy' },
        { key: 'sortOrder', label: 'Sort Order Label', type: 'text', required: true, placeholder: 'Sort order label', translationPath: 'incomingCars.sorting.sortOrder' },
        { key: 'compare', label: 'Compare Button', type: 'text', required: false, placeholder: 'Compare button text', translationPath: 'incomingCars.sorting.compare' }
      ]
    }
  ]
};

// Language configuration
const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export default function AdminPagesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('tr');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Define available pages
  const availablePages = [
    { slug: 'home', name: 'Homepage', description: 'Main landing page', icon: '🏠' },
    { slug: 'about', name: 'About Us', description: 'About page', icon: 'ℹ️' },
    { slug: 'contact', name: 'Contact', description: 'Contact page', icon: '📞' },
    { slug: 'inventory', name: 'Inventory', description: 'Car inventory page', icon: '🚗' },
    { slug: 'sold-cars', name: 'Sold Cars', description: 'Sold vehicles page', icon: '✅' },
    { slug: 'incoming-cars', name: 'Incoming Cars', description: 'Incoming vehicles page', icon: '🚛' },
    { slug: 'blog', name: 'Blog', description: 'Blog listing page', icon: '📝' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadPages();
    }
  }, [router]);

  const loadPages = async () => {
    try {
      const data = await apiClient.getPages() as Page[];
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (pageSlug: string) => {
    setSelectedPage(pageSlug);
    setSelectedSection(null);
    setSectionData({});
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    setSelectedSection(null);
    setSectionData({});
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setShowSectionModal(true);
    // Load existing section data for the selected language
    loadSectionData(sectionId, selectedLanguage);
  };

  const loadSectionData = async (sectionId: string, language: string) => {
    try {
      console.log(`Loading translations for language: ${language}`);
      
      // Load translation data from the messages files
      const response = await fetch(`/messages/${language}.json`);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${language}: ${response.status} ${response.statusText}`);
      }
      
      const translations = await response.json();
      console.log('Translations loaded successfully:', Object.keys(translations));
      
      const section = getCurrentSections().find(s => s.id === sectionId);
      if (!section) {
        console.error('Section not found:', sectionId);
        return;
      }
      
      const sectionData: Record<string, any> = {};
      
      section.fields.forEach(field => {
        const value = getNestedValue(translations, field.translationPath);
        console.log(`Field ${field.key} (${field.translationPath}):`, value);
        sectionData[field.key] = value || '';
      });
      
      console.log('Section data loaded:', sectionData);
      setSectionData(sectionData);
    } catch (error) {
      console.error('Error loading section data:', error);
      // Fallback to empty data
      const section = getCurrentSections().find(s => s.id === sectionId);
      if (section) {
        const emptyData: Record<string, any> = {};
        section.fields.forEach(field => {
          emptyData[field.key] = '';
        });
        setSectionData(emptyData);
      }
    }
  };

  const getNestedValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  const setNestedValue = (obj: any, path: string, value: string): any => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
    return obj;
  };

  const handleSectionSave = async () => {
    setSaving(true);
    try {
      // Load current translation file
      const response = await fetch(`/messages/${selectedLanguage}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${selectedLanguage}`);
      }
      const translations = await response.json();
      
      // Update translations with new section data
      const section = getCurrentSections().find(s => s.id === selectedSection);
      if (!section) return;
      
      let updatedTranslations = { ...translations };
      
      section.fields.forEach(field => {
        const value = sectionData[field.key];
        if (value !== undefined) {
          updatedTranslations = setNestedValue(updatedTranslations, field.translationPath, value);
        }
      });
      
      // Save updated translations back to the file
      const saveResponse = await fetch('/api/admin/update-translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          translations: updatedTranslations
        })
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save translations');
      }
      
      setShowSectionModal(false);
      setSelectedSection(null);
      setSectionData({});
      
      // Show success message
      alert('Section updated successfully!');
    } catch (error) {
      console.error('Error saving section data:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSectionData = (key: string, value: any) => {
    setSectionData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getCurrentSections = () => {
    if (!selectedPage) return [];
    return PAGE_SECTIONS[selectedPage] || [];
  };

  const getCurrentLanguage = () => {
    return LANGUAGES.find(lang => lang.code === selectedLanguage) || LANGUAGES[0];
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-prestige-bg">
        <div className="text-center">
          <h1 className="text-2xl font-prestige-sans font-bold text-prestige-black mb-4">Unauthorized Access</h1>
          <p className="text-prestige-gray mb-4">You need to log in to access this page.</p>
          <Link
            href="/admin/login"
            className="bg-prestige-gold text-prestige-black px-6 py-3 rounded-xl hover:bg-prestige-gold-dark font-prestige-sans font-semibold transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-prestige-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-prestige-gold/30 border-t-prestige-gold mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-prestige-gold to-prestige-gold-light rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-prestige-gray font-prestige-sans font-medium text-lg">Loading Pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-prestige-bg">
      {/* Header */}
      <header className="bg-prestige-card shadow-prestige-lg border-b border-prestige-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-prestige-gold/20 to-prestige-gold-light/20 rounded-2xl blur-sm"></div>
                <div className="relative bg-prestige-card p-3 rounded-2xl shadow-prestige-sm">
                  <Image
                    src="/logo.png"
                    alt="Mustafa Cangil Auto Trading Ltd."
                    width={100}
                    height={66}
                    className="h-14 w-auto"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-prestige-sans font-bold text-prestige-black prestige-text-glow">
                  Pages Management
                </h1>
                <p className="text-lg text-prestige-gray font-prestige-sans">Manage and edit your website pages and sections</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="group flex items-center space-x-3 text-prestige-gray hover:text-prestige-gold px-6 py-3 rounded-xl hover:bg-prestige-gold/10 transition-all duration-300 font-prestige-sans font-medium"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Pages List */}
          <div className="lg:col-span-1">
            <div className="prestige-card p-6">
              <h2 className="text-2xl font-prestige-sans font-bold text-prestige-black mb-6">Pages</h2>
              <div className="space-y-3">
                {availablePages.map((page) => (
                  <button
                    key={page.slug}
                    onClick={() => handlePageSelect(page.slug)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group ${
                      selectedPage === page.slug
                        ? 'bg-gradient-to-r from-prestige-gold to-prestige-gold-light text-prestige-black shadow-prestige-md'
                        : 'bg-prestige-gray/10 hover:bg-prestige-gold/10 text-prestige-gray hover:text-prestige-gold'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{page.icon}</span>
                      <div>
                        <h3 className="font-prestige-sans font-semibold">{page.name}</h3>
                        <p className="text-sm opacity-75">{page.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Language Selection & Sections */}
          <div className="lg:col-span-3">
            {selectedPage ? (
              <div className="space-y-6">
                {/* Language Selection */}
                <div className="prestige-card p-6">
                  <h3 className="text-xl font-prestige-sans font-bold text-prestige-black mb-4">Select Language</h3>
                  <div className="flex space-x-4">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 group ${
                          selectedLanguage === lang.code
                            ? 'bg-gradient-to-r from-prestige-gold to-prestige-gold-light text-prestige-black shadow-prestige-md'
                            : 'bg-prestige-gray/10 hover:bg-prestige-gold/10 text-prestige-gray hover:text-prestige-gold'
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-prestige-sans font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sections */}
                <div className="prestige-card p-6">
                  <h3 className="text-xl font-prestige-sans font-bold text-prestige-black mb-6">
                    Sections for {availablePages.find(p => p.slug === selectedPage)?.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getCurrentSections().map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionSelect(section.id)}
                        className="group p-6 bg-prestige-gray/5 hover:bg-prestige-gold/10 rounded-2xl border border-prestige-border hover:border-prestige-gold/30 transition-all duration-300 text-left"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-prestige-sans font-semibold text-prestige-black group-hover:text-prestige-gold transition-colors duration-300 mb-2">
                              {section.name}
                            </h4>
                            <p className="text-sm text-prestige-gray group-hover:text-prestige-gold/80 transition-colors duration-300">
                              {section.description}
                            </p>
                            <div className="mt-3 flex items-center text-xs text-prestige-gray group-hover:text-prestige-gold transition-colors duration-300">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Click to edit
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="prestige-card p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-prestige-sans font-bold text-prestige-black mb-4">Select a Page</h3>
                <p className="text-prestige-gray font-prestige-sans">
                  Choose a page from the left to start editing its sections and content.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Section Editing Modal */}
      {showSectionModal && selectedSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={() => {
          setShowSectionModal(false);
          setSelectedSection(null);
          setSectionData({});
        }}>
          <div 
            className="relative w-full max-w-4xl bg-prestige-card rounded-3xl shadow-prestige-xl border border-prestige-border overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-prestige-gold to-prestige-gold-light px-8 py-6 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-prestige-black/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">
                      {getCurrentSections().find(s => s.id === selectedSection)?.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-prestige-sans font-bold text-prestige-black">
                      {getCurrentSections().find(s => s.id === selectedSection)?.name}
                    </h3>
                    <p className="text-prestige-black/70 font-prestige-sans">
                      Editing in {getCurrentLanguage().name} {getCurrentLanguage().flag}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSectionModal(false);
                    setSelectedSection(null);
                    setSectionData({});
                  }}
                  className="p-3 text-prestige-black/70 hover:text-prestige-black hover:bg-prestige-black/10 rounded-xl transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="space-y-6">
                {getCurrentSections()
                  .find(s => s.id === selectedSection)
                  ?.fields.map((field) => (
                    <div key={field.key} className="space-y-3">
                      <label className="block text-sm font-prestige-sans font-semibold text-prestige-black">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={sectionData[field.key] || ''}
                          onChange={(e) => updateSectionData(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 border-2 border-prestige-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-prestige-gold focus:border-prestige-gold text-prestige-black font-prestige-sans transition-all duration-300"
                        />
                      )}
                      
                      {field.type === 'textarea' && (
                        <textarea
                          value={sectionData[field.key] || ''}
                          onChange={(e) => updateSectionData(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-prestige-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-prestige-gold focus:border-prestige-gold text-prestige-black font-prestige-sans transition-all duration-300"
                        />
                      )}
                      
                      {field.type === 'rich' && (
                        <div className="border-2 border-prestige-border rounded-2xl p-4 min-h-[200px]">
                          <textarea
                            value={sectionData[field.key] || ''}
                            onChange={(e) => updateSectionData(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={8}
                            className="w-full border-none outline-none resize-none text-prestige-black font-prestige-sans"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-4 p-8 pt-6 border-t border-prestige-border bg-prestige-bg/50">
              <button
                type="button"
                onClick={() => {
                  setShowSectionModal(false);
                  setSelectedSection(null);
                  setSectionData({});
                }}
                className="px-6 py-3 text-sm font-prestige-sans font-semibold text-prestige-gray bg-prestige-gray/10 hover:bg-prestige-gray/20 rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSectionSave}
                disabled={saving}
                className="px-8 py-3 text-sm font-prestige-sans font-semibold text-prestige-black bg-gradient-to-r from-prestige-gold to-prestige-gold-light hover:from-prestige-gold-dark hover:to-prestige-gold rounded-xl shadow-prestige-md hover:shadow-prestige-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}