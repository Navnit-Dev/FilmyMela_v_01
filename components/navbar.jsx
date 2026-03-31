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
  Menu, 
  X, 
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const pathname = usePathname();

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
                  src="https://filmymela.netlify.app/assets/logo.png"
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
                href="/watchlist"
                className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
              >
                <Heart className="w-5 h-5 text-[var(--on-surface-variant)]" />
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="absolute top-16 left-0 right-0 bg-[var(--surface)] border-b border-[var(--outline-variant)]/20"
            >
              <div className="p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === link.href
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'hover:bg-[var(--surface-container)]'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
                <div className="border-t border-[var(--outline-variant)]/20 my-2" />
                <Link
                  href="/watchlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Watchlist</span>
                </Link>
                {showAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
