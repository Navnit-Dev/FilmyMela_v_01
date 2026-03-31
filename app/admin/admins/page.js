'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast';
import { 
  ChevronLeft, 
  Plus, 
  UserPlus, 
  Shield, 
  User,
  MoreVertical,
  Edit2,
  Trash2,
  Power,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminManagementPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    status: 'active'
  });

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      // Check current user role
      const meRes = await fetch('/api/admin/me');
      if (!meRes.ok) {
        router.push('/admin');
        return;
      }
      const meData = await meRes.json();
      
      if (meData.role !== 'SuperAdmin') {
        showToast('Only SuperAdmin can manage admins', 'error');
        router.push('/admin/dashboard');
        return;
      }
      
      setIsSuperAdmin(true);
      await fetchAdmins();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      showToast('Failed to fetch admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast('Admin created successfully', 'success');
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'Admin', status: 'active' });
        fetchAdmins();
      } else {
        const error = await res.json();
        showToast(error.error || 'Failed to create admin', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/admin/admins/${currentAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          status: formData.status
        })
      });

      if (res.ok) {
        showToast('Admin updated successfully', 'success');
        setShowEditModal(false);
        fetchAdmins();
      } else {
        const error = await res.json();
        showToast(error.error || 'Failed to update admin', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const toggleAdminStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'disabled' : 'active';
    
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`Admin ${newStatus === 'active' ? 'activated' : 'disabled'}`, 'success');
        fetchAdmins();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const deleteAdmin = async (admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.name}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast('Admin deleted successfully', 'success');
        fetchAdmins();
      } else {
        showToast('Failed to delete admin', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const openEditModal = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      status: admin.status
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) return null;

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
              <h1 className="font-display font-bold text-xl">Admin Management</h1>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Manage admin users (SuperAdmin only)
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setFormData({ name: '', email: '', password: '', role: 'Admin', status: 'active' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)]"
          >
            <UserPlus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-[var(--surface-container)] ghost-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                  <Shield className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{admins.filter(a => a.role === 'SuperAdmin').length}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">SuperAdmins</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-[var(--surface-container)] ghost-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--tertiary)]/10">
                  <User className="w-5 h-5 text-[var(--tertiary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{admins.filter(a => a.role === 'Admin').length}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">Admins</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-[var(--surface-container)] ghost-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--success)]/10">
                  <Power className="w-5 h-5 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{admins.filter(a => a.status === 'active').length}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admins Table */}
          <div className="rounded-2xl bg-[var(--surface-container)] ghost-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface-container-low)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]/30">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[var(--surface-container-low)]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                          <span className="font-semibold text-[var(--primary)]">
                            {admin.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--on-surface-variant)]">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        admin.role === 'SuperAdmin' 
                          ? 'bg-[var(--primary)]/20 text-[var(--primary)]' 
                          : 'bg-[var(--tertiary)]/20 text-[var(--tertiary)]'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAdminStatus(admin)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                          admin.status === 'active' 
                            ? 'bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30' 
                            : 'bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/30'
                        }`}
                      >
                        {admin.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 rounded-lg hover:bg-[var(--surface-bright)] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAdmin(admin)}
                          className="p-2 rounded-lg hover:bg-[var(--error)]/10 text-[var(--error)] transition-colors"
                          disabled={admin.role === 'SuperAdmin' && admins.filter(a => a.role === 'SuperAdmin').length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl">Add New Admin</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-[var(--surface-container)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl gradient-btn font-medium text-[var(--on-primary)]"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Admin Modal */}
      <AnimatePresence>
        {showEditModal && currentAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl">Edit Admin</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 rounded-lg hover:bg-[var(--surface-container)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email (readonly)</label>
                  <input
                    type="email"
                    readOnly
                    value={formData.email}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 rounded-xl bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl gradient-btn font-medium text-[var(--on-primary)]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
