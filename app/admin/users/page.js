'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Users,
  Search,
  Filter,
  MoreVertical,
  UserX,
  UserCheck,
  Mail,
  Calendar,
  Shield,
  Loader2,
  Ban,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UserManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const itemsPerPage = 20;

  useEffect(() => {
    checkAuthAndFetch();
  }, [currentPage, searchQuery, filterStatus]);

  const checkAuthAndFetch = async () => {
    try {
      const meRes = await fetch('/api/admin/me');
      if (!meRes.ok) {
        router.push('/admin');
        return;
      }
      const meData = await meRes.json();
      
      if (!['SuperAdmin', 'Admin'].includes(meData.role)) {
        router.push('/admin/dashboard');
        return;
      }
      
      setIsAdmin(true);
      await fetchUsers();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });
      
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        fetchUsers();
        setShowActionsMenu(null);
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-500/20 text-green-500',
      inactive: 'bg-yellow-500/20 text-yellow-500',
      banned: 'bg-red-500/20 text-red-500'
    };
    return badges[status] || badges.inactive;
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass ghost-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl flex items-center gap-2">
                <Users className="w-6 h-6" />
                User Management
              </h1>
              <p className="text-sm text-[var(--on-surface-variant)]">
                {totalCount} total users
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-sm w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: totalCount, icon: Users },
              { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: UserCheck },
              { label: 'New This Week', value: users.filter(u => {
                const created = new Date(u.created_at);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return created > weekAgo;
              }).length, icon: Calendar },
              { label: 'Banned', value: users.filter(u => u.status === 'banned').length, icon: Ban }
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-[var(--surface-container)] ghost-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                    <stat.icon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-[var(--surface-container)] ghost-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)]/20">
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">User</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Joined</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[var(--on-surface-variant)]">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-[var(--outline-variant)]/10 hover:bg-[var(--surface-container-high)]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                              <span className="font-semibold text-[var(--primary)]">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name || 'Unknown'}</p>
                              {user.is_verified && (
                                <span className="text-xs text-[var(--success)]">Verified</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-[var(--on-surface-variant)]">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="relative">
                            <button
                              onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}
                              className="p-2 rounded-lg hover:bg-[var(--surface-container-high)]"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            <AnimatePresence>
                              {showActionsMenu === user.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--surface)] border shadow-lg z-50"
                                >
                                  {user.status !== 'banned' ? (
                                    <button
                                      onClick={() => handleUserAction(user.id, 'ban')}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-[var(--surface-container)]"
                                    >
                                      <Ban className="w-4 h-4" />
                                      Ban User
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserAction(user.id, 'unban')}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-500 hover:bg-[var(--surface-container)]"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      Unban User
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleUserAction(user.id, 'delete')}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-[var(--surface-container)]"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete User
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[var(--outline-variant)]/20">
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg bg-[var(--surface-container)] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg bg-[var(--surface-container)] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
