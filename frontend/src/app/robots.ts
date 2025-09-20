import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/tr/',
          '/en/',
          '/ar/',
          '/ru/',
          '/tr/inventory',
          '/en/inventory', 
          '/ar/inventory',
          '/ru/inventory',
          '/tr/sold-cars',
          '/en/sold-cars',
          '/ar/sold-cars',
          '/ru/sold-cars',
          '/tr/incoming-cars',
          '/en/incoming-cars',
          '/ar/incoming-cars',
          '/ru/incoming-cars',
          '/tr/blog',
          '/en/blog',
          '/ar/blog',
          '/ru/blog',
          '/tr/contact',
          '/en/contact',
          '/ar/contact',
          '/ru/contact',
          '/tr/about',
          '/en/about',
          '/ar/about',
          '/ru/about',
          '/tr/faq',
          '/en/faq',
          '/ar/faq',
          '/ru/faq'
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/fordevs/',
          '*.json$',
          '*.xml$'
        ],
        crawlDelay: 1
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1
      }
    ],
    sitemap: 'https://mcangilmotors.com/sitemap.xml',
    host: 'https://mcangilmotors.com'
  }
}

