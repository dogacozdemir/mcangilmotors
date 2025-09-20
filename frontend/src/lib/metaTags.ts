import { Metadata } from 'next';

export interface MetaTagsConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  url: string;
  locale: string;
  type?: 'website' | 'article' | 'product' | 'collection' | 'organization' | 'localbusiness' | 'autodealer' | 'service' | 'faqpage';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  engine?: string;
  category?: string;
  numberOfItems?: number;
  breadcrumbs?: Array<{
    name: string;
    url: string;
    position: number;
  }>;
  // Additional schema properties
  rating?: number;
  reviewCount?: number;
  services?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  openingHours?: string[];
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
    postalCode?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  paymentAccepted?: string[];
  currenciesAccepted?: string[];
  priceRange?: string;
  hasOfferCatalog?: boolean;
  areaServed?: string[];
  serviceArea?: {
    geoRadius?: number;
    geoMidpoint?: {
      latitude: number;
      longitude: number;
    };
  };
  // Kuzey Kıbrıs özel SEO
  location?: {
    country: string;
    region: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  businessType?: 'car_dealer' | 'auto_import' | 'used_cars' | 'luxury_cars';
  languages?: string[];
  hreflang?: Array<{
    hreflang: string;
    href: string;
  }>;
}

export function generateMetaTags(config: MetaTagsConfig): Metadata {
  const {
    title,
    description,
    keywords,
    image = '/og-image.jpg',
    images,
    url,
    locale,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    price,
    currency = 'EUR',
    availability,
    brand,
    model,
    year,
    mileage,
    fuelType,
    transmission,
    color,
    engine,
    category,
    numberOfItems,
    breadcrumbs,
    location,
    businessType,
    languages,
    hreflang
  } = config;

  const fullTitle = `${title} | Mustafa Cangil Auto Trading Ltd.`;
  const fullUrl = `https://mcangilmotors.com${url}`;
  const fullImage = `https://mcangilmotors.com${image}`;

  // Generate hreflang URLs
  const hreflangUrls = hreflang || [
    {
      hreflang: 'tr',
      href: `https://mcangilmotors.com/tr${url.replace(`/${locale}`, '')}`
    },
    {
      hreflang: 'en',
      href: `https://mcangilmotors.com/en${url.replace(`/${locale}`, '')}`
    },
    {
      hreflang: 'ar',
      href: `https://mcangilmotors.com/ar${url.replace(`/${locale}`, '')}`
    },
    {
      hreflang: 'ru',
      href: `https://mcangilmotors.com/ru${url.replace(`/${locale}`, '')}`
    }
  ];

  // Generate Open Graph images
  const ogImages = images || [
    {
      url: fullImage,
      width: 1200,
      height: 630,
      alt: title
    }
  ];

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords || generateDefaultKeywords(title, description, brand, model, year, category, location, businessType),
    authors: [{ name: 'Mustafa Cangil Auto Trading Ltd.' }],
    creator: 'Mustafa Cangil Auto Trading Ltd.',
    publisher: 'Mustafa Cangil Auto Trading Ltd.',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://mcangilmotors.com'),
    alternates: {
      canonical: fullUrl,
      languages: {
        'tr': `https://mcangilmotors.com/tr${url.replace(`/${locale}`, '')}`,
        'en': `https://mcangilmotors.com/en${url.replace(`/${locale}`, '')}`,
        'ar': `https://mcangilmotors.com/ar${url.replace(`/${locale}`, '')}`,
        'ru': `https://mcangilmotors.com/ru${url.replace(`/${locale}`, '')}`,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      type: type === 'product' || type === 'collection' || type === 'autodealer' || type === 'organization' || type === 'localbusiness' || type === 'service' || type === 'faqpage' ? 'website' : type,
      locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : locale === 'ar' ? 'ar_SA' : 'ru_RU',
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: 'Mustafa Cangil Auto Trading Ltd.',
      images: ogImages,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    // Twitter Card removed - no Twitter account
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-snippet': -1,
        'max-image-preview': 'large',
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
    category: 'Automotive',
    classification: 'Car Dealership',
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'MC Motors',
      'msapplication-TileColor': '#D3AF77',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': '#D3AF77',
    },
  };

  return metadata;
}

