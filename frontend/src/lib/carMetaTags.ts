import { Metadata } from 'next';

export interface CarMetaConfig {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  engine?: string;
  bodyType?: string;
  plateStatus?: string;
  featured?: boolean;
  coverImage?: string;
  images?: Array<{
    imagePath: string;
    isMain: boolean;
  }>;
  category?: {
    name: string;
  };
  locale: string;
  url: string;
}

// Generate car-specific title
export function generateCarTitle(car: CarMetaConfig): string {
  const baseTitle = `${car.year} ${car.make} ${car.model}`;
  const price = car.price ? `£${car.price.toLocaleString('tr-TR')}` : 'Fiyat Belirtilmemiş';
  const location = car.locale === 'tr' ? 'KKTC' : 
                   car.locale === 'en' ? 'Northern Cyprus' :
                   car.locale === 'ar' ? 'شمال قبرص' : 'Северный Кипр';
  
  return `${baseTitle} - ${price} | ${location} | Mustafa Cangil Motors`;
}

// Generate car-specific description
export function generateCarDescription(car: CarMetaConfig): string {
  const locale = car.locale;
  const baseInfo = `${car.year} ${car.make} ${car.model}`;
  const price = car.price ? `£${car.price.toLocaleString('tr-TR')}` : 'Fiyat Belirtilmemiş';
  const mileage = car.mileage ? `${car.mileage.toLocaleString('tr-TR')} km` : 'Kilometre Belirtilmemiş';
  
  if (locale === 'tr') {
    return `${baseInfo} - ${price} - ${mileage} - ${car.fuelType} - ${car.transmission} - ${car.color} | KKTC'nin en güvenilir araç galerisi Mustafa Cangil Motors'ta. Yurtdışından araç import, satış ve servis hizmetleri.`;
  } else if (locale === 'en') {
    return `${baseInfo} - ${price} - ${mileage} - ${car.fuelType} - ${car.transmission} - ${car.color} | Northern Cyprus' most trusted car dealership Mustafa Cangil Motors. Car import, sales and service.`;
  } else if (locale === 'ar') {
    return `${baseInfo} - ${price} - ${mileage} - ${car.fuelType} - ${car.transmission} - ${car.color} | معرض سيارات شمال قبرص الموثوق مصطفى جانجيل موتورز. استيراد وبيع وخدمة السيارات.`;
  } else {
    return `${baseInfo} - ${price} - ${mileage} - ${car.fuelType} - ${car.transmission} - ${car.color} | Надежный автосалон Северного Кипра Мустафа Джангил Моторс. Импорт, продажа и сервис автомобилей.`;
  }
}

// Generate car-specific keywords
export function generateCarKeywords(car: CarMetaConfig): string {
  const baseKeywords = [
    `${car.year} ${car.make} ${car.model}`,
    `${car.make} ${car.model}`,
    `${car.year} ${car.make}`,
    car.make.toLowerCase(),
    car.model.toLowerCase(),
    car.fuelType.toLowerCase(),
    car.transmission.toLowerCase(),
    car.color.toLowerCase(),
    car.bodyType?.toLowerCase() || '',
    car.category?.name.toLowerCase() || ''
  ].filter(Boolean);

  const locale = car.locale;
  const locationKeywords = locale === 'tr' ? [
    'kktc', 'kuzey kıbrıs', 'alsancak', 'girne', 'mağusa', 'güzelyurt',
    'araç galerisi', 'ikinci el araba', 'araç satış'
  ] : locale === 'en' ? [
    'northern cyprus', 'north cyprus', 'nicosia', 'kyrenia', 'famagusta', 'morphou',
    'car dealer', 'used car', 'car sales'
  ] : locale === 'ar' ? [
    'شمال قبرص', 'ليفكوشا', 'كيرينيا', 'فاماغوستا', 'مورفو',
    'معرض سيارات', 'سيارة مستعملة', 'بيع سيارات'
  ] : [
    'северный кипр', 'лефкоша', 'кирения', 'фамагуста', 'морфу',
    'автосалон', 'подержанный автомобиль', 'продажа автомобилей'
  ];

  const brandKeywords = [
    'bmw', 'mercedes', 'audi', 'volkswagen', 'toyota', 'honda', 'ford',
    'hyundai', 'kia', 'nissan', 'suzuki'
  ].filter(brand => car.make.toLowerCase().includes(brand));

  const serviceKeywords = locale === 'tr' ? [
    'araç import', 'yurtdışından araç', 'araç servis', 'araç bakım',
    'araç finansmanı', 'test sürüşü', 'araç değerleme'
  ] : locale === 'en' ? [
    'car import', 'car service', 'car maintenance', 'car financing',
    'test drive', 'car valuation'
  ] : locale === 'ar' ? [
    'استيراد سيارات', 'خدمة السيارات', 'صيانة السيارات', 'تمويل السيارات',
    'تجربة القيادة', 'تقييم السيارات'
  ] : [
    'импорт автомобилей', 'сервис автомобилей', 'обслуживание автомобилей', 'финансирование автомобилей',
    'тест-драйв', 'оценка автомобилей'
  ];

  return [...baseKeywords, ...locationKeywords, ...brandKeywords, ...serviceKeywords]
    .filter(Boolean)
    .join(', ');
}

