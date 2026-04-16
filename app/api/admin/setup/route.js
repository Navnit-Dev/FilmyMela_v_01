import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Create first admin user (only works if no admins exist)
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check if admin already exists
    const { count, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (count > 0) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 403 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'SuperAdmin' }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Add to admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        name,
        email,
        role: 'SuperAdmin',
        status: 'active'
      });

    if (adminError) {
      return NextResponse.json(
        { error: 'Failed to create admin record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
