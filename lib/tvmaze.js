// TVMaze API Service
// Used for enhanced web series/TV show metadata
// No API key required, rate limit: reasonable use

const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

/**
 * Search for shows on TVMaze
 * @param {string} query - Search query
 */
export async function searchTVMaze(query) {
  try {
    const url = `${TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`TVMaze API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      results: data.map(item => formatTVMazeResult(item.show, item.score))
    };
  } catch (error) {
    console.error('TVMaze Search Error:', error);
    return { results: [] };
  }
}

/**
 * Get show details by TVMaze ID
 * @param {number} showId - TVMaze show ID
 */
export async function getTVMazeShowDetails(showId) {
  try {
    const url = `${TVMAZE_BASE_URL}/shows/${showId}?embed[]=episodes&embed[]=seasons&embed[]=cast&embed[]=crew`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`TVMaze API error: ${response.status}`);
    }
    
    const data = await response.json();
    return formatTVMazeDetails(data);
  } catch (error) {
    console.error('TVMaze Details Error:', error);
    return null;
  }
}

/**
 * Get show by IMDB ID
 * @param {string} imdbId - IMDB ID (e.g., "tt0944947")
 */
export async function getTVMazeByImdb(imdbId) {
  try {
    const url = `${TVMAZE_BASE_URL}/lookup/shows?imdb=${imdbId}`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`TVMaze API error: ${response.status}`);
    }
    
    const data = await response.json();
    return await getTVMazeShowDetails(data.id);
  } catch (error) {
    console.error('TVMaze IMDB Lookup Error:', error);
    return null;
  }
}

/**
 * Get show by TheTVDB ID
 * @param {number} tvdbId - TheTVDB ID
 */
export async function getTVMazeByTVDB(tvdbId) {
  try {
    const url = `${TVMAZE_BASE_URL}/lookup/shows?thetvdb=${tvdbId}`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`TVMaze API error: ${response.status}`);
    }
    
    const data = await response.json();
    return await getTVMazeShowDetails(data.id);
  } catch (error) {
    console.error('TVMaze TVDB Lookup Error:', error);
    return null;
  }
}

/**
 * Get show by title match (best match)
 * @param {string} title - Show title
 */
export async function getTVMazeByTitle(title) {
  const searchResults = await searchTVMaze(title);
  if (searchResults.results.length === 0) return null;
  
  // Get details for the best match
  return await getTVMazeShowDetails(searchResults.results[0].tvmazeId);
}

/**
 * Get all episodes for a show
 * @param {number} showId - TVMaze show ID
 */
export async function getTVMazeEpisodes(showId) {
  try {
    const url = `${TVMAZE_BASE_URL}/shows/${showId}/episodes`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`TVMaze API error: ${response.status}`);
    }
    
    const episodes = await response.json();
    return episodes.map(ep => ({
      id: ep.id,
      season: ep.season,
      episodeNumber: ep.number,
      title: ep.name,
      airdate: ep.airdate,
      airtime: ep.airtime,
      airstamp: ep.airstamp,
      runtime: ep.runtime,
      summary: ep.summary,
      image: ep.image?.original || ep.image?.medium,
      rating: ep.rating?.average
    }));
  } catch (error) {
    console.error('TVMaze Episodes Error:', error);
    return [];
  }
}

/**
 * Get seasons info
 * @param {number} showId - TVMaze show ID
 */
export async function getTVMazeSeasons(showId) {
  try {
    const url = `${TVMAZE_BASE_URL}/shows/${showId}/seasons`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`TVMaze API error: ${response.status}`);
    }
    
    const seasons = await response.json();
    return seasons.map(s => ({
      id: s.id,
      seasonNumber: s.number,
      episodeOrder: s.episodeOrder,
      premiereDate: s.premiereDate,
      endDate: s.endDate,
      network: s.network?.name,
      summary: s.summary,
      image: s.image?.original || s.image?.medium
    }));
  } catch (error) {
    console.error('TVMaze Seasons Error:', error);
    return [];
  }
}

/**
 * Format TVMaze search result
 */
