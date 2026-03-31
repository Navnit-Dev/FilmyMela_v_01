'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Save,
  MessageSquare,
  Power,
  Bot,
  Send,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    maintenance_message: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    telegram_enabled: false
  });

  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        // Ensure no null values for input fields
        setSettings({
          maintenance_mode: data.maintenance_mode ?? false,
          maintenance_message: data.maintenance_message ?? '',
          telegram_bot_token: data.telegram_bot_token ?? '',
          telegram_chat_id: data.telegram_chat_id ?? '',
          telegram_enabled: data.telegram_enabled ?? false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        showNotification('Settings saved successfully', 'success');
      } else {
        showNotification('Failed to save settings', 'error');
      }
    } catch (error) {
      showNotification('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testTelegram = async () => {
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage || 'Test message from FilmyMela!' })
      });

      if (res.ok) {
        showNotification('Test message sent successfully!', 'success');
      } else {
        showNotification('Failed to send test message', 'error');
      }
    } catch (error) {
      showNotification('Error sending test message', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass ghost-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-bold text-xl">Settings</h1>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn font-medium text-[var(--on-primary)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Maintenance Mode */}
          <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${settings.maintenance_mode ? 'bg-[var(--error)]/10' : 'bg-[var(--success)]/10'}`}>
                <Power className={`w-5 h-5 ${settings.maintenance_mode ? 'text-[var(--error)]' : 'text-[var(--success)]'}`} />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg">Maintenance Mode</h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Temporarily disable the site for maintenance
                </p>
              </div>
              <label className="ml-auto relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--surface-bright)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]" />
              </label>
            </div>

            {settings.maintenance_mode && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                  Maintenance Message
                </label>
                <textarea
                  value={settings.maintenance_message}
                  onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] resize-none"
                  placeholder="Enter the message to display during maintenance..."
                />
              </div>
            )}
          </div>

          {/* Telegram Bot Integration */}
          <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[var(--tertiary)]/10">
                <Bot className="w-5 h-5 text-[var(--tertiary)]" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg">Telegram Bot</h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Configure automatic notifications to Telegram
                </p>
              </div>
              <label className="ml-auto relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.telegram_enabled}
                  onChange={(e) => setSettings({ ...settings, telegram_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--surface-bright)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]" />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                  Bot Token
                </label>
                <input
                  type="password"
                  value={settings.telegram_bot_token}
                  onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                />
                <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                  Get this from @BotFather on Telegram
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                  Chat ID
                </label>
                <input
                  type="text"
                  value={settings.telegram_chat_id}
                  onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
                  placeholder="-1001234567890 or @channelusername"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                />
                <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                  Channel or group ID where notifications will be sent
                </p>
              </div>

              {/* Test Telegram */}
              {settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id && (
                <div className="p-4 rounded-xl bg-[var(--surface-container-low)]">
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">
                    Send Test Message
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Enter test message..."
                      className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    />
                    <button
                      onClick={testTelegram}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--tertiary)]/20 text-[var(--tertiary)] hover:bg-[var(--tertiary)]/30 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Test
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div className="p-6 rounded-2xl bg-[var(--surface-container)] ghost-border">
            <h2 className="font-display font-semibold text-lg mb-4">About FilmyMela</h2>
            <div className="space-y-2 text-sm text-[var(--on-surface-variant)]">
              <p>Version: 1.0.0</p>
              <p>Platform: Next.js + Supabase</p>
              <p>Theme: Dark Cinema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg toast-${notification.type}`}
          >
            <p className="font-medium">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
