import { useLazyImage } from '@/hooks/useIntersectionObserver';
import { OptimizedImage } from './OptimizedImage';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes = '100vw',
  quality = 85,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}: LazyImageProps) {
  const { ref, isLoaded, hasError, shouldLoad } = useLazyImage(src, {
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  });

  // If priority is true, load immediately
  if (priority) {
    return (
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={className}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  // Show placeholder while loading
  if (!shouldLoad || !isLoaded) {
    return (
      <div
        ref={ref}
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  // Render optimized image when loaded
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

