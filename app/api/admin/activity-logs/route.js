import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Fetch admin activity logs
export async function GET(request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if SuperAdmin
    const { data: admin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isSuperAdmin = admin?.role === 'SuperAdmin';

    // Parse query params
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const actionType = searchParams.get('actionType');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    let query = supabase
      .from('admin_activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Regular admins can only see their own logs
    if (!isSuperAdmin) {
      query = query.eq('admin_id', user.id);
    } else if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({ 
      logs: data, 
      total: count,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create activity log (for internal use)
export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      action_type, 
      action_description, 
      entity_type, 
      entity_id, 
      entity_name, 
      metadata 
    } = body;

    // Get admin details
    const { data: admin } = await supabase
      .from('admin_users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Insert log
    const { data, error } = await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        admin_name: admin.name,
        admin_email: admin.email,
        action_type,
        action_description,
        entity_type,
        entity_id,
        entity_name,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    // Update last seen
    await supabase
      .from('admin_users')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
