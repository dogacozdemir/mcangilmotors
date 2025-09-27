/**
 * URL utility functions for handling API and image URLs
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:3001';

/**
 * Get the full API URL for a given path
 */
export const getApiUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Handle API_BASE_URL that might already include /api
  const cleanApiBase = API_BASE_URL.replace(/\/api\/?$/, '');
  
  // If path already starts with 'api/', use it as is, otherwise add /api/
  if (cleanPath.startsWith('api/')) {
    return `${cleanApiBase}/${cleanPath}`;
  } else {
    return `${cleanApiBase}/api/${cleanPath}`;
  }
};

/**
 * Get the full URL for an uploaded image
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/cars/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /uploads, use upload base URL
  if (imagePath.startsWith('/uploads')) {
    return `${UPLOAD_BASE_URL}${imagePath}`;
  }
  
  // If it's a relative path, prepend upload base URL
  return `${UPLOAD_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

/**
 * Get the full URL for a car image
 */
export const getCarImageUrl = (car: any): string => {
  // Check for cover image first
  if (car.coverImage) {
    return getImageUrl(car.coverImage);
  }
  
  // Check for main image in images array
  if (car.images && car.images.length > 0) {
    const mainImage = car.images.find((img: any) => img.isMain) || car.images[0];
    if (mainImage?.imagePath) {
      return getImageUrl(mainImage.imagePath);
    }
  }
  
  // Fallback to placeholder
  return '/cars/placeholder.svg';
};

/**
 * Get the full URL for a blog image
 */
export const getBlogImageUrl = (post: any): string => {
  // Check for imgUrl first
  if (post.imgUrl) {
    return getImageUrl(post.imgUrl);
  }
  
  // Check for main image in images array
  if (post.images && post.images.length > 0) {
    const mainImage = post.images.find((img: any) => img.isMain) || post.images[0];
    if (mainImage?.imagePath) {
      return getImageUrl(mainImage.imagePath);
    }
  }
  
  // Fallback to placeholder
  return '/blog/placeholder.jpg';
};
