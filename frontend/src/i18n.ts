import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale) {
    locale = 'tr';
  }

  // Validate locale
  const validLocales = ['tr', 'en', 'ar', 'ru'];
  if (!validLocales.includes(locale)) {
    notFound();
  }

  try {
    return {
      locale,
      messages: (await import(`../public/messages/${locale}.json`)).default
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to Turkish if locale fails to load
    return {
      locale: 'tr',
      messages: (await import(`../public/messages/tr.json`)).default
    };
  }
});
