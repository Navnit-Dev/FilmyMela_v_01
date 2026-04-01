// TMDB API Service Layer
// Provides integration with The Movie Database API for auto-filling movie data

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_READ_TOKEN = process.env.TMDB_READ_TOKEN || process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Use Bearer token if available, otherwise fall back to API key
const useBearerToken = !!TMDB_READ_TOKEN;

// Helper function for fetch with retry
async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { ...options, cache: 'no-store' });
      return response;
    } catch (error) {
      lastError = error;
      console.log(`TMDB fetch attempt ${i + 1} failed, retrying...`);
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
}

/**
 * Search for movies, TV shows, or anime on TMDB
 * @param {string} query - Search query
 * @param {string} type - Content type: 'movie', 'tv', or 'multi'
 * @param {number} page - Page number for pagination
 */
export async function searchTMDB(query, type = 'multi', page = 1) {
  // Try Bearer token first, fallback to API key in query param
  const useBearer = !!TMDB_READ_TOKEN;
  
  let url, options;
  
  if (useBearer) {
    url = `${TMDB_BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    options = {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_READ_TOKEN}`
      }
    };
  } else {
    // Fallback: API key in query param (some networks block auth headers)
    url = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    options = { headers: { accept: 'application/json' } };
  }
  
  try {
    const response = await fetchWithRetry(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return {
      results: data.results.map(formatSearchResult),
      totalResults: data.total_results,
      totalPages: data.total_pages,
      page: data.page
    };
  } catch (error) {
    console.error('TMDB Search Error:', error);
    // Return empty results on network error instead of crashing
    return { results: [], totalResults: 0, totalPages: 0, page: 1 };
  }
}

/**
 * Get detailed information about a movie
 * @param {number} tmdbId - TMDB movie ID
 */
