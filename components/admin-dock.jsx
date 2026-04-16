'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Tooltip,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ViewModule as ViewModuleIcon,
  NotificationsActive as PopupIcon,
} from '@mui/icons-material';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: DashboardIcon },
  { label: 'Movies', href: '/admin/movies', icon: MovieIcon },
  { label: 'Sections', href: '/admin/sections', icon: ViewModuleIcon },
  { label: 'Popups', href: '/admin/popups', icon: PopupIcon },
  { label: 'Genres', href: '/admin/genres', icon: StarIcon },
  { label: 'Industries', href: '/admin/industries', icon: BusinessIcon },
  { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

export default function AdminDock({ onLogout }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/admin/dashboard') {
      return pathname === href || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 1,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(26, 25, 25, 0.95)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Tooltip key={item.href} title={item.label} placement="top" arrow>
            <IconButton
              component={Link}
              href={item.href}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                '&:hover': {
                  bgcolor: active ? 'rgba(229, 9, 20, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Icon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        );
      })}

      <Box sx={{ width: 1, height: 32, bgcolor: 'divider', mx: 0.5 }} />

      <Tooltip title="Logout" placement="top" arrow>
        <IconButton
          onClick={onLogout}
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'error.contrastText',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <LogoutIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}
