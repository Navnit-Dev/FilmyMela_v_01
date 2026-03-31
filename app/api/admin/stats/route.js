import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const [
      { count: totalMovies },
      { count: trendingMovies },
      { count: featuredMovies },
      { data: recentMovies }
    ] = await Promise.all([
      supabase.from('movies').select('*', { count: 'exact', head: true }),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('trending', true),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('featured', true),
      supabase
        .from('movies')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    return NextResponse.json({
      totalMovies: totalMovies || 0,
      trendingMovies: trendingMovies || 0,
      featuredMovies: featuredMovies || 0,
      recentMovies: recentMovies || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