export async function getMovieDetails(tmdbId) {
  try {
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?append_to_response=credits,videos,images`;
    
    const headers = { accept: 'application/json' };
    if (useBearerToken) {
      headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
    } else if (TMDB_API_KEY) {
      headers.Authorization = `Bearer ${TMDB_API_KEY}`;
    }
    
    const response = await fetchWithRetry(url, { headers });
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return formatMovieDetails(data);
  } catch (error) {
    console.error('TMDB Movie Details Error:', error);
    throw error;
  }
}

/**
 * Get detailed information about a TV show (for Web Series/Anime)
 * @param {number} tmdbId - TMDB TV show ID
 */
export async function getTVShowDetails(tmdbId) {
  try {
    const url = `${TMDB_BASE_URL}/tv/${tmdbId}?append_to_response=credits,videos,images,seasons`;
    
    const headers = { accept: 'application/json' };
    if (useBearerToken) {
      headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
    } else if (TMDB_API_KEY) {
      headers.Authorization = `Bearer ${TMDB_API_KEY}`;
    }
    
    const response = await fetchWithRetry(url, { headers });
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return formatTVShowDetails(data);
  } catch (error) {
    console.error('TMDB TV Show Details Error:', error);
    throw error;
  }
}

/**
 * Get trending movies/TV shows
 * @param {string} mediaType - 'movie', 'tv', or 'all'
 * @param {string} timeWindow - 'day' or 'week'
 */
export async function getTrending(mediaType = 'movie', timeWindow = 'week') {
  try {
    const url = `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}`;
    
    const headers = { accept: 'application/json' };
    if (useBearerToken) {
      headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
    } else if (TMDB_API_KEY) {
      headers.Authorization = `Bearer ${TMDB_API_KEY}`;
    }
    
    const response = await fetchWithRetry(url, { headers });
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      results: data.results.map(formatSearchResult),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results
    };
  } catch (error) {
    console.error('TMDB Trending Error:', error);
    throw error;
  }
}

/**
 * Format search result for consistent output
 */
function formatSearchResult(item) {
  const isMovie = item.media_type === 'movie' || !item.media_type;
  
  return {
    id: item.id,
    tmdbId: item.id,
    title: item.title || item.name,
    originalTitle: item.original_title || item.original_name,
    overview: item.overview,
    posterPath: item.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${item.poster_path}` : null,
    backdropPath: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${item.backdrop_path}` : null,
    mediaType: item.media_type || (item.title ? 'movie' : 'tv'),
    releaseDate: item.release_date || item.first_air_date,
    year: item.release_date ? new Date(item.release_date).getFullYear() : 
          item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
    voteAverage: item.vote_average,
    voteCount: item.vote_count,
    popularity: item.popularity,
    genreIds: item.genre_ids || []
  };
}

/**
 * Format movie details for form autofill
 */
function formatMovieDetails(data) {
  const cast = data.credits?.cast?.slice(0, 10).map(person => person.name) || [];
  const genres = data.genres?.map(g => g.name) || [];
  const runtime = data.runtime ? formatRuntime(data.runtime) : '';
  
  // Extract backdrop images
  const backdrops = data.images?.backdrops?.slice(0, 5).map(img => 
    `${TMDB_IMAGE_BASE_URL}/original${img.file_path}`
  ) || [];
  
  // Extract video trailers
  const trailers = data.videos?.results?.filter(v => v.type === 'Trailer').slice(0, 3) || [];
  const trailerUrl = trailers.length > 0 ? `https://www.youtube.com/embed/${trailers[0].key}` : '';
  
  return {
    tmdbId: data.id,
    imdbId: data.imdb_id,
    name: data.title,
    originalName: data.original_title,
    tagline: data.tagline,
    description: data.overview,
    releaseYear: data.release_date ? new Date(data.release_date).getFullYear() : null,
    releaseDate: data.release_date,
    rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 0,
    duration: runtime,
    runtimeMinutes: data.runtime,
    genres: genres,
    genreIds: data.genres?.map(g => g.id) || [],
    cast: cast,
    posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE_URL}/original${data.poster_path}` : null,
    backdropUrl: data.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${data.backdrop_path}` : null,
    backdrops: backdrops,
    trailerUrl: trailerUrl,
    originalLanguage: data.original_language,
    budget: data.budget,
    revenue: data.revenue,
    homepage: data.homepage,
    status: data.status,
    productionCompanies: data.production_companies?.map(p => p.name) || [],
    productionCountries: data.production_countries?.map(c => c.name) || [],
    contentType: 'movie'
  };
}

/**
 * Format TV show details for form autofill
 */
