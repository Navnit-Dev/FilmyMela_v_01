'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  X, 
  Upload,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MovieFormPage({ params }) {
  const router = useRouter();
  const { id: movieId } = use(params);
  const isEdit = !!movieId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rating: '',
    duration: '',
    genre: [],
    industry: '',
    release_year: '',
    cast: [],
    poster_url: '',
    scenes_gallery: [],
    video_url: '',
    download_urls: {},
    featured: false,
    trending: false,
    visible: true,
  });

  const [genreInput, setGenreInput] = useState('');
  const [castInput, setCastInput] = useState('');
  const [downloadQuality, setDownloadQuality] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [sceneUrl, setSceneUrl] = useState('');

  // Fetch movie data if editing
  useEffect(() => {
    if (isEdit) {
      fetchMovie();
    }
  }, [movieId]);

  const fetchMovie = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/movies/${movieId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    } catch (error) {
      showNotification('Error loading movie', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEdit ? `/api/admin/movies/${movieId}` : '/api/admin/movies';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showNotification(isEdit ? 'Movie updated successfully' : 'Movie created successfully', 'success');
        setTimeout(() => {
          router.push('/admin/movies');
        }, 1500);
      } else {
        const error = await res.json();
        showNotification(error.message || 'Error saving movie', 'error');
      }
    } catch (error) {
      showNotification('Error saving movie', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addGenre = () => {
    if (genreInput.trim() && !formData.genre.includes(genreInput.trim())) {
      setFormData({ ...formData, genre: [...formData.genre, genreInput.trim()] });
      setGenreInput('');
    }
  };

  const removeGenre = (genre) => {
    setFormData({ ...formData, genre: formData.genre.filter(g => g !== genre) });
  };

  const addCast = () => {
    if (castInput.trim() && !formData.cast.includes(castInput.trim())) {
      setFormData({ ...formData, cast: [...formData.cast, castInput.trim()] });
      setCastInput('');
    }
  };

  const removeCast = (member) => {
    setFormData({ ...formData, cast: formData.cast.filter(c => c !== member) });
  };

  const addScene = () => {
    if (sceneUrl.trim() && !formData.scenes_gallery.includes(sceneUrl.trim())) {
      setFormData({ ...formData, scenes_gallery: [...formData.scenes_gallery, sceneUrl.trim()] });
      setSceneUrl('');
    }
  };

  const removeScene = (url) => {
    setFormData({ ...formData, scenes_gallery: formData.scenes_gallery.filter(s => s !== url) });
  };

  const addDownload = () => {
    if (downloadQuality.trim() && downloadUrl.trim()) {
      setFormData({
        ...formData,
        download_urls: { ...formData.download_urls, [downloadQuality.trim()]: downloadUrl.trim() }
      });
      setDownloadQuality('');
      setDownloadUrl('');
    }
  };

  const removeDownload = (quality) => {
    const newDownloads = { ...formData.download_urls };
    delete newDownloads[quality];
    setFormData({ ...formData, download_urls: newDownloads });
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
              href="/admin/movies"
              className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-bold text-xl">
              {isEdit ? 'Edit Movie' : 'Add New Movie'}
            </h1>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Movie'}
          </button>
        </div>
      </header>

      {/* Form */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h2 className="font-display font-semibold text-lg mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Movie Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Rating (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Duration (e.g., 2h 30m)
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    required
                  >
                    <option value="">Select Industry</option>
                    <option value="Hollywood">Hollywood</option>
                    <option value="Bollywood">Bollywood</option>
                    <option value="South Indian">South Indian</option>
                    <option value="International">International</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Release Year *
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2099"
                    value={formData.release_year}
                    onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h2 className="font-display font-semibold text-lg mb-4">Genres</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                  placeholder="Add genre..."
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={addGenre}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-bright)] hover:bg-[var(--primary)]/20 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.genre.map((genre) => (
                  <span
                    key={genre}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-sm"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-1 hover:text-[var(--error)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cast */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h2 className="font-display font-semibold text-lg mb-4">Cast</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCast())}
                  placeholder="Add cast member..."
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={addCast}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-bright)] hover:bg-[var(--primary)]/20 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.cast.map((member) => (
                  <span
                    key={member}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--tertiary)]/20 text-[var(--tertiary)] text-sm"
                  >
                    {member}
                    <button
                      type="button"
                      onClick={() => removeCast(member)}
                      className="ml-1 hover:text-[var(--error)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Media URLs */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h2 className="font-display font-semibold text-lg mb-4">Media URLs</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Poster URL *
                  </label>
                  <input
                    type="url"
                    value={formData.poster_url}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    placeholder="https://example.com/poster.jpg"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Video URL (Embed)
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/embed/..."
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                {/* Scenes Gallery */}
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Scenes Gallery
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={sceneUrl}
                      onChange={(e) => setSceneUrl(e.target.value)}
                      placeholder="Scene image URL..."
                      className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    />
                    <button
                      type="button"
                      onClick={addScene}
                      className="px-4 py-2 rounded-lg bg-[var(--surface-bright)] hover:bg-[var(--primary)]/20 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {formData.scenes_gallery.map((url, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-[var(--surface-bright)]">
                        <img src={url} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeScene(url)}
                          className="absolute top-1 right-1 p-1 rounded bg-black/50 hover:bg-[var(--error)] text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Download URLs */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h2 className="font-display font-semibold text-lg mb-4">Download Links</h2>
              <div className="flex gap-2 mb-3">
                <select
                  value={downloadQuality}
                  onChange={(e) => setDownloadQuality(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Quality</option>
                  <option value="4K">4K</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                  <option value="360p">360p</option>
                </select>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="Download URL..."
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={addDownload}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-bright)] hover:bg-[var(--primary)]/20 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(formData.download_urls).map(([quality, url]) => (
                  <div
                    key={quality}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-container-low)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-[var(--primary)]/20 text-[var(--primary)]">
                        {quality}
                      </span>
                      <span className="text-sm truncate max-w-xs">{url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDownload(quality)}
                      className="p-1.5 rounded hover:bg-[var(--error)]/10 text-[var(--error)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h2 className="font-display font-semibold text-lg mb-4">Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container-low)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--outline-variant)] bg-[var(--surface-bright)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="font-medium">Visible</span>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container-low)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--outline-variant)] bg-[var(--surface-bright)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="font-medium">Featured</span>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container-low)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trending}
                    onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--outline-variant)] bg-[var(--surface-bright)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="font-medium">Trending</span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>

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
