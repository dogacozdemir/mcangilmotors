'use client';

import { useState, useRef } from 'react';
import { Upload, X, Link, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
}

export function ImageUpload({ value, onChange, onImageUpload, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!onImageUpload) return;

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      onChange(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Resim yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {value && (
        <div className="relative">
          <div className="relative w-full h-48 bg-prestige-card rounded-2xl overflow-hidden border-2 border-prestige-gold/20">
            <Image
              src={value.startsWith('http') ? value : `http://localhost:3001${value}`}
              alt="Preview"
              fill
              className="object-cover"
              sizes="400px"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Options */}
      {!value && (
        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-prestige-gold bg-prestige-gold/10'
                : 'border-prestige-border hover:border-prestige-gold/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-prestige-gold/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-prestige-gold" />
              </div>
              
              <div>
                <p className="text-lg font-prestige-sans font-semibold text-prestige-black mb-2">
                  Resim Yükle
                </p>
                <p className="text-prestige-gray font-prestige-sans text-sm">
                  Dosyayı buraya sürükleyin veya seçmek için tıklayın
                </p>
              </div>
              
              <Button
                type="button"
                onClick={openFileDialog}
                disabled={isUploading}
                className="prestige-button bg-gradient-to-r from-prestige-gold to-prestige-gold-light hover:from-prestige-gold-dark hover:to-prestige-gold text-prestige-black font-prestige-sans font-semibold rounded-xl"
              >
                {isUploading ? 'Yükleniyor...' : 'Dosya Seç'}
              </Button>
            </div>
          </div>

          {/* URL Input Option */}
          <div className="text-center">
            <p className="text-prestige-gray font-prestige-sans text-sm mb-2">
              veya
            </p>
            
            {!showUrlInput ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUrlInput(true)}
                className="border-2 border-prestige-gold/30 text-prestige-gold hover:bg-prestige-gold/10 font-prestige-sans"
              >
                <Link className="h-4 w-4 mr-2" />
                URL ile Ekle
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 border-2 border-prestige-border rounded-xl focus:outline-none focus:border-prestige-gold text-prestige-black font-prestige-sans"
                  />
                  <Button
                    type="button"
                    onClick={handleUrlSubmit}
                    className="prestige-button bg-gradient-to-r from-prestige-gold to-prestige-gold-light hover:from-prestige-gold-dark hover:to-prestige-gold text-prestige-black font-prestige-sans font-semibold rounded-xl"
                  >
                    Ekle
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowUrlInput(false);
                    setUrlInput('');
                  }}
                  className="text-prestige-gray hover:text-prestige-black font-prestige-sans text-sm"
                >
                  İptal
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Image Button */}
      {value && (
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            onClick={openFileDialog}
            disabled={isUploading}
            variant="outline"
            className="border-2 border-prestige-gold/30 text-prestige-gold hover:bg-prestige-gold/10 font-prestige-sans"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Yükleniyor...' : 'Değiştir'}
          </Button>
          
          <Button
            type="button"
            onClick={() => setShowUrlInput(true)}
            variant="outline"
            className="border-2 border-prestige-gold/30 text-prestige-gold hover:bg-prestige-gold/10 font-prestige-sans"
          >
            <Link className="h-4 w-4 mr-2" />
            URL ile Değiştir
          </Button>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
