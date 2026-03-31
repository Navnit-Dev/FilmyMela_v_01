'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Settings, 
  LogOut,
  TrendingUp,
  Eye,
  Star,
  Plus,
  Search,
  Bell,
  GripVertical
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Check auth and fetch stats
    const init = async () => {
      try {
        const [authRes, statsRes] = await Promise.all([
          fetch('/api/admin/me'),
          fetch('/api/admin/stats')
        ]);

        if (!authRes.ok) {
          router.push('/admin');
          return;
        }

        const adminData = await authRes.json();
        const statsData = await statsRes.json();
        
        setAdmin(adminData);
        setStats(statsData);
      } catch (error) {
        console.error('Dashboard init error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const statCards = [
    { 
      label: 'Total Movies', 
      value: stats?.totalMovies || 0, 
      icon: Film,
      trend: '+12%',
      color: 'primary'
    },
    { 
      label: 'Trending', 
      value: stats?.trendingMovies || 0, 
      icon: TrendingUp,
      trend: '+5%',
      color: 'tertiary'
    },
    { 
      label: 'Featured', 
      value: stats?.featuredMovies || 0, 
      icon: Star,
      trend: 'Featured',
      color: 'warning'
    },
    { 
      label: 'Total Views', 
      value: '24.5K', 
      icon: Eye,
      trend: '+18%',
      color: 'success'
    },
  ];

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, active: true },
    { label: 'Movies', href: '/admin/movies', icon: Film },
    { label: 'Admins', href: '/admin/admins', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface-container)] border-r border-[var(--outline-variant)]/20 z-50 hidden lg:block">
        <div className="p-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <Image
                src="https://filmymela.netlify.app/assets/logo.png"
                alt="FilmyMela"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display font-bold text-lg gradient-text">
              FilmyMela
            </span>
          </Link>
        </div>

        <nav className="px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-1 ${
                item.active
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass ghost-border">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="font-display font-bold text-xl">Dashboard</h1>
            
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--primary)] rounded-full" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <span className="font-semibold text-[var(--on-primary)]">
                    {admin?.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-sm">{admin?.name}</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">{admin?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-2xl bg-[var(--surface-container)] ghost-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                  <span className="text-xs font-medium text-[var(--success)]">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-[var(--on-surface-variant)]">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Add Movie Card */}
            <Link
              href="/admin/movies/new"
              className="group p-6 rounded-2xl bg-[var(--surface-container)] ghost-border hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-[var(--on-primary)]" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">Add New Movie</h3>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Upload a new movie to the platform
              </p>
            </Link>

            {/* Manage Movies */}
            <Link
              href="/admin/movies"
              className="group p-6 rounded-2xl bg-[var(--surface-container)] ghost-border hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--tertiary)]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Film className="w-6 h-6 text-[var(--tertiary)]" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">Manage Movies</h3>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Edit, delete, or update existing movies
              </p>
            </Link>

            {/* Manage Sequence */}
            <Link
              href="/admin/sequence"
              className="group p-6 rounded-2xl bg-[var(--surface-container)] ghost-border hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--success)]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GripVertical className="w-6 h-6 text-[var(--success)]" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">Manage Sequence</h3>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Drag & drop to reorder movie display
              </p>
            </Link>

            {/* Settings */}
            <Link
              href="/admin/settings"
              className="group p-6 rounded-2xl bg-[var(--surface-container)] ghost-border hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-bright)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-[var(--on-surface)]" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">Platform Settings</h3>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Configure Telegram bot and maintenance mode
              </p>
            </Link>
          </div>

          {/* Recent Movies */}
          <div className="rounded-2xl bg-[var(--surface-container)] ghost-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[var(--outline-variant)]/20">
              <h3 className="font-display font-semibold text-lg">Recently Added</h3>
              <Link
                href="/admin/movies"
                className="text-sm text-[var(--primary)] hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-[var(--outline-variant)]/20">
              {stats?.recentMovies?.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between p-4 hover:bg-[var(--surface-container-high)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface-bright)] flex items-center justify-center">
                      <Film className="w-5 h-5 text-[var(--on-surface-variant)]" />
                    </div>
                    <div>
                      <p className="font-medium">{movie.name}</p>
                      <p className="text-xs text-[var(--on-surface-variant)]">
                        {new Date(movie.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/movies/${movie.id}/edit`}
                    className="px-3 py-1.5 text-sm rounded-lg bg-[var(--surface-bright)] hover:bg-[var(--primary)]/20 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              )) || (
                <div className="p-8 text-center text-[var(--on-surface-variant)]">
                  No movies added yet
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
