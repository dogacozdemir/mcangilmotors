import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateMetaTags, generateJSONLD, generateAutoDealerSchema, generateMultipleSchemas, generateNorthernCyprusLocalBusinessSchema, generateNorthernCyprusKeywords } from '@/lib/metaTags';
import { HeroSection } from '@/components/sections/HeroSection';
import { BodyTypeQuickFilter } from '@/components/sections/BodyTypeQuickFilter';
import { BrandsCarousel } from '@/components/sections/BrandsCarousel';
import { BlogCarousel } from '@/components/sections/BlogCarousel';

// Lazy load heavy components
const AvailableStock = dynamic(() => import('@/components/sections/AvailableStock').then(mod => ({ default: mod.AvailableStock })), {
  loading: () => <div className="h-96 bg-gradient-to-br from-prestige-bg via-prestige-card to-prestige-bg animate-pulse rounded-3xl border border-prestige-border"></div>
});

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'home' });
  
  // Generate Northern Cyprus specific keywords
  const northernCyprusKeywords = generateNorthernCyprusKeywords();
  const combinedKeywords = `${t('keywords')}, ${northernCyprusKeywords.join(', ')}`;
  
  return generateMetaTags({
    title: t('title'),
    description: t('description'),
    keywords: combinedKeywords,
    url: `/${params.locale}`,
    locale: params.locale,
    type: 'autodealer',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: t('title')
      },
      {
        url: '/logo.png',
        width: 400,
        height: 400,
        alt: 'Mustafa Cangil Auto Trading Logo'
      }
    ],
    category: 'Car Dealership',
    rating: 4.8,
    reviewCount: 127,
    services: [
      "Car Sales",
      "Used Car Sales", 
      "Car Financing",
      "Test Drive",
      "Vehicle Inspection",
      "Car Insurance",
      "Trade-in Service",
      "Car Import",
      "Vehicle Import"
    ],
    openingHours: [
      "Mo-Fr 08:00-19:00",
      "Sa 09:00-16:00"
    ],
    telephone: "+90-533-855-11-66",
    email: "m.cangilmotors@gmail.com",
    address: {
      streetAddress: "Sakarya Sk No:10",
      addressLocality: "Alsancak",
      addressRegion: "KKTC",
      addressCountry: "TR",
      postalCode: "99010"
    },
    socialMedia: {
      facebook: "https://www.facebook.com/mustafacangilmotors",
      instagram: "https://www.instagram.com/mcangilmotors"
    },
    breadcrumbs: [
      {
        name: t('title'),
        url: `https://mcangilmotors.com/${params.locale}`,
        position: 1
      }
    ],
    location: {
      country: "TR",
      region: "KKTC",
      city: "Alsancak",
      postalCode: "99010",
      coordinates: {
        latitude: 35.1856,
        longitude: 33.3823
      }
    },
    businessType: "car_dealer",
    languages: ["tr", "en", "ar", "ru"]
  });
}

export default function HomePage({ params }: { params: { locale: string } }) {
  const t = useTranslations();
  
  // Generate Northern Cyprus specific schemas for comprehensive SEO
  const schemas = [
    generateNorthernCyprusLocalBusinessSchema({
      title: t('home.title'),
      description: t('home.description'),
      url: `/${params.locale}`,
      locale: params.locale
    }),
    generateAutoDealerSchema({
      title: t('home.title'),
      description: t('home.description'),
      url: `/${params.locale}`,
      locale: params.locale,
      rating: 4.8,
      reviewCount: 127,
      services: [
        "Car Sales",
        "Used Car Sales", 
        "Car Financing",
        "Test Drive",
        "Vehicle Inspection",
        "Car Insurance",
        "Trade-in Service",
        "Car Import",
        "Vehicle Import"
      ],
      openingHours: [
        "Mo-Fr 08:00-19:00",
        "Sa 09:00-16:00"
      ],
      telephone: "+90-533-855-11-66",
      email: "m.cangilmotors@gmail.com",
      address: {
        streetAddress: "Lefkoşa Merkez",
        addressLocality: "Lefkoşa",
        addressRegion: "KKTC",
        addressCountry: "TR",
        postalCode: "99010"
      },
      socialMedia: {
        facebook: "https://www.facebook.com/mustafacangilmotors",
        instagram: "https://www.instagram.com/mcangilmotors"
      }
    })
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <HeroSection />
      <BodyTypeQuickFilter />
      <AvailableStock />
      <BrandsCarousel />
      <BlogCarousel />
    </>
  );
}
