// Jikan API Service (MyAnimeList)
// Used for enhanced anime metadata
// Rate limit: 3 requests per second, 60 per minute

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Rate limiting
let lastRequest = 0;
const MIN_DELAY = 334; // 334ms between requests for 3req/sec

async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequest;
  if (elapsed < MIN_DELAY) {
    await new Promise(resolve => setTimeout(resolve, MIN_DELAY - elapsed));
  }
  lastRequest = Date.now();
}

/**
 * Search for anime on Jikan
 * @param {string} query - Search query
 * @param {number} limit - Results limit (max 25)
 */
export async function searchJikan(query, limit = 5) {
  try {
    await rateLimit();
    
    const url = `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=${limit}&order_by=score&sort=desc`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add confidence scoring to search results
    const resultsWithConfidence = data.data.map(anime => {
      const confidence = calculateSearchConfidence(anime);
      return {
        ...formatJikanResult(anime),
        _meta: {
          source: 'jikan',
          sourceId: anime.mal_id,
          found: true,
          confidence
        }
      };
    });
    
    return {
      results: resultsWithConfidence,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Jikan Search Error:', error);
    return { results: [], pagination: null };
  }
}

/**
 * Calculate confidence for search results
 */
function calculateSearchConfidence(anime) {
  let score = 0;
  let fields = 0;
  
  // Check for title (any language)
  if (anime.title || anime.title_english || anime.title_japanese) { score++; fields++; }
  
  // Check for description
  if (anime.synopsis && anime.synopsis.length > 50) { score++; fields++; }
  
  // Check for poster
  if (anime.images?.jpg?.image_url) { score++; fields++; }
  
  // Check for rating/score
  if (anime.score && anime.score > 0) { score++; fields++; }
  
  // Check for year
  if (anime.year && anime.year > 1900 && anime.year <= new Date().getFullYear()) { score++; fields++; }
  
  // Check for genres
  if (anime.genres && anime.genres.length > 0) { score++; fields++; }
  
  // Check for episodes
  if (anime.episodes && anime.episodes > 0) { score++; fields++; }
  
  // Check for studios
  if (anime.studios && anime.studios.length > 0) { score++; fields++; }
  
  // Check for type
  if (anime.type) { score++; fields++; }
  
  const percentage = fields > 0 ? Math.round((score / fields) * 100) : 0;
  
  return {
    score: percentage,
    level: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low'
  };
}

/**
 * Get anime details by ID
 * @param {number} malId - MyAnimeList ID
 */
export async function getJikanAnimeDetails(malId) {
  try {
    await rateLimit();
    
    const url = `${JIKAN_BASE_URL}/anime/${malId}/full`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }
    
    const data = await response.json();
    const details = formatJikanDetails(data.data);
    
    // Fetch cast information separately
    const cast = await getJikanAnimeCharacters(malId);
    
    return {
      ...details,
      cast
    };
  } catch (error) {
    console.error('Jikan Details Error:', error);
    return null;
  }
}

/**
 * Get anime characters/cast by anime ID
 * @param {number} malId - MyAnimeList ID
 */
