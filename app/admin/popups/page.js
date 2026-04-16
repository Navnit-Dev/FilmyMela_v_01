'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tooltip,
  Chip,
  Divider,
  Stack,
  Avatar,
  Badge,
  LinearProgress,
  Backdrop,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  NotificationsActive as PopupIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PopupsManagement() {
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    button_text: '',
    button_url: '',
    is_active: false,
    show_after_seconds: 5,
    show_once_per_session: true,
  });

  useEffect(() => {
    fetchPopup();
  }, []);

  const fetchPopup = async () => {
    try {
      const { data, error } = await supabase
        .from('popups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      setPopup(data?.[0] || null);
      if (data?.[0]) {
        setFormData(data[0]);
      }
    } catch (error) {
      toast.error('Error fetching popups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (popup) {
        // Update existing popup
        const { error } = await supabase
          .from('popups')
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            button_text: formData.button_text,
            button_url: formData.button_url,
            is_active: formData.is_active,
            show_after_seconds: formData.show_after_seconds,
            show_once_per_session: formData.show_once_per_session,
            updated_at: new Date().toISOString(),
          })
          .eq('id', popup.id);

        if (error) throw error;
        toast.success('Popup updated successfully');
      } else {
        // Create new popup
        const { error } = await supabase
          .from('popups')
          .insert({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            button_text: formData.button_text,
            button_url: formData.button_url,
            is_active: formData.is_active,
            show_after_seconds: formData.show_after_seconds,
            show_once_per_session: formData.show_once_per_session,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success('Popup created successfully');
      }

      await fetchPopup();
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to save popup');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this popup? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('popups')
        .delete()
        .eq('id', popup.id);

      if (error) throw error;
      toast.success('Popup deleted successfully');
      await fetchPopup();
    } catch (error) {
      toast.error('Failed to delete popup');
    }
  };

  const handleToggleActive = async () => {
    const action = !popup.is_active ? 'enable' : 'disable';
    if (!confirm(`Are you sure you want to ${action} this popup?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('popups')
        .update({
          is_active: !popup.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', popup.id);

      if (error) throw error;
      toast.success(`Popup ${!popup.is_active ? 'enabled' : 'disabled'} successfully`);
      await fetchPopup();
    } catch (error) {
      toast.error('Failed to toggle popup status');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <PopupIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Popups Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage promotional popups for user engagement
                </Typography>
              </Box>
            </Box>
            
            {popup && (
              <Stack direction="row" spacing={1}>
                <Badge 
                  badgeContent={popup.is_active ? 'Active' : 'Inactive'} 
                  color={popup.is_active ? 'success' : 'error'}
                  overlap="circular"
                >
                  <Tooltip title={popup.is_active ? 'Disable Popup' : 'Enable Popup'}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={popup.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      onClick={handleToggleActive}
                      sx={{ 
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': { 
                          borderColor: 'rgba(255,255,255,0.8)',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      {popup.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </Tooltip>
                </Badge>
                
                <Tooltip title="Edit Popup">
                  <IconButton
                    onClick={() => setEditMode(true)}
                    sx={{ 
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete Popup">
                  <IconButton
                    onClick={handleDelete}
                    sx={{ 
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Box>
        </Paper>

        {/* Content */}
        {editMode ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PopupIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {popup ? 'Edit Popup' : 'Create New Popup'}
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: <TitleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    InputProps={{
                      startAdornment: <DescriptionIcon sx={{ mt: 1, mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    InputProps={{
                      startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Button Text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="Learn More"
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Button URL"
                    value={formData.button_url}
                    onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                    placeholder="https://example.com"
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Show After (seconds)"
                    type="number"
                    value={formData.show_after_seconds}
                    onChange={(e) => setFormData({ ...formData, show_after_seconds: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0 }}
                    InputProps={{
                      startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          color="primary"
                        />
                      }
                      label="Active"
                      sx={{ flexGrow: 1 }}
                    />
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.show_once_per_session}
                          onChange={(e) => setFormData({ ...formData, show_once_per_session: e.target.checked })}
                          color="primary"
                        />
                      }
                      label="Show Once Per Session"
                      sx={{ flexGrow: 1 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setEditMode(false);
                    if (popup) {
                      setFormData(popup);
                    } else {
                      setFormData({
                        title: '',
                        description: '',
                        image_url: '',
                        button_text: '',
                        button_url: '',
                        is_active: false,
                        show_after_seconds: 5,
                        show_once_per_session: true,
                      });
                    }
                  }}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving || !formData.title}
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        ) : popup ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ height: '100%' }}>
                  {popup.image_url && (
                    <CardMedia
                      component="img"
                      height="300"
                      image={popup.image_url}
                      alt={popup.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <TitleIcon />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {popup.title}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mt: 0.5 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {popup.description || 'No description provided'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                            <LinkIcon />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Button Text
                            </Typography>
                            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                              {popup.button_text || 'No button text'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                            <ScheduleIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Show After
                            </Typography>
                            <Typography variant="body1">
                              {popup.show_after_seconds} seconds
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                            <VisibilityIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Status
                            </Typography>
                            <Chip
                              label={popup.is_active ? 'Active' : 'Inactive'}
                              color={popup.is_active ? 'success' : 'error'}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            <SettingsIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Show Once Per Session
                            </Typography>
                            <Chip
                              label={popup.show_once_per_session ? 'Yes' : 'No'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                  
                  <Stack spacing={2} sx={{ flexGrow: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                    >
                      Edit Popup
                    </Button>
                    
                    <Button
                      fullWidth
                      variant={popup.is_active ? 'outlined' : 'contained'}
                      color={popup.is_active ? 'error' : 'success'}
                      startIcon={popup.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      onClick={handleToggleActive}
                    >
                      {popup.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                    >
                      Delete Popup
                    </Button>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 6, textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 3,
                fontSize: 40
              }}>
                <PopupIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                No popup created yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                Create your first popup to engage with your users. Popups can be used for announcements, promotions, or important updates.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setEditMode(true)}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2
                }}
              >
                Create Your First Popup
              </Button>
            </Paper>
          </motion.div>
        )}
      </motion.div>
      
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={saving}
      >
        <Fade in={saving}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Saving popup...
            </Typography>
          </Box>
        </Fade>
      </Backdrop>
    </Box>
  );
}
