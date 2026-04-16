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
  Skeleton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Security,
  Add,
  Edit,
  Delete,
  Shield,
  Person,
  Lock,
  Email,
  Close,
  PowerSettingsNew,
} from '@mui/icons-material';

// Simple toast notification helper
const useToast = () => {
  const showToast = (message, type = 'info') => {
    console.log(`[${type}] ${message}`);
  };
  return { showToast };
};

export default function AdminManagementPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    status: 'active'
  });

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      // Check current user role
      const meRes = await fetch('/api/admin/me');
      if (!meRes.ok) {
        router.push('/admin');
        return;
      }
      const meData = await meRes.json();
      
      if (meData.role !== 'SuperAdmin') {
        showToast('Only SuperAdmin can manage admins', 'error');
        router.push('/admin/dashboard');
        return;
      }
      
      setIsSuperAdmin(true);
      await fetchAdmins();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      showToast('Failed to fetch admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast('Admin created successfully', 'success');
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'Admin', status: 'active' });
        fetchAdmins();
      } else {
        const error = await res.json();
        showToast(error.error || 'Failed to create admin', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/admin/admins/${currentAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          status: formData.status
        })
      });

      if (res.ok) {
        showToast('Admin updated successfully', 'success');
        setShowEditModal(false);
        fetchAdmins();
      } else {
        const error = await res.json();
        showToast(error.error || 'Failed to update admin', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const toggleAdminStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'disabled' : 'active';
    
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`Admin ${newStatus === 'active' ? 'activated' : 'disabled'}`, 'success');
        fetchAdmins();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const deleteAdmin = async (admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.name}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast('Admin deleted successfully', 'success');
        fetchAdmins();
      } else {
        showToast('Failed to delete admin', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const openEditModal = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      status: admin.status
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    );
  }

  if (!isSuperAdmin) return null;

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
              <Typography variant="h6" fontWeight={700}>Admin Management</Typography>
              <Typography variant="caption" color="text.secondary">Manage admin users (SuperAdmin only)</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setFormData({ name: '', email: '', password: '', role: 'Admin', status: 'active' });
              setShowAddModal(true);
            }}
            sx={{ borderRadius: 3 }}
          >
            Add Admin
          </Button>
        </Box>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Security sx={{ color: 'white' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{admins.filter(a => a.role === 'SuperAdmin').length}</Typography>
                    <Typography variant="body2" color="text.secondary">SuperAdmins</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <Shield sx={{ color: 'white' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{admins.filter(a => a.role === 'Admin').length}</Typography>
                    <Typography variant="body2" color="text.secondary">Admins</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <PowerSettingsNew sx={{ color: 'white' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{admins.filter(a => a.status === 'active').length}</Typography>
                    <Typography variant="body2" color="text.secondary">Active</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Admins Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {admin.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>{admin.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell color="text.secondary">{admin.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={admin.role}
                        color={admin.role === 'SuperAdmin' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={admin.status}
                        color={admin.status === 'active' ? 'success' : 'error'}
                        size="small"
                        sx={{ borderRadius: 2, cursor: 'pointer' }}
                        onClick={() => toggleAdminStatus(admin)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditModal(admin)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteAdmin(admin)}
                        disabled={admin.role === 'SuperAdmin' && admins.filter(a => a.role === 'SuperAdmin').length === 1}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Add Admin Modal */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add New Admin
          <IconButton onClick={() => setShowAddModal(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddAdmin} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Password (min 6 chars)"
              type="password"
              required
              fullWidth
              inputProps={{ minLength: 6 }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
              </Select>
            </FormControl>
            <DialogActions>
              <Button onClick={() => setShowAddModal(false)} variant="outlined" sx={{ borderRadius: 3 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" sx={{ borderRadius: 3 }}>
                Create Admin
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Admin
          <IconButton onClick={() => setShowEditModal(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditAdmin} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
            <DialogActions>
              <Button onClick={() => setShowEditModal(false)} variant="outlined" sx={{ borderRadius: 3 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" sx={{ borderRadius: 3 }}>
                Save Changes
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
