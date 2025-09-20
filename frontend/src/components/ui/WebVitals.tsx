'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

interface WebVitalsProps {
  onVitals?: (metric: any) => void;
}

export function WebVitals({ onVitals }: WebVitalsProps) {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', metric);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_label: metric.id,
          non_interaction: true,
        });
      }
      
      // Example: Send to custom analytics
      if (onVitals) {
        onVitals(metric);
      }
    }
  });

  return null;
}

// Hook for manual Web Vitals measurement
export function useWebVitals() {
  useEffect(() => {
    // Measure LCP
    const measureLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    };

        // Measure FID
        const measureFID = () => {
          if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry: any) => {
                console.log('FID:', entry.processingStart - entry.startTime);
              });
            });
            observer.observe({ entryTypes: ['first-input'] });
          }
        };

    // Measure CLS
    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log('CLS:', clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      }
    };

        // Measure TTFB
        const measureTTFB = () => {
          if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry: any) => {
                if (entry.entryType === 'navigation') {
                  console.log('TTFB:', entry.responseStart - entry.requestStart);
                }
              });
            });
            observer.observe({ entryTypes: ['navigation'] });
          }
        };

    // Start measurements
    measureLCP();
    measureFID();
    measureCLS();
    measureTTFB();

    // Cleanup
    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    // Return any utilities if needed
  };
}
