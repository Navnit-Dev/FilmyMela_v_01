'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminMoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMovies();
  }, [currentPage, searchQuery]);

  const fetchMovies = async () => {
    try {
      const queryParams = new URLSearchParams({
        limit: String(itemsPerPage),
        offset: String((currentPage - 1) * itemsPerPage),
        ...(searchQuery && { search: searchQuery })
      });

      const res = await fetch(`/api/admin/movies?${queryParams}`);
      const data = await res.json();
      
      setMovies(data.movies || []);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!movieToDelete) return;

    try {
      const res = await fetch(`/api/admin/movies/${movieToDelete.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMovies(movies.filter(m => m.id !== movieToDelete.id));
        showNotification('Movie deleted successfully', 'success');
      } else {
        showNotification('Failed to delete movie', 'error');
      }
    } catch (error) {
      showNotification('Error deleting movie', 'error');
    }

    setDeleteModalOpen(false);
    setMovieToDelete(null);
  };

  const toggleVisibility = async (movie) => {
    try {
      const res = await fetch(`/api/admin/movies/${movie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !movie.visible })
      });

      if (res.ok) {
        setMovies(movies.map(m => 
          m.id === movie.id ? { ...m, visible: !m.visible } : m
        ));
        showNotification(`Movie ${movie.visible ? 'hidden' : 'visible'}`, 'success');
      }
    } catch (error) {
      showNotification('Error updating movie', 'error');
    }
  };

  const toggleFeatured = async (movie) => {
    try {
      const res = await fetch(`/api/admin/movies/${movie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !movie.featured })
      });

      if (res.ok) {
        setMovies(movies.map(m => 
          m.id === movie.id ? { ...m, featured: !m.featured } : m
        ));
        showNotification(`Movie ${movie.featured ? 'unfeatured' : 'featured'}`, 'success');
      }
    } catch (error) {
      showNotification('Error updating movie', 'error');
    }
  };

  const toggleTrending = async (movie) => {
    try {
      const res = await fetch(`/api/admin/movies/${movie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trending: !movie.trending })
      });

      if (res.ok) {
        setMovies(movies.map(m => 
          m.id === movie.id ? { ...m, trending: !m.trending } : m
        ));
        showNotification(`Movie ${movie.trending ? 'removed from' : 'added to'} trending`, 'success');
      }
    } catch (error) {
      showNotification('Error updating movie', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass ghost-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-bold text-xl">Movie Management</h1>
          </div>
          
          <Link
            href="/admin/movies/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)]"
          >
            <Plus className="w-4 h-4" />
            Add Movie
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search movies..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] placeholder-[var(--on-surface-variant)]/50 focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {/* Movies Table */}
        <div className="rounded-2xl bg-[var(--surface-container)] ghost-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--surface-container-low)]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">
                        Movie
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">
                        Industry
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">
                        Year
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--outline-variant)]/20">
                    {movies.map((movie) => (
                      <tr key={movie.id} className="hover:bg-[var(--surface-container-high)]/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-[var(--surface-bright)]">
                              {movie.poster_url ? (
                                <Image
                                  src={movie.poster_url}
                                  alt={movie.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-xs text-[var(--on-surface-variant)]">No img</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{movie.name}</p>
                              <p className="text-xs text-[var(--on-surface-variant)]">
                                {movie.genre?.join(', ')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-[var(--surface-bright)]">
                            {movie.industry}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {movie.release_year}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleVisibility(movie)}
                              className={`p-1.5 rounded ${movie.visible ? 'text-[var(--success)]' : 'text-[var(--on-surface-variant)]'}`}
                              title={movie.visible ? 'Visible' : 'Hidden'}
                            >
                              {movie.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => toggleFeatured(movie)}
                              className={`p-1.5 rounded ${movie.featured ? 'text-yellow-400' : 'text-[var(--on-surface-variant)]'}`}
                              title={movie.featured ? 'Featured' : 'Not Featured'}
                            >
                              <Star className="w-4 h-4" fill={movie.featured ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={() => toggleTrending(movie)}
                              className={`p-1.5 rounded ${movie.trending ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`}
                              title={movie.trending ? 'Trending' : 'Not Trending'}
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/movie/${movie.id}`}
                              target="_blank"
                              className="p-1.5 rounded hover:bg-[var(--surface-bright)] transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/movies/${movie.id}/edit`}
                              className="p-1.5 rounded hover:bg-[var(--surface-bright)] transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setMovieToDelete(movie);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded hover:bg-[var(--error)]/10 text-[var(--error)] transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--outline-variant)]/20">
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && movies.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-bright)] flex items-center justify-center">
                <Search className="w-8 h-8 text-[var(--on-surface-variant)]" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">No movies found</h3>
              <p className="text-[var(--on-surface-variant)] mb-4">
                {searchQuery ? 'Try a different search term' : 'Add your first movie to get started'}
              </p>
              <Link
                href="/admin/movies/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)]"
              >
                <Plus className="w-4 h-4" />
                Add Movie
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[var(--surface-container)] ghost-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-[var(--error)]/10">
                  <AlertCircle className="w-6 h-6 text-[var(--error)]" />
                </div>
                <h3 className="font-display font-semibold text-lg">Delete Movie</h3>
              </div>
              <p className="text-[var(--on-surface-variant)] mb-6">
                Are you sure you want to delete &quot;{movieToDelete?.name}&quot;? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setMovieToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-bright)] hover:bg-[var(--surface-container-high)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-[var(--error)] text-white hover:bg-[var(--error)]/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg toast-${notification.type}`}
          >
            <p className="font-medium">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
