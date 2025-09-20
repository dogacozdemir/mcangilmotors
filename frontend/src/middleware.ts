import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['tr', 'en', 'ar', 'ru'],
  defaultLocale: 'tr'
});

export const config = {
  matcher: ['/', '/(tr|en|ar|ru)/:path*', '/((?!api|_next|_vercel|admin|.*\\..*).*)']
};