function formatTVShowDetails(data) {
  const cast = data.credits?.cast?.slice(0, 10).map(person => person.name) || [];
  const genres = data.genres?.map(g => g.name) || [];
  
  // Calculate average episode runtime
  const episodeRuntime = data.episode_run_time?.[0] || 0;
  const formattedRuntime = episodeRuntime ? formatRuntime(episodeRuntime) : '';
  
  // Extract backdrop images
  const backdrops = data.images?.backdrops?.slice(0, 5).map(img => 
    `${TMDB_IMAGE_BASE_URL}/original${img.file_path}`
  ) || [];
  
  // Extract video trailers
  const trailers = data.videos?.results?.filter(v => v.type === 'Trailer').slice(0, 3) || [];
  const trailerUrl = trailers.length > 0 ? `https://www.youtube.com/embed/${trailers[0].key}` : '';
  
  // Calculate total episodes
  const totalEpisodes = data.seasons?.reduce((acc, season) => acc + (season.episode_count || 0), 0) || 0;
  
  // Determine if anime
  const isAnime = genres.some(g => 
    g.toLowerCase().includes('animation') && 
    data.origin_country?.includes('JP')
  );
  
  return {
    tmdbId: data.id,
    name: data.name,
    originalName: data.original_name,
    tagline: data.tagline,
    description: data.overview,
    releaseYear: data.first_air_date ? new Date(data.first_air_date).getFullYear() : null,
    firstAirDate: data.first_air_date,
    lastAirDate: data.last_air_date,
    rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 0,
    episodeDuration: formattedRuntime,
    episodeRuntimeMinutes: episodeRuntime,
    totalEpisodes: totalEpisodes,
    seasons: data.number_of_seasons,
    genres: genres,
    genreIds: data.genres?.map(g => g.id) || [],
    cast: cast,
    posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE_URL}/original${data.poster_path}` : null,
    backdropUrl: data.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${data.backdrop_path}` : null,
    backdrops: backdrops,
    trailerUrl: trailerUrl,
    originalLanguage: data.original_language,
    originCountry: data.origin_country,
    homepage: data.homepage,
    status: data.status,
    inProduction: data.in_production,
    productionCompanies: data.production_companies?.map(p => p.name) || [],
    contentType: isAnime ? 'anime' : 'web_series',
    isAnime: isAnime,
    seasonsData: data.seasons?.map(s => ({
      seasonNumber: s.season_number,
      episodeCount: s.episode_count,
      name: s.name,
      airDate: s.air_date,
      overview: s.overview,
      posterPath: s.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${s.poster_path}` : null
    })) || []
  };
}

/**
 * Format runtime minutes to readable string
 */
function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

/**
 * Discover movies by various filters
 * @param {Object} filters - Filter options
 */
export async function discoverMovies(filters = {}) {
  const {
    genre,
    year,
    sortBy = 'popularity.desc',
    page = 1
  } = filters;
  
  const params = new URLSearchParams({
    sort_by: sortBy,
    page: String(page),
    include_adult: 'false',
    include_video: 'false'
  });
  
  if (genre) params.append('with_genres', genre);
  if (year) params.append('year', String(year));
  
  try {
    const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
    
    const headers = { accept: 'application/json' };
    if (useBearerToken) {
      headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
    } else if (TMDB_API_KEY) {
      headers.Authorization = `Bearer ${TMDB_API_KEY}`;
    }
    
    const response = await fetchWithRetry(url, { headers });
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      results: data.results.map(formatSearchResult),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results
    };
  } catch (error) {
    console.error('TMDB Discover Error:', error);
    throw error;
  }
}

/**
 * Get list of TMDB genres
 */
export async function getTMDBGenres() {
  try {
    const headers = { accept: 'application/json' };
    if (useBearerToken) {
      headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
    } else if (TMDB_API_KEY) {
      headers.Authorization = `Bearer ${TMDB_API_KEY}`;
    }
    
    const [movieGenresRes, tvGenresRes] = await Promise.all([
      fetchWithRetry(`${TMDB_BASE_URL}/genre/movie/list`, { headers }),
      fetchWithRetry(`${TMDB_BASE_URL}/genre/tv/list`, { headers })
    ]);
    
    const movieGenres = await movieGenresRes.json();
    const tvGenres = await tvGenresRes.json();
    
    // Merge and deduplicate genres
    const allGenres = [...movieGenres.genres, ...tvGenres.genres];
    const uniqueGenres = allGenres.filter((genre, index, self) => 
      index === self.findIndex(g => g.id === genre.id)
    );
    
    return uniqueGenres;
  } catch (error) {
    console.error('TMDB Genres Error:', error);
    throw error;
  }
}

/**
 * Get TMDB image URL with specified size
 * @param {string} path - Image path (e.g., "/abc123.jpg")
 * @param {string} size - Size type: 'w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'
 * @returns {string|null} Full image URL
 */
export function getTMDBImageUrl(path, size = 'w500') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

// Export configuration for use in other modules
export const tmdbConfig = {
  apiKey: TMDB_API_KEY,
  baseUrl: TMDB_BASE_URL,
  imageBaseUrl: TMDB_IMAGE_BASE_URL,
  posterSizes: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original'
  },
  backdropSizes: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original'
  }
};
