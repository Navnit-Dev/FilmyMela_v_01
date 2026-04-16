import { createClient } from '@/lib/supabase-server';

export async function logAdminActivity({
  actionType,
  actionDescription,
  entityType = null,
  entityId = null,
  entityName = null,
  metadata = {}
}) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get admin details
    const { data: admin } = await supabase
      .from('admin_users')
      .select('name, email, role')
      .eq('id', user.id)
      .single();

    if (!admin) return;

    // Get request headers for IP and user agent (only available in API routes)
    // These will be passed from the API route
    
    // Insert activity log
    const { error } = await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        admin_name: admin.name,
        admin_email: admin.email,
        action_type: actionType,
        action_description: actionDescription,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        metadata: metadata
      });

    if (error) {
      console.error('Error logging admin activity:', error);
    }

    // Update last seen and action count
    await supabase
      .from('admin_users')
      .update({
        last_seen_at: new Date().toISOString(),
        total_actions: supabase.rpc('increment', { row_id: user.id })
      })
      .eq('id', user.id);

  } catch (error) {
    console.error('Error in logAdminActivity:', error);
  }
}

export async function getAdminActivityLogs({
  adminId = null,
  actionType = null,
  limit = 50,
  offset = 0,
  startDate = null,
  endDate = null
}) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('admin_activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (adminId) {
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

    return { data, count, error: null };
  } catch (error) {
    console.error('Error fetching admin activity logs:', error);
    return { data: [], count: 0, error: error.message };
  }
}

export async function getAdminStats(adminId = null) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('admin_activity_logs')
      .select('action_type', { count: 'exact' });

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    // Get action type breakdown
    const { data: actionTypes, error: actionError } = await supabase
      .from('admin_activity_logs')
      .select('action_type');

    if (actionError) throw actionError;

    const actionCounts = actionTypes.reduce((acc, log) => {
      acc[log.action_type] = (acc[log.action_type] || 0) + 1;
      return acc;
    }, {});

    // Get recent activity count (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let recentQuery = supabase
      .from('admin_activity_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    if (adminId) {
      recentQuery = recentQuery.eq('admin_id', adminId);
    }

    const { count: recentCount, error: recentError } = await recentQuery;

    if (recentError) throw recentError;

    return {
      totalActions: actionTypes.length,
      recentActions: recentCount || 0,
      actionBreakdown: actionCounts,
      error: null
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return { totalActions: 0, recentActions: 0, actionBreakdown: {}, error: error.message };
  }
}

// Action types enum
export const AdminActionTypes = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE_MOVIE: 'create_movie',
  UPDATE_MOVIE: 'update_movie',
  DELETE_MOVIE: 'delete_movie',
  CREATE_SECTION: 'create_section',
  UPDATE_SECTION: 'update_section',
  DELETE_SECTION: 'delete_section',
  CREATE_GENRE: 'create_genre',
  UPDATE_GENRE: 'update_genre',
  DELETE_GENRE: 'delete_genre',
  CREATE_INDUSTRY: 'create_industry',
  UPDATE_INDUSTRY: 'update_industry',
  DELETE_INDUSTRY: 'delete_industry',
  CREATE_POPUP: 'create_popup',
  UPDATE_POPUP: 'update_popup',
  DELETE_POPUP: 'delete_popup',
  UPDATE_SETTINGS: 'update_settings',
  CREATE_ADMIN: 'create_admin',
  UPDATE_ADMIN: 'update_admin',
  DELETE_ADMIN: 'delete_admin',
  UPLOAD_IMAGE: 'upload_image',
  UPLOAD_APK: 'upload_apk',
  UPDATE_APP_DOWNLOAD: 'update_app_download'
};

