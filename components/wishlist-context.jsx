'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('filmyMela_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('filmyMela_wishlist', JSON.stringify(wishlist));
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = (movie) => {
    setWishlist(prev => {
      if (prev.some(item => item.id === movie.id)) {
        return prev; // Already in wishlist
      }
      return [...prev, movie];
    });
  };

  const removeFromWishlist = (movieId) => {
    setWishlist(prev => prev.filter(item => item.id !== movieId));
  };

  const isInWishlist = (movieId) => {
    return wishlist.some(item => item.id === movieId);
  };

  const toggleWishlist = (movie) => {
    if (isInWishlist(movie.id)) {
      removeFromWishlist(movie.id);
      return false;
    } else {
      addToWishlist(movie);
      return true;
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
      isLoaded
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
