'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  Home, 
  Compass, 
  Heart, 
  User,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '@/components/wishlist-context';
import { useAppDownload } from '@/hooks/use-app-download';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();
  const { settings: appSettings } = useAppDownload();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check if admin was unlocked via secret pin
    const adminUnlocked = localStorage.getItem('admin_unlocked') === 'true';
    setShowAdmin(adminUnlocked);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/movies', label: 'Browse', icon: Compass },
    { href: '/search', label: 'Search', icon: Search },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass ghost-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center ambient-glow-hover transition-all">
                <Image
                  src="/logo.jpeg"
                  alt="FilmyMela"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display font-bold text-xl tracking-tight gradient-text">
                FilmyMela
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors hover:text-[var(--primary)] ${
                    pathname === link.href 
                      ? 'text-[var(--primary)]' 
                      : 'text-[var(--on-surface-variant)]'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/wishlist"
                className="relative p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
              >
                <Heart className="w-5 h-5 text-[var(--on-surface-variant)]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[var(--primary)] text-[var(--on-primary)] text-xs font-bold rounded-full">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
              {showAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-colors text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Mobile Download App Button - Right side */}
            <AnimatePresence>
              {appSettings.enabled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.5
                  }}
                  className="lg:hidden"
                >
                  <Link href="/download-app">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--tertiary)] text-[var(--on-primary)] font-medium text-sm shadow-lg shadow-[var(--primary)]/30 overflow-hidden group"
                    >
                      {/* Animated shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2,
                          ease: 'linear',
                          repeatDelay: 1
                        }}
                      />
                      
                      <Download className="w-4 h-4 relative z-10" />
                      <span className="relative z-10 hidden sm:inline">Get App</span>
                      
                      {/* Pulse animation ring */}
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-[var(--primary)]"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2,
                          ease: 'easeInOut'
                        }}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

    </>
  );
}