function formatTVMazeResult(show, relevanceScore = null) {
  return {
    tvmazeId: show.id,
    url: show.url,
    name: show.name,
    type: show.type, // "Scripted", "Reality", etc.
    language: show.language,
    genres: show.genres || [],
    status: show.status, // "Running", "Ended", etc.
    runtime: show.runtime, // minutes per episode
    averageRuntime: show.averageRuntime,
    premiered: show.premiered, // YYYY-MM-DD
    ended: show.ended,
    officialSite: show.officialSite,
    schedule: show.schedule ? {
      time: show.schedule.time,
      days: show.schedule.days
    } : null,
    rating: show.rating?.average,
    weight: show.weight,
    imdbId: show.externals?.imdb,
    thetvdbId: show.externals?.thetvdb,
    tvrageId: show.externals?.tvrage,
    summary: show.summary,
    posterUrl: show.image?.original,
    mediumPosterUrl: show.image?.medium,
    relevanceScore,
    network: show.network?.name,
    webChannel: show.webChannel?.name,
    country: show.network?.country?.name || show.webChannel?.country?.name
  };
}

/**
 * Format TVMaze show details for merging
 */
function formatTVMazeDetails(show) {
  const formatted = formatTVMazeResult(show);
  
  // Extract embedded data
  const episodes = show._embedded?.episodes || [];
  const seasons = show._embedded?.seasons || [];
  const cast = show._embedded?.cast || [];
  const crew = show._embedded?.crew || [];
  
  // Calculate total episodes
  const totalEpisodes = episodes.length;
  const totalSeasons = seasons.length || Math.max(...episodes.map(ep => ep.season), 0);
  
  return {
    ...formatted,
    totalEpisodes,
    totalSeasons,
    episodes: episodes.map(ep => ({
      id: ep.id,
      season: ep.season,
      episodeNumber: ep.number,
      title: ep.name,
      airdate: ep.airdate,
      runtime: ep.runtime,
      summary: ep.summary,
      image: ep.image?.original || ep.image?.medium,
      rating: ep.rating?.average
    })),
    seasons: seasons.map(s => ({
      id: s.id,
      seasonNumber: s.number,
      episodeOrder: s.episodeOrder,
      premiereDate: s.premiereDate,
      endDate: s.endDate,
      network: s.network?.name,
      summary: s.summary
    })),
    cast: cast.map(person => ({
      personId: person.person?.id,
      name: person.person?.name,
      character: person.character?.name,
      image: person.person?.image?.medium
    })),
    crew: crew.map(member => ({
      personId: member.person?.id,
      name: member.person?.name,
      type: member.type,
      job: member.job
    }))
  };
}

/**
 * Parse runtime string to minutes
 * @param {number|string} runtime - Runtime in minutes or string
 */
export function parseTVMazeRuntime(runtime) {
  if (typeof runtime === 'number') return runtime;
  if (typeof runtime === 'string') {
    const match = runtime.match(/(\d+)/);
    if (match) return parseInt(match[1]);
  }
  return null;
}

/**
 * Get next episode info
 * @param {number} showId - TVMaze show ID
 */
export async function getTVMazeNextEpisode(showId) {
  try {
    const url = `${TVMAZE_BASE_URL}/shows/${showId}?embed=nextepisode`;
    
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`TVMaze API error: ${response.status}`);
    }
    
    const data = await response.json();
    const nextEp = data._embedded?.nextepisode;
    
    if (!nextEp) return null;
    
    return {
      id: nextEp.id,
      season: nextEp.season,
      episodeNumber: nextEp.number,
      title: nextEp.name,
      airdate: nextEp.airdate,
      airtime: nextEp.airtime,
      airstamp: nextEp.airstamp,
      runtime: nextEp.runtime,
      summary: nextEp.summary,
      image: nextEp.image?.original || nextEp.image?.medium
    };
  } catch (error) {
    console.error('TVMaze Next Episode Error:', error);
    return null;
  }
}

// Export configuration
export const tvmazeConfig = {
  baseUrl: TVMAZE_BASE_URL,
  rateLimit: {
    // TVMaze has no strict rate limit but recommends reasonable use
    requestsPerSecond: 5,
    note: 'No API key required'
  }
};