export function generateJSONLD(config: MetaTagsConfig): object {
  const {
    title,
    description,
    url,
    locale,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    price,
    currency = 'EUR',
    availability,
    brand,
    model,
    year,
    mileage,
    fuelType,
    transmission,
    color,
    engine,
    category,
    numberOfItems,
    breadcrumbs,
    rating,
    reviewCount,
    services,
    faqs,
    openingHours,
    telephone,
    email,
    address,
    socialMedia,
    paymentAccepted,
    currenciesAccepted,
    priceRange,
    hasOfferCatalog,
    areaServed,
    serviceArea
  } = config;

  const fullUrl = `https://mcangilmotors.com${url}`;

  // Base schema
  let schema: any = {
    "@context": "https://schema.org",
    "@type": getSchemaType(type, category),
    "name": title,
    "description": description,
    "url": fullUrl,
    "inLanguage": locale,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Mustafa Cangil Auto Trading Ltd.",
      "url": "https://mcangilmotors.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mustafa Cangil Auto Trading Ltd.",
      "url": "https://mcangilmotors.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mcangilmotors.com/logo.png"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": telephone || "+90-533-855-11-66",
        "contactType": "customer service",
        "areaServed": areaServed || ["TR", "KKTC"],
        "availableLanguage": ["Turkish", "English", "Arabic", "Russian"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": address?.streetAddress || "Sakarya Sk No:10",
        "addressLocality": address?.addressLocality || "Alsancak",
        "addressRegion": address?.addressRegion || "KKTC",
        "addressCountry": address?.addressCountry || "TR",
        "postalCode": address?.postalCode || "99010"
      },
      "sameAs": socialMedia ? Object.values(socialMedia).filter(Boolean) : [
        "https://www.facebook.com/mustafacangilmotors",
        "https://www.instagram.com/mcangilmotors"
      ]
    }
  };

  // Add rating and review information
  if (rating && reviewCount) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "reviewCount": reviewCount,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  // Add specific properties based on type
  if (type === 'article') {
    schema = {
      ...schema,
      "headline": title,
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      ...(author && { "author": { "@type": "Person", "name": author } }),
      ...(section && { "articleSection": section }),
      ...(tags && { "keywords": tags.join(', ') })
    };
  } else if (type === 'product') {
    schema = {
      ...schema,
      "brand": { "@type": "Brand", "name": brand || "Mustafa Cangil Auto Trading Ltd." },
      "model": model,
      "productionDate": year ? `${year}-01-01` : undefined,
      "mileageFromOdometer": mileage ? { "@type": "QuantitativeValue", "value": mileage, "unitCode": "KMT" } : undefined,
      "fuelType": fuelType,
      "vehicleTransmission": transmission,
      "color": color,
      "vehicleEngine": engine ? { "@type": "EngineSpecification", "name": engine } : undefined,
      "category": category,
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": currency,
        "availability": availability ? `https://schema.org/${availability}` : "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Mustafa Cangil Auto Trading Ltd."
        }
      }
    };
  } else if (type === 'collection') {
    schema = {
      ...schema,
      "mainEntity": {
        "@type": "ItemList",
        "name": title,
        "description": description,
        "numberOfItems": numberOfItems || 0
      }
    };
  } else if (type === 'autodealer') {
    schema = {
      ...schema,
      "priceRange": priceRange || "$$",
      "paymentAccepted": paymentAccepted || ["Cash", "Credit Card", "Bank Transfer"],
      "currenciesAccepted": currenciesAccepted || ["EUR", "TRY", "USD"],
      "hasOfferCatalog": hasOfferCatalog || true,
      "areaServed": areaServed || ["KKTC", "Alsancak", "Girne", "Mağusa", "Güzelyurt"],
      "serviceArea": serviceArea || {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 35.1856,
          "longitude": 33.3823
        },
        "geoRadius": 50000
      },
      "openingHours": openingHours || [
        "Mo-Fr 09:00-18:00",
        "Sa 09:00-16:00"
      ],
      "services": services || [
        "Car Sales",
        "Used Car Sales", 
        "Car Financing",
        "Test Drive",
        "Vehicle Inspection",
        "Car Insurance",
        "Trade-in Service"
      ]
    };
  } else if (type === 'localbusiness') {
    schema = {
      ...schema,
      "openingHours": openingHours || [
        "Mo-Fr 09:00-18:00",
        "Sa 09:00-16:00"
      ],
      "telephone": telephone || "+90-533-855-11-66",
      "email": email || "info@mcangilmotors.com",
      "priceRange": priceRange || "$$",
      "paymentAccepted": paymentAccepted || ["Cash", "Credit Card", "Bank Transfer"],
      "areaServed": areaServed || ["KKTC", "Lefkoşa", "Girne", "Mağusa", "Güzelyurt"]
    };
  } else if (type === 'service') {
    schema = {
      ...schema,
      "serviceType": category || "Automotive Services",
      "provider": {
        "@type": "Organization",
        "name": "Mustafa Cangil Auto Trading Ltd."
      },
      "areaServed": areaServed || ["KKTC", "Alsancak", "Girne", "Mağusa", "Güzelyurt"],
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": fullUrl,
        "servicePhone": telephone || "+90-533-855-11-66"
      }
    };
  } else if (type === 'faqpage') {
    schema = {
      ...schema,
      "mainEntity": faqs ? faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      })) : []
    };
  }

  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    schema["breadcrumb"] = {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map(breadcrumb => ({
        "@type": "ListItem",
        "position": breadcrumb.position,
        "name": breadcrumb.name,
        "item": breadcrumb.url
      }))
    };
  }

  return schema;
}

