'use client';

import { useEffect, useState } from 'react';

export function useCSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
          
          // Update meta tag
          const metaTag = document.querySelector('meta[name="csrf-token"]');
          if (metaTag) {
            metaTag.setAttribute('content', data.csrfToken);
          }
          
          // Store in localStorage as backup
          localStorage.setItem('csrfToken', data.csrfToken);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    fetchCSRFToken();
  }, []);

  return csrfToken;
}
