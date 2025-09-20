'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  title?: string;
  className?: string;
}

export function ImageModal({ 
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  title,
  className = ''
}: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) {
            onIndexChange(currentIndex + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `image-${currentIndex + 1}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Araç Görseli',
          url: currentImage
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentImage);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center ${className}`}
        onClick={onClose}
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200"
        >
          <X size={24} />
        </motion.button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={(e) => {
                e.stopPropagation();
                if (currentIndex > 0) {
                  onIndexChange(currentIndex - 1);
                }
              }}
              disabled={currentIndex === 0}
              className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={24} />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                if (currentIndex < images.length - 1) {
                  onIndexChange(currentIndex + 1);
                }
              }}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={24} />
            </motion.button>
          </>
        )}

        {/* Image Container */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <motion.div
            className="relative max-w-full max-h-full"
            style={{
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => {
              e.stopPropagation();
              if (zoom === 1) {
                handleZoomIn();
              }
            }}
          >
            <Image
              src={currentImage}
              alt={title || `Image ${currentIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              priority
            />
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
        >
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          
          <span className="text-white text-sm font-medium min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          
          <div className="w-px h-6 bg-white/30"></div>
          
          <button
            onClick={handleResetZoom}
            className="px-3 py-1 text-white text-sm hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            Reset
          </button>
          
          <div className="w-px h-6 bg-white/30"></div>
          
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200"
            title="Download"
          >
            <Download size={20} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200"
            title="Share"
          >
            <Share2 size={20} />
          </button>
        </motion.div>

        {/* Image Counter */}
        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            {currentIndex + 1} / {images.length}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}