function getSchemaType(type: string, category?: string): string {
  switch (type) {
    case 'article':
      return 'Article';
    case 'product':
      return 'Car';
    case 'collection':
      return 'CollectionPage';
    case 'organization':
      return 'Organization';
    case 'localbusiness':
      return 'LocalBusiness';
    case 'autodealer':
      return 'AutoDealer';
    case 'service':
      return 'Service';
    case 'faqpage':
      return 'FAQPage';
    default:
      return 'WebPage';
  }
}

function generateDefaultKeywords(
  title: string,
  description: string,
  brand?: string,
  model?: string,
  year?: number,
  category?: string,
  location?: any,
  businessType?: string
): string {
  const baseKeywords = [
    'Mustafa Cangil Auto Trading Ltd.',
    'KKTC araba galerisi',
    'Kuzey Kıbrıs otomobil satış',
    'ikinci el araba KKTC',
    'Alsancak araba galerisi',
    'Girne araba satış',
    'KKTC araç galerisi',
    'araç import KKTC',
    'yurtdışından araç',
    'araç galerisi Alsancak',
    'araç galerisi Girne',
    'araç galerisi Mağusa',
    'araç galerisi Güzelyurt',
    'Northern Cyprus car dealership',
    'used cars Cyprus',
    'car sales Nicosia',
    'vehicle gallery Cyprus',
    'premium cars KKTC',
    'luxury vehicles Northern Cyprus',
    'reliable car dealer Cyprus',
    'trusted vehicle gallery KKTC',
    'car financing Cyprus',
    'vehicle inspection KKTC',
    'automotive services Northern Cyprus',
    'car import Cyprus',
    'vehicle import Northern Cyprus'
  ];

  const specificKeywords = [];
  
  if (brand) specificKeywords.push(brand);
  if (model) specificKeywords.push(model);
  if (year) specificKeywords.push(`${year} model`);
  if (category) specificKeywords.push(category);
  
  // Extract keywords from title and description
  const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
  const descriptionWords = description.toLowerCase().split(' ').filter(word => word.length > 3);
  
  specificKeywords.push(...titleWords, ...descriptionWords);
  
  return [...baseKeywords, ...specificKeywords].join(', ');
}

export function generateHreflangTags(locale: string, path: string): Array<{ hrefLang: string; href: string }> {
  const basePath = path.replace(`/${locale}`, '');
  
  return [
    { hrefLang: 'tr', href: `https://mcangilmotors.com/tr${basePath}` },
    { hrefLang: 'en', href: `https://mcangilmotors.com/en${basePath}` },
    { hrefLang: 'ar', href: `https://mcangilmotors.com/ar${basePath}` },
    { hrefLang: 'ru', href: `https://mcangilmotors.com/ru${basePath}` },
    { hrefLang: 'x-default', href: `https://mcangilmotors.com/tr${basePath}` }
  ];
}

export function generateCanonicalUrl(locale: string, path: string): string {
  return `https://mcangilmotors.com${path}`;
}

