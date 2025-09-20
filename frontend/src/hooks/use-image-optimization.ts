import { useState, useEffect } from 'react';

interface UseImageOptimizationProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export const useImageOptimization = ({ src, alt, priority = false }: UseImageOptimizationProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
      // Fallback to placeholder
      setImageSrc('/placeholder-car.jpg');
    };
    
    img.src = src;
  }, [src]);

  // Generate responsive image sizes
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [320, 640, 768, 1024, 1280, 1536];
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=80 ${size}w`)
      .join(', ');
  };

  // Generate WebP version
  const generateWebPSrc = (baseSrc: string) => {
    return baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  return {
    isLoaded,
    hasError,
    imageSrc,
    srcSet: generateSrcSet(imageSrc),
    webpSrc: generateWebPSrc(imageSrc),
    className: `transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async' as const,
  };
};









