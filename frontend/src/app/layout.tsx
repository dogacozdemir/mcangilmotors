import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css';
import { WebVitals } from '@/components/ui/WebVitals';

const inter = Inter({ subsets: ['latin'] });

const locales = ['tr', 'en', 'ar', 'ru'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // Default to Turkish if locale is invalid
  const validLocale = locales.includes(locale) ? locale : 'tr';
  
  const messages = await getMessages();
  const t = (key: string) => messages[key as keyof typeof messages] as string;

  return {
    title: {
      default: t('home.title'),
      template: `%s | ${t('home.title')}`
    },
    description: t('home.description'),
    keywords: 'KKTC araba galerisi, Kuzey Kıbrıs otomobil satış, ikinci el araba KKTC, Mustafa Cangil Auto Trading Ltd., Lefkoşa araba galerisi, Girne araba satış, KKTC araç galerisi, Northern Cyprus car dealership, used cars Cyprus, car sales Nicosia, vehicle gallery Cyprus, premium cars KKTC, luxury vehicles Northern Cyprus, reliable car dealer Cyprus, trusted vehicle gallery KKTC, car financing Cyprus, vehicle inspection KKTC, automotive services Northern Cyprus',
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
      canonical: '/',
      languages: {
        'tr': '/tr',
        'en': '/en',
        'ar': '/ar',
        'ru': '/ru',
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      type: 'website',
      locale: validLocale,
      url: 'https://mcangilmotors.com',
      title: t('home.title'),
      description: t('home.description'),
      siteName: 'Mustafa Cangil Auto Trading Ltd.',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: t('home.title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home.title'),
      description: t('home.description'),
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Default to Turkish if locale is invalid
  const validLocale = locales.includes(locale) ? locale : 'tr';
  
  const messages = await getMessages();

  return (
    <html lang={validLocale} dir={validLocale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D3AF77" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MC Motors" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="csrf-token" content="" />
      </head>
      <body className={inter.className}>
        <WebVitals />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
