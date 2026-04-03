'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Avatar,
  Skeleton,
  Fade,
} from '@mui/material';
import {
  Movie as MovieIcon,
  TrendingUp,
  Star,
  People,
  Add,
  Edit,
  ArrowForward,
} from '@mui/icons-material';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Movies', value: stats?.totalMovies || 0, icon: MovieIcon, color: 'primary' },
    { label: 'Trending', value: stats?.trendingMovies || 0, icon: TrendingUp, color: 'secondary' },
    { label: 'Featured', value: stats?.featuredMovies || 0, icon: Star, color: 'warning' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: People, color: 'success' },
  ];

  const contentTypeCards = [
    { label: 'Movies', value: stats?.contentTypeStats?.movies || 0, icon: MovieIcon, href: '/admin/movies?type=movie', color: '#3b82f6' },
    { label: 'Web Series', value: stats?.contentTypeStats?.webSeries || 0, icon: TrendingUp, href: '/admin/movies?type=web_series', color: '#8b5cf6' },
    { label: 'Anime', value: stats?.contentTypeStats?.anime || 0, icon: Star, href: '/admin/movies?type=anime', color: '#ec4899' },
  ];

  const quickActions = [
    { title: 'Add New Content', description: 'Upload new content', icon: Add, href: '/admin/movies/new', color: 'linear-gradient(135deg, #e91e63, #9c27b0)' },
    { title: 'Manage Sequence', description: 'Reorder content', icon: TrendingUp, href: '/admin/sequence', color: 'linear-gradient(135deg, #10b981, #14b8a6)' },
    { title: 'Manage Genres', description: `${stats?.totalGenres || 0} genres`, icon: Star, href: '/admin/genres', color: 'linear-gradient(135deg, #f59e0b, #f97316)' },
    { title: 'Manage Industries', description: `${stats?.totalIndustries || 0} industries`, icon: People, href: '/admin/industries', color: 'linear-gradient(135deg, #ef4444, #ec4899)' },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={50} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, overview of your platform
            </Typography>
          </Box>

          <Link href="/admin/movies/new" style={{ textDecoration: 'none' }}>
            <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2 }}>
              Add Content
            </Button>
          </Link>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, i) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.label}>
              <Fade in timeout={400 + i * 80}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 1,
                    transition: '0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${stat.color}.main`,
                        width: 40,
                        height: 40,
                        mb: 1.5,
                      }}
                    >
                      <stat.icon fontSize="small" />
                    </Avatar>

                    <Typography variant="h5" fontWeight={700}>
                      {stat.value.toLocaleString()}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Content Types */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {contentTypeCards.map((type, i) => (
            <Grid item xs={12} md={4} key={type.label}>
              <Fade in timeout={600 + i * 80}>
                <Link href={type.href} style={{ textDecoration: 'none' }}>
                  <Paper
                    sx={{
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      borderRadius: 3,
                      transition: '0.2s',
                      border: '1px solid transparent',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: type.color, width: 48, height: 48 }}>
                      <type.icon sx={{ color: '#fff' }} />
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {type.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.label}
                      </Typography>
                    </Box>

                    <ArrowForward fontSize="small" />
                  </Paper>
                </Link>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.map((action, i) => (
            <Grid item xs={12} sm={6} lg={3} key={action.title}>
              <Fade in timeout={800 + i * 80}>
                <Link href={action.href} style={{ textDecoration: 'none' }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      transition: '0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Avatar
                        sx={{
                          background: action.color,
                          width: 46,
                          height: 46,
                          mb: 2,
                        }}
                      >
                        <action.icon sx={{ color: '#fff' }} />
                      </Avatar>

                      <Typography fontWeight={600} gutterBottom>
                        {action.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Recent */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight={700}>Recently Added</Typography>

              <Link href="/admin/movies" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  View All
                </Typography>
              </Link>
            </Box>

            {stats?.recentMovies?.length ? (
              stats.recentMovies.map((movie) => (
                <Box
                  key={movie.id}
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    transition: '0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ width: 44, height: 44 }}>
                      <MovieIcon fontSize="small" />
                    </Avatar>

                    <Box>
                      <Typography fontWeight={600}>
                        {movie.name}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {movie.content_type?.replace('_', ' ')} •{' '}
                        {new Date(movie.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Link href={`/admin/movies/${movie.id}/edit`}>
                    <Button size="small" startIcon={<Edit />} sx={{ borderRadius: 2 }}>
                      Edit
                    </Button>
                  </Link>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No content added yet
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}