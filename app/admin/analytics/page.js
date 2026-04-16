'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  BarChart,
  TrendingUp,
  People,
  Movie,
  Visibility,
  Download,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Views', value: analytics?.totalViews || 0, change: analytics?.viewsChange || 0, icon: Visibility, color: 'primary' },
    { label: 'New Users', value: analytics?.newUsers || 0, change: analytics?.usersChange || 0, icon: People, color: 'secondary' },
    { label: 'Downloads', value: analytics?.downloads || 0, change: analytics?.downloadsChange || 0, icon: Download, color: 'success' },
    { label: 'Movies Added', value: analytics?.moviesAdded || 0, change: analytics?.moviesChange || 0, icon: Movie, color: 'warning' },
  ];

  const contentTypeStats = analytics?.contentTypeStats || [
    { type: 'movie', count: 0, percentage: 0 },
    { type: 'web_series', count: 0, percentage: 0 },
    { type: 'anime', count: 0, percentage: 0 }
  ];

  const topMovies = analytics?.topMovies || [];
  const dailyStats = analytics?.dailyStats || [];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
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
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChart /> Analytics & Statistics
            </Typography>
          </Box>

          {/* Date Range Selector */}
          <Box sx={{ display: 'flex', gap: 1, bgcolor: 'background.paper', borderRadius: 2, p: 0.5 }}>
            {[
              { value: '24h', label: '24h' },
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '3 Months' }
            ].map((range) => (
              <Button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                variant={dateRange === range.value ? 'contained' : 'text'}
                size="small"
                sx={{ borderRadius: 2, minWidth: 60 }}
              >
                {range.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={stat.label}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar sx={{ bgcolor: `${stat.color}.main` }}>
                        <stat.icon sx={{ color: 'white' }} />
                      </Avatar>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: stat.change >= 0 ? 'success.main' : 'error.main' }}>
                        {stat.change >= 0 ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                        <Typography variant="body2">{Math.abs(stat.change)}%</Typography>
                      </Box>
                    </Box>
                    <Typography variant="h4" fontWeight={700}>{stat.value.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Daily Activity</Typography>
                  <Box sx={{ height: 256, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    {dailyStats.length > 0 ? (
                      dailyStats.map((day, index) => {
                        const maxViews = Math.max(...dailyStats.map(d => d.views));
                        const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                        return (
                          <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: '100%',
                                bgcolor: 'primary.main',
                                opacity: 0.2,
                                borderRadius: '4px 4px 0 0',
                                height: `${Math.max(height, 4)}%`,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                            </Typography>
                          </Box>
                        );
                      })
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                        No data available
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Content Types</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {contentTypeStats.map((stat) => (
                      <Box key={stat.type}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{stat.type.replace('_', ' ')}</Typography>
                          <Typography variant="body2" fontWeight={500}>{stat.count} ({stat.percentage}%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={stat.percentage} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top Movies Table */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>Top Performing Content</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Views</TableCell>
                      <TableCell>Downloads</TableCell>
                      <TableCell>Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topMovies.length > 0 ? (
                      topMovies.map((movie, index) => (
                        <TableRow key={movie.id} hover>
                          <TableCell>#{index + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {movie.poster_url && (
                                <Avatar src={movie.poster_url} variant="rounded" sx={{ width: 40, height: 56 }} />
                              )}
                              <Typography variant="body2" fontWeight={500}>{movie.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{movie.content_type?.replace('_', ' ')}</TableCell>
                          <TableCell>{movie.views?.toLocaleString() || 0}</TableCell>
                          <TableCell>{movie.downloads?.toLocaleString() || 0}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="primary">⭐ {movie.rating}</Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No performance data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Genre & Industry Stats */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Popular Genres</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {analytics?.topGenres?.map((genre, index) => (
                      <Box key={genre.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 30 }}>#{index + 1}</Typography>
                        <Typography variant="body2" sx={{ flex: 1 }} fontWeight={500}>{genre.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{genre.count} movies</Typography>
                        <LinearProgress variant="determinate" value={genre.percentage} sx={{ width: 100, height: 8, borderRadius: 4, bgcolor: 'background.paper' }} />
                      </Box>
                    )) || (
                      <Typography color="text.secondary">No genre data available</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Content by Industry</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {analytics?.topIndustries?.map((industry, index) => (
                      <Box key={industry.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 30 }}>#{index + 1}</Typography>
                        <Typography variant="body2" sx={{ flex: 1 }} fontWeight={500}>{industry.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{industry.count} movies</Typography>
                        <LinearProgress variant="determinate" value={industry.percentage} sx={{ width: 100, height: 8, borderRadius: 4, bgcolor: 'background.paper' }} color="success" />
                      </Box>
                    )) || (
                      <Typography color="text.secondary">No industry data available</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
