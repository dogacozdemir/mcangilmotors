import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateMetaTags, generateNorthernCyprusKeywords } from '@/lib/metaTags';
import InventoryClient from './InventoryClient';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'inventory' });
  
  // Generate Northern Cyprus specific keywords for inventory
  const northernCyprusKeywords = generateNorthernCyprusKeywords();
  const inventoryKeywords = [
    'araç galerisi', 'ikinci el araba', 'araç satış', 'araç envanteri',
    'bmw', 'mercedes', 'audi', 'volkswagen', 'toyota', 'honda', 'ford',
    'hyundai', 'kia', 'nissan', 'suzuki', 'sedan', 'hatchback', 'suv',
    'coupe', 'cabrio', 'pickup', 'manuel', 'otomatik', 'benzin', 'dizel',
    'hibrit', 'elektrikli'
  ];
  
  const combinedKeywords = `${t('keywords')}, ${northernCyprusKeywords.join(', ')}, ${inventoryKeywords.join(', ')}`;
  
  return generateMetaTags({
    title: t('title'),
    description: t('description'),
    keywords: combinedKeywords,
    url: `/${params.locale}/inventory`,
    locale: params.locale,
    type: 'autodealer',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: t('title')
      }
    ],
    category: 'Car Inventory',
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
      "Car Import"
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

export default function InventoryPage({ params }: { params: { locale: string } }) {
  return <InventoryClient params={params} />;
}
