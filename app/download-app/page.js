'use client';

import { useEffect, useState, useCallback } from 'react';
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

/* -----------------------------
   PREMIUM PREVIEW GALLERY
------------------------------*/
function PreviewGallery({ images = [] }) {
  return (
    <div className="relative w-full py-12">

      {/* Glow Background */}
      <div className="absolute inset-0 -z-10 flex justify-center">
        <div className="w-[420px] h-[420px] bg-[var(--primary)]/10 blur-[120px] rounded-full" />
      </div>

      {/* Scroll */}
      <div className="overflow-x-auto no-scrollbar px-4">
        <div className="flex gap-6 w-max mx-auto">

          {images.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.07,
                type: 'spring',
                stiffness: 120,
                damping: 14
              }}
              whileHover={{
                scale: 1.12,
                y: -18,
                rotate: i % 2 === 0 ? -2 : 2,
                zIndex: 50
              }}
              className="relative shrink-0 w-[180px] md:w-[220px] aspect-[9/19] rounded-[28px] overflow-hidden border border-white/10 bg-black shadow-2xl"
            >
              <Image
                src={src}
                alt={`preview-${i}`}
                fill
                className="object-cover"
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />

              {/* edge highlight */}
              <div className="absolute inset-0 ring-1 ring-white/10 rounded-[28px]" />
            </motion.div>
          ))}

        </div>
      </div>

      <p className="text-center text-xs text-[var(--on-surface-variant)] mt-6">
        Swipe to explore screenshots
      </p>
    </div>
  );
}

/* -----------------------------
        MAIN PAGE
------------------------------*/
export default function DownloadAppPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/app-download');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleDownload = useCallback(async () => {
    if (!settings?.apk_url || downloading) return;

    setDownloading(true);

    try {
      fetch('/api/app-download/track', { method: 'POST' }).catch(() => {});
      window.location.assign(settings.apk_url);
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  }, [settings, downloading]);

  const features = [
    { icon: Zap, title: 'Fast Streaming', desc: 'No buffering, instant playback' },
    { icon: Shield, title: 'Secure', desc: 'Safe & private experience' },
    { icon: Star, title: 'HD Quality', desc: 'Crystal clear visuals' }
  ];

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--surface)]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ---------- Disabled ---------- */
  if (!settings?.enabled) {
    return (
      <div className="min-h-screen grid place-items-center text-center px-4">
        <Smartphone className="w-14 h-14 text-[var(--on-surface-variant)] mb-4" />
        <h1 className="text-2xl font-semibold">Coming Soon</h1>
        <p className="text-[var(--on-surface-variant)] mb-4">
          App is under development
        </p>
        <Link href="/" className="flex items-center gap-2 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--surface)]/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="font-semibold">Download App</h1>
          <div />
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16 text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-5">
            <Star className="w-3 h-3" />
            Version {settings.app_version}
          </div>

          <h2 className="text-4xl md:text-5xl font-bold">
            FilmyMela <span className="text-[var(--primary)]">Mobile</span>
          </h2>

          <p className="mt-4 text-[var(--on-surface-variant)]">
            Experience seamless movie streaming on your mobile device.
          </p>

          <motion.button
            onClick={handleDownload}
            disabled={downloading || !settings.apk_url}
            whileTap={{ scale: 0.96 }}
            className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] shadow-lg"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download APK
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          <p className="text-xs mt-3 text-[var(--on-surface-variant)]">
            Android 6.0+ supported
          </p>
        </motion.div>
      </section>

      {/* Premium Gallery */}
      {!!settings.preview_images?.length && (
        <section className="py-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold">App Experience</h3>
            <p className="text-sm text-[var(--on-surface-variant)] mt-2">
              Smooth, fast and immersive UI
            </p>
          </div>

          <PreviewGallery images={settings.preview_images} />
        </section>
      )}

      {/* Features */}
      <section className="px-4 py-12 max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl bg-[var(--surface-container)] border border-white/5"
          >
            <f.icon className="w-6 h-6 text-[var(--primary)] mb-3" />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-[var(--on-surface-variant)]">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Release Notes */}
      {!!settings.release_notes && (
        <section className="px-4 py-12 max-w-2xl mx-auto">
          <h3 className="text-center font-semibold mb-6">What's New</h3>

          <div className="space-y-3">
            {settings.release_notes.split('\n').map((note, i) =>
              note.trim() && (
                <div key={i} className="flex gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[var(--primary)] mt-0.5" />
                  <span className="text-[var(--on-surface-variant)]">{note}</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

    </div>
  );
}