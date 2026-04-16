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
  Business,
  Public,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

export default function IndustryManagementPage() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    country: '',
    icon: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const res = await fetch('/api/admin/industries');
      if (res.ok) {
        const data = await res.json();
        setIndustries(data.industries || []);
      }
    } catch (error) {
      toast.error('Error fetching industries: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingIndustry ? `/api/admin/industries/${editingIndustry.id}` : '/api/admin/industries';
      const method = editingIndustry ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Industry created successfully');
        setShowModal(false);
        setEditingIndustry(null);
        resetForm();
        fetchIndustries();
      } else {
        const error = await res.json();
        toast.error('Error creating industry: ' + error.message);
      }
    } catch (error) {
      toast.error('Error creating industry: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this industry?')) return;
    
    try {
      const res = await fetch(`/api/admin/industries/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Industry deleted successfully');
        fetchIndustries();
      } else {
        toast.error('Error deleting industry: ' + error.message);
      }
    } catch (error) {
      toast.error('Error deleting industry: ' + error.message);
    }
  };

  const openEditModal = (industry) => {
    setEditingIndustry(industry);
    setFormData({
      name: industry.name,
      slug: industry.slug,
      description: industry.description || '',
      country: industry.country || '',
      icon: industry.icon || '',
      is_active: industry.is_active,
      sort_order: industry.sort_order || 0
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingIndustry(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      country: '',
      icon: '',
      is_active: true,
      sort_order: 0
    });
  };

  const filteredIndustries = industries.filter(industry =>
    industry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    industry.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Typography variant="h6" fontWeight={700}>Industry Management</Typography>
              <Typography variant="caption" color="text.secondary">{industries.length} industries</Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openCreateModal} sx={{ borderRadius: 3 }}>
            Add Industry
          </Button>
        </Box>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Search */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search industries..."
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

          {/* Industries Grid */}
          <Grid container spacing={3}>
            {filteredIndustries.map((industry) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={industry.id}>
                <Card sx={{ position: 'relative', '&:hover .actions': { opacity: 1 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Business sx={{ color: 'white' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>{industry.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{industry.slug}</Typography>
                        </Box>
                      </Box>
                      <Box className="actions" sx={{ opacity: { xs: 1, md: 0 }, transition: 'opacity 0.2s' }}>
                        <IconButton size="small" onClick={() => openEditModal(industry)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(industry.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {industry.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineClamp: 2 }}>
                        {industry.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <Public fontSize="small" />
                        <Typography variant="caption">{industry.country || 'International'}</Typography>
                      </Box>
                      <Chip 
                        label={industry.is_active ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={industry.is_active ? 'success' : 'error'}
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredIndustries.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'action.hover' }}>
                <Business sx={{ fontSize: 32, color: 'text.secondary' }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>No industries found</Typography>
              <Typography variant="body2" color="text.secondary">Create your first industry to get started</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndustry ? 'Edit Industry' : 'Add New Industry'}</DialogTitle>
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., USA, India"
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
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Icon (emoji)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🎬"
              fullWidth
            />
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
            {editingIndustry ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
