'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    imagePath: string;
    alt?: string;
  }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function PhotoModal({ isOpen, onClose, images, currentIndex, onIndexChange }: PhotoModalProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance for swipe
  const minSwipeDistance = 50;

  const nextImage = useCallback(() => {
    onIndexChange((currentIndex + 1) % images.length);
  }, [onIndexChange, currentIndex, images.length]);

  const prevImage = useCallback(() => {
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  }, [onIndexChange, currentIndex, images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && images.length > 1) {
      prevImage();
    } else if (e.key === 'ArrowRight' && images.length > 1) {
      nextImage();
    }
  }, [onClose, images.length, prevImage, nextImage]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, images.length, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-transparent max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors duration-200 text-white"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-full p-3 hover:bg-black/70 transition-colors duration-200 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-full p-3 hover:bg-black/70 transition-colors duration-200 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative max-w-full max-h-full">
              <Image
                src={currentImage.imagePath}
                alt={currentImage.alt || 'Car image'}
                width={1200}
                height={800}
                className="object-contain max-h-[80vh] w-auto"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onIndexChange(index)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                    index === currentIndex 
                      ? 'border-white scale-110' 
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={image.imagePath}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
