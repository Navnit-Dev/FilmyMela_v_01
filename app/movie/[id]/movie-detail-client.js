'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MovieCard } from '@/components/movie-card';
import { useToast } from '@/components/toast';
import { 
  Play, 
  Download, 
  Clock, 
  Star, 
  Share2,
  Heart,
  ChevronLeft,
  ExternalLink,
  Users,
  Package,
  X,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Send,
  Copy,
  Check
} from 'lucide-react';

export default function MovieDetailClient({ movie }) {
  const { showToast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse download URLs
  const downloadLinks = movie.download_urls || {};
  const qualities = Object.entries(downloadLinks).sort(([a], [b]) => {
    const order = { '4K': 0, '2160p': 1, '1080p': 2, '720p': 3, '480p': 4, '360p': 5 };
    return (order[a] ?? 99) - (order[b] ?? 99);
  });

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/movie/${movie.id}` 
    : `/movie/${movie.id}`;

  const shareText = `Watch ${movie.name} (${movie.release_year}) on FilmyMela! Rated ${movie.rating}/10. 🎬`;

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleShare();
    }
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <Navbar />
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">Share Movie</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-[var(--surface-container)]">
              <LinkIcon className="w-5 h-5 text-[var(--on-surface-variant)]" />
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="flex-1 bg-transparent text-sm text-[var(--on-surface-variant)] truncate"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 transition-opacity"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareOnTwitter}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container)] hover:bg-[#1DA1F2]/20 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Twitter</span>
              </button>

              <button
                onClick={shareOnFacebook}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container)] hover:bg-[#1877F2]/20 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Facebook</span>
              </button>

              <button
                onClick={shareOnTelegram}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container)] hover:bg-[#0088cc]/20 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Telegram</span>
              </button>

              <button
                onClick={shareOnWhatsApp}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container)] hover:bg-[#25D366]/20 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                  </svg>
                </div>
                <span className="font-medium">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative pt-16 lg:pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 h-[60vh] lg:h-[70vh]">
          <Image
            src={movie.poster_url || '/placeholder-hero.jpg'}
            alt={movie.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-16">
          <Link 
            href="/movies" 
            className="inline-flex items-center gap-2 text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Movies
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Poster */}
            <div className="lg:col-span-3">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ambient-glow">
                <Image
                  src={movie.poster_url || '/placeholder-movie.jpg'}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={movie.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-full gradient-btn flex items-center justify-center ambient-glow hover:scale-110 transition-transform"
                  >
                    <Play className="w-7 h-7 text-[var(--on-primary)] ml-1" fill="currentColor" />
                  </a>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-9 space-y-6">
              {/* Title & Badges */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {movie.trending && (
                    <span className="px-2 py-1 text-xs font-semibold bg-[var(--primary)] text-[var(--on-primary)] rounded">
                      🔥 Trending
                    </span>
                  )}
                  {movie.featured && (
                    <span className="px-2 py-1 text-xs font-semibold bg-[var(--tertiary)] text-[var(--on-primary)] rounded">
                      ⭐ Featured
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs font-medium bg-[var(--surface-container)] rounded text-[var(--on-surface-variant)]">
                    {movie.industry}
                  </span>
                </div>
                
                <h1 className="font-display font-bold text-3xl lg:text-5xl text-white mb-4">
                  {movie.name}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4" fill="currentColor" />
                    <span className="font-semibold">{movie.rating}</span>
                    <span className="text-[var(--on-surface-variant)]">/10</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-[var(--on-surface-variant)]" />
                  <span className="text-[var(--on-surface-variant)]">{movie.release_year}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--on-surface-variant)]" />
                  <span className="flex items-center gap-1 text-[var(--on-surface-variant)]">
                    <Clock className="w-4 h-4" />
                    {movie.duration}
                  </span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genre?.map((g) => (
                  <Link
                    key={g}
                    href={`/movies?genre=${encodeURIComponent(g)}`}
                    className="px-3 py-1.5 text-sm bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] rounded-full text-[var(--on-surface-variant)] transition-colors"
                  >
                    {g}
                  </Link>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">Synopsis</h3>
                <p className="text-[var(--on-surface-variant)] leading-relaxed max-w-3xl">
                  {movie.description}
                </p>
              </div>

              {/* Cast */}
              {movie.cast?.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Cast
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.map((actor) => (
                      <span
                        key={actor}
                        className="px-3 py-1.5 text-sm bg-[var(--surface-container)] rounded-lg text-[var(--on-surface)]"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scene Images Gallery */}
              {movie.scenes_gallery?.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Scene Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {movie.scenes_gallery.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`Scene ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23374151"/%3E%3Ctext x="200" y="112.5" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14" font-family="sans-serif"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-xs text-white">Scene {index + 1}</p>
                          </div>
                        </div>
                        {/* Lightbox trigger */}
                        <button
                          onClick={() => {
                            // Simple lightbox implementation
                            const lightbox = document.createElement('div');
                            lightbox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4';
                            lightbox.innerHTML = `
                              <div class="relative max-w-4xl max-h-[90vh]">
                                <img src="${url}" alt="Scene ${index + 1}" class="w-full h-full object-contain rounded-lg" />
                                <button class="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                </button>
                              </div>
                            `;
                            lightbox.onclick = (e) => {
                              if (e.target === lightbox || e.target.tagName === 'BUTTON') {
                                document.body.removeChild(lightbox);
                              }
                            };
                            document.body.appendChild(lightbox);
                          }}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          aria-label={`View scene ${index + 1} in full size`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                {movie.video_url && (
                  <a
                    href={movie.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-btn font-semibold text-[var(--on-primary)] ambient-glow-hover transition-all hover:scale-105"
                  >
                    <Play className="w-5 h-5" fill="currentColor" />
                    Watch Now
                  </a>
                )}
                
                <button 
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] font-medium transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>

                <button className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] font-medium transition-colors">
                  <Heart className="w-5 h-5" />
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>

          {/* Video Player Section */}
          {movie.video_url && (
            <div className="mt-12">
              <h2 className="font-display font-bold text-xl lg:text-2xl mb-4">Watch Movie</h2>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--surface-container)]">
                <iframe
                  src={movie.video_url}
                  title={movie.name}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}

          {/* Scenes Gallery */}
          {movie.scenes_gallery?.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display font-bold text-xl lg:text-2xl mb-4">Scenes Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movie.scenes_gallery.map((scene, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
                  >
                    <Image
                      src={scene}
                      alt={`${movie.name} scene ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Section */}
          {qualities.length > 0 && (
            <div className="mt-12 p-6 rounded-2xl bg-[var(--surface-container-low)] ghost-border">
              <h2 className="font-display font-bold text-xl lg:text-2xl mb-4 flex items-center gap-2">
                <Download className="w-6 h-6" />
                Download Movie
              </h2>
              <p className="text-sm text-[var(--on-surface-variant)] mb-4">
                Choose your preferred quality to download
              </p>
              <div className="flex flex-wrap gap-3">
                {qualities.map(([quality, url]) => (
                  <a
                    key={quality}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--surface-container)] hover:bg-[var(--primary)] transition-all"
                  >
                    <span className="font-semibold">{quality}</span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
