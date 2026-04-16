// OMDB API Service - Open Movie Database
// API Key: 84e13176

const OMDB_API_KEY = '84e13176';
const OMDB_BASE_URL = 'http://www.omdbapi.com';

/**
 * Search movies by title using OMDB API
 * @param {string} query - Movie title to search
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of search results
 */
export async function searchOMDB(query, limit = 5) {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      return { results: [], totalResults: 0 };
    }
    
    const results = (data.Search || []).slice(0, limit).map(movie => ({
      imdbId: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      type: movie.Type,
      posterUrl: movie.Poster !== 'N/A' ? movie.Poster : null,
      source: 'omdb'
    }));
    
    return {
      results,
      totalResults: parseInt(data.totalResults) || 0
    };
  } catch (error) {
    console.error('OMDB search error:', error);
    return { results: [], totalResults: 0 };
  }
}

/**
 * Get detailed movie information from OMDB by IMDB ID or title
 * @param {string} imdbId - IMDB ID (optional)
 * @param {string} title - Movie title (optional)
 * @returns {Promise<Object>} - Movie details
 */
export async function getOMDBMovieDetails(imdbId = null, title = null) {
  try {
    let url;
    if (imdbId) {
      url = `${OMDB_BASE_URL}/?i=${imdbId}&plot=full&apikey=${OMDB_API_KEY}`;
    } else if (title) {
      url = `${OMDB_BASE_URL}/?t=${encodeURIComponent(title)}&plot=full&apikey=${OMDB_API_KEY}`;
    } else {
      throw new Error('Either imdbId or title is required');
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      return null;
    }
    
    // Parse runtime (format: "120 min")
    const runtimeMatch = data.Runtime?.match(/(\d+)/);
    const runtimeMinutes = runtimeMatch ? parseInt(runtimeMatch[1]) : null;
    
    // Parse rating (format: "8.5/10" from IMDb)
    const ratingMatch = data.imdbRating?.match(/([\d.]+)/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
    
    // Parse year
    const year = data.Year ? parseInt(data.Year) : null;
    
    // Parse genres
    const genres = data.Genre ? data.Genre.split(',').map(g => g.trim()) : [];
    
    // Parse actors/cast
    const cast = data.Actors ? data.Actors.split(',').map(a => a.trim()) : [];
    
    // Parse director
    const directors = data.Director ? data.Director.split(',').map(d => d.trim()) : [];
    
    // Parse ratings from different sources
    const ratings = {};
    if (data.Ratings) {
      data.Ratings.forEach(r => {
        if (r.Source === 'Internet Movie Database') {
          ratings.imdb = r.Value;
        } else if (r.Source === 'Rotten Tomatoes') {
          ratings.rottenTomatoes = r.Value;
        } else if (r.Source === 'Metacritic') {
          ratings.metacritic = r.Value;
        }
      });
    }
    
    return {
      imdbId: data.imdbID,
      title: data.Title,
      originalTitle: data.Title,
      year: year,
      rated: data.Rated,
      released: data.Released,
      runtime: data.Runtime,
      runtimeMinutes: runtimeMinutes,
      duration: runtimeMinutes ? `${runtimeMinutes} min` : null,
      genres: genres,
      director: data.Director,
      directors: directors,
      writer: data.Writer,
      actors: data.Actors,
      cast: cast,
      plot: data.Plot,
      description: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      posterUrl: data.Poster !== 'N/A' ? data.Poster : null,
      ratings: ratings,
      rating: rating,
      imdbRating: rating,
      imdbVotes: data.imdbVotes,
      metascore: data.Metascore,
      type: data.Type,
      dvd: data.DVD,
      boxOffice: data.BoxOffice,
      production: data.Production,
      website: data.Website,
      source: 'omdb'
    };
  } catch (error) {
    console.error('OMDB details error:', error);
    return null;
  }
}

/**
 * Get movie by title from OMDB
 * @param {string} title - Movie title
 * @returns {Promise<Object>} - Movie details
 */
export async function getOMDBByTitle(title) {
  return await getOMDBMovieDetails(null, title);
}

/**
 * Get movie by IMDB ID from OMDB
 * @param {string} imdbId - IMDB ID
 * @returns {Promise<Object>} - Movie details
 */
export async function getOMDBByImdbId(imdbId) {
  return await getOMDBMovieDetails(imdbId, null);
}

/**
 * Parse duration string from OMDB to minutes
 * @param {string} duration - Duration string (e.g., "120 min")
 * @returns {number|null} - Duration in minutes
 */
export function parseOMDBDuration(duration) {
  if (!duration || duration === 'N/A') return null;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export default {
  searchOMDB,
  getOMDBMovieDetails,
  getOMDBByTitle,
  getOMDBByImdbId,
  parseOMDBDuration
};
