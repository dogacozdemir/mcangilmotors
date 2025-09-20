import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BlogPageClient from './BlogPageClient';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
  };
}

export default function BlogPage() {
  return <BlogPageClient />;
}