import { useLazyComponent } from '@/hooks/useIntersectionObserver';
import { ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function LazySection({
  children,
  fallback,
  className = '',
  threshold = 0.1,
  rootMargin = '100px'
}: LazySectionProps) {
  const { ref, shouldRender } = useLazyComponent({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const defaultFallback = (
    <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`}>
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (fallback || defaultFallback)}
    </div>
  );
}

