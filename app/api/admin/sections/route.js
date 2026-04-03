import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Fetch all sections or sections with their movies
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const withMovies = searchParams.get('withMovies') === 'true';
    
    // Fetch all active sections ordered by sort_order
    const { data: sections, error: sectionsError } = await supabase
      .from('home_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (sectionsError) throw sectionsError;
    
    // If withMovies is true, fetch movies for each section
    if (withMovies && sections) {
      for (const section of sections) {
        let moviesQuery;
        
        if (section.section_type === 'industry') {
          // Fetch movies by industry
          const { data: movies, error: moviesError } = await supabase
            .from('movies')
            .select('id, name, poster_url, backdrop_url, content_type, rating, release_year, genre, industry')
            .eq('industry', section.filter_value)
            .eq('visible', true)
            .order('created_at', { ascending: false })
            .limit(section.max_items || 12);
          
          if (!moviesError) {
            section.movies = movies || [];
          } else {
            section.movies = [];
          }
        } else if (section.section_type === 'genre') {
          // Fetch movies by genre (genre is stored as array)
          const { data: movies, error: moviesError } = await supabase
            .from('movies')
            .select('id, name, poster_url, backdrop_url, content_type, rating, release_year, genre, industry')
            .contains('genre', [section.filter_value])
            .eq('visible', true)
            .order('created_at', { ascending: false })
            .limit(section.max_items || 10);
          
          if (!moviesError) {
            section.movies = movies || [];
          } else {
            section.movies = [];
          }
        } else {
          section.movies = [];
        }
      }
    }
    
    return NextResponse.json(sections || []);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST - Create new section
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminError || !['SuperAdmin', 'Admin'].includes(adminData?.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, section_type, filter_value, max_items } = body;
    
    // Validate required fields
    if (!name || !section_type || !filter_value) {
      return NextResponse.json(
        { error: 'Missing required fields: name, section_type, filter_value' },
        { status: 400 }
      );
    }
    
    // Validate section_type
    if (!['industry', 'genre'].includes(section_type)) {
      return NextResponse.json(
        { error: 'section_type must be either "industry" or "genre"' },
        { status: 400 }
      );
    }
    
    // Get current max sort_order
    const { data: sortData, error: sortError } = await supabase
      .from('home_sections')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();
    
    const nextSortOrder = sortError || !sortData ? 1 : sortData.sort_order + 1;
    
    // Set default max_items based on type
    const defaultMaxItems = section_type === 'industry' ? 12 : 10;
    
    const { data: result, error: insertError } = await supabase
      .from('home_sections')
      .insert({
        name,
        section_type,
        filter_value,
        sort_order: nextSortOrder,
        max_items: max_items || defaultMaxItems
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}

// PUT - Update section order (bulk update)
export async function PUT(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminError || !['SuperAdmin', 'Admin'].includes(adminData?.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { sections } = body;
    
    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Invalid request: sections must be an array' },
        { status: 400 }
      );
    }
    
    // Update sort order for each section
    for (const section of sections) {
      await supabase
        .from('home_sections')
        .update({ sort_order: section.sort_order })
        .eq('id', section.id);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating section order:', error);
    return NextResponse.json(
      { error: 'Failed to update section order' },
      { status: 500 }
    );
  }
}
