'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { OptimizedImage } from './OptimizedImage';

interface AdvancedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  // Advanced props
  lazy?: boolean;
  intersectionThreshold?: number;
  fallbackSrc?: string;
  webp?: boolean;
  avif?: boolean;
}

export function AdvancedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes = '100vw',
  className = '',
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  intersectionThreshold = 0.1,
  fallbackSrc = '/cars/placeholder.svg',
  webp = true,
  avif = true
}: AdvancedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: intersectionThreshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, intersectionThreshold]);

  // Generate optimized src with format support
  const getOptimizedSrc = (originalSrc: string) => {
    if (originalSrc.startsWith('http')) return originalSrc;
    
    // Add format support for local images
    const baseSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '');
    return `${baseSrc}.webp`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  // Generate blur placeholder
  const generateBlurDataURL = (width: number, height: number) => {
    if (typeof window === 'undefined') return '';
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL('image/jpeg', 0.1);
  };

  const defaultBlurDataURL = blurDataURL || (width && height ? generateBlurDataURL(width, height) : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=');

  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={fill ? {} : { width, height }}
      />
    );
  }

  return (
    <div ref={imgRef} className={className}>
      <OptimizedImage
        src={getOptimizedSrc(currentSrc)}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

// Hook for advanced image optimization
export function useAdvancedImage() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const preloadImage = (src: string) => {
    if (loadedImages.has(src)) return Promise.resolve(src);

    return new Promise<string>((resolve, reject) => {
      const img = new (window as any).Image();
      img.onload = () => {
        setLoadedImages(prev => {
          const newSet = new Set(prev);
          newSet.add(src);
          return newSet;
        });
        resolve(src);
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = (srcs: string[]) => {
    return Promise.all(srcs.map(preloadImage));
  };

  const isImageLoaded = (src: string) => {
    return loadedImages.has(src);
  };

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    loadedImages
  };
}
