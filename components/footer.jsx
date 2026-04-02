'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Instagram, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    movies: [
      { label: 'Latest Movies', href: '/movies?sort=latest' },
      { label: 'Trending', href: '/movies?trending=true' },
      { label: 'Featured', href: '/movies?featured=true' },
      { label: 'Browse All', href: '/movies' },
    ],
    genres: [
      { label: 'Action', href: '/movies?genre=Action' },
      { label: 'Drama', href: '/movies?genre=Drama' },
      { label: 'Comedy', href: '/movies?genre=Comedy' },
      { label: 'Horror', href: '/movies?genre=Horror' },
    ],
    industries: [
      { label: 'Hollywood', href: '/movies?industry=Hollywood' },
      { label: 'Bollywood', href: '/movies?industry=Bollywood' },
      { label: 'South Indian', href: '/movies?industry=South%20Indian' },
      { label: 'International', href: '/movies?industry=International' },
    ],
  };

  return (
    <footer className="bg-[var(--surface-container-low)] border-t border-[var(--outline-variant)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/logo.jpeg"
                  alt="FilmyMela"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display font-bold text-xl gradient-text">
                FilmyMela
              </span>
            </Link>
            <p className="text-sm text-[var(--on-surface-variant)] mb-6 max-w-xs">
              Your ultimate destination for streaming and downloading the latest movies in high quality.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="p-2 rounded-lg bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Movies */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 uppercase tracking-wider text-[var(--on-surface-variant)]">
              Movies
            </h4>
            <ul className="space-y-2">
              {footerLinks.movies.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 uppercase tracking-wider text-[var(--on-surface-variant)]">
              Genres
            </h4>
            <ul className="space-y-2">
              {footerLinks.genres.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 uppercase tracking-wider text-[var(--on-surface-variant)]">
              Industries
            </h4>
            <ul className="space-y-2">
              {footerLinks.industries.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--outline-variant)]/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--on-surface-variant)]">
            &copy; {currentYear} FilmyMela. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/dmca" className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
              DMCA
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
