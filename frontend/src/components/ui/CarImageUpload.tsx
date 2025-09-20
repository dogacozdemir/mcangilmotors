'use client';

import { useState, useRef } from 'react';
import { Upload, X, Link, Image as ImageIcon, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface CarImage {
  id?: number;
  imagePath: string;
  sortOrder: number;
  altText?: string;
}

interface CarImageUploadProps {
  carId: number;
  coverImage?: string;
  galleryImages?: CarImage[];
  onCoverImageChange: (imagePath: string) => void;
  onGalleryImagesChange: (images: CarImage[]) => void;
  className?: string;
}

export function CarImageUpload({
  carId,
  coverImage,
  galleryImages = [],
  onCoverImageChange,
  onGalleryImagesChange,
  className = ''
}: CarImageUploadProps) {
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImageUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const response = await apiClient.uploadCarCoverImage(carId, file);
      onCoverImageChange(response.image.optimized.large);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Cover image upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryImagesUpload = async (files: File[]) => {
    setUploadingGallery(true);
    try {
      const response = await apiClient.uploadCarGalleryImages(carId, files);
      const newImages = response.images.map((img: any) => ({
        id: img.id,
        imagePath: img.imagePath,
        sortOrder: img.sortOrder,
        altText: `${carId} - Image ${img.sortOrder + 1}`
      }));
      onGalleryImagesChange([...galleryImages, ...newImages]);
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Gallery images upload failed');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCoverImageUpload(file);
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleGalleryImagesUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleGalleryImagesUpload(imageFiles);
    }
  };

  const handleRemoveGalleryImage = async (imageId: number) => {
    try {
      await apiClient.deleteCarImage(carId, imageId);
      onGalleryImagesChange(galleryImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleReorderImages = async (newOrder: CarImage[]) => {
    try {
      const imageIds = newOrder.map(img => img.id!);
      await apiClient.reorderCarImages(carId, imageIds);
      onGalleryImagesChange(newOrder);
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('Failed to reorder images');
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...galleryImages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      handleReorderImages(newOrder);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Cover Image Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-prestige-sans font-semibold text-prestige-black">
          Cover Image (Ana Sayfa Görseli)
        </h3>
        
        {coverImage ? (
          <div className="relative">
            <div className="relative w-full h-64 bg-prestige-card rounded-2xl overflow-hidden border-2 border-prestige-gold/20">
              <Image
                src={coverImage.startsWith('http') ? coverImage : `http://localhost:3001${coverImage}`}
                alt="Cover Image"
                fill
                className="object-cover"
                sizes="600px"
                unoptimized
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCoverImageChange('');
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-prestige-gold/30 rounded-2xl p-8 text-center hover:border-prestige-gold/50 transition-colors">
            <ImageIcon className="h-12 w-12 text-prestige-gold/50 mx-auto mb-4" />
            <p className="text-prestige-gray font-prestige-sans mb-4">
              Cover image for homepage display
            </p>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                coverInputRef.current?.click();
              }}
              disabled={uploadingCover}
              className="prestige-button bg-prestige-gold hover:bg-prestige-gold-dark text-prestige-black"
            >
              {uploadingCover ? 'Uploading...' : 'Upload Cover Image'}
            </Button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Gallery Images Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-prestige-sans font-semibold text-prestige-black">
          Gallery Images (Ürün Sayfası Galerisi)
        </h3>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragOver 
              ? 'border-prestige-gold bg-prestige-gold/5' 
              : 'border-prestige-gold/30 hover:border-prestige-gold/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(e);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            handleDragLeave(e);
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(e);
          }}
        >
          <Upload className="h-12 w-12 text-prestige-gold/50 mx-auto mb-4" />
          <p className="text-prestige-gray font-prestige-sans mb-4">
            Drag & drop images here or click to select
          </p>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              galleryInputRef.current?.click();
            }}
            disabled={uploadingGallery}
            className="prestige-button bg-prestige-gold hover:bg-prestige-gold-dark text-prestige-black"
          >
            {uploadingGallery ? 'Uploading...' : 'Select Gallery Images'}
          </Button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryFileChange}
            className="hidden"
          />
        </div>

        {/* Gallery Images Grid */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((image, index) => (
                <div key={image.id || index} className="relative group">
                  <div className="relative w-full h-32 bg-prestige-card rounded-xl overflow-hidden border-2 border-prestige-gold/20">
                    <Image
                      src={image.imagePath.startsWith('http') ? image.imagePath : `http://localhost:3001${image.imagePath}`}
                      alt={image.altText || 'Gallery Image'}
                      fill
                      className="object-cover"
                      sizes="200px"
                      unoptimized
                    />
                    
                    {/* Controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          moveImage(index, 'up');
                        }}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          moveImage(index, 'down');
                        }}
                        disabled={index === galleryImages.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          image.id && handleRemoveGalleryImage(image.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Sort Order Indicator */}
                  <div className="absolute top-1 left-1 bg-prestige-gold text-prestige-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
