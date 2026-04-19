'use client';

import { useState, useEffect, useCallback ,useMemo} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Info, Star, Clock } from 'lucide-react';

export function HeroCarousel({ movies }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  function getRandomMovies(arr, count) {
  const shuffled = [...arr];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

  const slides = useMemo(() => {
  return movies ? getRandomMovies(movies, 6) : [];
}, [movies]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length, nextSlide]);

  if (!slides.length) return null;

  const currentMovie = slides[currentIndex];

  return (
    <section
      className="relative w-full h-[70vh] sm:h-[75vh] lg:h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image
            src={currentMovie.poster_url || '/placeholder.jpg'}
            alt={currentMovie.name}
            fill
            priority
            className="object-cover"
          />

          {/* Cleaner overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end lg:items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-0 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl"
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {currentMovie.trending && (
                  <span className="px-2.5 py-1 text-xs bg-red-500 text-white rounded-md">
                    Trending
                  </span>
                )}
                {currentMovie.featured && (
                  <span className="px-2.5 py-1 text-xs bg-purple-500 text-white rounded-md">
                    Featured
                  </span>
                )}
                <span className="px-2.5 py-1 text-xs bg-white/10 border border-white/20 rounded-md text-white/80">
                  {Array.isArray(currentMovie.industry)
                    ? currentMovie.industry[0]
                    : currentMovie.industry}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                {currentMovie.name}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-3 text-sm text-white/80 mb-3 flex-wrap">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  {currentMovie.rating || 'N/A'}
                </div>
                <span>{currentMovie.release_year}</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {currentMovie.duration}
                </span>
              </div>

              {/* Description (clean mobile clamp) */}
              <p className="text-sm sm:text-base text-white/80 line-clamp-2 sm:line-clamp-3 mb-5">
                {currentMovie.description}
              </p>

              {/* Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Link
                  href={`/movie/${currentMovie.id}`}
                  className="flex items-center gap-2 px-5 py-3 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
                >
                  <Play size={16} />
                  Watch
                </Link>

                <Link
                  href={`/movie/${currentMovie.id}`}
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-lg text-sm hover:bg-white/20 transition"
                >
                  <Info size={16} />
                  Details
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Arrows (better mobile UX) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dots (cleaner & mobile friendly) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-[var(--primary)]'
                  : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
