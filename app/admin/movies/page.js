'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  InputAdornment,
  Tooltip,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  TrendingUp,
  Star,
  ArrowBack,
  OpenInNew,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

export default function AdminMoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [filterHasScenes, setFilterHasScenes] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMovies();
  }, [currentPage, searchQuery, filterHasScenes]);

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
      toast.error('Error fetching movies: ' + error.message);
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
        toast.success('Movie deleted successfully');
      } else {
        toast.error('Failed to delete movie');
      }
    } catch (error) {
      toast.error('Error deleting movie');
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
          m.id === movie.id ? { ...m, visible: !movie.visible } : m
        ));
        toast.success(`Movie ${movie.visible ? 'hidden' : 'visible'}`);
      } else {
        toast.error('Failed to update movie');
      }
    } catch (error) {
      toast.error('Error updating movie');
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
          m.id === movie.id ? { ...m, featured: !movie.featured } : m
        ));
        toast.success(`Movie ${movie.featured ? 'unfeatured' : 'featured'}`);
      } else {
        toast.error('Failed to update movie');
      }
    } catch (error) {
      toast.error('Error updating movie');
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
          m.id === movie.id ? { ...m, trending: !movie.trending } : m
        ));
        toast.success(`Movie ${movie.trending ? 'removed from' : 'added to'} trending`);
      } else {
        toast.error('Failed to update movie');
      }
    } catch (error) {
      toast.error('Error updating movie');
    }
  };

  // Filter movies based on search, type, visibility and has_scenes
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = !searchQuery || 
      movie.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || movie.content_type === filterType;
    const matchesVisibility = filterVisibility === 'all' || 
      (filterVisibility === 'visible' && movie.visible) ||
      (filterVisibility === 'hidden' && !movie.visible);
    // Check scenes_gallery length directly for Non-Scened status
    const hasScenesGallery = movie.scenes_gallery && movie.scenes_gallery.length > 0;
    const matchesHasScenes = filterHasScenes === 'all' || 
      (filterHasScenes === 'true' && hasScenesGallery) ||
      (filterHasScenes === 'false' && !hasScenesGallery);
    
    return matchesSearch && matchesType && matchesVisibility && matchesHasScenes;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper sx={{ position: 'sticky', top: 0, zIndex: 40, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link href="/admin/dashboard" passHref style={{ textDecoration: 'none' }}>
              <IconButton>
                <ArrowBack />
              </IconButton>
            </Link>
            <Typography variant="h6" fontWeight={700}>Movie Management</Typography>
          </Box>
          <Link href="/admin/movies/new" passHref style={{ textDecoration: 'none' }}>
            <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 3 }}>
              Add Movie
            </Button>
          </Link>
        </Box>
      </Paper>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Content Type"
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="movie">Movies</MenuItem>
              <MenuItem value="anime">Anime</MenuItem>
              <MenuItem value="web_series">Web Series</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Visibility</InputLabel>
            <Select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              label="Visibility"
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="visible">Visible</MenuItem>
              <MenuItem value="hidden">Hidden</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Scenes Status</InputLabel>
            <Select
              value={filterHasScenes}
              onChange={(e) => setFilterHasScenes(e.target.value)}
              label="Scenes Status"
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="all">All Movies</MenuItem>
              <MenuItem value="true">Has Scenes</MenuItem>
              <MenuItem value="false">Non-Scened</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Movies Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Movie</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMovies.map((movie) => (
                <TableRow key={movie.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar variant="rounded" sx={{ width: 48, height: 64, bgcolor: 'background.paper' }}>
                        {movie.poster_url ? (
                          <Image src={movie.poster_url} alt={movie.name} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <Typography variant="caption" color="text.secondary">No img</Typography>
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{movie.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{movie.genre?.join(', ')}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={movie.industry} size="small" sx={{ borderRadius: 2 }} />
                  </TableCell>
                  <TableCell>{movie.release_year}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Tooltip title={movie.visible ? 'Visible' : 'Hidden'}>
                        <IconButton size="small" onClick={() => toggleVisibility(movie)} color={movie.visible ? 'success' : 'default'}>
                          {movie.visible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={movie.featured ? 'Featured' : 'Not Featured'}>
                        <IconButton size="small" onClick={() => toggleFeatured(movie)} color={movie.featured ? 'warning' : 'default'}>
                          <Star fontSize="small" sx={{ color: movie.featured ? '#f59e0b' : undefined }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={movie.trending ? 'Trending' : 'Not Trending'}>
                        <IconButton size="small" onClick={() => toggleTrending(movie)} color={movie.trending ? 'primary' : 'default'}>
                          <TrendingUp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {(!movie.scenes_gallery || movie.scenes_gallery.length === 0) && (
                        <Chip 
                          label="Non-Scened" 
                          size="small" 
                          color="error" 
                          sx={{ borderRadius: 1, fontSize: '0.7rem', height: 24 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Link href={`/movie/${movie.id}`} target="_blank" passHref style={{ textDecoration: 'none' }}>
                        <Tooltip title="View">
                          <IconButton size="small">
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Link>
                      <Link href={`/admin/movies/${movie.id}/edit`} passHref style={{ textDecoration: 'none' }}>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Link>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => { setMovieToDelete(movie); setDeleteModalOpen(true); }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMovies.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'action.hover' }}>
                      <Search sx={{ fontSize: 32, color: 'text.secondary' }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>No movies found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {searchQuery ? 'Try a different search term' : 'Add your first movie to get started'}
                    </Typography>
                    <Link href="/admin/movies/new" passHref style={{ textDecoration: 'none' }}>
                      <Button variant="contained" startIcon={<Add />}>
                        Add Movie
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </TableContainer>
      </Box>

      {/* Delete Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'error.main' }}>
            <Delete sx={{ color: 'white' }} />
          </Avatar>
          Delete Movie
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{movieToDelete?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} variant="outlined" sx={{ borderRadius: 3 }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 3 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