export async function getJikanAnimeCharacters(malId) {
  try {
    await rateLimit();
    
    const url = `${JIKAN_BASE_URL}/anime/${malId}/characters`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      console.warn(`Jikan Characters API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data.data)) {
      return [];
    }
    
    // Format characters with their voice actors
    return data.data.slice(0, 10).map(char => {
      const character = char.character;
      const voiceActors = char.voice_actors || [];
      const mainVA = voiceActors.find(va => va.language === 'Japanese') || voiceActors[0];
      
      return {
        characterId: character?.mal_id,
        characterName: character?.name,
        characterImage: character?.images?.jpg?.image_url,
        role: char.role, // Main, Supporting, etc.
        voiceActor: mainVA ? {
          personId: mainVA.person?.mal_id,
          name: mainVA.person?.name,
          image: mainVA.person?.images?.jpg?.image_url,
          language: mainVA.language
        } : null
      };
    });
  } catch (error) {
    console.error('Jikan Characters Error:', error);
    return [];
  }
}

/**
 * Get anime by title match (best match)
 * @param {string} title - Anime title
 */
export async function getJikanByTitle(title) {
  try {
    const searchResults = await searchJikan(title, 3);
    if (searchResults.results.length === 0) return null;
    
    // Get details for the best match
    const details = await getJikanAnimeDetails(searchResults.results[0].malId);
    if (!details) return null;
    
    // Add confidence scoring based on data completeness
    const confidence = calculateJikanConfidence(details);
    return {
      ...details,
      _meta: {
        source: 'jikan',
        sourceId: details.malId,
        found: true,
        confidence
      }
    };
  } catch (error) {
    console.error('Jikan title search error:', error);
    return {
      _meta: {
        source: 'jikan',
        sourceId: null,
        found: false,
        confidence: { score: 0, level: 'low' }
      }
    };
  }
}

/**
 * Calculate confidence score for Jikan data
 */
function calculateJikanConfidence(data) {
  let score = 0;
  let fields = 0;
  
  // Check for title (any language)
  if (data.title || data.titleEnglish || data.titleJapanese) { score++; fields++; }
  
  // Check for description
  if (data.synopsis && data.synopsis.length > 50) { score++; fields++; }
  
  // Check for poster
  if (data.posterUrl) { score++; fields++; }
  
  // Check for rating/score
  if (data.score && data.score > 0) { score++; fields++; }
  
  // Check for year
  if (data.year && data.year > 1900 && data.year <= new Date().getFullYear()) { score++; fields++; }
  
  // Check for genres
  if (data.genres && data.genres.length > 0) { score++; fields++; }
  
  // Check for episodes
  if (data.episodes && data.episodes > 0) { score++; fields++; }
  
  // Check for studios
  if (data.studios && data.studios.length > 0) { score++; fields++; }
  
  // Check for aired date
  if (data.airedFrom) { score++; fields++; }
  
  // Check for type (TV, Movie, etc.)
  if (data.type) { score++; fields++; }
  
  const percentage = fields > 0 ? Math.round((score / fields) * 100) : 0;
  
  return {
    score: percentage,
    level: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low'
  };
}

/**
 * Format Jikan search result
 */
function formatJikanResult(anime) {
  return {
    malId: anime.mal_id,
    title: anime.title,
    titleEnglish: anime.title_english,
    titleJapanese: anime.title_japanese,
    type: anime.type, // TV, Movie, OVA, etc.
    episodes: anime.episodes,
    status: anime.status,
    airing: anime.airing,
    airedFrom: anime.aired?.from,
    airedTo: anime.aired?.to,
    duration: anime.duration, // "24 min per ep"
    rating: anime.rating, // PG, R, etc.
    score: anime.score,
    synopsis: anime.synopsis,
    posterUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    smallPosterUrl: anime.images?.jpg?.small_image_url,
    genres: anime.genres?.map(g => g.name) || [],
    studios: anime.studios?.map(s => s.name) || [],
    year: anime.year,
    season: anime.season,
    source: anime.source // Manga, Light novel, etc.
  };
}

/**
 * Format Jikan anime details for merging
 */
function formatJikanDetails(anime) {
  const formatted = formatJikanResult(anime);
  
  // Extract additional details
  return {
    ...formatted,
    trailerUrl: anime.trailer?.embed_url || anime.trailer?.url,
    trailerYoutubeId: anime.trailer?.youtube_id,
    broadcast: anime.broadcast?.string, // "Mondays at 00:00 (JST)"
    producers: anime.producers?.map(p => p.name) || [],
    licensors: anime.licensors?.map(l => l.name) || [],
    demographics: anime.demographics?.map(d => d.name) || [],
    themes: anime.themes?.map(t => t.name) || [],
    explicitGenres: anime.explicit_genres?.map(g => g.name) || [],
    relations: anime.relations?.map(r => ({
      relation: r.relation,
      entries: r.entry.map(e => ({ malId: e.mal_id, type: e.type, name: e.name }))
    })) || [],
    openingThemes: anime.theme?.openings || [],
    endingThemes: anime.theme?.endings || [],
    episodesList: Array.isArray(anime.episodes) ? anime.episodes.map(ep => ({
      episodeId: ep.mal_id,
      title: ep.title,
      episodeNumber: ep.episode,
      aired: ep.aired,
      score: ep.score,
      filler: ep.filler,
      recap: ep.recap,
      forumUrl: ep.forum_url
    })) : [],
    streaming: anime.streaming?.map(s => ({ name: s.name, url: s.url })) || []
  };
}

/**
 * Parse duration string to minutes
 * @param {string} duration - e.g., "24 min per ep" or "1 hr 23 min"
 */
export function parseJikanDuration(duration) {
  if (!duration) return null;
  
  const hourMatch = duration.match(/(\d+)\s*hr?/i);
  const minMatch = duration.match(/(\d+)\s*min/i);
  
  let minutes = 0;
  if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);
  
  return minutes > 0 ? minutes : null;
}

/**
 * Extract episode count
 * @param {string} episodes - episodes string or number
 */
export function parseJikanEpisodes(episodes) {
  if (typeof episodes === 'number') return episodes;
  if (typeof episodes === 'string') {
    const match = episodes.match(/(\d+)/);
    if (match) return parseInt(match[1]);
  }
  return null;
}

// Export configuration
export const jikanConfig = {
  baseUrl: JIKAN_BASE_URL,
  rateLimit: {
    requestsPerSecond: 3,
    requestsPerMinute: 60
  }
};
