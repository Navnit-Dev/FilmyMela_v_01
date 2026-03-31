import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Check SuperAdmin helper
async function checkSuperAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', status: 401 };

  const { data: currentAdmin } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!currentAdmin || currentAdmin.role !== 'SuperAdmin') {
    return { error: 'SuperAdmin only', status: 403 };
  }

  return { user };
}

// PUT /api/admin/admins/[id] - Update admin
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, role, status } = await request.json();
    
    const supabase = await createClient();
    const auth = await checkSuperAdmin(supabase);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Update admin_users table
    const { error } = await supabase
      .from('admin_users')
      .update({ name, role, status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Admin updated' });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/admins/[id] - Partial update (toggle status)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    const supabase = await createClient();
    const auth = await checkSuperAdmin(supabase);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { error } = await supabase
      .from('admin_users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Admin updated' });
  } catch (error) {
    console.error('Error patching admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/admins/[id] - Delete admin
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const supabase = await createClient();
    const auth = await checkSuperAdmin(supabase);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Prevent deleting yourself
    if (id === auth.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Delete from admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (adminError) {
      return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      console.log('Auth delete error (may be expected):', authError.message);
    }

    return NextResponse.json({ success: true, message: 'Admin deleted' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
