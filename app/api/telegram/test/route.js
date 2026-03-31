import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
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

    const { message } = await request.json();
    
    const { data: settings } = await supabase
      .from('settings')
      .select('telegram_bot_token, telegram_chat_id')
      .single();

    if (!settings?.telegram_bot_token || !settings?.telegram_chat_id) {
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 400 });
    }

    const telegramRes = await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.telegram_chat_id,
        text: message || `🎬 <b>FilmyMela Bot Test</b>\n\n✅ Bot is working correctly!\n\n🎬 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}"><b>FilmyMela</b></a> • Stream & Download Movies`,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    const telegramData = await telegramRes.json();

    if (!telegramRes.ok) {
      return NextResponse.json(
        { error: telegramData.description || 'Telegram API error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
