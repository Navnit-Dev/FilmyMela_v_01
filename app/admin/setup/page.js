'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useToast } from '@/components/toast';
import { Shield, Mail, Lock, User, CheckCircle } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        setHasAdmin(data.hasAdmin);
      } catch (error) {
        console.error('Error checking admin:', error);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Admin created successfully! Please login.', 'success');
        router.push('/admin');
      } else {
        showToast(data.error || 'Failed to create admin', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (hasAdmin === null) {
    return (
      <main className="min-h-screen bg-[var(--surface)]">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    );
  }

  if (hasAdmin) {
    return (
      <main className="min-h-screen bg-[var(--surface)]">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="max-w-md mx-auto px-4">
            <div className="glass rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-[var(--success)]" />
              <h1 className="font-display font-bold text-2xl mb-2">Setup Complete</h1>
              <p className="text-[var(--on-surface-variant)] mb-6">
                An admin user already exists. Please login to access the admin dashboard.
              </p>
              <a
                href="/admin"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl gradient-btn font-semibold"
              >
                Go to Admin Login
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <Navbar />
      
      <div className="pt-20 lg:pt-24 pb-12">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-[var(--on-surface)] mb-2">
              First Time Setup
            </h1>
            <p className="text-[var(--on-surface-variant)]">
              Create your first admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 lg:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface)] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface)] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface)] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-btn font-semibold text-[var(--on-primary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