// Specialized schema generators
export function generateAutoDealerSchema(config: Partial<MetaTagsConfig>): object {
  return generateJSONLD({
    title: config.title || 'Mustafa Cangil Auto Trading Ltd.',
    description: config.description || 'KKTC\'nin en güvenilir araç galerisi',
    url: config.url || '/',
    locale: config.locale || 'tr',
    type: 'autodealer',
    services: config.services || [
      "Car Sales",
      "Used Car Sales", 
      "Car Financing",
      "Test Drive",
      "Vehicle Inspection",
      "Car Insurance",
      "Trade-in Service"
    ],
    openingHours: config.openingHours || [
      "Mo-Fr 09:00-18:00",
      "Sa 09:00-16:00"
    ],
    paymentAccepted: config.paymentAccepted || ["Cash", "Credit Card", "Bank Transfer"],
    currenciesAccepted: config.currenciesAccepted || ["EUR", "TRY", "USD"],
    areaServed: config.areaServed || ["KKTC", "Lefkoşa", "Girne", "Mağusa", "Güzelyurt"],
    ...config
  });
}

export function generateLocalBusinessSchema(config: Partial<MetaTagsConfig>): object {
  return generateJSONLD({
    title: config.title || 'Mustafa Cangil Auto Trading Ltd.',
    description: config.description || 'KKTC\'nin en güvenilir araç galerisi',
    url: config.url || '/',
    locale: config.locale || 'tr',
    type: 'localbusiness',
    openingHours: config.openingHours || [
      "Mo-Fr 09:00-18:00",
      "Sa 09:00-16:00"
    ],
    telephone: config.telephone || "+90-533-855-11-66",
    email: config.email || "info@mcangilmotors.com",
    priceRange: config.priceRange || "$$",
    areaServed: config.areaServed || ["KKTC", "Lefkoşa", "Girne", "Mağusa", "Güzelyurt"],
    ...config
  });
}

export function generateFAQPageSchema(config: Partial<MetaTagsConfig>): object {
  return generateJSONLD({
    title: config.title || 'Mustafa Cangil Auto Trading Ltd.',
    description: config.description || 'KKTC\'nin en güvenilir araç galerisi',
    url: config.url || '/',
    locale: config.locale || 'tr',
    type: 'faqpage',
    faqs: config.faqs || [],
    ...config
  });
}

export function generateServiceSchema(config: Partial<MetaTagsConfig>): object {
  return generateJSONLD({
    title: config.title || 'Mustafa Cangil Auto Trading Ltd.',
    description: config.description || 'KKTC\'nin en güvenilir araç galerisi',
    url: config.url || '/',
    locale: config.locale || 'tr',
    type: 'service',
    areaServed: config.areaServed || ["KKTC", "Lefkoşa", "Girne", "Mağusa", "Güzelyurt"],
    ...config
  });
}

export function generateOrganizationSchema(config: Partial<MetaTagsConfig>): object {
  return generateJSONLD({
    title: config.title || 'Mustafa Cangil Auto Trading Ltd.',
    description: config.description || 'KKTC\'nin en güvenilir araç galerisi',
    url: config.url || '/',
    locale: config.locale || 'tr',
    type: 'organization',
    socialMedia: config.socialMedia || {
      facebook: "https://www.facebook.com/mustafacangilmotors",
      instagram: "https://www.instagram.com/mcangilmotors"
    },
    ...config
  });
}

// Generate breadcrumb schema
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string; position: number }>): any {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map(breadcrumb => ({
      "@type": "ListItem",
      "position": breadcrumb.position,
      "name": breadcrumb.name,
      "item": breadcrumb.url.startsWith('http') ? breadcrumb.url : `https://mcangilmotors.com${breadcrumb.url}`
    }))
  };
}

