import { NextResponse } from 'next/server';
import { getMovies, getIndustries, getGenres, getYears, searchMovies } from '@/lib/movies';

// Ensure Node.js runtime for Supabase SSR compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const industry = searchParams.get('industry') || null;
    const genre = searchParams.get('genre') || null;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : null;
    const trending = searchParams.get('trending') === 'true' ? true : null;
    const featured = searchParams.get('featured') === 'true' ? true : null;
    const sort = searchParams.get('sort') || 'latest';

    const { movies, count } = await getMovies({
      limit,
      offset,
      industry,
      genre,
      year,
      trending,
      featured,
      visible: true
    });

    return NextResponse.json({ 
      movies, 
      count,
      pagination: {
        limit,
        offset,
        hasMore: offset + movies.length < count
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
