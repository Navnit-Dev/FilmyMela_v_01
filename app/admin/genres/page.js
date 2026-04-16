'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Search,
  LocalOffer,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

export default function GenreManagementPage() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  
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
      toast.error('Error fetching genres: ' + error.message);
    } finally {
      setLoading(false);
    }
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
        toast.success('Genre created successfully');
        setShowModal(false);
        setEditingGenre(null);
        resetForm();
        fetchGenres();
      } else {
        const error = await res.json();
        toast.error('Error creating genre: ' + error.message);
      }
    } catch (error) {
      toast.error('Error creating genre: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this genre?')) return;
    
    try {
      const res = await fetch(`/api/admin/genres/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Genre deleted successfully');
        fetchGenres();
      } else {
        toast.error('Error deleting genre: ' + error.message);
      }
    } catch (error) {
      toast.error('Error deleting genre: ' + error.message);
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
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
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
              <Typography variant="h6" fontWeight={700}>Genre Management</Typography>
              <Typography variant="caption" color="text.secondary">{genres.length} genres</Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openCreateModal} sx={{ borderRadius: 3 }}>
            Add Genre
          </Button>
        </Box>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Search */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 500, mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          {/* Genres Grid */}
          <Grid container spacing={3}>
            {filteredGenres.map((genre) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={genre.id}>
                <Card sx={{ position: 'relative', '&:hover .actions': { opacity: 1 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: genre.color || '#6366f1' }}>
                          <LocalOffer sx={{ color: 'white' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>{genre.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{genre.slug}</Typography>
                        </Box>
                      </Box>
                      <Box className="actions" sx={{ opacity: { xs: 1, md: 0 }, transition: 'opacity 0.2s' }}>
                        <IconButton size="small" onClick={() => openEditModal(genre)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(genre.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {genre.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineClamp: 2 }}>
                        {genre.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Order: {genre.sort_order}</Typography>
                      <Chip 
                        label={genre.is_active ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={genre.is_active ? 'success' : 'error'}
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredGenres.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'action.hover' }}>
                <LocalOffer sx={{ fontSize: 32, color: 'text.secondary' }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>No genres found</Typography>
              <Typography variant="body2" color="text.secondary">Create your first genre to get started</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGenre ? 'Edit Genre' : 'Add New Genre'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Slug (auto-generated if empty)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Icon (emoji)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Sort Order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                sx={{ flex: 1 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Color</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {presetColors.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: color,
                      cursor: 'pointer',
                      border: formData.color === color ? '2px solid white' : 'none',
                      boxShadow: formData.color === color ? '0 0 0 2px #e91e63' : 'none',
                    }}
                  />
                ))}
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} variant="outlined" sx={{ borderRadius: 3 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 3 }}>
            {editingGenre ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
