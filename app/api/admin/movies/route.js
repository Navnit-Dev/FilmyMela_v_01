import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Check if admin is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: admin } = await supabase
      .from('admin_users')
      .select('role, name')
      .eq('id', user.id)
      .single();

    if (!admin || !['SuperAdmin', 'Admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.poster_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get max sequence
    const { data: maxSeq } = await supabase
      .from('movies')
      .select('sequence')
      .order('sequence', { ascending: false })
      .limit(1);

    const sequence = (maxSeq?.[0]?.sequence || 0) + 1;

    // Prepare movie data - exclude old fields and clean up empty strings
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
    
    // Calculate has_scenes based on scenes_gallery
    const hasScenes = cleanedFields.scenes_gallery && 
                      Array.isArray(cleanedFields.scenes_gallery) && 
                      cleanedFields.scenes_gallery.length > 0;
    
    const movieData = {
      ...cleanedFields,
      genre: genre_names || [],
      industry: industry_names?.[0] || [],
      has_scenes: hasScenes,
      sequence,
      created_by: user.id
    };

    // Insert movie using RPC to bypass schema cache issues
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('insert_movie_with_episodes', { movie_data: movieData });

    let data = rpcData;

    if (rpcError) {
      // Fallback to direct insert if RPC fails
      const { data: directData, error: directError } = await supabase
        .from('movies')
        .insert({
          ...movieData,
          has_scenes: undefined
        })
        .select()
        .single();

      if (directError) throw directError;
      data = directData;
    }

    // Log activity
    try {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: user.id,
          admin_name: admin.name,
          admin_email: user.email,
          action_type: 'create_movie',
          action_description: `Created movie "${data.name}"`,
          entity_type: 'movie',
          entity_id: data.id,
          entity_name: data.name,
          metadata: { poster_url: data.poster_url }
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    // Trigger Telegram notification if enabled (direct, no auth needed)
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('telegram_bot_token, telegram_chat_id, telegram_enabled')
        .single();

      if (settings?.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) {
        const message = formatTelegramMessage(data);
        
        console.log('Sending Telegram notification to chat:', settings.telegram_chat_id);
        
        const telegramRes = await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegram_chat_id,
            photo: data.poster_url,
            caption: message,
            parse_mode: 'HTML'
          })
        });
        
        const telegramData = await telegramRes.json();
        
        if (!telegramRes.ok || !telegramData.ok) {
          console.error('Telegram API error:', telegramData);
          // Try sending text-only as fallback
          const textRes = await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: settings.telegram_chat_id,
              text: message,
              parse_mode: 'HTML'
            })
          });
          const textData = await textRes.json();
          if (textData.ok) {
            // console.log('Telegram text notification sent for movie:', data.name);
          } else {
            console.error('Telegram text fallback also failed:', textData);
          }
        } else {
          // console.log('Telegram photo notification sent for movie:', data.name, 'Message ID:', telegramData.result?.message_id);
        }
      } else {
        console.log('Telegram not configured - enabled:', settings?.telegram_enabled, 'hasToken:', !!settings?.telegram_bot_token, 'hasChatId:', !!settings?.telegram_chat_id);
      }
    } catch (notifyError) {
      console.error('Telegram notification error:', notifyError);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create movie error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create movie' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const search = searchParams.get('search') || '';
    const hasScenes = searchParams.get('has_scenes');

    let query = supabase
      .from('movies')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (hasScenes !== null && hasScenes !== '') {
      try {
        query = query.eq('has_scenes', hasScenes === 'true');
      } catch (e) {
        // If has_scenes column not in cache, skip this filter
        console.log('has_scenes filter skipped due to schema cache');
      }
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // If error is about missing column, retry without that filter
      if (error.message?.includes('has_scenes')) {
        const { data: retryData, error: retryError, count: retryCount } = await supabase
          .from('movies')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (retryError) throw retryError;
        return NextResponse.json({ movies: retryData || [], count: retryCount });
      }
      throw error;
    }

    return NextResponse.json({ movies: data || [], count });
  } catch (error) {
    console.error('Get movies error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function formatTelegramMessage(movie) {
  const downloadLinks = Object.entries(movie.download_urls || {})
    .map(([quality, url]) => `    <b>${quality}</b> • <a href="${url}">📥 Download</a>`)
    .join('\n');

  // Handle download parts for series/anime
  let partsInfo = '';
  if (movie.is_in_parts && movie.download_parts && movie.download_parts.length > 0) {
    partsInfo = movie.download_parts.map(part => {
      const partLinks = Object.entries(part.downloads || {})
        .map(([quality, url]) => `      ${quality}: <a href="${url}">📥</a>`)
        .join('\n');
      return `\n📦 <b>${part.name}</b> (${part.episode_range})\n${partLinks}`;
    }).join('\n');
  }

  // Content type display
  const contentTypeLabels = {
    movie: '🎬 Movie',
    web_series: '📺 Web Series',
    anime: '🎌 Anime'
  };
  const contentTypeDisplay = contentTypeLabels[movie.content_type] || '🎬 Movie';

  // Episode info for series/anime
  let episodeInfo = '';
  if (movie.content_type !== 'movie') {
    episodeInfo = `    📺 <b>Episodes:</b> ${movie.total_episodes || 'N/A'}\n    📅 <b>Seasons:</b> ${movie.seasons || 'N/A'}\n`;
  }
  
  return `
<b>🎬 NEW ${movie.content_type === 'movie' ? 'MOVIE' : 'SERIES'} ADDED</b>

<b>🎭 ${movie.name}</b>
<b>${contentTypeDisplay}</b>

<b>📊 Info:</b>
    📅 <b>Year:</b> ${movie.release_year}
    ⭐ <b>Rating:</b> ${movie.rating}/10
${episodeInfo}${movie.tagline ? `    💬 <b>Tagline:</b> ${movie.tagline}\n` : ''}

<b>📝 Synopsis:</b>
<i>${movie.description?.substring(0, 300)}${movie.description?.length > 300 ? '...' : ''}</i>

${movie.is_in_parts && partsInfo ? `<b>📦 Download Parts:</b>${partsInfo}\n` : (downloadLinks ? `<b>💾 Download Options:</b>\n${downloadLinks}\n` : '')}

<b>▶️ WATCH ONLINE NOW</b>
<a href="${process.env.NEXT_PUBLIC_APP_URL}/movie/${movie.id}">🎬 Click Here to Watch on FilmyMela</a>

🎬 <b>FilmyMela</b> • Stream & Download HD Movies`.trim();
}
