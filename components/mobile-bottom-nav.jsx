'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Compass, 
  Search, 
  Heart, 
  User,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Browse', icon: Compass },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/wishlist', label: 'Watchlist', icon: Heart },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check if admin was unlocked
    const adminUnlocked = localStorage.getItem('admin_unlocked') === 'true';
    setShowAdmin(adminUnlocked);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="mobile-nav lg:hidden"
        >
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] touch-target ${
                    isActive 
                      ? 'text-[var(--primary)] bg-[var(--primary)]/10' 
                      : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                  }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--primary)] rounded-full"
                      />
                    )}
                  </motion.div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Admin Link (if unlocked) */}
            {showAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] touch-target text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                <motion.div whileTap={{ scale: 0.9 }}>
                  <User className="w-5 h-5" />
                </motion.div>
                <span className="text-[10px] font-medium">Admin</span>
              </Link>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
