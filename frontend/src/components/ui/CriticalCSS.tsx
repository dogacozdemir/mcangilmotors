'use client';

import Head from 'next/head';

interface CriticalCSSProps {
  css?: string;
}

export function CriticalCSS({ css }: CriticalCSSProps) {
  const defaultCriticalCSS = `
    /* Critical CSS for above-the-fold content */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%);
      position: relative;
      overflow: hidden;
    }
    
    .hero-content {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 80rem;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      color: white;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      color: #d1d5db;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .hero-image {
      width: 100%;
      height: 20rem;
      object-fit: cover;
      border-radius: 1rem;
    }
    
    /* Prevent layout shift for images */
    .image-container {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      overflow: hidden;
    }
    
    .image-container img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* Loading states */
    .loading-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
    
    /* Font loading optimization */
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/inter-var.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url('/fonts/inter-var.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('/fonts/inter-var.woff2') format('woff2');
    }
  `;

  return (
    <Head>
      <style
        dangerouslySetInnerHTML={{
          __html: css || defaultCriticalCSS
        }}
      />
    </Head>
  );
}

// Hook for dynamic critical CSS
export function useCriticalCSS() {
  const addCriticalCSS = (css: string) => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = css;
      style.setAttribute('data-critical', 'true');
      document.head.appendChild(style);
    }
  };

  const removeCriticalCSS = () => {
    if (typeof window !== 'undefined') {
      const criticalStyles = document.querySelectorAll('style[data-critical="true"]');
      criticalStyles.forEach(style => style.remove());
    }
  };

  return {
    addCriticalCSS,
    removeCriticalCSS
  };
}
