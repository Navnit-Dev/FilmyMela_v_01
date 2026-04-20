import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get movie with related genres and industries
    const { data: movie, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // Return movie with genre and industry from movies table
    // Industry is stored as a single value but form expects an array
    return NextResponse.json({
      ...movie,
      genre_names: movie.genre || [],
      industry_names: movie.industry ? [movie.industry] : []
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check admin
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
    const { genre_ids, industry_ids, genres, industries, genre_names, industry_names, ...movieFields } = body;
    // Clean up empty strings for integer fields
    const integerFields = ['tmdb_id', 'mal_id', 'tvmaze_id', 'total_episodes', 'seasons'];
    const cleanedFields = { ...movieFields };
    
    integerFields.forEach(field => {
      if (cleanedFields[field] === '' || cleanedFields[field] === undefined) {
        cleanedFields[field] = null;
      } else if (cleanedFields[field]) {
        cleanedFields[field] = parseInt(cleanedFields[field]) || null;
      }
    });

    // Add genre and industry arrays directly to movie data
    if (genre_names !== undefined) {
      cleanedFields.genre = genre_names || [];
    }
    if (industry_names !== undefined) {
      cleanedFields.industry = industry_names?.[0] || [];
    }

    // Update movie
    const { data, error } = await supabase
      .from('movies')
      .update(cleanedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    try {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: user.id,
          admin_name: admin.name,
          admin_email: user.email,
          action_type: 'update_movie',
          action_description: `Updated movie "${data.name}"`,
          entity_type: 'movie',
          entity_id: id,
          entity_name: data.name,
          metadata: { poster_url: data.poster_url }
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT Movie Error:', error);
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check admin
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
    const { genre_ids, industry_ids, genres, industries, genre_names, industry_names, ...movieFields } = body;

    // Clean up empty strings for integer fields
    const integerFields = ['tmdb_id', 'mal_id', 'tvmaze_id', 'total_episodes', 'seasons'];
    const cleanedFields = { ...movieFields };
    
    integerFields.forEach(field => {
      if (cleanedFields[field] === '' || cleanedFields[field] === undefined) {
        cleanedFields[field] = null;
      } else if (cleanedFields[field]) {
        cleanedFields[field] = parseInt(cleanedFields[field]) || null;
      }
    });

    // Add genre and industry arrays directly to movie data
    if (genre_names !== undefined) {
      cleanedFields.genre = genre_names || [];
    }
    if (industry_names !== undefined) {
      cleanedFields.industry = industry_names?.[0] || [];
    }

    const { data, error } = await supabase
      .from('movies')
      .update(cleanedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('PATCH Movie Error:', error);
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admin_users')
      .select('role, name')
      .eq('id', user.id)
      .single();

    if (!admin || !['SuperAdmin', 'Admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get movie name before deleting
    const { data: movie } = await supabase
      .from('movies')
      .select('name, poster_url')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    try {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: user.id,
          admin_name: admin.name,
          admin_email: user.email,
          action_type: 'delete_movie',
          action_description: `Deleted movie "${movie?.name || id}"`,
          entity_type: 'movie',
          entity_id: id,
          entity_name: movie?.name,
          metadata: { poster_url: movie?.poster_url }
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
