'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useCache';

export function ServiceWorkerRegistration() {
  const { isSupported, isRegistered, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (isSupported && isRegistered) {
      console.log('Service Worker is registered and ready');
      
      // Check for updates
      const checkForUpdates = () => {
        updateServiceWorker();
      };

      // Check for updates every 5 minutes
      const updateInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

      return () => {
        clearInterval(updateInterval);
      };
    }
  }, [isSupported, isRegistered, updateServiceWorker]);

  // Listen for service worker updates
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data.payload);
        }
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        // Reload page to get new version
        window.location.reload();
      });
    }
  }, []);

  return null; // This component doesn't render anything
}

