'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  engine?: string;
  bodyType?: string;
  plateStatus?: string;
  featured: boolean;
  coverImage?: string;
  category?: {
    name: string;
  };
  images?: Array<{
    imagePath: string;
    isMain: boolean;
    sortOrder: number;
    altText?: string;
  }>;
}

interface WishlistContextType {
  wishlist: Car[];
  addToWishlist: (car: Car) => void;
  removeFromWishlist: (carId: number) => void;
  isInWishlist: (carId: number) => boolean;
  toggleWishlist: (carId: number) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Car[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (car: Car) => {
    setWishlist(prev => {
      if (prev.find(c => c.id === car.id)) {
        return prev; // Already in wishlist
      }
      return [...prev, car];
    });
  };

  const removeFromWishlist = (carId: number) => {
    setWishlist(prev => prev.filter(car => car.id !== carId));
  };

  const isInWishlist = (carId: number) => {
    return wishlist.some(car => car.id === carId);
  };

  const toggleWishlist = (carId: number) => {
    setWishlist(prev => {
      if (prev.find(c => c.id === carId)) {
        return prev.filter(car => car.id !== carId);
      } else {
        // Find the car in the current wishlist or create a minimal car object
        const car = prev.find(c => c.id === carId) || { id: carId } as Car;
        return [...prev, car];
      }
    });
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}


