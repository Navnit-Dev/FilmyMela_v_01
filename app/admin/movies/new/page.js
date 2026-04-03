'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Skeleton,
  InputAdornment,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Add,
  Close,
  Search,
  Movie as MovieIcon,
  ChevronLeft,
  Tv,
  X,
  AutoFixHigh,
  Inventory,
  Check,
  Delete,
  Storage,
  OpenInNew,
  Star,
  
  Security,
} from '@mui/icons-material';

export default function MovieFormPage({ params }) {
  const router = useRouter();
  const { id: movieId } = use(params);
  const isEdit = !!movieId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  
  // Reference data
  const [genres, setGenres] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  
  // Multi-Source API Search
  const [apiQuery, setApiQuery] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [showApiDropdown, setShowApiDropdown] = useState(false);
  const [selectedApiData, setSelectedApiData] = useState(null);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const [apiSource, setApiSource] = useState('tmdb'); // 'tmdb' or 'omdb' for movies
  
  // Form data with new fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tagline: '',
    content_type: 'movie',
    tmdb_id: null,
    mal_id: null,
    tvmaze_id: null,
    imdb_id: '',
    rating: '',
    release_year: '',
    original_language: '',
    total_episodes: '',
    seasons: '',
    episode_duration: '',
    duration: '',
    poster_url: '',
    backdrop_url: '',
    scenes_gallery: [],
    video_url: '',
    genre_names: [],
    industry_names: [],
    cast: [],
    is_in_parts: false,
    download_urls: {},
    download_parts: [],
    featured: false,
    trending: false,
    visible: true,
  });

  const [genreInput, setGenreInput] = useState('');
  const [castInput, setCastInput] = useState('');
  const [downloadQuality, setDownloadQuality] = useState('720p'); // Default quality
  const [downloadUrl, setDownloadUrl] = useState('');
  const [sceneUrl, setSceneUrl] = useState('');

  // Download parts state
  const [newPart, setNewPart] = useState({ name: '', episode_range: '', downloads: {} });

  // Fetch reference data on mount
  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [genresRes, industriesRes, contentTypesRes] = await Promise.all([
        fetch('/api/admin/genres'),
        fetch('/api/admin/industries'),
        fetch('/api/admin/content-types')
      ]);
      if (genresRes.ok) setGenres((await genresRes.json()).genres);
      if (industriesRes.ok) setIndustries((await industriesRes.json()).industries);
      if (contentTypesRes.ok) setContentTypes((await contentTypesRes.json()).contentTypes);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

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
        // Ensure genre_names and industry_names are always arrays
        setFormData({
          ...data,
          genre_names: data.genre_names || [],
          industry_names: data.industry_names || []
        });
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

  // Multi-Source API Search with debounce
  const debouncedSearch = useCallback((query) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    if (!query.trim()) {
      setApiResults([]);
      setShowApiDropdown(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      setApiLoading(true);
      try {
        // For movies, use the selected API source (TMDB or OMDB)
        const apiParam = formData.content_type === 'movie' ? `&apiSource=${apiSource}` : '';
        const res = await fetch(`/api/admin/content?action=quick&q=${encodeURIComponent(query)}&type=${formData.content_type}${apiParam}`);
        if (res.ok) {
          const data = await res.json();
          setApiResults(data || []);
          setShowApiDropdown(true);
        }
      } catch (error) {
        console.error('API search failed:', error);
      } finally {
        setApiLoading(false);
      }
    }, 400); // 400ms debounce
    
    setSearchDebounceTimer(timer);
  }, [formData.content_type, searchDebounceTimer]);

  // Handle API query input change
  const handleApiQueryChange = (e) => {
    const value = e.target.value;
    setApiQuery(value);
    debouncedSearch(value);
  };

  // Load full content details from selected API result
  const loadContentDetails = async (result) => {
    setApiLoading(true);
    try {
      // For movies, include the selected API source
      const apiParam = formData.content_type === 'movie' ? `&apiSource=${apiSource}` : '';
      const res = await fetch(`/api/admin/content?action=details&q=${encodeURIComponent(result.title)}&type=${formData.content_type}&apiId=${result.sourceId || ''}${apiParam}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedApiData(data);
        
        // Match API genres with local genres - store names
        const matchedGenreNames = [];
        if (data.genres && Array.isArray(data.genres)) {
          data.genres.forEach(apiGenre => {
            const localGenre = genres.find(g => 
              g.name.toLowerCase() === apiGenre.toLowerCase() ||
              g.name.toLowerCase().includes(apiGenre.toLowerCase()) ||
              apiGenre.toLowerCase().includes(g.name.toLowerCase())
            );
            if (localGenre && !matchedGenreNames.includes(localGenre.name)) {
              matchedGenreNames.push(localGenre.name);
            }
          });
        }
        
        // Match content type with industry - store names
        const matchedIndustryNames = [];
        if (formData.content_type) {
          const contentTypeToIndustry = {
            'movie': 'Hollywood',
            'anime': 'Japanese',
            'web_series': 'Streaming'
          };
          const industryName = contentTypeToIndustry[formData.content_type];
          if (industryName) {
            const localIndustry = industries.find(i => 
              i.name.toLowerCase().includes(industryName.toLowerCase()) ||
              industryName.toLowerCase().includes(i.name.toLowerCase())
            );
            if (localIndustry && !matchedIndustryNames.includes(localIndustry.name)) {
              matchedIndustryNames.push(localIndustry.name);
            }
          }
        }
        
        // Autofill form with API data
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          description: data.description || prev.description,
          tagline: data.tagline || prev.tagline || '',
          tmdb_id: data.tmdbId || prev.tmdb_id,
          mal_id: data.malId || prev.mal_id,
          tvmaze_id: data.tvmazeId || prev.tvmaze_id,
          imdb_id: data.imdbId || prev.imdb_id || '',
          rating: data.rating || prev.rating || '',
          release_year: data.releaseYear || prev.release_year,
          original_language: data.originalLanguage || prev.original_language || '',
          duration: data.runtimeMinutes || prev.duration || '',
          episode_duration: data.episodeDuration || prev.episode_duration || '',
          total_episodes: data.totalEpisodes || prev.total_episodes,
          seasons: data.seasons || prev.seasons,
          poster_url: data.posterUrl || prev.poster_url || '',
          backdrop_url: data.backdropUrl || prev.backdrop_url || '',
          cast: data.cast || prev.cast,
          video_url: data.videoUrl || prev.video_url || '',
          genre_names: matchedGenreNames.length > 0 ? matchedGenreNames : prev.genre_names,
          industry_names: matchedIndustryNames.length > 0 ? matchedIndustryNames : prev.industry_names,
        }));
        
        // Show notification about matched genres/industries
        if (matchedGenreNames.length > 0 || matchedIndustryNames.length > 0) {
          const matchedItems = [];
          if (matchedGenreNames.length > 0) matchedItems.push(`${matchedGenreNames.length} genre(s)`);
          if (matchedIndustryNames.length > 0) matchedItems.push(`${matchedIndustryNames.length} industry(s)`);
          showNotification(`Auto-matched: ${matchedItems.join(', ')}`, 'info');
        }
        
        setShowApiDropdown(false);
        setApiQuery('');
        
        // Show success with confidence info
        const confidence = data._meta?.confidence;
        const sourceName = data._meta?.source?.toUpperCase() || 'API';
        showNotification(
          `Data loaded from ${sourceName} (${confidence?.score || 0}% confidence)`, 
          confidence?.level === 'high' ? 'success' : confidence?.level === 'medium' ? 'info' : 'warning'
        );
      }
    } catch (error) {
      showNotification('Failed to load content details', 'error');
    } finally {
      setApiLoading(false);
    }
  };

  // Handle API source change for movies
  const handleApiSourceChange = (newSource) => {
    setApiSource(newSource);
    setApiQuery('');
    setApiResults([]);
    setShowApiDropdown(false);
    setSelectedApiData(null);
  };

  // Source badge component - shows correct API based on content type and user selection
  const SourceBadge = ({ source }) => {
    const badges = {
      tmdb: { color: 'bg-blue-500', label: 'TMDB', icon: Storage },
      omdb: { color: 'bg-orange-500', label: 'OMDB', icon: Storage },
      jikan: { color: 'bg-purple-500', label: 'Jikan', icon: AutoFixHigh },
      tvmaze: { color: 'bg-green-500', label: 'TVMaze', icon: Tv }
    };
    
    // Auto-detect source from content type if not provided, or use selected API for movies
    const effectiveSource = source || 
      (formData.content_type === 'movie' ? apiSource :
       formData.content_type === 'anime' ? 'jikan' :
       formData.content_type === 'web_series' ? 'tvmaze' : 'tmdb');
    
    const badge = badges[effectiveSource];
    if (!badge) return null;
    
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Confidence indicator component
  const ConfidenceIndicator = ({ score, level }) => {
    const colors = {
      high: 'text-green-500',
      medium: 'text-yellow-500',
      low: 'text-red-500'
    };
    
    return (
      <div className="flex items-center gap-1">
        <Star className={`w-4 h-4 ${colors[level] || 'text-gray-400'}`} />
        <span className={`text-sm font-medium ${colors[level] || 'text-gray-400'}`}>
          {score}%
        </span>
      </div>
    );
  };

  // Genre toggle (using names)
  const toggleGenre = (genreName) => {
    setFormData(prev => ({
      ...prev,
      genre_names: prev.genre_names.includes(genreName)
        ? prev.genre_names.filter(name => name !== genreName)
        : [...prev.genre_names, genreName]
    }));
  };

  // Industry toggle (single selection, removes brackets/parentheses)
  const toggleIndustry = (industryName) => {
    // Remove any text in parentheses or brackets
    const cleanName = industryName.replace(/[\[(].*?[\])]/g, '').trim();
    
    setFormData(prev => ({
      ...prev,
      industry_names: prev.industry_names?.[0] === cleanName ? [] : [cleanName]
    }));
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

  // Download parts management
  const addDownloadPart = () => {
    if (!newPart.name || !newPart.episode_range) return;
    setFormData(prev => ({
      ...prev,
      download_parts: [...prev.download_parts, { ...newPart, id: Date.now() }]
    }));
    setNewPart({ name: '', episode_range: '', downloads: {} });
  };

  const updateDownloadPart = (partId, quality, url) => {
    setFormData(prev => ({
      ...prev,
      download_parts: prev.download_parts.map(part =>
        part.id === partId
          ? { ...part, downloads: { ...part.downloads, [quality]: url } }
          : part
      )
    }));
  };

  const removeDownloadPart = (partId) => {
    setFormData(prev => ({
      ...prev,
      download_parts: prev.download_parts.filter(part => part.id !== partId)
    }));
  };

  const removeScene = (url) => {
    setFormData(prev => ({ ...prev, scenes_gallery: prev.scenes_gallery.filter(s => s !== url) }));
  };

  const addDownload = () => {
    if (downloadQuality.trim() && downloadUrl.trim()) {
      setFormData({
        ...formData,
        download_urls: { ...formData.download_urls, [downloadQuality.trim()]: downloadUrl.trim() }
      });
      setDownloadUrl(''); // Clear URL but keep quality
    }
  };

  const removeDownload = (quality) => {
    const newDownloads = { ...formData.download_urls };
    delete newDownloads[quality];
    setFormData({ ...formData, download_urls: newDownloads });
  };

  const contentTypeIcons = {
    movie: MovieIcon,
    web_series: Tv,
    anime: AutoFixHigh
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
            <div>
              <h1 className="font-display font-bold text-xl">
                {isEdit ? 'Edit Content' : 'Add New Content'}
              </h1>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Step {activeStep} of 4
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(prev => prev - 1)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-container)] text-[var(--on-surface)]"
              >
                Back
              </button>
            )}
            {activeStep < 4 ? (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--on-primary)]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Content'}
              </button>
            )}
          </div>
        </div>
        
        {/* Step Indicator */}
        <div className="px-6 py-2 border-t border-[var(--outline-variant)]/20">
          <div className="flex items-center gap-2 max-w-2xl">
            {['Basic Info', 'Media & Taxonomy', 'Downloads', 'Review'].map((step, index) => (
              <button
                key={step}
                onClick={() => setActiveStep(index + 1)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeStep === index + 1
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : activeStep > index + 1
                    ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                    : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Content Type Selector */}
                <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
                  <h2 className="font-display font-semibold text-lg mb-4">Content Type</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {contentTypes.map((type) => {
                      const Icon = contentTypeIcons[type.name] || Film;
                      return (
                        <button
                          key={type.name}
                          onClick={() => setFormData(prev => ({ ...prev, content_type: type.name }))}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.content_type === type.name
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                              : 'border-[var(--outline-variant)]/30 hover:border-[var(--primary)]/50'
                          }`}
                        >
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${formData.content_type === type.name ? 'text-[var(--primary)]' : ''}`} />
                          <p className="font-medium text-center">{type.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Multi-Source API Search */}
                <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                      <AutoFixHigh className="w-5 h-5 text-[var(--primary)]" />
                      Auto-fill from External APIs
                    </h2>
                    {selectedApiData?._meta?.confidence && (
                      <ConfidenceIndicator 
                        score={selectedApiData._meta.confidence.score} 
                        level={selectedApiData._meta.confidence.level} 
                      />
                    )}
                  </div>
                  
                  {/* API Source Selector - Only for Movies */}
                  {formData.content_type === 'movie' && (
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-[var(--on-surface-variant)]">API Source:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApiSourceChange('tmdb')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            apiSource === 'tmdb'
                              ? 'bg-blue-500 text-white'
                              : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
                          }`}
                        >
                          TMDB
                        </button>
                        <button
                          onClick={() => handleApiSourceChange('omdb')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            apiSource === 'omdb'
                              ? 'bg-orange-500 text-white'
                              : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
                          }`}
                        >
                          OMDB
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedApiData?._meta?.source && (
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[var(--surface-container-low)]">
                      <span className="text-sm text-[var(--on-surface-variant)]">Data source:</span>
                      <SourceBadge source={selectedApiData._meta.source} />
                      {selectedApiData._meta.found === false && (
                        <span className="text-xs text-amber-500 ml-2">
                          (No results found)
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
                        <input
                          type="text"
                          value={apiQuery}
                          onChange={handleApiQueryChange}
                          placeholder={`Search ${formData.content_type === 'movie' ? 'movies' : formData.content_type === 'anime' ? 'anime' : 'web series'}...`}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                        />
                        {apiLoading && (
                          <CircularProgress size={20} className="absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                    
                    {showApiDropdown && apiResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[var(--surface)] border shadow-xl z-50 max-h-80 overflow-y-auto"
                      >
                        {apiResults.map((result) => (
                          <button
                            key={`${result.source}-${result.sourceId}`}
                            onClick={() => loadContentDetails(result)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-container)] text-left"
                          >
                            {result.posterUrl ? (
                              <img src={result.posterUrl} alt="" className="w-12 h-16 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-16 rounded bg-[var(--surface-container)] flex items-center justify-center">
                                <MovieIcon className="w-6 h-6" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{result.title}</p>
                                <SourceBadge source={result.source} />
                              </div>
                              <p className="text-sm text-[var(--on-surface-variant)]">
                                {result.year} • ⭐ {result.rating?.toFixed(1) || 'N/A'}
                                {result.episodes && ` • ${result.episodes} eps`}
                              </p>
                              {result.network && (
                                <p className="text-xs text-[var(--on-surface-variant)]">{result.network}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  
                  <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                    {formData.content_type === 'movie' && (
                      apiSource === 'tmdb' 
                        ? "Using TMDB - Search movies by title" 
                        : "Using OMDB (Open Movie Database) - Search movies by title"
                    )}
                    {formData.content_type === 'anime' && "Using Jikan (MyAnimeList) - Search anime by title"}
                    {formData.content_type === 'web_series' && "Using TVMaze - Search web series by title"}
                  </p>
                </div>

                {/* Basic Information Fields */}
                <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
                  <h2 className="font-display font-semibold text-lg mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Tagline</label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Rating (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Release Year *</label>
                      <input
                        type="number"
                        min="1900"
                        max="2099"
                        value={formData.release_year}
                        onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                        placeholder="e.g., 120"
                      />
                    </div>

                    {/* Episode fields for series/anime */}
                    {(formData.content_type === 'web_series' || formData.content_type === 'anime') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Total Episodes</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.total_episodes}
                            onChange={(e) => setFormData({ ...formData, total_episodes: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Seasons</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.seasons}
                            onChange={(e) => setFormData({ ...formData, seasons: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Media & Taxonomy */}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Media Upload */}
                <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
                  <h2 className="font-display font-semibold text-lg mb-4">Media</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Poster URL</label>
                        <input
                          type="url"
                          value={formData.poster_url}
                          onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          placeholder="https://example.com/poster.jpg"
                        />
                        {formData.poster_url && (
                          <div className="mt-2">
                            <img src={formData.poster_url} alt="Poster preview" className="w-32 h-48 object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Backdrop URL</label>
                        <input
                          type="url"
                          value={formData.backdrop_url}
                          onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          placeholder="https://example.com/backdrop.jpg"
                        />
                        {formData.backdrop_url && (
                          <div className="mt-2">
                            <img src={formData.backdrop_url} alt="Backdrop preview" className="w-32 h-20 object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scene Images Gallery */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Scene Images Gallery</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="url"
                          value={sceneUrl}
                          onChange={(e) => setSceneUrl(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addScene()}
                          className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          placeholder="Add scene image URL..."
                        />
                        <button
                          onClick={addScene}
                          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)]"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Scene Images Preview Grid */}
                      {formData.scenes_gallery.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {formData.scenes_gallery.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Scene ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12" font-family="sans-serif"%3EImage Error%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <button
                                onClick={() => removeScene(url)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                                <p className="text-xs text-white truncate">Scene {index + 1}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {formData.scenes_gallery.length === 0 && (
                        <div className="p-8 border-2 border-dashed border-[var(--outline-variant)]/30 rounded-lg text-center">
                          <Inventory className="w-12 h-12 mx-auto mb-2 text-[var(--on-surface-variant)]" />
                          <p className="text-sm text-[var(--on-surface-variant)]">No scene images added yet</p>
                          <p className="text-xs text-[var(--on-surface-variant)] mt-1">Add scene images to showcase content visuals</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Taxonomy Selection */}
                <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
                  <h2 className="font-display font-semibold text-lg mb-4">Taxonomy</h2>
                  <div className="space-y-4">
                    {/* Genres */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Genres</label>
                      <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => (
                          <button
                            key={genre.id}
                            onClick={() => toggleGenre(genre.name)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              formData.genre_names?.includes(genre.name)
                                ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                                : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
                            }`}
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Industries */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Industries</label>
                      <div className="flex flex-wrap gap-2">
                        {industries.map((industry) => (
                          <button
                            key={industry.id}
                            onClick={() => toggleIndustry(industry.name)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              formData.industry_names?.[0] === industry.name.replace(/[\[(].*?[\])]/g, '').trim()
                                ? 'bg-[var(--tertiary)] text-[var(--on-tertiary)]'
                                : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
                            }`}
                          >
                            {industry.name.replace(/[\[(].*?[\])]/g, '').trim()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cast */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Cast</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={castInput}
                          onChange={(e) => setCastInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCast()}
                          className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          placeholder="Add cast member..."
                        />
                        <button
                          onClick={addCast}
                          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)]"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.cast.map((member) => (
                          <span
                            key={member}
                            className="px-3 py-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] flex items-center gap-2"
                          >
                            {member}
                            <button
                              onClick={() => removeCast(member)}
                              className="text-[var(--error)] hover:text-[var(--error)]/80"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Downloads */}
            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
                  <h2 className="font-display font-semibold text-lg mb-4">Download Options</h2>
                  
                  {/* Toggle for parts mode */}
                  <div className="flex items-center gap-4 mb-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_in_parts}
                        onChange={(e) => setFormData({ ...formData, is_in_parts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[var(--surface-bright)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]" />
                    </label>
                    <span className="text-sm font-medium">
                      {formData.is_in_parts ? 'Download by Parts' : 'Single Download'}
                    </span>
                  </div>

                  {!formData.is_in_parts ? (
                    /* Single Download Mode */
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <select
                          value={downloadQuality}
                          onChange={(e) => setDownloadQuality(e.target.value)}
                          className="px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                        >
                          <option value="360p">360p</option>
                          <option value="480p">480p</option>
                          <option value="720p">720p</option>
                          <option value="1080p">1080p</option>
                          <option value="2160p">2160p</option>
                          <option value="4K">4K</option>
                        </select>
                        <input
                          type="url"
                          value={downloadUrl}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          placeholder="Download URL"
                        />
                        <button
                          onClick={addDownload}
                          disabled={!downloadUrl.trim()}
                          className="px-4 py-2 rounded-lg bg-[var(--success)] text-[var(--on-success)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(formData.download_urls).map(([quality, url]) => (
                          <div key={quality} className="flex items-center gap-3 p-3 bg-[var(--surface-container-low)] rounded-lg">
                            <span className="px-2 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded text-sm font-medium">
                              {quality}
                            </span>
                            <span className="flex-1 truncate text-sm">{url}</span>
                            <button
                              onClick={() => removeDownload(quality)}
                              className="text-[var(--error)] hover:text-[var(--error)]/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Parts Mode */
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={newPart.name}
                          onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                          className="px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          placeholder="Part name (e.g., Part 1)"
                        />
                        <input
                          type="text"
                          value={newPart.episode_range}
                          onChange={(e) => setNewPart({ ...newPart, episode_range: e.target.value })}
                          className="px-4 py-2 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                          placeholder="Episode range (e.g., 1-10)"
                        />
                        <button
                          onClick={addDownloadPart}
                          className="px-4 py-2 rounded-lg bg-[var(--success)] text-[var(--on-success)]"
                        >
                          Add Part
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.download_parts.map((part) => (
                          <div key={part.id} className="p-4 bg-[var(--surface-container-low)] rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{part.name}</h4>
                              <span className="text-sm text-[var(--on-surface-variant)]">{part.episode_range}</span>
                              <button
                                onClick={() => removeDownloadPart(part.id)}
                                className="text-[var(--error)] hover:text-[var(--error)]/80"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {Object.entries(part.downloads || {}).map(([quality, url]) => (
                                <div key={quality} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={quality}
                                    onChange={(e) => updateDownloadPart(part.id, e.target.value, url)}
                                    className="w-20 px-2 py-1 rounded bg-[var(--surface)] border border-[var(--outline-variant)]/30 text-sm"
                                  />
                                  <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => updateDownloadPart(part.id, quality, e.target.value)}
                                    className="flex-1 px-2 py-1 rounded bg-[var(--surface)] border border-[var(--outline-variant)]/30 text-sm"
                                    placeholder="Download URL"
                                  />
                                </div>
                              ))}
                              <button
                                onClick={() => updateDownloadPart(part.id, '', '')}
                                className="px-2 py-1 rounded bg-[var(--primary)] text-[var(--on-primary)] text-sm"
                              >
                                Add Quality
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Video URL</label>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30"
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {activeStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
                  <h2 className="font-display font-semibold text-lg mb-4">Review & Publish</h2>
                  
                  {/* Status Toggles */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <label className="flex items-center gap-3 p-4 rounded-lg bg-[var(--surface-container-low)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.visible}
                        onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                        className="w-5 h-5 text-[var(--primary)]"
                      />
                      <div>
                        <p className="font-medium">Visible</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">Show to public</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 rounded-lg bg-[var(--surface-container-low)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 text-[var(--warning)]"
                      />
                      <div>
                        <p className="font-medium">Featured</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">Show on homepage</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 rounded-lg bg-[var(--surface-container-low)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.trending}
                        onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                        className="w-5 h-5 text-[var(--tertiary)]"
                      />
                      <div>
                        <p className="font-medium">Trending</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">Show in trending</p>
                      </div>
                    </label>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-[var(--surface-bright)] rounded-lg">
                    <h3 className="font-medium mb-3">Content Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--on-surface-variant)]">Title:</span>
                        <p className="font-medium">{formData.name || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="text-[var(--on-surface-variant)]">Type:</span>
                        <p className="font-medium capitalize">{formData.content_type}</p>
                      </div>
                      <div>
                        <span className="text-[var(--on-surface-variant)]">Year:</span>
                        <p className="font-medium">{formData.release_year || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="text-[var(--on-surface-variant)]">Rating:</span>
                        <p className="font-medium">{formData.rating || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="text-[var(--on-surface-variant)]">Genres:</span>
                        <p className="font-medium">
                          {formData.genre_names.join(', ') || 'None'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--on-surface-variant)]">Industry:</span>
                        <p className="font-medium">
                          {formData.industry_names?.[0] || 'None'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--on-surface-variant)]">Downloads:</span>
                        <p className="font-medium">
                          {formData.is_in_parts ? `${formData.download_parts.length} parts` : `${Object.keys(formData.download_urls).length} qualities`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
