'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Film, 
  TrendingUp,
  Eye,
  Star,
  Plus,
  GripVertical,
  Building,
  Users,
  Settings,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Movies', 
      value: stats?.totalMovies || 0, 
      icon: Film,
      color: 'primary'
    },
    { 
      label: 'Trending', 
      value: stats?.trendingMovies || 0, 
      icon: TrendingUp,
      color: 'tertiary'
    },
    { 
      label: 'Featured', 
      value: stats?.featuredMovies || 0, 
      icon: Star,
      color: 'warning'
    },
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users,
      color: 'success'
    },
  ];

  const contentTypeCards = [
    { 
      label: 'Movies', 
      value: stats?.contentTypeStats?.movies || 0,
      icon: Film,
      href: '/admin/movies?type=movie',
      color: 'bg-blue-500'
    },
    { 
      label: 'Web Series', 
      value: stats?.contentTypeStats?.webSeries || 0,
      icon: TrendingUp,
      href: '/admin/movies?type=web_series',
      color: 'bg-purple-500'
    },
    { 
      label: 'Anime', 
      value: stats?.contentTypeStats?.anime || 0,
      icon: Star,
      href: '/admin/movies?type=anime',
      color: 'bg-pink-500'
    },
  ];

  const quickActions = [
    {
      title: 'Add New Content',
      description: 'Upload a new movie, series, or anime',
      icon: Plus,
      href: '/admin/movies/new',
      color: 'from-[var(--primary)] to-[var(--tertiary)]'
    },
    {
      title: 'Manage Sequence',
      description: 'Reorder content display order',
      icon: GripVertical,
      href: '/admin/sequence',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Manage Genres',
      description: `${stats?.totalGenres || 0} genres defined`,
      icon: Star,
      href: '/admin/genres',
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Manage Industries',
      description: `${stats?.totalIndustries || 0} industries defined`,
      icon: Building,
      href: '/admin/industries',
      color: 'from-rose-500 to-pink-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl">Dashboard</h1>
            <p className="text-[var(--on-surface-variant)]">Welcome back! Here's what's happening.</p>
          </div>
          <Link
            href="/admin/movies/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)]"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-2xl bg-[var(--surface-container)] ghost-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg bg-[var(--${stat.color})]/10`}>
                  <stat.icon className={`w-5 h-5 text-[var(--${stat.color})]`} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-[var(--on-surface-variant)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Content Type Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {contentTypeCards.map((type, index) => (
            <motion.div
              key={type.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link
                href={type.href}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-container)] ghost-border hover:border-[var(--primary)]/30 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center`}>
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{type.value}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">{type.label}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--on-surface-variant)] group-hover:text-[var(--primary)] transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Link
                href={action.href}
                className="block p-5 rounded-2xl bg-[var(--surface-container)] ghost-border hover:border-[var(--primary)]/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-[var(--on-surface-variant)]">{action.description}</p>
              </Link>
            </motion.div>
          ))}
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
                    <p className="text-xs text-[var(--on-surface-variant)] capitalize">
                      {movie.content_type?.replace('_', ' ')} • {new Date(movie.created_at).toLocaleDateString()}
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
                No content added yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
