import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/admin/admins - List all admins (SuperAdmin only)
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if current user is SuperAdmin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'SuperAdmin only' }, { status: 403 });
    }

    // Get all admins
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/admins - Create new admin (SuperAdmin only)
export async function POST(request) {
  try {
    const { name, email, password, role, status } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if current user is SuperAdmin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'SuperAdmin only' }, { status: 403 });
    }

    // Create auth user using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: role || 'Admin' }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Add to admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        name,
        email,
        role: role || 'Admin',
        status: status || 'active'
      });

    if (adminError) {
      return NextResponse.json({ error: 'Failed to create admin record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: authData.user.id,
        name,
        email,
        role: role || 'Admin',
        status: status || 'active'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
