import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Get admin activity statistics
export async function GET(request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if SuperAdmin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isSuperAdmin = currentAdmin?.role === 'SuperAdmin';

    // Parse query params
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const days = parseInt(searchParams.get('days')) || 30;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build base query
    let baseQuery = supabase
      .from('admin_activity_logs')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (adminId && isSuperAdmin) {
      baseQuery = baseQuery.eq('admin_id', adminId);
    } else if (!isSuperAdmin) {
      baseQuery = baseQuery.eq('admin_id', user.id);
    }

    // Get all logs for stats
    const { data: logs, error: logsError } = await baseQuery;

    if (logsError) throw logsError;

    // Calculate statistics
    const stats = {
      totalActions: logs.length,
      actionBreakdown: {},
      dailyActivity: [],
      mostActiveHours: [],
      recentLogins: 0
    };

    // Action type breakdown
    logs.forEach(log => {
      stats.actionBreakdown[log.action_type] = (stats.actionBreakdown[log.action_type] || 0) + 1;
      if (log.action_type === 'login') {
        stats.recentLogins++;
      }
    });

    // Daily activity (last 7 days)
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }

    logs.forEach(log => {
      const dateStr = new Date(log.created_at).toISOString().split('T')[0];
      if (dailyMap.hasOwnProperty(dateStr)) {
        dailyMap[dateStr]++;
      }
    });

    stats.dailyActivity = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count
    }));

    // Get admin list with last seen (SuperAdmin only)
    let admins = [];
    if (isSuperAdmin) {
      const { data: adminList, error: adminError } = await supabase
        .from('admin_users')
        .select('id, name, email, role, last_seen_at, created_at')
        .order('last_seen_at', { ascending: false });

      if (!adminError) {
        // Get action counts for each admin
        const { data: actionCounts } = await supabase
          .from('admin_activity_logs')
          .select('admin_id', { count: 'exact' })
          .in('admin_id', adminList.map(a => a.id));

        admins = adminList.map(admin => ({
          ...admin,
          totalActions: logs.filter(l => l.admin_id === admin.id).length
        }));
      }
    }

    return NextResponse.json({
      stats,
      admins: isSuperAdmin ? admins : null,
      isSuperAdmin
    });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
