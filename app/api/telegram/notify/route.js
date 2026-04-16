import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
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

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { movie } = await request.json();
    
    console.log('Telegram notify triggered for movie:', movie?.name);
    
    // Get Telegram settings
    const { data: settings } = await supabase
      .from('settings')
      .select('telegram_bot_token, telegram_chat_id, telegram_enabled')
      .single();

    console.log('Telegram settings:', { 
      enabled: settings?.telegram_enabled, 
      hasToken: !!settings?.telegram_bot_token,
      hasChatId: !!settings?.telegram_chat_id 
    });

    if (!settings?.telegram_enabled || !settings.telegram_bot_token || !settings.telegram_chat_id) {
      console.log('Telegram notification skipped - not configured');
      return NextResponse.json({ skipped: true, reason: 'Telegram not configured' });
    }

    // Format message
    const message = formatTelegramMessage(movie);

    // Send to Telegram
    const telegramRes = await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.telegram_chat_id,
        photo: movie.poster_url,
        caption: message,
        parse_mode: 'HTML'
      })
    });

    const telegramData = await telegramRes.json();

    if (!telegramRes.ok) {
      console.error('Telegram API error:', telegramData);
      return NextResponse.json({ error: 'Failed to send Telegram message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: telegramData.result?.message_id });
  } catch (error) {
    console.error('Telegram notify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatTelegramMessage(movie) {
  const downloadLinks = Object.entries(movie.download_urls || {})
    .map(([quality, url]) => `  <b>${quality}:</b> <a href="${url}">Download</a>`)
    .join('\n');

  return `
<b>🎬 ${movie.name}</b>

📅 <b>Year:</b> ${movie.release_year}
⭐ <b>Rating:</b> ${movie.rating}/10
🎭 <b>Genre:</b> ${movie.genre?.join(', ') || 'N/A'}
🎬 <b>Industry:</b> ${movie.industry || 'N/A'}

📝 <b>Synopsis:</b>
${movie.description?.substring(0, 200)}${movie.description?.length > 200 ? '...' : ''}

${downloadLinks ? `⬇️ <b>Download Links:</b>\n${downloadLinks}` : ''}

🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL}/movie/${movie.id}">Watch Online</a>

<i>via FilmyMela</i>
  `.trim();
}
