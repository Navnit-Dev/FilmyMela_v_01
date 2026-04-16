'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Activity,
  User,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Settings,
  BarChart3,
  Users,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ActionIcons = {
  login: LogIn,
  logout: LogOut,
  create_movie: Plus,
  update_movie: Pencil,
  delete_movie: Trash2,
  create_section: Plus,
  update_section: Pencil,
  delete_section: Trash2,
  create_genre: Plus,
  update_genre: Pencil,
  delete_genre: Trash2,
  create_industry: Plus,
  update_industry: Pencil,
  delete_industry: Trash2,
  create_popup: Plus,
  update_popup: Pencil,
  delete_popup: Trash2,
  update_settings: Settings,
  create_admin: Plus,
  update_admin: Pencil,
  delete_admin: Trash2,
  upload_image: Upload,
  upload_apk: Upload,
  update_app_download: Settings
};

const ActionColors = {
  login: 'bg-green-500/10 text-green-500',
  logout: 'bg-gray-500/10 text-gray-500',
  create_movie: 'bg-blue-500/10 text-blue-500',
  update_movie: 'bg-yellow-500/10 text-yellow-500',
  delete_movie: 'bg-red-500/10 text-red-500',
  create_section: 'bg-blue-500/10 text-blue-500',
  update_section: 'bg-yellow-500/10 text-yellow-500',
  delete_section: 'bg-red-500/10 text-red-500',
  create_genre: 'bg-blue-500/10 text-blue-500',
  update_genre: 'bg-yellow-500/10 text-yellow-500',
  delete_genre: 'bg-red-500/10 text-red-500',
  create_industry: 'bg-blue-500/10 text-blue-500',
  update_industry: 'bg-yellow-500/10 text-yellow-500',
  delete_industry: 'bg-red-500/10 text-red-500',
  create_popup: 'bg-blue-500/10 text-blue-500',
  update_popup: 'bg-yellow-500/10 text-yellow-500',
  delete_popup: 'bg-red-500/10 text-red-500',
  update_settings: 'bg-purple-500/10 text-purple-500',
  create_admin: 'bg-blue-500/10 text-blue-500',
  update_admin: 'bg-yellow-500/10 text-yellow-500',
  delete_admin: 'bg-red-500/10 text-red-500',
  upload_image: 'bg-cyan-500/10 text-cyan-500',
  upload_apk: 'bg-cyan-500/10 text-cyan-500',
  update_app_download: 'bg-purple-500/10 text-purple-500'
};

