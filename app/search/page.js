'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MovieCard } from '@/components/movie-card';
import { SkeletonGrid } from '@/components/skeletons';
import { Search, X, Filter, TrendingUp, Clock, Star, Film } from 'lucide-react';

import { useToast } from '@/components/toast';

// Secret admin PIN - in production, this should be stored server-side
const SECRET_ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_SECRET_PIN || 'admin123';

export default function SearchPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Check if admin already unlocked
    const unlocked = localStorage.getItem('admin_unlocked') === 'true';
    setAdminUnlocked(unlocked);
  }, []);

  // Check for secret PIN in search query
  useEffect(() => {
    if (query === SECRET_ADMIN_PIN && !adminUnlocked) {
      localStorage.setItem('admin_unlocked', 'true');
      setAdminUnlocked(true);
      showToast('Admin access unlocked!', 'success');
      // Clear the search
      setQuery('');
      setMovies([]);
    }
  }, [query, adminUnlocked, showToast]);

  // Search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setMovies(data.movies || []);

      // Save to recent searches
      if (data.movies?.length > 0) {
        const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [recentSearches]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setMovies([]);
    setShowSuggestions(false);
  };

  const removeRecentSearch = (search, e) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter(s => s !== search);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <Navbar />
      
      <div className="pt-20 lg:pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-[var(--on-surface)] mb-2">
              Search Movies
            </h1>
            <p className="text-[var(--on-surface-variant)]">
              Find movies by title, description, or cast
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-[var(--on-surface-variant)]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search for movies..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] placeholder-[var(--on-surface-variant)]/50 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-lg"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-4 flex items-center"
              >
                <X className="w-5 h-5 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]" />
              </button>
            )}
          </div>

          {/* Content */}
          {!query ? (
            <div className="space-y-8">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-lg">Recent Searches</h3>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('recentSearches');
                      }}
                      className="text-sm text-[var(--error)] hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => setQuery(search)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-colors"
                      >
                        <Clock className="w-4 h-4 text-[var(--on-surface-variant)]" />
                        <span>{search}</span>
                        <X
                          className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[var(--error)]"
                          onClick={(e) => removeRecentSearch(search, e)}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Action Movies', '2024 Releases', 'Hollywood', 'Horror', 'Comedy', 'Thriller'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Categories */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-4">Browse by Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Trending', href: '/movies?trending=true', icon: TrendingUp },
                    { label: 'Featured', href: '/movies?featured=true', icon: Star },
                    { label: 'Hollywood', href: '/movies?industry=Hollywood', icon: Film },
                    { label: 'Bollywood', href: '/movies?industry=Bollywood', icon: Film },
                    { label: 'Latest', href: '/movies?sort=latest', icon: Clock },
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-colors"
                    >
                      <cat.icon className="w-5 h-5 text-[var(--primary)]" />
                      <span className="font-medium">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Results Count */}
              <div className="mb-6 text-sm text-[var(--on-surface-variant)]">
                {loading ? 'Searching...' : `Found ${movies.length} results for "${query}"`}
              </div>

              {/* Results Grid */}
              {loading && movies.length === 0 ? (
                <SkeletonGrid count={6} />
              ) : (
                <>
                  {movies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6">
                      {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--surface-container)] flex items-center justify-center">
                        <Search className="w-10 h-10 text-[var(--on-surface-variant)]" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">No results found</h3>
                      <p className="text-[var(--on-surface-variant)]">
                        Try searching with different keywords
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
