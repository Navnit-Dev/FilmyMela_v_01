'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  BarChart3,
  TrendingUp,
  Users,
  Film,
  Eye,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Views', 
      value: analytics?.totalViews || 0, 
      change: analytics?.viewsChange || 0,
      icon: Eye,
      color: 'primary'
    },
    { 
      label: 'New Users', 
      value: analytics?.newUsers || 0, 
      change: analytics?.usersChange || 0,
      icon: Users,
      color: 'tertiary'
    },
    { 
      label: 'Downloads', 
      value: analytics?.downloads || 0, 
      change: analytics?.downloadsChange || 0,
      icon: Download,
      color: 'success'
    },
    { 
      label: 'Movies Added', 
      value: analytics?.moviesAdded || 0, 
      change: analytics?.moviesChange || 0,
      icon: Film,
      color: 'warning'
    }
  ];

  const contentTypeStats = analytics?.contentTypeStats || [
    { type: 'movie', count: 0, percentage: 0 },
    { type: 'web_series', count: 0, percentage: 0 },
    { type: 'anime', count: 0, percentage: 0 }
  ];

  const topMovies = analytics?.topMovies || [];
  const dailyStats = analytics?.dailyStats || [];

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
            <h1 className="font-display font-bold text-xl flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Analytics & Statistics
            </h1>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-[var(--surface-container)] rounded-lg p-1">
            {[
              { value: '24h', label: '24h' },
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '3 Months' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range.value
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
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
                  <div className={`flex items-center gap-1 text-sm ${stat.change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-[var(--on-surface-variant)]">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Activity Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h3 className="font-display font-semibold text-lg mb-4">Daily Activity</h3>
              <div className="h-64 flex items-end gap-2">
                {dailyStats.length > 0 ? (
                  dailyStats.map((day, index) => {
                    const maxViews = Math.max(...dailyStats.map(d => d.views));
                    const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-[var(--primary)]/20 rounded-t-lg relative group"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[var(--surface-bright)] text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.views} views
                          </div>
                        </div>
                        <span className="text-xs text-[var(--on-surface-variant)]">
                          {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--on-surface-variant)]">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Content Type Distribution */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h3 className="font-display font-semibold text-lg mb-4">Content Types</h3>
              <div className="space-y-4">
                {contentTypeStats.map((stat) => (
                  <div key={stat.type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm capitalize">{stat.type.replace('_', ' ')}</span>
                      <span className="text-sm font-medium">{stat.count} ({stat.percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--surface-container-low)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Movies Table */}
          <div className="rounded-2xl bg-[var(--surface-container)] ghost-border overflow-hidden">
            <div className="p-6 border-b border-[var(--outline-variant)]/20">
              <h3 className="font-display font-semibold text-lg">Top Performing Content</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)]/20">
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Rank</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Views</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Downloads</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--on-surface-variant)]">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topMovies.length > 0 ? (
                    topMovies.map((movie, index) => (
                      <tr key={movie.id} className="border-b border-[var(--outline-variant)]/10 hover:bg-[var(--surface-container-high)]">
                        <td className="p-4 text-sm font-medium">#{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {movie.poster_url && (
                              <img src={movie.poster_url} alt="" className="w-10 h-14 object-cover rounded" />
                            )}
                            <span className="font-medium">{movie.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm capitalize">{movie.content_type?.replace('_', ' ')}</td>
                        <td className="p-4 text-sm">{movie.views?.toLocaleString() || 0}</td>
                        <td className="p-4 text-sm">{movie.downloads?.toLocaleString() || 0}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs">
                            ⭐ {movie.rating}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[var(--on-surface-variant)]">
                        No performance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Genre & Industry Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Genres */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h3 className="font-display font-semibold text-lg mb-4">Popular Genres</h3>
              <div className="space-y-3">
                {analytics?.topGenres?.map((genre, index) => (
                  <div key={genre.name} className="flex items-center gap-3">
                    <span className="text-sm text-[var(--on-surface-variant)] w-6">#{index + 1}</span>
                    <span className="flex-1 font-medium">{genre.name}</span>
                    <span className="text-sm text-[var(--on-surface-variant)]">{genre.count} movies</span>
                    <div className="w-24 h-2 rounded-full bg-[var(--surface-container-low)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--tertiary)] rounded-full"
                        style={{ width: `${genre.percentage}%` }}
                      />
                    </div>
                  </div>
                )) || (
                  <p className="text-[var(--on-surface-variant)]">No genre data available</p>
                )}
              </div>
            </div>

            {/* Top Industries */}
            <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
              <h3 className="font-display font-semibold text-lg mb-4">Content by Industry</h3>
              <div className="space-y-3">
                {analytics?.topIndustries?.map((industry, index) => (
                  <div key={industry.name} className="flex items-center gap-3">
                    <span className="text-sm text-[var(--on-surface-variant)] w-6">#{index + 1}</span>
                    <span className="flex-1 font-medium">{industry.name}</span>
                    <span className="text-sm text-[var(--on-surface-variant)]">{industry.count} movies</span>
                    <div className="w-24 h-2 rounded-full bg-[var(--surface-container-low)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--success)] rounded-full"
                        style={{ width: `${industry.percentage}%` }}
                      />
                    </div>
                  </div>
                )) || (
                  <p className="text-[var(--on-surface-variant)]">No industry data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
