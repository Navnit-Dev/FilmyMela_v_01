import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// PUT /api/admin/movies/sequence - Update movie sequences
export async function PUT(request) {
  try {
    const { updates } = await request.json();
    
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates must be an array' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check admin auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admin_users')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (!admin || admin.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update each movie's sequence
    const errors = [];
    for (const update of updates) {
      const { error } = await supabase
        .from('movies')
        .update({ sequence: update.sequence })
        .eq('id', update.id);

      if (error) errors.push({ id: update.id, error: error.message });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Some updates failed', 
        errors 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sequence updated successfully' 
    });
  } catch (error) {
    console.error('Error updating sequence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
