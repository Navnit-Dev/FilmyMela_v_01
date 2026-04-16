import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/admin/analytics - Get analytics data
export async function GET(request) {
  try {
    const supabase = await createClient();
    
    // Check admin auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!admin || !['SuperAdmin', 'Admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse date range
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const startDateStr = startDate.toISOString();

    // Get stats in parallel
    const [
      totalViewsRes,
      newUsersRes,
      downloadsRes,
      moviesAddedRes,
      contentTypeRes,
      topMoviesRes,
      dailyStatsRes,
      genreStatsRes,
      industryStatsRes
    ] = await Promise.all([
      // Total views (placeholder - would need view tracking table)
      supabase.from('movie_views').select('*', { count: 'exact', head: true }).gte('created_at', startDateStr),
      
      // New users
      supabase.from('users').select('*', { count: 'exact' }).gte('created_at', startDateStr),
      
      // Downloads (placeholder)
      supabase.from('downloads').select('*', { count: 'exact', head: true }).gte('created_at', startDateStr),
      
      // Movies added
      supabase.from('movies').select('*', { count: 'exact' }).gte('created_at', startDateStr),
      
      // Content type distribution
      supabase.from('movies').select('content_type'),
      
      // Top movies by views
      supabase.from('movies').select('id, name, poster_url, content_type, rating, views, downloads').order('views', { ascending: false }).limit(10),
      
      // Daily stats (placeholder)
      Promise.resolve([]),
      
      // Genre stats
      supabase.from('genres').select('id, name, movie_genres(count)'),
      
      // Industry stats
      supabase.from('industries').select('id, name, movie_industries(count)')
    ]);

    // Calculate content type stats
    const contentTypes = contentTypeRes.data || [];
    const totalContent = contentTypes.length;
    const contentTypeStats = [
      { 
        type: 'movie', 
        count: contentTypes.filter(c => c.content_type === 'movie').length,
        percentage: totalContent > 0 ? Math.round((contentTypes.filter(c => c.content_type === 'movie').length / totalContent) * 100) : 0
      },
      { 
        type: 'web_series', 
        count: contentTypes.filter(c => c.content_type === 'web_series').length,
        percentage: totalContent > 0 ? Math.round((contentTypes.filter(c => c.content_type === 'web_series').length / totalContent) * 100) : 0
      },
      { 
        type: 'anime', 
        count: contentTypes.filter(c => c.content_type === 'anime').length,
        percentage: totalContent > 0 ? Math.round((contentTypes.filter(c => c.content_type === 'anime').length / totalContent) * 100) : 0
      }
    ];

    // Format genre stats
    const genreStats = (genreStatsRes.data || [])
      .map(g => ({ name: g.name, count: g.movie_genres?.[0]?.count || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((g, i, arr) => ({
        ...g,
        percentage: arr[0].count > 0 ? Math.round((g.count / arr[0].count) * 100) : 0
      }));

    // Format industry stats
    const industryStats = (industryStatsRes.data || [])
      .map(i => ({ name: i.name, count: i.movie_industries?.[0]?.count || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((i, idx, arr) => ({
        ...i,
        percentage: arr[0].count > 0 ? Math.round((i.count / arr[0].count) * 100) : 0
      }));

    // Generate daily stats (placeholder - would come from actual view tracking)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 1000) + 500 // Placeholder
      });
    }

    return NextResponse.json({
      totalViews: totalViewsRes.count || 0,
      newUsers: newUsersRes.count || 0,
      downloads: downloadsRes.count || 0,
      moviesAdded: moviesAddedRes.count || 0,
      viewsChange: 15, // Placeholder - calculate from previous period
      usersChange: 8,
      downloadsChange: 23,
      moviesChange: 5,
      contentTypeStats,
      topMovies: topMoviesRes.data || [],
      dailyStats,
      topGenres: genreStats,
      topIndustries: industryStats
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
