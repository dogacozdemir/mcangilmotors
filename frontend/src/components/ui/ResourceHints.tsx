'use client';

import Head from 'next/head';

interface ResourceHintsProps {
  preloadImages?: string[];
  preconnectDomains?: string[];
  dnsPrefetchDomains?: string[];
  preloadFonts?: string[];
}

export function ResourceHints({
  preloadImages = [],
  preconnectDomains = [],
  dnsPrefetchDomains = [],
  preloadFonts = []
}: ResourceHintsProps) {
  return (
    <Head>
      {/* Preconnect to external domains */}
      {preconnectDomains.map((domain) => (
        <link key={domain} rel="preconnect" href={domain} />
      ))}
      
      {/* DNS prefetch for external domains */}
      {dnsPrefetchDomains.map((domain) => (
        <link key={domain} rel="dns-prefetch" href={domain} />
      ))}
      
      {/* Preload critical images */}
      {preloadImages.map((image, index) => (
        <link
          key={index}
          rel="preload"
          as="image"
          href={image}
          type="image/webp"
        />
      ))}
      
      {/* Preload critical fonts */}
      {preloadFonts.map((font, index) => (
        <link
          key={index}
          rel="preload"
          as="font"
          href={font}
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
      
      {/* Preload critical CSS */}
      <link
        rel="preload"
        href="/globals.css"
        as="style"
      />
      
      {/* Preload critical JavaScript */}
      <link
        rel="modulepreload"
        href="/_next/static/chunks/webpack.js"
      />
    </Head>
  );
}

// Hook for dynamic resource hints
export function useResourceHints() {
  const addPreloadImage = (src: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  };

  const addPreconnect = (domain: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    }
  };

  return {
    addPreloadImage,
    addPreconnect
  };
}
