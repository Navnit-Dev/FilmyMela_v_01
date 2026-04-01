// Content Service - Single API per Content Type
// Movie: TMDB | Anime: Jikan | Web Series: TVMaze

import { searchTMDB, getMovieDetails, getTVShowDetails, getTMDBImageUrl } from './tmdb.js';
import { searchJikan, getJikanAnimeDetails, getJikanByTitle, parseJikanDuration } from './jikan.js';
import { searchTVMaze, getTVMazeShowDetails, getTVMazeByTitle, getTVMazeByImdb } from './tvmaze.js';

export const ContentTypes = {
  MOVIE: 'movie',
  ANIME: 'anime',
  WEB_SERIES: 'web_series'
};

export async function getContentDetails({ query, type, imdbId = null, apiId = null }) {
  switch (type) {
    case ContentTypes.MOVIE:
      return await getMovieDetailsFromTMDB({ query, tmdbId: apiId });
    case ContentTypes.ANIME:
      return await getAnimeDetailsFromJikan({ query, malId: apiId });
    case ContentTypes.WEB_SERIES:
      return await getWebSeriesDetailsFromTVMaze({ query, imdbId, tvmazeId: apiId });
    default:
      throw new Error(`Unsupported content type: ${type}`);
  }
}

async function getMovieDetailsFromTMDB({ query, tmdbId }) {
  let data;
  let sourceId = tmdbId;
  
  if (tmdbId) {
    data = await getMovieDetails(tmdbId);
  } else {
    const searchResults = await searchTMDB(query, 'movie', 1);
    if (searchResults.results.length === 0) return { _meta: { source: 'tmdb', found: false } };
    sourceId = searchResults.results[0].tmdbId;
    data = await getMovieDetails(sourceId);
  }
  
  if (!data) return { _meta: { source: 'tmdb', found: false } };
  
  return {
    name: data.name,
    originalName: data.originalName,
    tagline: data.tagline,
    description: data.description,
    rating: data.rating,
    releaseYear: data.releaseYear,
    releaseDate: data.releaseDate,
    duration: data.duration,
    runtimeMinutes: data.runtimeMinutes,
    genres: data.genres,
    genreIds: data.genreIds,
    cast: data.cast,
    posterUrl: data.posterUrl,
    backdropUrl: data.backdropUrl,
    scenesGallery: data.backdrops,
    videoUrl: data.trailerUrl,
    imdbId: data.imdbId,
    tmdbId: data.tmdbId,
    originalLanguage: data.originalLanguage,
    studios: data.productionCompanies,
    productionCompanies: data.productionCompanies,
    contentType: 'movie',
    _meta: { source: 'tmdb', sourceId, found: true, confidence: calculateConfidence(data) }
  };
}

async function getAnimeDetailsFromJikan({ query, malId }) {
  let data;
  let sourceId = malId;
  
  if (malId) {
    data = await getJikanAnimeDetails(malId);
  } else {
    data = await getJikanByTitle(query);
  }
  
  if (!data || !data._meta?.found) {
    return { _meta: { source: 'jikan', sourceId: null, found: false, confidence: { score: 0, level: 'low' } } };
  }
  
  sourceId = data.malId;
  const episodeDurationMin = parseJikanDuration(data.duration);
  
  // Extract cast names from Jikan character data
  const cast = data.cast?.map(char => {
    // Return voice actor name if available, otherwise character name
    if (char.voiceActor?.name) {
      return `${char.characterName} (${char.voiceActor.name})`;
    }
    return char.characterName;
  }) || [];
  
  return {
    name: data.title,
    originalName: data.titleJapanese || data.titleEnglish || data.title,
    tagline: data.tagline || '',
    description: data.synopsis,
    rating: data.score,
    releaseYear: data.year,
    releaseDate: data.airedFrom,
    duration: data.duration,
    episodeDuration: episodeDurationMin ? `${Math.floor(episodeDurationMin / 60)}h ${episodeDurationMin % 60}m` : '',
    episodeRuntimeMinutes: episodeDurationMin,
    totalEpisodes: data.episodes,
    genres: data.genres,
    cast: cast, // Extract cast from Jikan
    posterUrl: data.posterUrl,
    backdropUrl: data.posterUrl, // Use poster as fallback
    scenesGallery: [],
    videoUrl: data.trailerUrl || '',
    malId: data.malId,
    originalLanguage: 'Japanese',
    studios: data.studios,
    productionCompanies: data.studios,
    contentType: 'anime',
    // Anime-specific fields
    airedFrom: data.airedFrom,
    airedTo: data.airedTo,
    broadcast: data.broadcast,
    source: data.source,
    _meta: {
      source: data._meta?.source || 'jikan',
      sourceId: data._meta?.sourceId || sourceId,
      found: data._meta?.found !== false,
      confidence: data._meta?.confidence || calculateConfidence({
        name: data.title,
        description: data.synopsis,
        posterUrl: data.posterUrl,
        score: data.score,
        episodes: data.episodes,
        studios: data.studios
      })
    }
  };
}

