'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
            <Image
              src="https://filmymela.netlify.app/assets/logo.png"
              alt="FilmyMela"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-display font-bold text-2xl gradient-text">
            FilmyMela Admin
          </span>
        </Link>

        {/* Login Card */}
        <div className="bg-[var(--surface-container)] rounded-2xl p-8 ghost-border">
          <h1 className="font-display font-bold text-2xl text-center mb-2">
            Admin Login
          </h1>
          <p className="text-sm text-[var(--on-surface-variant)] text-center mb-6">
            Sign in to manage your movie platform
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-[var(--error)]/10 text-[var(--error)] text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@filmymela.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] placeholder-[var(--on-surface-variant)]/50 focus:outline-none focus:border-[var(--primary)]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] placeholder-[var(--on-surface-variant)]/50 focus:outline-none focus:border-[var(--primary)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-btn font-semibold text-[var(--on-primary)] ambient-glow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--on-surface-variant)]/60 mt-6">
          Secure Admin Portal • FilmyMela Platform
        </p>
      </div>
    </div>
  );
}
