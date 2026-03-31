'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MovieCard } from './movie-card';

export function MovieSection({ title, movies, viewAllHref, showIndustry = false }) {
  if (!movies?.length) return null;

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl lg:text-2xl text-[var(--on-surface)]">
            {title}
          </h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="group flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-container)] transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
}
