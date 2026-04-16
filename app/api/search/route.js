import { NextResponse } from 'next/server';
import { searchMovies } from '@/lib/movies';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    if (!query.trim()) {
      return NextResponse.json({ movies: [], count: 0 });
    }

    const { movies, count } = await searchMovies(query, { limit, offset });

    return NextResponse.json({ 
      movies, 
      count,
      query,
      pagination: {
        limit,
        offset,
        hasMore: offset + movies.length < count
      }
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
}
