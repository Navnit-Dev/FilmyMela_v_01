'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MovieCard } from '@/components/movie-card';
import { useWishlist } from '@/components/wishlist-context';
import Link from 'next/link';
import { Heart, Trash2, ArrowLeft, Film } from 'lucide-react';
import { motion } from 'motion/react';

export default function WishlistPage() {
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist, isLoaded } = useWishlist();

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[var(--surface)]">
        <Navbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[var(--surface-container)] rounded w-1/4"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-[2/3] bg-[var(--surface-container)] rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link 
              href="/movies" 
              className="inline-flex items-center gap-2 text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Movies
            </Link>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-3xl lg:text-4xl text-[var(--on-surface)] mb-2">
                  My Wishlist
                </h1>
                <p className="text-[var(--on-surface-variant)]">
                  {wishlistCount > 0 
                    ? `${wishlistCount} movie${wishlistCount > 1 ? 's' : ''} saved`
                    : 'No movies saved yet'
                  }
                </p>
              </div>
              
              {wishlistCount > 0 && (
                <button
                  onClick={clearWishlist}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-container)] hover:bg-[var(--error)]/20 text-[var(--error)] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </motion.div>

          {/* Wishlist Content */}
          {wishlistCount > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            >
              {wishlist.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <MovieCard movie={movie} />
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(movie.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--error)] z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--surface-container)] flex items-center justify-center">
                <Heart className="w-12 h-12 text-[var(--on-surface-variant)]" />
              </div>
              <h2 className="font-display font-semibold text-xl mb-2 text-[var(--on-surface)]">
                Your wishlist is empty
              </h2>
              <p className="text-[var(--on-surface-variant)] mb-6 max-w-md mx-auto">
                Start adding movies to your wishlist by clicking the heart icon on any movie card or detail page.
              </p>
              <Link
                href="/movies"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-btn font-semibold text-[var(--on-primary)] ambient-glow-hover transition-all hover:scale-105"
              >
                <Film className="w-5 h-5" />
                Browse Movies
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