const ActionLabels = {
  login: 'Login',
  logout: 'Logout',
  create_movie: 'Created Movie',
  update_movie: 'Updated Movie',
  delete_movie: 'Deleted Movie',
  create_section: 'Created Section',
  update_section: 'Updated Section',
  delete_section: 'Deleted Section',
  create_genre: 'Created Genre',
  update_genre: 'Updated Genre',
  delete_genre: 'Deleted Genre',
  create_industry: 'Created Industry',
  update_industry: 'Updated Industry',
  delete_industry: 'Deleted Industry',
  create_popup: 'Created Popup',
  update_popup: 'Updated Popup',
  delete_popup: 'Deleted Popup',
  update_settings: 'Updated Settings',
  create_admin: 'Created Admin',
  update_admin: 'Updated Admin',
  delete_admin: 'Deleted Admin',
  upload_image: 'Uploaded Image',
  upload_apk: 'Uploaded APK',
  update_app_download: 'Updated App Download'
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    adminId: '',
    actionType: '',
    days: 7
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0
  });

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        days: filters.days.toString()
      });

      if (filters.adminId) params.append('adminId', filters.adminId);
      if (filters.actionType) params.append('actionType', filters.actionType);

      const res = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await res.json();

      if (res.ok) {
        setLogs(data.logs);
        setPagination(prev => ({ ...prev, total: data.total }));
      } else {
        toast.error(data.error || 'Failed to fetch logs');
      }
    } catch (error) {
      toast.error('Error fetching activity logs');
    }
  }, [filters, pagination.limit, pagination.offset]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        days: filters.days.toString()
      });

      if (filters.adminId) params.append('adminId', filters.adminId);

      const res = await fetch(`/api/admin/activity-stats?${params}`);
      const data = await res.json();

      if (res.ok) {
        setStats(data.stats);
        setAdmins(data.admins || []);
        setIsSuperAdmin(data.isSuperAdmin);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
    fetchStats();
    setLoading(false);
  }, [fetchLogs, fetchStats]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
  };

  const handlePageChange = (direction) => {
    setPagination(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset + (direction * prev.limit))
    }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="min-h-screen bg-[var(--surface)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Admin Activity</h1>
              <p className="text-[var(--on-surface-variant)] text-sm">
                Track all admin actions and system events
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--on-surface-variant)]">Total Actions</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalActions}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <div className="flex items-center gap-3 mb-2">
                <LogIn className="w-5 h-5 text-green-500" />
                <span className="text-sm text-[var(--on-surface-variant)]">Logins</span>
              </div>
              <p className="text-2xl font-bold">{stats.recentLogins}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <div className="flex items-center gap-3 mb-2">
                <Plus className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-[var(--on-surface-variant)]">Created</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.entries(stats.actionBreakdown)
                  .filter(([key]) => key.startsWith('create_'))
                  .reduce((sum, [, count]) => sum + count, 0)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <div className="flex items-center gap-3 mb-2">
                <Pencil className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-[var(--on-surface-variant)]">Updated</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.entries(stats.actionBreakdown)
                  .filter(([key]) => key.startsWith('update_'))
                  .reduce((sum, [, count]) => sum + count, 0)}
              </p>
            </div>
          </div>
        )}

        {/* Admins List (SuperAdmin only) */}
        {isSuperAdmin && admins.length > 0 && (
          <div className="mb-6 p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins.map(admin => (
                <div
                  key={admin.id}
                  onClick={() => setFilters(prev => ({ ...prev, adminId: admin.id }))}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    filters.adminId === admin.id
                      ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                      : 'bg-[var(--surface)] hover:bg-[var(--surface-container-high)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-xs text-[var(--on-surface-variant)]">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-[var(--on-surface-variant)]">
                      {admin.totalActions} actions
                    </span>
                    {admin.last_seen_at && (
                      <span className="text-xs text-[var(--on-surface-variant)]">
                        Last seen: {formatRelativeTime(admin.last_seen_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-[var(--surface-container)]">
          <Filter className="w-5 h-5 text-[var(--on-surface-variant)]" />
          
          <select
            value={filters.days}
            onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
            className="px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--outline-variant)]/30 text-sm"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <select
            value={filters.actionType}
            onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--outline-variant)]/30 text-sm"
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create_movie">Create Movie</option>
            <option value="update_movie">Update Movie</option>
            <option value="delete_movie">Delete Movie</option>
            <option value="create_section">Create Section</option>
            <option value="update_section">Update Section</option>
            <option value="create_admin">Create Admin</option>
            <option value="update_admin">Update Admin</option>
          </select>

          {(filters.adminId || filters.actionType) && (
            <button
              onClick={() => setFilters({ adminId: '', actionType: '', days: 7 })}
              className="px-3 py-2 rounded-lg text-sm text-[var(--primary)] hover:bg-[var(--primary)]/10"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Activity Logs */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-[var(--on-surface-variant)] mx-auto mb-4" />
              <p className="text-[var(--on-surface-variant)]">No activity found</p>
            </div>
          ) : (
            logs.map((log, index) => {
              const Icon = ActionIcons[log.action_type] || Activity;
              const colorClass = ActionColors[log.action_type] || 'bg-gray-500/10 text-gray-500';
              const label = ActionLabels[log.action_type] || log.action_type;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-[var(--surface-container)] ghost-border hover:bg-[var(--surface-container-high)] transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {log.admin_name}
                          <span className="text-[var(--on-surface-variant)] font-normal"> • {label}</span>
                        </p>
                        <p className="text-sm text-[var(--on-surface-variant)] mt-0.5">
                          {log.action_description}
                        </p>
                        {log.entity_name && (
                          <p className="text-xs text-[var(--primary)] mt-1">
                            {log.entity_type}: {log.entity_name}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-[var(--on-surface-variant)] shrink-0">
                        {formatRelativeTime(log.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-[var(--on-surface-variant)]">
              Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(-1)}
                disabled={pagination.offset === 0}
                className="p-2 rounded-lg hover:bg-[var(--surface-container)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="p-2 rounded-lg hover:bg-[var(--surface-container)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
