'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Play, Clock, Star, Eye } from 'lucide-react';

export function MovieCard({ movie, variant = 'default' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/movie/${movie.id}`}>
        <div
          className="group relative rounded-xl overflow-hidden bg-[var(--surface-container)] card-hover cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Poster Image */}
          <div className={`relative ${isCompact ? 'aspect-[2/3]' : 'aspect-[2/3]'} overflow-hidden`}>
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}
            <Image
              src={movie.poster_url || '/placeholder-movie.jpg'}
              alt={movie.name}
              fill
              className={`object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Play Button */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="w-14 h-14 rounded-full gradient-btn flex items-center justify-center ambient-glow transform group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-[var(--on-primary)] ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {movie.featured && (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--primary)] text-[var(--on-primary)] rounded">
                  Featured
                </span>
              )}
              {movie.trending && (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--tertiary)] text-[var(--on-primary)] rounded">
                  Trending
                </span>
              )}
            </div>

            {/* Rating */}
            {movie.rating && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                <span className="text-xs font-semibold">{movie.rating}</span>
              </div>
            )}

            {/* Genre Tags - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex flex-wrap gap-1">
                {movie.genre?.slice(0, 2).map((g) => (
                  <span 
                    key={g} 
                    className="px-2 py-0.5 text-[10px] bg-[var(--surface-container)]/90 rounded text-[var(--on-surface-variant)]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="p-3">
            <h3 className={`font-display font-semibold text-[var(--on-surface)] line-clamp-1 ${
              isCompact ? 'text-sm' : 'text-base'
            }`}>
              {movie.name}
            </h3>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--on-surface-variant)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {movie.duration}
              </span>
              <span>{movie.release_year}</span>
              {movie.industry && (
                <span className="px-1.5 py-0.5 bg-[var(--surface-container-high)] rounded text-[10px]">
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
