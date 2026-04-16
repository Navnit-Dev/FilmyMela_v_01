'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Pagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  ArrowBack,
  People,
  Search,
  MoreVert,
  Block,
  CheckCircle,
  Delete,
  CalendarToday,
  Security,
} from '@mui/icons-material';

export default function UserManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    checkAuthAndFetch();
  }, [currentPage, searchQuery, filterStatus]);

  const checkAuthAndFetch = async () => {
    try {
      const meRes = await fetch('/api/admin/me');
      if (!meRes.ok) {
        router.push('/admin');
        return;
      }
      const meData = await meRes.json();
      
      if (!['SuperAdmin', 'Admin'].includes(meData.role)) {
        router.push('/admin/dashboard');
        return;
      }
      
      setIsAdmin(true);
      await fetchUsers();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });
      
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        fetchUsers();
        setAnchorEl(null);
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'banned': return 'error';
      default: return 'default';
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (!isAdmin) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    );
  }

  const stats = [
    { label: 'Total Users', value: totalCount, icon: People },
    { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: CheckCircle },
    { label: 'New This Week', value: users.filter(u => {
      const created = new Date(u.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created > weekAgo;
    }).length, icon: CalendarToday },
    { label: 'Banned', value: users.filter(u => u.status === 'banned').length, icon: Block },
  ];

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
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People /> User Management
              </Typography>
              <Typography variant="caption" color="text.secondary">{totalCount} total users</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <FormControl size="small" sx={{ width: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="banned">Banned</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <Card>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <stat.icon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                      <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Users Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Skeleton variant="rectangular" height={100} />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>{user.name || 'Unknown'}</Typography>
                            {user.is_verified && (
                              <Chip label="Verified" size="small" color="success" sx={{ height: 20 }} />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.status} color={getStatusColor(user.status)} size="small" />
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={() => setAnchorEl(null)}
                        >
                          {user.status !== 'banned' ? (
                            <MenuItem onClick={() => handleUserAction(user.id, 'ban')} sx={{ color: 'error.main' }}>
                              <Block fontSize="small" sx={{ mr: 1 }} /> Ban User
                            </MenuItem>
                          ) : (
                            <MenuItem onClick={() => handleUserAction(user.id, 'unban')} sx={{ color: 'success.main' }}>
                              <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Unban User
                            </MenuItem>
                          )}
                          <MenuItem onClick={() => handleUserAction(user.id, 'delete')} sx={{ color: 'error.main' }}>
                            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete User
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
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
      </Box>
    </Box>
  );
}
