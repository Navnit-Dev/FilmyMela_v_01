'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Play, Clock, Star, Eye, Film, Heart } from 'lucide-react';
import { useWishlist } from '@/components/wishlist-context';
import { useToast } from '@/components/toast';

export function MovieCard({ movie, variant = 'default' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const isCompact = variant === 'compact';
  const inWishlist = isInWishlist(movie.id);
  
  // Determine if device supports hover (for touch devices)
  const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  
  // Use touch state for mobile, hover for desktop
  const showOverlay = supportsHover ? isHovered : isTouched;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(movie);
    showToast(
      added ? 'Added to wishlist' : 'Removed from wishlist',
      added ? 'success' : 'info'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link href={`/movie/${movie.id}`} className="block h-full">
        <div
          className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[var(--surface-container)] card-hover cursor-pointer h-full flex flex-col touch-target"
          onMouseEnter={() => supportsHover && setIsHovered(true)}
          onMouseLeave={() => supportsHover && setIsHovered(false)}
          onTouchStart={() => !supportsHover && setIsTouched(true)}
          onTouchEnd={() => setTimeout(() => setIsTouched(false), 3000)}
        >
          {/* Poster Image Container */}
          <div className={`relative aspect-[2/3] overflow-hidden ${isCompact ? 'sm:aspect-[2/3]' : ''}`}>
            {/* Skeleton Loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}
            
            {/* Movie Poster */}
            <Image
              src={movie.poster_url || '/placeholder-movie.jpg'}
              alt={movie.name}
              fill
              className={`object-cover transition-all duration-500 ${
                showOverlay ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              priority={variant === 'featured'}
            />
            
            {/* Gradient Overlay - Always visible on mobile, hover on desktop */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                showOverlay ? 'opacity-100' : 'opacity-0 md:opacity-0'
              }`} 
            />
            
            {/* Play Button - Visible on touch or hover */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              showOverlay ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-btn flex items-center justify-center ambient-glow transform transition-transform duration-300 scale-90 sm:scale-100">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--on-primary)] ml-0.5" fill="currentColor" />
              </div>
            </div>

            {/* Badges - Top Left */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {movie.featured && (
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider bg-[var(--primary)] text-[var(--on-primary)] rounded">
                  Featured
                </span>
              )}
              {movie.trending && (
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider bg-[var(--tertiary)] text-[var(--on-primary)] rounded">
                  Trending
                </span>
              )}
            </div>

            {/* Rating - Top Right */}
            {movie.rating && (
              <div className="absolute top-2 right-2 flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" fill="currentColor" />
                <span className="text-[10px] sm:text-xs font-semibold">{movie.rating}</span>
              </div>
            )}

            {/* Wishlist Button - Top Right, below rating */}
            <button
              onClick={handleWishlistClick}
              className={`absolute top-8 sm:top-10 right-2 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm transition-all hover:scale-110 ${
                inWishlist 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black/60 text-white hover:bg-red-500/80'
              }`}
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Genre Tags - Bottom (always visible on mobile preview) */}
            <div 
              className={`absolute bottom-0 left-0 right-0 p-2 sm:p-3 transition-transform duration-300 ${
                showOverlay ? 'translate-y-0' : 'translate-y-full md:translate-y-full'
              }`}
            >
              <div className="flex flex-wrap gap-1">
                {movie.genre?.slice(0, 2).map((g) => (
                  <span 
                    key={g} 
                    className="px-1.5 py-0.5 text-[8px] sm:text-[10px] bg-[var(--surface-container)]/90 rounded text-[var(--on-surface-variant)]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="p-2 sm:p-3 flex-1 flex flex-col">
            <h3 className={`font-display font-semibold text-[var(--on-surface)] line-clamp-2 leading-tight ${
              isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
            }`}>
              {movie.name}
            </h3>
            
            <div className="flex items-center gap-1.5 sm:gap-3 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-[var(--on-surface-variant)] flex-wrap">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {movie.duration}
              </span>
              <span>{movie.release_year}</span>
              
              {/* Scene count badge */}
              {movie.scenes_gallery?.length > 0 && (
                <span className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 bg-[var(--primary)]/10 rounded text-[8px] sm:text-[10px] text-[var(--primary)]">
                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {movie.scenes_gallery.length}
                </span>
              )}
              
              {/* Industry badge */}
              {movie.industry && (
                <span className="hidden sm:inline-flex px-1 sm:px-1.5 py-0.5 bg-[var(--surface-container-high)] rounded text-[8px] sm:text-[10px]">
                  {movie.industry}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
