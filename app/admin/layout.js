'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Settings, 
  LogOut,
  Star,
  Building,
  BarChart3,
  Shield,
  Menu,
  X,
  ChevronRight,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Avatar utility using DiceBear API - Male Gamer Style
const getAdminAvatar = (name, seed = null) => {
  const avatarSeed = seed || name || 'admin';
  return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50&gender=male`;
};

// Fallback fun-emoji avatar
const getFallbackAvatar = (name) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A';
  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name || 'Admin')}&radius=50`;
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Hide sidebar on /admin/login
  const hideSidebar = pathname === '/admin';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (!res.ok) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setAdmin(data);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Movies', href: '/admin/movies', icon: Film },
    { 
      label: 'Taxonomies', 
      icon: Star,
      children: [
        { label: 'Genres', href: '/admin/genres', icon: Star },
        { label: 'Industries', href: '/admin/industries', icon: Building }
      ]
    },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { 
      label: 'Management', 
      icon: Users,
      children: [
        { label: 'Admins', href: '/admin/admins', icon: Shield },
        { label: 'Users', href: '/admin/users', icon: Users }
      ]
    },
    { label: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const avatarUrl = admin && !avatarError 
    ? getAdminAvatar(admin.name, admin.id || admin.email)
    : getFallbackAvatar(admin?.name || 'Admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 glass ghost-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="https://filmymela.netlify.app/assets/logo.png"
              alt="FilmyMela"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-display font-bold gradient-text">FilmyMela</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--primary)]/30">
              <img 
                src={avatarUrl}
                alt={admin?.name || 'Admin'}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[var(--surface-container)] touch-target"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {!hideSidebar && (sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`admin-sidebar ${sidebarOpen ? 'open' : ''} lg:translate-x-0 flex flex-col h-screen overflow-hidden`}
          >
            {/* Logo */}
            <div className="p-6 flex-shrink-0">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--surface-bright)] flex items-center justify-center">
                  <Image
                    src="https://filmymela.netlify.app/assets/logo.png"
                    alt="FilmyMela"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="font-display font-bold text-lg gradient-text">FilmyMela</span>
                  <p className="text-xs text-[var(--on-surface-variant)]">Admin Panel</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--on-surface-variant)]">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div>
                      <div className="ml-4 pl-4 border-l border-[var(--outline-variant)]/30 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors touch-target ${
                              isActive(child.href)
                                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]'
                            }`}
                          >
                            <child.icon className="w-4 h-4" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors touch-target ${
                        isActive(item.href)
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive(item.href) && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* User Info */}
            <div className="flex-shrink-0 p-4 border-t border-[var(--outline-variant)]/20 bg-[var(--surface-container)] safe-bottom">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar avatar-lg border-2 border-[var(--primary)]/30 overflow-hidden bg-[var(--surface-bright)]">
                  <img 
                    src={avatarUrl}
                    alt={admin?.name || 'Admin'}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-[var(--on-surface-variant)] flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {admin?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors text-sm touch-target"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!hideSidebar && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${hideSidebar ? '' : 'lg:ml-64'}`}>
        <div className="max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
