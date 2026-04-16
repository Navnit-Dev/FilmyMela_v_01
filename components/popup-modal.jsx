'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PopupModal() {
  const [popup, setPopup] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPopup = async () => {
      try {
        const sessionKey = 'popup_shown';
        const sessionShown = sessionStorage.getItem(sessionKey);

        const { data, error } = await supabase
          .from('popups')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        if (data.show_once_per_session && sessionShown === 'true') {
          setLoading(false);
          return;
        }

        setPopup(data);

        const timer = setTimeout(() => {
          setOpen(true);
          if (data.show_once_per_session) {
            sessionStorage.setItem(sessionKey, 'true');
          }
        }, data.show_after_seconds * 1000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error checking popup:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    checkPopup();
  }, []);

  const handleClose = () => setOpen(false);

  const handleButtonClick = () => {
    if (popup?.button_url) {
      window.open(popup.button_url, '_blank');
    }
    handleClose();
  };

  if (loading || !popup) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#0e0e0e] shadow-2xl"
          >
            {/* Close Button */}
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20 text-pink-500 transition-colors hover:bg-pink-500/40"
            >
              <X size={20} />
            </motion.button>

            {/* Image */}
            {popup.image_url && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative h-48 w-full"
              >
                <img
                  src={popup.image_url}
                  alt={popup.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0e0e0e] to-transparent" />
              </motion.div>
            )}

            {/* Content */}
            <div className="relative p-6">
              {/* Decorative glows */}
              <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-pink-500/10 blur-2xl" />
              <div className="absolute -bottom-5 -left-5 h-28 w-28 rounded-full bg-pink-500/5 blur-2xl" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="mb-3 text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  {popup.title}
                </h2>

                {popup.description && (
                  <p className="mb-4 text-sm leading-relaxed text-gray-400">
                    {popup.description}
                  </p>
                )}

                {popup.button_text && (
                  <motion.button
                    onClick={handleButtonClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-pink-500/40"
                  >
                    {popup.button_text}
                  </motion.button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
