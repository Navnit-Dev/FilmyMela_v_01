import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { searchTMDB, getMovieDetails, getTVShowDetails, getTMDBGenres } from '@/lib/tmdb';

// GET /api/admin/tmdb/search?q=query&type=type
export async function GET(request) {
  try {
    const supabase = await createClient();
    
    // Verify admin authentication
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';

    switch (action) {
      case 'search': {
        const query = searchParams.get('q');
        const type = searchParams.get('type') || 'multi';
        const page = parseInt(searchParams.get('page') || '1');

        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }

        const results = await searchTMDB(query, type, page);
        return NextResponse.json(results);
      }

      case 'details': {
        const tmdbId = searchParams.get('id');
        const mediaType = searchParams.get('media_type') || 'movie';

        if (!tmdbId) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }

        let details;
        if (mediaType === 'tv') {
          details = await getTVShowDetails(parseInt(tmdbId));
        } else {
          details = await getMovieDetails(parseInt(tmdbId));
        }

        return NextResponse.json(details);
      }

      case 'genres': {
        const genres = await getTMDBGenres();
        return NextResponse.json({ genres });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('TMDB API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch from TMDB' },
      { status: 500 }
    );
  }
}