// Generate car-specific Open Graph data
export function generateCarOpenGraph(car: CarMetaConfig) {
  const title = generateCarTitle(car);
  const description = generateCarDescription(car);
  
  const images = car.images && car.images.length > 0 
    ? car.images.map(img => ({
        url: img.imagePath.startsWith('http') ? img.imagePath : `https://mcangilmotors.com${img.imagePath}`,
        width: 800,
        height: 600,
        alt: `${car.year} ${car.make} ${car.model}`
      }))
    : [{
        url: car.coverImage ? 
          (car.coverImage.startsWith('http') ? car.coverImage : `https://mcangilmotors.com${car.coverImage}`) :
          'https://mcangilmotors.com/cars/placeholder.svg',
        width: 800,
        height: 600,
        alt: `${car.year} ${car.make} ${car.model}`
      }];

  return {
    title,
    description,
    type: 'website' as const,
    images,
    url: `https://mcangilmotors.com${car.url}`,
    siteName: 'Mustafa Cangil Motors',
    locale: car.locale === 'tr' ? 'tr_TR' : 
            car.locale === 'en' ? 'en_US' :
            car.locale === 'ar' ? 'ar_SA' : 'ru_RU'
  };
}

// Generate car-specific JSON-LD schema
export function generateCarSchema(car: CarMetaConfig) {
  const baseUrl = 'https://mcangilmotors.com';
  const carUrl = `${baseUrl}${car.url}`;
  
  const images = car.images && car.images.length > 0 
    ? car.images.map(img => ({
        "@type": "ImageObject",
        "url": img.imagePath.startsWith('http') ? img.imagePath : `${baseUrl}${img.imagePath}`,
        "name": `${car.year} ${car.make} ${car.model}`,
        "description": `${car.year} ${car.make} ${car.model} - ${car.color}`
      }))
    : [{
        "@type": "ImageObject",
        "url": car.coverImage ? 
          (car.coverImage.startsWith('http') ? car.coverImage : `${baseUrl}${car.coverImage}`) :
          `${baseUrl}/cars/placeholder.svg`,
        "name": `${car.year} ${car.make} ${car.model}`,
        "description": `${car.year} ${car.make} ${car.model} - ${car.color}`
      }];

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": `${car.year} ${car.make} ${car.model}`,
    "description": generateCarDescription(car),
    "url": carUrl,
    "image": images,
    "brand": {
      "@type": "Brand",
      "name": car.make
    },
    "model": car.model,
    "vehicleModelDate": car.year,
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": car.mileage,
      "unitCode": "KMT"
    },
    "fuelType": car.fuelType,
    "vehicleTransmission": car.transmission,
    "vehicleColor": car.color,
    "vehicleEngine": {
      "@type": "EngineSpecification",
      "name": car.engine || `${car.make} Engine`
    },
    "bodyType": car.bodyType || "Car",
    "vehicleConfiguration": car.bodyType || "Car",
    "offers": {
      "@type": "Offer",
      "url": carUrl,
      "priceCurrency": "GBP",
      "price": car.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/UsedCondition",
      "seller": {
        "@type": "LocalBusiness",
        "name": "Mustafa Cangil Motors",
        "url": baseUrl,
        "telephone": "+90-533-855-11-66",
        "email": "m.cangilmotors@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Sakarya Sk No:10",
          "addressLocality": "Alsancak",
          "addressRegion": "Kuzey Kıbrıs",
          "addressCountry": "TR",
          "postalCode": "99010"
        }
      }
    },
    "category": car.category?.name || "Used Car",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Plate Status",
        "value": car.plateStatus || "Available"
      },
      {
        "@type": "PropertyValue", 
        "name": "Featured",
        "value": car.featured ? "Yes" : "No"
      }
    ]
  };
}

// Generate comprehensive car metadata
export function generateCarMetadata(car: CarMetaConfig): Metadata {
  const title = generateCarTitle(car);
  const description = generateCarDescription(car);
  const keywords = generateCarKeywords(car);
  const openGraph = generateCarOpenGraph(car);

  return {
    title,
    description,
    keywords,
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: openGraph.images.map(img => img.url)
    },
    alternates: {
      canonical: `https://mcangilmotors.com${car.url}`,
      languages: {
        'tr': `https://mcangilmotors.com/tr${car.url.replace(`/${car.locale}`, '')}`,
        'en': `https://mcangilmotors.com/en${car.url.replace(`/${car.locale}`, '')}`,
        'ar': `https://mcangilmotors.com/ar${car.url.replace(`/${car.locale}`, '')}`,
        'ru': `https://mcangilmotors.com/ru${car.url.replace(`/${car.locale}`, '')}`,
      }
    },
    other: {
      'car:make': car.make,
      'car:model': car.model,
      'car:year': car.year.toString(),
      'car:price': car.price.toString(),
      'car:mileage': car.mileage.toString(),
      'car:fuel-type': car.fuelType,
      'car:transmission': car.transmission,
      'car:color': car.color,
      'car:engine': car.engine || '',
      'car:body-type': car.bodyType || '',
      'car:plate-status': car.plateStatus || '',
      'car:featured': car.featured ? 'true' : 'false'
    }
  };
}
