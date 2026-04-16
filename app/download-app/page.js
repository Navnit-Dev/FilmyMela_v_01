'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  Download, 
  ChevronLeft, 
  Smartphone, 
  Star, 
  Shield, 
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function DownloadAppPage() {
  const [settings, setSettings] = useState({
    enabled: false,
    apk_url: '',
    preview_images: [],
    app_version: '1.0.0',
    release_notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/app-download');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching app settings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleDownload = async () => {
    if (!settings.apk_url) return;
    
    setDownloading(true);
    
    // Track download
    try {
      await fetch('/api/app-download/track', { method: 'POST' });
    } catch (e) {
      // Silent fail for tracking
    }
    
    // Trigger download
    window.location.href = settings.apk_url;
    
    setTimeout(() => setDownloading(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings.enabled) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex flex-col items-center justify-center p-4">
        <Smartphone className="w-16 h-16 text-[var(--on-surface-variant)] mb-4" />
        <h1 className="text-2xl font-bold text-[var(--on-surface)] mb-2">App Coming Soon</h1>
        <p className="text-[var(--on-surface-variant)] text-center mb-6">
          Our mobile app is currently under development. Check back later!
        </p>
        <Link 
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    );
  }

  const features = [
    { icon: Zap, title: 'Fast Streaming', desc: 'Watch movies without buffering' },
    { icon: Shield, title: 'Secure', desc: 'Your data is protected' },
    { icon: Star, title: 'HD Quality', desc: 'Crystal clear video quality' },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass ghost-border">
        <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="font-display font-bold text-xl">Download App</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Latest Version {settings.app_version}
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
              FilmyMela <span className="gradient-text">Mobile</span>
            </h2>
            
            <p className="text-lg md:text-xl text-[var(--on-surface-variant)] mb-8 max-w-2xl mx-auto">
              Experience the best of cinema on your mobile device. 
              Stream thousands of movies anytime, anywhere.
            </p>

            {/* Download Button */}
            <motion.button
              onClick={handleDownload}
              disabled={downloading || !settings.apk_url}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--tertiary)] text-[var(--on-primary)] font-bold text-lg shadow-xl shadow-[var(--primary)]/30 disabled:opacity-50 overflow-hidden group"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              />
              
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting Download...
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  Download APK
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            <p className="mt-4 text-sm text-[var(--on-surface-variant)]">
              Android 6.0+ required • {settings.app_version} MB
            </p>
          </motion.div>
        </div>
      </section>

      {/* App Preview Screenshots */}
      {settings.preview_images?.length > 0 && (
        <section className="px-4 py-12 bg-[var(--surface-container)]">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-display font-bold text-center mb-8">
              App Preview
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {settings.preview_images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative aspect-[9/19] rounded-2xl overflow-hidden border-4 border-[var(--surface)] shadow-xl"
                >
                  <Image
                    src={image}
                    alt={`App preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-display font-bold text-center mb-8">
            Why Choose Our App?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-[var(--on-surface-variant)] text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Release Notes */}
      {settings.release_notes && (
        <section className="px-4 py-12 bg-[var(--surface-container)]">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-display font-bold text-center mb-8">
              What's New
            </h3>
            
            <div className="p-6 rounded-2xl bg-[var(--surface)] ghost-border">
              <ul className="space-y-3">
                {settings.release_notes.split('\n').map((note, index) => (
                  note.trim() && (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--primary)] mt-0.5 shrink-0" />
                      <span className="text-[var(--on-surface-variant)]">{note.trim()}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-12">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-2xl font-display font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-[var(--on-surface-variant)] mb-6">
            Download the app now and start watching your favorite movies.
          </p>
          
          <motion.button
            onClick={handleDownload}
            disabled={downloading || !settings.apk_url}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-lg shadow-xl shadow-[var(--primary)]/30 disabled:opacity-50"
          >
            <Download className="w-6 h-6" />
            Download Now
          </motion.button>
        </div>
      </section>
    </div>
  );
}
