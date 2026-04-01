'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Plus, 
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  Palette,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GenreManagementPage() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#6366f1',
    is_active: true,
    sort_order: 0
  });

  // Fetch genres on load
  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const res = await fetch('/api/admin/genres');
      if (res.ok) {
        const data = await res.json();
        setGenres(data.genres || []);
      }
    } catch (error) {
      showNotification('Error loading genres', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingGenre ? `/api/admin/genres/${editingGenre.id}` : '/api/admin/genres';
      const method = editingGenre ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showNotification(editingGenre ? 'Genre updated' : 'Genre created', 'success');
        setShowModal(false);
        setEditingGenre(null);
        resetForm();
        fetchGenres();
      } else {
        const error = await res.json();
        showNotification(error.message || 'Error saving genre', 'error');
      }
    } catch (error) {
      showNotification('Error saving genre', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this genre?')) return;
    
    try {
      const res = await fetch(`/api/admin/genres/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showNotification('Genre deleted', 'success');
        fetchGenres();
      } else {
        showNotification('Error deleting genre', 'error');
      }
    } catch (error) {
      showNotification('Error deleting genre', 'error');
    }
  };

  const openEditModal = (genre) => {
    setEditingGenre(genre);
    setFormData({
      name: genre.name,
      slug: genre.slug,
      description: genre.description || '',
      icon: genre.icon || '',
      color: genre.color || '#6366f1',
      is_active: genre.is_active,
      sort_order: genre.sort_order || 0
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingGenre(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#6366f1',
      is_active: true,
      sort_order: 0
    });
  };

  const filteredGenres = genres.filter(genre =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    genre.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#78716c', '#6b7280', '#374151', '#1f2937'
  ];

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
              <h1 className="font-display font-bold text-xl">Genre Management</h1>
              <p className="text-sm text-[var(--on-surface-variant)]">{genres.length} genres</p>
            </div>
          </div>
          
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)]"
          >
            <Plus className="w-4 h-4" />
            Add Genre
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="px-6 py-4">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search genres..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Genres Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGenres.map((genre) => (
            <div
              key={genre.id}
              className="p-4 rounded-xl bg-[var(--surface-container)] ghost-border group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: genre.color || '#6366f1' }}
                  >
                    {genre.icon ? (
                      <span className="text-lg">{genre.icon}</span>
                    ) : (
                      <Tag className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{genre.name}</h3>
                    <p className="text-xs text-[var(--on-surface-variant)]">{genre.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(genre)}
                    className="p-1.5 rounded-lg hover:bg-[var(--surface-bright)] text-[var(--on-surface-variant)]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(genre.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--error)]/10 text-[var(--error)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {genre.description && (
                <p className="text-sm text-[var(--on-surface-variant)] mb-2 line-clamp-2">
                  {genre.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                <span>Order: {genre.sort_order}</span>
                <span className={`px-2 py-0.5 rounded-full ${genre.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {genre.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {filteredGenres.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-container)] flex items-center justify-center">
              <Tag className="w-8 h-8 text-[var(--on-surface-variant)]" />
            </div>
            <h3 className="font-semibold mb-1">No genres found</h3>
            <p className="text-sm text-[var(--on-surface-variant)]">Create your first genre to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg p-6 rounded-2xl bg-[var(--surface)] shadow-2xl"
            >
              <h2 className="font-display font-bold text-xl mb-6">
                {editingGenre ? 'Edit Genre' : 'Add New Genre'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Slug (auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="auto-generated-from-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                      Icon (emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="🎬"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-[var(--primary)] scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-container)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--outline-variant)] bg-[var(--surface-bright)] text-[var(--primary)]"
                  />
                  <span className="font-medium">Active</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-container)] text-[var(--on-surface)] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg gradient-btn text-[var(--on-primary)] font-medium"
                  >
                    {editingGenre ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
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
