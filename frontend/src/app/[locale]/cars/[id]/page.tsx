import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateCarMetadata } from '@/lib/carMetaTags';
import CarDetailClient from './CarDetailClient';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  engine?: string;
  bodyType?: string;
  plateStatus?: string;
  price: number;
  featured: boolean;
  coverImage?: string;
  category?: {
    name: string;
  };
  images?: Array<{
    imagePath: string;
    isMain: boolean;
    sortOrder: number;
    altText?: string;
  }>;
  translations?: Array<{
    title: string;
    description: string;
  }>;
}

export async function generateMetadata({ params }: { params: { id: string; locale: string } }): Promise<Metadata> {
  try {
    // Import apiClient dynamically for server-side usage
    const { default: apiClient } = await import('@/lib/api');
    const car = await apiClient.getCar(Number(params.id), params.locale) as Car;
    
    return generateCarMetadata({
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      color: car.color,
      engine: car.engine,
      bodyType: car.bodyType,
      plateStatus: car.plateStatus,
      featured: car.featured,
      coverImage: car.coverImage,
      images: car.images,
      category: car.category,
      locale: params.locale,
      url: `/${params.locale}/cars/${params.id}`
    });
  } catch (error) {
    console.error('Error generating car metadata:', error);
    // Fallback metadata
    return {
      title: 'Araç Detayları | Mustafa Cangil Motors',
      description: 'KKTC\'nin en güvenilir araç galerisi Mustafa Cangil Motors\'ta araç detaylarını inceleyin.',
    };
  }
}

export default function CarDetailPage({ params }: { params: { id: string; locale: string } }) {
  return <CarDetailClient params={params} />;
}