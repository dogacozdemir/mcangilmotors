'use client';

import { useEffect } from 'react';

interface PerformanceBudget {
  lcp: number; // milliseconds
  fid: number; // milliseconds
  cls: number; // score
  ttfb: number; // milliseconds
  fcp: number; // milliseconds
}

const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500, // Good: < 2.5s, Needs Improvement: 2.5s - 4s, Poor: > 4s
  fid: 100,  // Good: < 100ms, Needs Improvement: 100ms - 300ms, Poor: > 300ms
  cls: 0.1,  // Good: < 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
  ttfb: 800, // Good: < 800ms, Needs Improvement: 800ms - 1.8s, Poor: > 1.8s
  fcp: 1800  // Good: < 1.8s, Needs Improvement: 1.8s - 3s, Poor: > 3s
};

export function PerformanceBudget({ budget = DEFAULT_BUDGET }: { budget?: PerformanceBudget }) {
  useEffect(() => {
    const checkPerformance = () => {
      if ('PerformanceObserver' in window) {
        // LCP Check
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.startTime;
          
          if (lcp > budget.lcp) {
            console.warn(`LCP exceeded budget: ${lcp}ms > ${budget.lcp}ms`);
          } else {
            console.log(`LCP within budget: ${lcp}ms <= ${budget.lcp}ms`);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID Check
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            if (fid > budget.fid) {
              console.warn(`FID exceeded budget: ${fid}ms > ${budget.fid}ms`);
            } else {
              console.log(`FID within budget: ${fid}ms <= ${budget.fid}ms`);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS Check
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          if (clsValue > budget.cls) {
            console.warn(`CLS exceeded budget: ${clsValue} > ${budget.cls}`);
          } else {
            console.log(`CLS within budget: ${clsValue} <= ${budget.cls}`);
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // TTFB Check
        const ttfbObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'navigation') {
              const ttfb = entry.responseStart - entry.requestStart;
              if (ttfb > budget.ttfb) {
                console.warn(`TTFB exceeded budget: ${ttfb}ms > ${budget.ttfb}ms`);
              } else {
                console.log(`TTFB within budget: ${ttfb}ms <= ${budget.ttfb}ms`);
              }
            }
          });
        });
        ttfbObserver.observe({ entryTypes: ['navigation'] });

        // FCP Check
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fcp = entry.startTime;
            if (fcp > budget.fcp) {
              console.warn(`FCP exceeded budget: ${fcp}ms > ${budget.fcp}ms`);
            } else {
              console.log(`FCP within budget: ${fcp}ms <= ${budget.fcp}ms`);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Cleanup
        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          ttfbObserver.disconnect();
          fcpObserver.disconnect();
        };
      }
    };

    const cleanup = checkPerformance();
    return cleanup;
  }, [budget]);

  return null;
}

// Hook for performance monitoring
export function usePerformanceBudget() {
  const checkResourceSize = (url: string, maxSize: number) => {
    if (typeof window !== 'undefined') {
      fetch(url, { method: 'HEAD' })
        .then(response => {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            const size = parseInt(contentLength);
            if (size > maxSize) {
              console.warn(`Resource ${url} exceeded size budget: ${size} bytes > ${maxSize} bytes`);
            }
          }
        })
        .catch(console.error);
    }
  };

  const checkImageOptimization = (src: string) => {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          
          // Check if image is too large
          if (img.naturalWidth > 1920 || img.naturalHeight > 1080) {
            console.warn(`Image ${src} is too large: ${img.naturalWidth}x${img.naturalHeight}`);
          }
        }
      };
      img.src = src;
    }
  };

  return {
    checkResourceSize,
    checkImageOptimization
  };
}
