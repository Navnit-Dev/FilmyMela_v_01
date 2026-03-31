'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast';
import { 
  ChevronLeft, 
  GripVertical,
  Save,
  Film,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function MovieSequencePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movies, setMovies] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/admin/movies?limit=100&sort=sequence');
      if (res.ok) {
        const data = await res.json();
        // Sort by sequence, then by created_at for items without sequence
        const sorted = data.movies?.sort((a, b) => {
          if (a.sequence !== b.sequence) return (a.sequence || 0) - (b.sequence || 0);
          return new Date(a.created_at) - new Date(b.created_at);
        }) || [];
        setMovies(sorted);
      }
    } catch (error) {
      showToast('Failed to fetch movies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a drag image
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newMovies = [...movies];
    const draggedMovie = newMovies[draggedItem];
    
    // Remove from old position
    newMovies.splice(draggedItem, 1);
    // Insert at new position
    newMovies.splice(index, 0, draggedMovie);
    
    setMovies(newMovies);
    setDraggedItem(index);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update sequence for each movie
      const updates = movies.map((movie, index) => ({
        id: movie.id,
        sequence: index
      }));

      const res = await fetch('/api/admin/movies/sequence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (res.ok) {
        showToast('Sequence saved successfully', 'success');
      } else {
        showToast('Failed to save sequence', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newMovies = [...movies];
    [newMovies[index], newMovies[index - 1]] = [newMovies[index - 1], newMovies[index]];
    setMovies(newMovies);
  };

  const moveDown = (index) => {
    if (index === movies.length - 1) return;
    const newMovies = [...movies];
    [newMovies[index], newMovies[index + 1]] = [newMovies[index + 1], newMovies[index]];
    setMovies(newMovies);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <div>
              <h1 className="font-display font-bold text-xl">Manage Sequence</h1>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Drag & drop to reorder movie display
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl bg-[var(--surface-container)] ghost-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                <GripVertical className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Drag and drop movies to reorder them. Click Save Order when done. 
                You can also use the arrow buttons to move items up or down.
              </p>
            </div>
          </div>

          {/* Movie List */}
          <div className="space-y-2">
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                layout
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-container)] ghost-border cursor-move hover:border-[var(--primary)]/30 transition-colors group"
              >
                {/* Drag Handle */}
                <div className="p-2 rounded-lg bg-[var(--surface-bright)] text-[var(--on-surface-variant)]">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Sequence Number */}
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <span className="font-semibold text-[var(--primary)] text-sm">{index + 1}</span>
                </div>

                {/* Movie Poster */}
                <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-[var(--surface-bright)] flex-shrink-0">
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Film className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
                  )}
                </div>

                {/* Movie Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{movie.name}</h3>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    {movie.industry} • {movie.release_year} • {movie.rating}/10
                  </p>
                </div>

                {/* Move Buttons */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-[var(--surface-bright)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === movies.length - 1}
                    className="p-1.5 rounded hover:bg-[var(--surface-bright)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {movies.length === 0 && (
            <div className="text-center py-12">
              <Film className="w-12 h-12 mx-auto mb-4 text-[var(--on-surface-variant)]" />
              <p className="text-[var(--on-surface-variant)]">No movies found</p>
              <Link
                href="/admin/movies/new"
                className="inline-block mt-4 text-[var(--primary)] hover:underline"
              >
                Add your first movie
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
