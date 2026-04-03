import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { 
  getContentDetails, 
  searchContent, 
  quickSearch,
  ContentTypes 
} from '@/lib/content';

/**
 * Multi-Source Content API Route
 * Handles search and data fetching from TMDB, Jikan, and TVMaze
 * 
 * Query Parameters:
 * - action: 'search' | 'details' | 'quick'
 * - q: search query
 * - type: 'movie' | 'anime' | 'web_series'
 * - tmdbId: TMDB ID for direct lookup
 * - imdbId: IMDB ID for TVMaze lookup
 */
export async function GET(request) {
  try {
    // Check admin authentication
    const supabase = await createClient();
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'quick';
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'movie';
    const tmdbId = searchParams.get('tmdbId') ? parseInt(searchParams.get('tmdbId')) : null;
    const imdbId = searchParams.get('imdbId') || null;
    const apiSource = searchParams.get('apiSource') || 'tmdb'; // 'tmdb' or 'omdb' for movies

    // Validate content type
    if (!Object.values(ContentTypes).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid content type. Use: movie, anime, web_series' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'search':
        // Search using appropriate API for content type
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter "q" is required' },
            { status: 400 }
          );
        }
        result = await searchContent(query, type, { apiSource });
        break;

      case 'details':
        // Get full content details from single source API
        if (!query && !tmdbId) {
          return NextResponse.json(
            { error: 'Query parameter "q" or "tmdbId" is required' },
            { status: 400 }
          );
        }
        result = await getContentDetails({ 
          query, 
          type, 
          apiId: tmdbId, 
          imdbId,
          apiSource
        });
        break;

      case 'quick':
      default:
        // Quick search for dropdown (simplified results)
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter "q" is required' },
            { status: 400 }
          );
        }
                result = await quickSearch(query, type, 5, { apiSource });
        break;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Content API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for batch operations
 */
export async function POST(request) {
  try {
    // Check admin authentication
    const supabase = await createClient();
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

    const body = await request.json();
    const { action, items, type } = body;

    if (action === 'batch_details' && Array.isArray(items)) {
      // Fetch details for multiple items
      const results = await Promise.all(
        items.map(item => 
          getContentDetails({
            query: item.query,
            type: type || item.type,
            apiId: item.apiId,
            imdbId: item.imdbId
          }).catch(error => ({
            error: error.message,
            query: item.query,
            _meta: { source: null, found: false, confidence: { score: 0, level: 'failed' } }
          }))
        )
      );

      return NextResponse.json({ results });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Content API POST Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
