import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Public access to app download settings
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('app_download_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching app download settings:', error);
      return NextResponse.json(
        { enabled: false, apk_url: '', preview_images: [], app_version: '1.0.0', release_notes: '' },
        { status: 200 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in app-download API:', error);
    return NextResponse.json(
      { enabled: false, apk_url: '', preview_images: [], app_version: '1.0.0', release_notes: '' },
      { status: 200 }
    );
  }
}

// PUT - Update settings (SuperAdmin only)
export async function PUT(request) {
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

    if (admin?.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Forbidden - SuperAdmin only' }, { status: 403 });
    }

    const body = await request.json();
    const { enabled, apk_url, preview_images, app_version, release_notes, id } = body;

    // Get the first settings record
    let settingsId = id;
    
    // If no ID provided, find existing record
    if (!settingsId) {
      const { data: existing } = await supabase
        .from('app_download_settings')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (existing?.id) {
        settingsId = existing.id;
      }
    }
    
    // If still no ID, create new record
    if (!settingsId) {
      const { data: newRecord, error: createError } = await supabase
        .from('app_download_settings')
        .insert({ enabled, apk_url, preview_images, app_version, release_notes })
        .select()
        .single();
      
      if (createError) throw createError;
      return NextResponse.json(newRecord);
    }

    // Update existing record
    const { data, error } = await supabase
      .from('app_download_settings')
      .update({
        enabled,
        apk_url,
        preview_images,
        app_version,
        release_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', settingsId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating app download settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      // Record with that ID doesn't exist, create new one
      const { data: newRecord, error: createError } = await supabase
        .from('app_download_settings')
        .insert({ enabled, apk_url, preview_images, app_version, release_notes })
        .select()
        .single();
      
      if (createError) throw createError;
      return NextResponse.json(newRecord);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in app-download PUT:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
