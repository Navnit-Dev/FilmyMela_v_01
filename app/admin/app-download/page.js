'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, 
  Trash2, 
  Save, 
  Smartphone, 
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AppDownloadAdmin() {
  const [settings, setSettings] = useState({
    id: '',
    enabled: false,
    apk_url: '',
    preview_images: [],
    app_version: '1.0.0',
    release_notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/app-download');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Upload APK file to Supabase Storage
  const handleApkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.apk')) {
      toast.error('Please upload an APK file');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'apk');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      
      setSettings(prev => ({ ...prev, apk_url: url }));
      toast.success('APK uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload APK');
    } finally {
      setUploading(false);
    }
  };

  // Upload preview images
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const { url } = await res.json();
          uploadedUrls.push(url);
        }
      } catch (error) {
        console.error('Failed to upload image:', file.name);
      }
    }

    setSettings(prev => ({
      ...prev,
      preview_images: [...prev.preview_images, ...uploadedUrls]
    }));
    
    setUploading(false);
    
    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    }
  };

  // Remove preview image
  const removeImage = (index) => {
    setSettings(prev => ({
      ...prev,
      preview_images: prev.preview_images.filter((_, i) => i !== index)
    }));
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const res = await fetch('/api/app-download', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error('Save failed');

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">App Download</h1>
              <p className="text-[var(--on-surface-variant)] text-sm">
                Manage mobile app distribution
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Enable App Download</h2>
                <p className="text-[var(--on-surface-variant)] text-sm">
                  Show download button on website
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                className="relative"
              >
                {settings.enabled ? (
                  <ToggleRight className="w-14 h-14 text-[var(--primary)]" />
                ) : (
                  <ToggleLeft className="w-14 h-14 text-[var(--on-surface-variant)]" />
                )}
              </button>
            </div>
          </div>

          {/* APK Upload */}
          <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <h2 className="font-semibold text-lg mb-4">APK File</h2>
            
            {settings.apk_url ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)]">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">APK Uploaded</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    {settings.apk_url.split('/').pop()}
                  </p>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-lg bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] transition-colors text-sm font-medium">
                  Replace
                  <input
                    type="file"
                    accept=".apk"
                    onChange={handleApkUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-[var(--outline-variant)] hover:border-[var(--primary)]/50 cursor-pointer transition-colors">
                <Upload className="w-10 h-10 text-[var(--on-surface-variant)]" />
                <span className="text-[var(--on-surface-variant)]">
                  Click to upload APK file
                </span>
                <input
                  type="file"
                  accept=".apk"
                  onChange={handleApkUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
            
            {uploading && (
              <div className="mt-4 flex items-center gap-2 text-[var(--primary)]">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {/* App Version */}
          <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <label className="block font-semibold text-lg mb-4">App Version</label>
            <input
              type="text"
              value={settings.app_version}
              onChange={(e) => setSettings(prev => ({ ...prev, app_version: e.target.value }))}
              placeholder="e.g., 1.0.0"
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30"
            />
          </div>

          {/* Preview Images */}
          <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">App Preview Images</h2>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors text-sm font-medium">
                <ImageIcon className="w-4 h-4" />
                Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            
            {settings.preview_images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {settings.preview_images.map((url, index) => (
                  <div key={index} className="relative group aspect-[9/16] rounded-xl overflow-hidden">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--on-surface-variant)] py-8">
                No preview images uploaded
              </p>
            )}
          </div>

          {/* Release Notes */}
          <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <label className="block font-semibold text-lg mb-4">Release Notes</label>
            <textarea
              value={settings.release_notes}
              onChange={(e) => setSettings(prev => ({ ...prev, release_notes: e.target.value }))}
              placeholder="Enter release notes (one per line)"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 resize-none"
            />
            <p className="text-sm text-[var(--on-surface-variant)] mt-2">
              Enter each feature or change on a new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
