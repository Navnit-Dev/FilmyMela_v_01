import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/admin/content-types - List all content types
export async function GET() {
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

    const { data, error } = await supabase
      .from('content_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ contentTypes: data });
  } catch (error) {
    console.error('Get content types error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
