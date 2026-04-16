'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Skeleton,
  InputAdornment,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  PowerSettingsNew,
  Telegram,
  Send,
  Info,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
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
        toast.success('Test message sent successfully');
      } else {
        toast.error('Failed to send test message');
      }
    } catch (error) {
      toast.error('Failed to send test message');
    }
  };


  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper sx={{ position: 'sticky', top: 0, zIndex: 40, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link href="/admin/dashboard" passHref style={{ textDecoration: 'none' }}>
              <IconButton>
                <ArrowBack />
              </IconButton>
            </Link>
            <Typography variant="h6" fontWeight={700}>Settings</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: 3 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Maintenance Mode */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: settings.maintenance_mode ? 'error.main' : 'success.main' }}>
                  <PowerSettingsNew sx={{ color: 'white' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>Maintenance Mode</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Temporarily disable the site for maintenance
                  </Typography>
                </Box>
                <Switch
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                />
              </Box>
              {settings.maintenance_mode && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Maintenance Message"
                  value={settings.maintenance_message}
                  onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                  placeholder="Enter the message to display during maintenance..."
                />
              )}
            </CardContent>
          </Card>

          {/* Telegram Bot */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <Telegram sx={{ color: 'white' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>Telegram Bot</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure automatic notifications to Telegram
                  </Typography>
                </Box>
                <Switch
                  checked={settings.telegram_enabled}
                  onChange={(e) => setSettings({ ...settings, telegram_enabled: e.target.checked })}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Bot Token"
                  value={settings.telegram_bot_token}
                  onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                  helperText="Get this from @BotFather on Telegram"
                />
                <TextField
                  fullWidth
                  label="Chat ID"
                  value={settings.telegram_chat_id}
                  onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
                  placeholder="-1001234567890 or @channelusername"
                  helperText="Channel or group ID where notifications will be sent"
                />
                {settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id && (
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <TextField
                      fullWidth
                      label="Send Test Message"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Enter test message..."
                      InputProps={{
                        endAdornment: (
                          <Button variant="contained" size="small" onClick={testTelegram} startIcon={<Send />}>
                            Test
                          </Button>
                        ),
                      }}
                    />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                <Info sx={{ verticalAlign: 'middle', mr: 1 }} />
                About FilmyMela
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
                <Typography variant="body2">Version: 1.0.0</Typography>
                <Typography variant="body2">Platform: Next.js + Supabase</Typography>
                <Typography variant="body2">Theme: Material UI Dark</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

    </Box>
  );
}
