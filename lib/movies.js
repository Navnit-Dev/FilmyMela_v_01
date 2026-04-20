import { cache } from 'react';
import { createClient } from '@/lib/supabase-server';

// Cache expensive data fetching functions
const getMoviesCached = cache(async ({ 
  limit = 20, 
  offset = 0, 
  featured = null, 
  trending = null, 
  industry = null,
  genre = null,
  year = null,
  visible = true 
} = {}) => {
  const supabase = await createClient();
  
  let query = supabase
    .from('movies')
    .select('*', { count: 'exact' });

  if (visible !== null) {
    query = query.eq('visible', visible);
  }
  if (featured !== null) {
    query = query.eq('featured', featured);
  }
  if (trending !== null) {
    query = query.eq('trending', trending);
  }
  if (industry) {
    query = query.eq('industry', industry);
  }
  if (genre) {
    query = query.contains('genre', [genre]);
  }
  if (year) {
    query = query.eq('release_year', year);
  }

  const { data, error, count } = await query
    .order('sequence', { ascending: true })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { movies: data || [], count };
});

// Export cached version
export const getMovies = getMoviesCached;

export async function getMovieById(id) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export const getHomeSectionsWithMovies = cache(async () => {
  const supabase = await createClient();
  
  // Fetch all active sections ordered by sort_order
  const { data: sections, error: sectionsError } = await supabase
    .from('home_sections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (sectionsError) throw sectionsError;
  if (!sections || sections.length === 0) return [];

  // Fetch movies for each section
  const sectionsWithMovies = await Promise.all(
    sections.map(async (section) => {
      let query = supabase
        .from('movies')
        .select('id, name, poster_url, backdrop_url, content_type, rating, release_year, genre, industry')
        .eq('visible', true)
        .order('created_at', { ascending: false })
        .limit(section.max_items || (section.section_type === 'industry' ? 12 : 10));

      if (section.section_type === 'industry') {
        query = query.eq('industry', section.filter_value);
      } else if (section.section_type === 'genre') {
        query = query.contains('genre', [section.filter_value]);
      }

      const { data: movies, error: moviesError } = await query;

      if (moviesError) {
        console.error(`Error fetching movies for section ${section.name}:`, moviesError);
        return { ...section, movies: [] };
      }

      return { ...section, movies: movies || [] };
    })
  );

  return sectionsWithMovies;
});

export async function searchMovies(query, { limit = 20, offset = 0 } = {}) {
  const supabase = await createClient();
  
  const { data, error, count } = await supabase
    .from('movies')
    .select('*', { count: 'exact' })
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,cast.cs.{${query}}`)
    .eq('visible', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { movies: data || [], count };
}

export async function getIndustries() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('movies')
    .select('industry')
    .eq('visible', true);

  if (error) throw error;
  
  const industries = [...new Set(data?.map(m => m.industry).filter(Boolean))];
  return industries;
}

export async function getGenres() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('movies')
    .select('genre')
    .eq('visible', true);

  if (error) throw error;
  
  const genres = [...new Set(data?.flatMap(m => m.genre || []))].filter(Boolean);
  return genres;
}

export async function getYears() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('movies')
    .select('release_year')
    .eq('visible', true)
    .order('release_year', { ascending: false });

  if (error) throw error;
  
  const years = [...new Set(data?.map(m => m.release_year).filter(Boolean))];
  return years;
}

export async function getStats() {
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
    supabase.from('movies').select('id, name, created_at').order('created_at', { ascending: false }).limit(5)
  ]);

  return {
    totalMovies: totalMovies || 0,
    trendingMovies: trendingMovies || 0,
    featuredMovies: featuredMovies || 0,
    recentMovies: recentMovies || []
  };
}