async function getWebSeriesDetailsFromTVMaze({ query, imdbId, tvmazeId }) {
  let data;
  let sourceId = tvmazeId;
  
  if (tvmazeId) {
    data = await getTVMazeShowDetails(tvmazeId);
  } else if (imdbId) {
    data = await getTVMazeByImdb(imdbId);
  } else {
    data = await getTVMazeByTitle(query);
  }
  
  if (!data) return { _meta: { source: 'tvmaze', found: false } };
  
  sourceId = data.tvmazeId;
  
  return {
    name: data.name,
    originalName: data.name,
    tagline: '',
    description: data.summary,
    rating: data.rating,
    releaseYear: data.premiered ? new Date(data.premiered).getFullYear() : null,
    releaseDate: data.premiered,
    duration: data.runtime ? `${data.runtime} min` : '',
    episodeDuration: data.runtime ? `${data.runtime}m` : '',
    episodeRuntimeMinutes: data.runtime,
    totalEpisodes: data.totalEpisodes,
    seasons: data.totalSeasons,
    genres: data.genres,
    cast: data.cast?.map(c => c.name) || [],
    posterUrl: data.posterUrl,
    backdropUrl: data.posterUrl,
    scenesGallery: [],
    videoUrl: '',
    tvmazeId: data.tvmazeId,
    imdbId: data.imdbId,
    originalLanguage: data.language,
    network: data.network,
    airingSchedule: data.schedule,
    airingStatus: data.status,
    contentType: 'web_series',
    _meta: { source: 'tvmaze', sourceId, found: true, confidence: calculateConfidence({ name: data.name, description: data.summary, posterUrl: data.posterUrl, rating: data.rating }) }
  };
}

export async function searchContent(query, type, limit = 5) {
  switch (type) {
    case ContentTypes.MOVIE: return await searchTMDBOnly(query, limit);
    case ContentTypes.ANIME: return await searchJikanOnly(query, limit);
    case ContentTypes.WEB_SERIES: return await searchTVMazeOnly(query, limit);
    default: return [];
  }
}

async function searchTMDBOnly(query, limit) {
  try {
    const results = await searchTMDB(query, 'movie', 1);
    return (results.results || []).slice(0, limit).map(r => ({
      id: r.tmdbId, sourceId: r.tmdbId, title: r.title, originalTitle: r.originalTitle,
      year: r.year, posterUrl: r.posterPath, rating: r.voteAverage, overview: r.overview,
      source: 'tmdb', sourceBadge: 'TMDB'
    }));
  } catch (error) {
    console.error('TMDB search error:', error);
    return [];
  }
}

async function searchJikanOnly(query, limit) {
  try {
    const results = await searchJikan(query, limit);
    return (results.results || []).map(r => ({
      id: r.malId, sourceId: r.malId, title: r.title, originalTitle: r.titleJapanese,
      year: r.year, posterUrl: r.posterUrl, rating: r.score, overview: r.synopsis,
      episodes: r.episodes, studios: r.studios, source: 'jikan', sourceBadge: 'Jikan'
    }));
  } catch (error) {
    console.error('Jikan search error:', error);
    return [];
  }
}

async function searchTVMazeOnly(query, limit) {
  try {
    const results = await searchTVMaze(query);
    return (results.results || []).slice(0, limit).map(r => ({
      id: r.tvmazeId, sourceId: r.tvmazeId, title: r.name, originalTitle: r.name,
      year: r.premiered ? new Date(r.premiered).getFullYear() : null,
      posterUrl: r.posterUrl || r.mediumPosterUrl, rating: r.rating,
      overview: r.summary, runtime: r.runtime, network: r.network,
      status: r.status, source: 'tvmaze', sourceBadge: 'TVMaze'
    }));
  } catch (error) {
    console.error('TVMaze search error:', error);
    return [];
  }
}

export async function quickSearch(query, type, limit = 5) {
  const results = await searchContent(query, type, limit);
  return results.map(r => ({
    id: r.id, sourceId: r.sourceId, title: r.title, originalTitle: r.originalTitle,
    year: r.year, posterUrl: r.posterUrl, rating: r.rating,
    overview: r.overview?.substring(0, 100) + (r.overview?.length > 100 ? '...' : ''),
    source: r.source, sourceBadge: r.sourceBadge,
    episodes: r.episodes, studios: r.studios, runtime: r.runtime, network: r.network
  }));
}

function calculateConfidence(data) {
  let score = 0;
  let fields = 0;
  
  if (data.name || data.title) { score++; fields++; }
  if (data.description || data.overview || data.synopsis) { score++; fields++; }
  if (data.posterUrl || data.posterPath) { score++; fields++; }
  if (data.rating || data.score || data.voteAverage) { score++; fields++; }
  if (data.year || data.releaseYear) { score++; fields++; }
  if (data.genres?.length) { score++; fields++; }
  if (data.episodes || data.totalEpisodes) { score++; fields++; }
  if (data.studios?.length) { score++; fields++; }
  if (data.type) { score++; fields++; }
  
  const percentage = fields > 0 ? Math.round((score / fields) * 100) : 0;
  return { score: percentage, level: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low' };
}

export { getTMDBImageUrl };
export const contentService = { getContentDetails, searchContent, quickSearch, ContentTypes };
export default contentService;
