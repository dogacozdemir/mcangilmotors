'use client';

import { useState, useRef } from 'react';
import { Upload, X, Link, Image as ImageIcon, GripVertical, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import apiClient from '@/lib/api';
import { getImageUrl } from '@/lib/urlUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CarImage {
  id?: number;
  imagePath: string;
  sortOrder: number;
  altText?: string;
}

interface UploadingImage {
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
}

interface SortableImageProps {
  image: CarImage;
  index: number;
  onRemove: (imageId: number) => void;
}

function SortableImage({ image, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="relative w-full h-32 bg-prestige-card rounded-xl overflow-hidden border-2 border-prestige-gold/20">
        <Image
          src={getImageUrl(image.imagePath)}
          alt={image.altText || 'Gallery Image'}
          fill
          className="object-cover"
          sizes="200px"
          unoptimized
        />
        
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 right-1 bg-prestige-gold/80 hover:bg-prestige-gold text-prestige-black p-1 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3" />
        </div>
        
        {/* Controls */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              image.id && onRemove(image.id);
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
  );
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
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    
    // Create preview images
    const previewImages: UploadingImage[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as const,
      progress: 0
    }));
    
    setUploadingImages(prev => [...prev, ...previewImages]);
    
    try {
      // Upload files one by one to track progress
      const uploadedImages: CarImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewIndex = uploadingImages.length + i;
        
        try {
          // Update progress
          setUploadingImages(prev => 
            prev.map((img, idx) => 
              idx === previewIndex ? { ...img, progress: 50 } : img
            )
          );
          
          const response = await apiClient.uploadCarGalleryImages(carId, [file]);
          const newImage = {
            id: response.images[0].id,
            imagePath: response.images[0].imagePath,
            sortOrder: response.images[0].sortOrder,
            altText: `${carId} - Image ${galleryImages.length + uploadedImages.length + 1}`
          };
          
          uploadedImages.push(newImage);
          
          // Update status to success
          setUploadingImages(prev => 
            prev.map((img, idx) => 
              idx === previewIndex ? { ...img, status: 'success' as const, progress: 100 } : img
            )
          );
        } catch (error) {
          // Update status to error
          setUploadingImages(prev => 
            prev.map((img, idx) => 
              idx === previewIndex ? { ...img, status: 'error' as const } : img
            )
          );
          console.error(`Error uploading ${file.name}:`, error);
        }
      }
      
      // Add successful uploads to gallery
      if (uploadedImages.length > 0) {
        onGalleryImagesChange([...galleryImages, ...uploadedImages]);
      }
      
      // Clear uploading images after 2 seconds
      setTimeout(() => {
        setUploadingImages([]);
      }, 2000);
      
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
      // Update sortOrder for each image
      const updatedOrder = newOrder.map((img, index) => ({
        ...img,
        sortOrder: index
      }));
      
      const imageIds = updatedOrder.map(img => img.id!);
      await apiClient.reorderCarImages(carId, imageIds);
      onGalleryImagesChange(updatedOrder);
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('Failed to reorder images');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = galleryImages.findIndex((img, index) => (img.id || index) === active.id);
      const newIndex = galleryImages.findIndex((img, index) => (img.id || index) === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(galleryImages, oldIndex, newIndex);
        handleReorderImages(newOrder);
      }
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
                src={getImageUrl(coverImage)}
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

        {/* Uploading Images Preview */}
        {uploadingImages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-prestige-gray">Uploading Images:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadingImages.map((uploadingImg, index) => (
                <div key={index} className="relative">
                  <div className="relative w-full h-32 bg-prestige-card rounded-xl overflow-hidden border-2 border-prestige-gold/20">
                    <Image
                      src={uploadingImg.preview}
                      alt="Uploading preview"
                      fill
                      className="object-cover"
                      sizes="200px"
                      unoptimized
                    />
                    
                    {/* Upload Status Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      {uploadingImg.status === 'uploading' && (
                        <div className="text-center text-white">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                          <div className="text-xs">Uploading...</div>
                          {uploadingImg.progress && (
                            <div className="w-16 bg-gray-300 rounded-full h-1 mt-1">
                              <div 
                                className="bg-prestige-gold h-1 rounded-full transition-all duration-300"
                                style={{ width: `${uploadingImg.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {uploadingImg.status === 'success' && (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      )}
                      {uploadingImg.status === 'error' && (
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Images Grid */}
        {(galleryImages.length > 0 || uploadingImages.length > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-prestige-gray">Gallery Images:</h4>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={galleryImages.map((img, index) => img.id || index)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((image, index) => (
                      <SortableImage
                        key={image.id || index}
                        image={image}
                        index={index}
                        onRemove={handleRemoveGalleryImage}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