// Generate Northern Cyprus specific LocalBusiness schema
export function generateNorthernCyprusLocalBusinessSchema(config: Partial<MetaTagsConfig>): object {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Mustafa Cangil Motors - KKTC Araç Galerisi",
    "alternateName": "Mustafa Cangil Auto Trading Ltd.",
    "description": "Kuzey Kıbrıs'ın en güvenilir ikinci el araç galerisi. Yurtdışından araç import, satış ve servis hizmetleri.",
    "url": "https://mcangilmotors.com",
    "logo": "https://mcangilmotors.com/logo.png",
    "image": [
      "https://mcangilmotors.com/hero-bg.jpg",
      "https://mcangilmotors.com/logo.png"
    ],
    "telephone": "+90 533 855 11 66",
    "email": "info@mcangilmotors.com",
    "address": {
      "@type": "PostalAddress",
        "streetAddress": "Sakarya Sk No:10",
        "addressLocality": "Alsancak",
      "addressRegion": "Kuzey Kıbrıs",
      "addressCountry": "TR",
      "postalCode": "99010"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "35.1856",
      "longitude": "33.3823"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Alsancak",
        "containedInPlace": {
          "@type": "Country",
          "name": "Kuzey Kıbrıs"
        }
      },
      {
        "@type": "City", 
        "name": "Girne",
        "containedInPlace": {
          "@type": "Country",
          "name": "Kuzey Kıbrıs"
        }
      },
      {
        "@type": "City",
        "name": "Mağusa", 
        "containedInPlace": {
          "@type": "Country",
          "name": "Kuzey Kıbrıs"
        }
      },
      {
        "@type": "City",
        "name": "Güzelyurt",
        "containedInPlace": {
          "@type": "Country", 
          "name": "Kuzey Kıbrıs"
        }
      }
    ],
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 09:00-16:00"
    ],
    "priceRange": "€€€",
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
    "currenciesAccepted": "EUR, TRY",
    "languages": ["tr", "en", "ar", "ru"],
    "sameAs": [
      "https://www.facebook.com/mustafacangilmotors",
      "https://www.instagram.com/mcangilmotors"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Araç Galerisi",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "İkinci El Araçlar"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Yurtdışından Araç Import"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product", 
            "name": "Araç Servis Hizmetleri"
          }
        }
      ]
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "name": "Ücretsiz Araç Değerleme",
        "description": "Araçlarınızın değerini ücretsiz olarak değerlendiriyoruz"
      },
      {
        "@type": "Offer",
        "name": "Yurtdışından Araç Getirme",
        "description": "Avrupa'dan güvenli araç import hizmeti"
      },
      {
        "@type": "Offer",
        "name": "Araç Finansmanı",
        "description": "Uygun koşullarla araç kredisi imkanları"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

// Generate Northern Cyprus specific keywords
export function generateNorthernCyprusKeywords(): string[] {
  return [
    // Primary keywords
    "kuzey kıbrıs araç galerisi",
    "kktc ikinci el araba",
    "alsancak araç galerisi", 
    "girne araç galerisi",
    "mağusa araç galerisi",
    "güzelyurt araç galerisi",
    
    // Import keywords
    "yurtdışından araç import kktc",
    "avrupa'dan araç getirme",
    "araç import alsancak",
    "ikinci el araç import",
    
    // Brand specific
    "bmw kktc",
    "mercedes kktc", 
    "audi kktc",
    "volkswagen kktc",
    "toyota kktc",
    "honda kktc",
    "ford kktc",
    "hyundai kktc",
    "kia kktc",
    "nissan kktc",
    "suzuki kktc",
    
    // Service keywords
    "araç servis kktc",
    "araç bakım alsancak",
    "araç tamir girne",
    "araç yedek parça",
    
    // Local business
    "mustafa cangil motors",
    "mcangil motors",
    "kktc araç satış",
    "kuzey kıbrıs oto galeri",
    
    // English keywords
    "northern cyprus car dealer",
    "north cyprus used cars",
    "alsancak car dealer",
    "girne car dealer",
    "car import northern cyprus",
    "used cars nicosia",
    "car dealer cyprus",
    
    // Arabic keywords  
    "معرض سيارات شمال قبرص",
    "سيارات مستعملة ليفكوشا",
    "واردات سيارات قبرص",
    
    // Russian keywords
    "автосалон северный кипр",
    "подержанные автомобили лефкоша",
    "импорт автомобилей кипр"
  ];
}

// Helper function to generate multiple schemas for a single page
export function generateMultipleSchemas(schemas: Array<{ type: string; config: Partial<MetaTagsConfig> }>): object[] {
  return schemas.map(({ type, config }) => {
    switch (type) {
      case 'autodealer':
        return generateAutoDealerSchema(config);
      case 'localbusiness':
        return generateLocalBusinessSchema(config);
      case 'faqpage':
        return generateFAQPageSchema(config);
      case 'service':
        return generateServiceSchema(config);
      case 'organization':
        return generateOrganizationSchema(config);
      default:
        return generateJSONLD(config as MetaTagsConfig);
    }
  });
}
