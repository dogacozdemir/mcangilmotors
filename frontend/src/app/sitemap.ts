import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mcangilmotors.com'
  const locales = ['tr', 'en', 'ar', 'ru']
  
  // Static pages with Northern Cyprus specific priorities
  const staticPages = [
    { path: '', priority: 1.0, changeFreq: 'daily' },
    { path: '/inventory', priority: 0.9, changeFreq: 'daily' },
    { path: '/sold-cars', priority: 0.8, changeFreq: 'weekly' },
    { path: '/incoming-cars', priority: 0.8, changeFreq: 'weekly' },
    { path: '/blog', priority: 0.7, changeFreq: 'weekly' },
    { path: '/contact', priority: 0.8, changeFreq: 'monthly' },
    { path: '/about', priority: 0.6, changeFreq: 'monthly' },
    { path: '/faq', priority: 0.6, changeFreq: 'monthly' }
  ]

  // Generate sitemap entries for all static pages in all locales
  const sitemap: MetadataRoute.Sitemap = []
  
  staticPages.forEach(page => {
    locales.forEach(locale => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq as any,
        priority: page.priority,
        alternates: {
          languages: {
            tr: `${baseUrl}/tr${page.path}`,
            en: `${baseUrl}/en${page.path}`,
            ar: `${baseUrl}/ar${page.path}`,
            ru: `${baseUrl}/ru${page.path}`,
          },
        },
      })
    })
  })

  // Add root URL
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
    alternates: {
      languages: {
        tr: `${baseUrl}/tr`,
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
        ru: `${baseUrl}/ru`,
      },
    },
  })

  return sitemap
}

