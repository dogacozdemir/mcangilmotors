import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  sizes?: string
  className?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes = '100vw',
  className = '',
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // If error, show placeholder
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    )
  }

  const imageProps = {
    src,
    alt,
    quality,
    priority,
    onLoad: handleLoad,
    onError: handleError,
    className: `transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    } ${className}`,
    ...(placeholder === 'blur' && {
      placeholder: 'blur' as const,
      blurDataURL: blurDataURL || defaultBlurDataURL
    })
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={sizes}
        alt={alt || ''}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width!}
      height={height!}
      sizes={sizes}
      alt={alt || ''}
    />
  )
}

// Hook for image optimization
export function useImageOptimization(src: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => setIsLoaded(true)
  const handleError = () => setHasError(true)

  return {
    isLoaded,
    hasError,
    onLoad: handleLoad,
    onError: handleError
  }
}

