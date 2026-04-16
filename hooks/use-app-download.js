'use client';

import { useState, useEffect } from 'react';

export function useAppDownload() {
  const [settings, setSettings] = useState({
    enabled: false,
    apk_url: '',
    preview_images: [],
    app_version: '1.0.0',
    release_notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/app-download');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching app download settings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading };
}
