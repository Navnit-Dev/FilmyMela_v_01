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
      .select('role')
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

    // Insert movie
    const { data, error } = await supabase
      .from('movies')
      .insert({
        ...body,
        sequence,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

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
            console.log('Telegram text notification sent for movie:', data.name);
          } else {
            console.error('Telegram text fallback also failed:', textData);
          }
        } else {
          console.log('Telegram photo notification sent for movie:', data.name, 'Message ID:', telegramData.result?.message_id);
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

    let query = supabase
      .from('movies')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

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

  const genres = movie.genre?.join('  •  ') || 'N/A';
  
  // Rating stars
  const stars = '⭐'.repeat(Math.floor(movie.rating / 2)) + '☆'.repeat(5 - Math.floor(movie.rating / 2));
  
  return `

<b>🎬 NEW MOVIE ADDED</b>

<b>🎭 ${movie.name}</b>

<b>📊 Info:</b>
    📅 <b>Year:</b> ${movie.release_year}
    ⭐ <b>Rating:</b> ${stars} (${movie.rating}/10)
    🎭 <b>Genre:</b> ${genres}
    🎬 <b>Industry:</b> ${movie.industry || 'N/A'}
    ⏱ <b>Duration:</b> ${movie.duration || 'N/A'}

<b>📝 Synopsis:</b>
<i>${movie.description?.substring(0, 250)}${movie.description?.length > 250 ? '...' : ''}</i>

${downloadLinks ? `\n<b>💾 Download Options:</b>\n${downloadLinks}\n` : ''}

<b>▶️ WATCH ONLINE NOW </b>
<a href="${process.env.NEXT_PUBLIC_APP_URL}/movie/${movie.id}">Click Here :🎬 FilmyMela</a>
  🎬 <b>FilmyMela</b> • HD Movies  │
   Stream & Download   │  `.trim();
}
