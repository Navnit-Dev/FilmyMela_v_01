'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Avatar,
  Skeleton,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  DragHandle,
  Movie,
  ArrowUpward,
  ArrowDownward,
  Search,
} from '@mui/icons-material';
import Image from 'next/image';
import { useToast } from '@/components/toast';
import { motion } from 'motion/react';

export default function MovieSequencePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movies, setMovies] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter movies based on search
  const filteredMovies = movies.filter(movie =>
    movie.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
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
            <Box>
              <Typography variant="h6" fontWeight={700}>Manage Sequence</Typography>
              <Typography variant="caption" color="text.secondary">Drag & drop to reorder movie display</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: 3 }}
          >
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Search Filter */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search movies by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          {/* Instructions */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <DragHandle sx={{ color: 'white' }} />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                Drag and drop movies to reorder them. Click Save Order when done.
                You can also use the arrow buttons to move items up or down.
              </Typography>
            </CardContent>
          </Card>

          {/* Movie List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filteredMovies.map((movie, index) => (
              <Card
                key={movie.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                sx={{
                  cursor: 'move',
                  '&:hover': { borderColor: 'primary.main', border: 1 },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  {/* Drag Handle */}
                  <Avatar sx={{ bgcolor: 'background.paper', width: 36, height: 36 }}>
                    <DragHandle color="action" />
                  </Avatar>

                  {/* Sequence Number */}
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
                    {index + 1}
                  </Avatar>

                  {/* Movie Poster */}
                  <Avatar
                    variant="rounded"
                    src={movie.poster_url}
                    sx={{ width: 48, height: 64, bgcolor: 'background.paper' }}
                  >
                    <Movie />
                  </Avatar>

                  {/* Movie Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>{movie.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {movie.industry} • {movie.release_year} • {movie.rating}/10
                    </Typography>
                  </Box>

                  {/* Move Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => moveDown(index)}
                      disabled={index === movies.length - 1}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {filteredMovies.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Movie sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                {searchQuery ? 'No movies match your search' : 'No movies found'}
              </Typography>
              <Link href="/admin/movies/new" passHref style={{ textDecoration: 'none' }}>
                <Typography color="primary" sx={{ mt: 2, display: 'inline-block' }}>
                  Add your first movie
                </Typography>
              </Link>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
