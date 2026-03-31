'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ChevronLeft, ChevronRight, Info, Star, Clock } from 'lucide-react';

export function HeroCarousel({ movies }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = movies?.slice(0, 5) || [];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length, nextSlide]);

  if (!slides.length) return null;

  const currentMovie = slides[currentIndex];

  return (
    <section 
      className="relative w-full aspect-hero lg:aspect-[21/9] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={currentMovie.poster_url || '/placeholder-hero.jpg'}
            alt={currentMovie.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-2xl"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {currentMovie.trending && (
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-[var(--primary)] text-[var(--on-primary)] rounded-full">
                    Trending Now
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-medium bg-[var(--surface-container)]/80 backdrop-blur-sm rounded-full text-[var(--on-surface-variant)]">
                  {currentMovie.industry}
                </span>
                <div className="flex items-center gap-1 px-3 py-1 bg-[var(--surface-container)]/80 backdrop-blur-sm rounded-full">
                  <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  <span className="text-xs font-medium">{currentMovie.rating}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white mb-4 leading-tight">
                {currentMovie.name}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mb-4 text-sm text-[var(--on-surface-variant)]">
                <span>{currentMovie.release_year}</span>
                <span className="w-1 h-1 rounded-full bg-[var(--on-surface-variant)]" />
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentMovie.duration}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--on-surface-variant)]" />
                <span>{currentMovie.genre?.join(', ')}</span>
              </div>

              {/* Description */}
              <p className="text-[var(--on-surface-variant)] mb-6 line-clamp-3 text-sm sm:text-base max-w-xl">
                {currentMovie.description}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/movie/${currentMovie.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-btn font-semibold text-[var(--on-primary)] ambient-glow-hover transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Watch Now
                </Link>
                <Link
                  href={`/movie/${currentMovie.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--surface-container)]/80 backdrop-blur-sm font-semibold text-white hover:bg-[var(--surface-container-high)] transition-all"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[var(--surface-container)]/80 backdrop-blur-sm hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[var(--surface-container)]/80 backdrop-blur-sm hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-[var(--primary)]'
                  : 'w-2 h-2 bg-[var(--on-surface-variant)]/50 hover:bg-[var(--on-surface-variant)]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Side Preview */}
      <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col gap-3">
          {slides.slice(currentIndex + 1, currentIndex + 3).concat(
            slides.slice(0, Math.max(0, 2 - (slides.length - currentIndex - 1)))
          ).map((movie, index) => (
            <motion.div
              key={`${movie.id}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setCurrentIndex(slides.indexOf(movie))}
              className="relative w-32 h-20 rounded-lg overflow-hidden cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            >
              <Image
                src={movie.poster_url}
                alt={movie.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