// Action type labels for display
export const ActionTypeLabels = {
  [AdminActionTypes.LOGIN]: 'Login',
  [AdminActionTypes.LOGOUT]: 'Logout',
  [AdminActionTypes.CREATE_MOVIE]: 'Created Movie',
  [AdminActionTypes.UPDATE_MOVIE]: 'Updated Movie',
  [AdminActionTypes.DELETE_MOVIE]: 'Deleted Movie',
  [AdminActionTypes.CREATE_SECTION]: 'Created Section',
  [AdminActionTypes.UPDATE_SECTION]: 'Updated Section',
  [AdminActionTypes.DELETE_SECTION]: 'Deleted Section',
  [AdminActionTypes.CREATE_GENRE]: 'Created Genre',
  [AdminActionTypes.UPDATE_GENRE]: 'Updated Genre',
  [AdminActionTypes.DELETE_GENRE]: 'Deleted Genre',
  [AdminActionTypes.CREATE_INDUSTRY]: 'Created Industry',
  [AdminActionTypes.UPDATE_INDUSTRY]: 'Updated Industry',
  [AdminActionTypes.DELETE_INDUSTRY]: 'Deleted Industry',
  [AdminActionTypes.CREATE_POPUP]: 'Created Popup',
  [AdminActionTypes.UPDATE_POPUP]: 'Updated Popup',
  [AdminActionTypes.DELETE_POPUP]: 'Deleted Popup',
  [AdminActionTypes.UPDATE_SETTINGS]: 'Updated Settings',
  [AdminActionTypes.CREATE_ADMIN]: 'Created Admin',
  [AdminActionTypes.UPDATE_ADMIN]: 'Updated Admin',
  [AdminActionTypes.DELETE_ADMIN]: 'Deleted Admin',
  [AdminActionTypes.UPLOAD_IMAGE]: 'Uploaded Image',
  [AdminActionTypes.UPLOAD_APK]: 'Uploaded APK',
  [AdminActionTypes.UPDATE_APP_DOWNLOAD]: 'Updated App Download'
};

// Action type colors for UI
export const ActionTypeColors = {
  [AdminActionTypes.LOGIN]: 'bg-green-500/10 text-green-500',
  [AdminActionTypes.LOGOUT]: 'bg-gray-500/10 text-gray-500',
  [AdminActionTypes.CREATE_MOVIE]: 'bg-blue-500/10 text-blue-500',
  [AdminActionTypes.UPDATE_MOVIE]: 'bg-yellow-500/10 text-yellow-500',
  [AdminActionTypes.DELETE_MOVIE]: 'bg-red-500/10 text-red-500',
  [AdminActionTypes.CREATE_SECTION]: 'bg-blue-500/10 text-blue-500',
  [AdminActionTypes.UPDATE_SECTION]: 'bg-yellow-500/10 text-yellow-500',
  [AdminActionTypes.DELETE_SECTION]: 'bg-red-500/10 text-red-500',
  [AdminActionTypes.CREATE_GENRE]: 'bg-blue-500/10 text-blue-500',
  [AdminActionTypes.UPDATE_GENRE]: 'bg-yellow-500/10 text-yellow-500',
  [AdminActionTypes.DELETE_GENRE]: 'bg-red-500/10 text-red-500',
  [AdminActionTypes.CREATE_INDUSTRY]: 'bg-blue-500/10 text-blue-500',
  [AdminActionTypes.UPDATE_INDUSTRY]: 'bg-yellow-500/10 text-yellow-500',
  [AdminActionTypes.DELETE_INDUSTRY]: 'bg-red-500/10 text-red-500',
  [AdminActionTypes.CREATE_POPUP]: 'bg-blue-500/10 text-blue-500',
  [AdminActionTypes.UPDATE_POPUP]: 'bg-yellow-500/10 text-yellow-500',
  [AdminActionTypes.DELETE_POPUP]: 'bg-red-500/10 text-red-500',
  [AdminActionTypes.UPDATE_SETTINGS]: 'bg-purple-500/10 text-purple-500',
  [AdminActionTypes.CREATE_ADMIN]: 'bg-blue-500/10 text-blue-500',
  [AdminActionTypes.UPDATE_ADMIN]: 'bg-yellow-500/10 text-yellow-500',
  [AdminActionTypes.DELETE_ADMIN]: 'bg-red-500/10 text-red-500',
  [AdminActionTypes.UPLOAD_IMAGE]: 'bg-cyan-500/10 text-cyan-500',
  [AdminActionTypes.UPLOAD_APK]: 'bg-cyan-500/10 text-cyan-500',
  [AdminActionTypes.UPDATE_APP_DOWNLOAD]: 'bg-purple-500/10 text-purple-500'
};
