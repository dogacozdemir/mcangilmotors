// Accessibility utilities and helpers

export const accessibility = {
  // Generate ARIA labels for common actions
  getAriaLabel: (action: string, context?: string) => {
    const labels: Record<string, string> = {
      'view-details': 'Detayları görüntüle',
      'edit': 'Düzenle',
      'delete': 'Sil',
      'close': 'Kapat',
      'search': 'Ara',
      'filter': 'Filtrele',
      'sort': 'Sırala',
      'next': 'Sonraki',
      'previous': 'Önceki',
      'menu': 'Menü',
      'close-menu': 'Menüyü kapat',
      'open-menu': 'Menüyü aç',
      'car-gallery': 'Araç galerisi',
      'contact-form': 'İletişim formu',
      'search-form': 'Arama formu',
    };

    const baseLabel = labels[action] || action;
    return context ? `${baseLabel} - ${context}` : baseLabel;
  },

  // Generate screen reader text
  getScreenReaderText: (text: string, hidden = true) => {
    return {
      className: hidden ? 'sr-only' : '',
      text: text
    };
  },

  // Focus management
  focusElement: (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  },

  // Trap focus within modal
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  // Announce to screen readers
  announce: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Generate unique IDs for form elements
  generateId: (prefix: string) => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Check if element is visible to screen readers
  isVisibleToScreenReader: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.getAttribute('aria-hidden') !== 'true'
    );
  },

  // Skip to main content link
  createSkipLink: () => {
    return {
      href: "#main-content",
      className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-500 text-white px-4 py-2 rounded z-50",
      text: "Ana içeriğe geç",
      onClick: (e: Event) => {
        e.preventDefault();
        accessibility.focusElement('#main-content');
      }
    };
  }
};

// ARIA attributes helper
export const aria = {
  // Button with proper ARIA attributes
  button: (props: {
    label: string;
    describedBy?: string;
    expanded?: boolean;
    controls?: string;
    pressed?: boolean;
    disabled?: boolean;
  }) => ({
    'aria-label': props.label,
    'aria-describedby': props.describedBy,
    'aria-expanded': props.expanded,
    'aria-controls': props.controls,
    'aria-pressed': props.pressed,
    'aria-disabled': props.disabled,
  }),

  // Form field with proper ARIA attributes
  formField: (props: {
    label: string;
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
    errorMessage?: string;
  }) => ({
    'aria-label': props.label,
    'aria-required': props.required,
    'aria-invalid': props.invalid,
    'aria-describedby': props.describedBy,
    'aria-errormessage': props.errorMessage,
  }),

  // Navigation with proper ARIA attributes
  navigation: (props: {
    label: string;
    current?: string;
  }) => ({
    'aria-label': props.label,
    'aria-current': props.current,
  }),

  // Dialog with proper ARIA attributes
  dialog: (props: {
    label: string;
    describedBy?: string;
    modal?: boolean;
  }) => ({
    'aria-label': props.label,
    'aria-describedby': props.describedBy,
    'aria-modal': props.modal,
    role: 'dialog',
  }),
};


