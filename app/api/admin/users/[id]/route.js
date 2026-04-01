import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// PATCH /api/admin/users/[id] - Update user status
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check admin auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!admin || !['SuperAdmin', 'Admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    let updateData = {};
    
    switch (action) {
      case 'ban':
        updateData = { status: 'banned', banned_at: new Date().toISOString() };
        break;
      case 'unban':
        updateData = { status: 'active', banned_at: null };
        break;
      case 'activate':
        updateData = { status: 'active' };
        break;
      case 'deactivate':
        updateData = { status: 'inactive' };
        break;
      default:
        updateData = body;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check admin auth - only SuperAdmin can delete
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
      return NextResponse.json({ error: 'Only SuperAdmin can delete users' }, { status: 403 });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
