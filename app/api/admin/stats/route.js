import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
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

    const [
      { count: totalMovies },
      { count: trendingMovies },
      { count: featuredMovies },
      { data: recentMovies },
      { count: totalUsers },
      { count: totalGenres },
      { count: totalIndustries },
      { count: moviesByType },
      { count: seriesCount },
      { count: animeCount }
    ] = await Promise.all([
      supabase.from('movies').select('*', { count: 'exact', head: true }),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('trending', true),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('featured', true),
      supabase
        .from('movies')
        .select('id, name, created_at, content_type')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('genres').select('*', { count: 'exact', head: true }),
      supabase.from('industries').select('*', { count: 'exact', head: true }),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('content_type', 'movie'),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('content_type', 'web_series'),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('content_type', 'anime')
    ]);

    return NextResponse.json({
      totalMovies: totalMovies || 0,
      trendingMovies: trendingMovies || 0,
      featuredMovies: featuredMovies || 0,
      recentMovies: recentMovies || [],
      totalUsers: totalUsers || 0,
      totalGenres: totalGenres || 0,
      totalIndustries: totalIndustries || 0,
      contentTypeStats: {
        movies: moviesByType || 0,
        webSeries: seriesCount || 0,
        anime: animeCount || 0
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
