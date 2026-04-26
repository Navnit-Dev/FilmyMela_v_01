'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MovieCard } from '@/components/movie-card';
import { SkeletonGrid } from '@/components/skeletons';
import UserLayout from '@/components/user-layout';
import { 
  Filter, 
  Grid3X3, 
  LayoutGrid, 
  ChevronDown,
  X,
  SlidersHorizontal
} from 'lucide-react';

function MoviesContent() {
  const searchParams = useSearchParams();
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    industry: searchParams.get('industry') || '',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    trending: searchParams.get('trending') === 'true',
    featured: searchParams.get('featured') === 'true',
    sort: searchParams.get('sort') || 'latest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);

  const limit = 20;

  // Fetch filter options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [indRes, genreRes, yearRes] = await Promise.all([
          fetch('/api/industries'),
          fetch('/api/genres'),
          fetch('/api/years')
        ]);
        
        if (indRes.ok) setIndustries(await indRes.json());
        if (genreRes.ok) setGenres(await genreRes.json());
        if (yearRes.ok) setYears(await yearRes.json());
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchOptions();
  }, []);

  // Fetch movies
  const fetchMovies = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: String(limit),
        offset: String(reset ? 0 : offset),
        ...(filters.industry && { industry: filters.industry }),
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.year && { year: filters.year }),
        ...(filters.trending && { trending: 'true' }),
        ...(filters.featured && { featured: 'true' }),
        sort: filters.sort
      });

      const res = await fetch(`/api/movies?${queryParams}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch movies');
      }

      const moviesData = data.movies || [];
      
      if (reset) {
        setMovies(moviesData);
        setOffset(limit);
      } else {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMovies = moviesData.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
        setOffset(prev => prev + limit);
      }
      
      setHasMore(moviesData.length === limit && offset + moviesData.length < data.count);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, offset]);

  // Initial fetch
  useEffect(() => {
    fetchMovies(true);
  }, [filters.industry, filters.genre, filters.year, filters.trending, filters.featured, filters.sort]);

  // Infinite scroll
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 500
        ) {
          if (!loading && hasMore) {
            fetchMovies(false);
          }
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, hasMore, fetchMovies]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setOffset(0);
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      genre: '',
      year: '',
      trending: false,
      featured: false,
      sort: 'latest'
    });
    setOffset(0);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length - (filters.sort ? 1 : 0);

  return (
    <UserLayout>
      <main className="min-h-screen bg-[var(--surface)]">
        <Navbar />
      
      <div className="pt-20 lg:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-2xl lg:text-3xl text-[var(--on-surface)] mb-2">
                Browse Movies
              </h1>
              
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'bg-[var(--surface-container)] text-[var(--on-surface)]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 p-6 rounded-2xl bg-[var(--surface-container-low)] ghost-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Industry
                  </label>
                  <select
                    value={filters.industry}
                    onChange={(e) => updateFilter('industry', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="">All Industries</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => updateFilter('genre', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="">All Genres</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Release Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => updateFilter('year', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--outline-variant)]/20">
                <button
                  onClick={() => updateFilter('trending', !filters.trending)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    filters.trending
                      ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                      : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                  }`}
                >
                  🔥 Trending
                </button>
                <button
                  onClick={() => updateFilter('featured', !filters.featured)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    filters.featured
                      ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                      : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                  }`}
                >
                  ⭐ Featured
                </button>
                
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}

         

          {/* Movies Grid */}
          {loading && movies.length === 0 ? (
            <SkeletonGrid count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}

          {/* Loading More */}
          {loading && movies.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* No Results */}
          {!loading && movies.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--surface-container)] flex items-center justify-center">
                <Filter className="w-10 h-10 text-[var(--on-surface-variant)]" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">No movies found</h3>
              <p className="text-[var(--on-surface-variant)] mb-4">Try adjusting your filters</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
      </main>
    </UserLayout>
  );
}

function MoviesLoading() {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <Navbar />
      <div className="pt-20 lg:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-2xl lg:text-3xl text-[var(--on-surface)] mb-2">
                Browse Movies
              </h1>
              <p className="text-[var(--on-surface-variant)]">Loading...</p>
            </div>
          </div>
          <SkeletonGrid count={12} />
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<MoviesLoading />}>
      <MoviesContent />
    </Suspense>
  );
}
