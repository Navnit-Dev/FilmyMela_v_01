'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Button,
  Divider,
  Collapse,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  BarChart as BarChartIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import theme from './theme';

const drawerWidth = 280;

const getAdminAvatar = (name, seed = null) => {
  const avatarSeed = seed || name || 'admin';
  return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50&gender=male`;
};

const getFallbackAvatar = (name) => {
  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name || 'Admin')}&radius=50`;
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const hideSidebar = pathname === '/admin';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (!res.ok) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setAdmin(data);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const handleExpandClick = (label) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: DashboardIcon },
    { label: 'Movies', href: '/admin/movies', icon: MovieIcon },
    { label: 'Sections', href: '/admin/sections', icon: ViewModuleIcon },
    {
      label: 'Taxonomies',
      icon: StarIcon,
      children: [
        { label: 'Genres', href: '/admin/genres', icon: StarIcon },
        { label: 'Industries', href: '/admin/industries', icon: BusinessIcon },
      ],
    },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChartIcon },
    {
      label: 'Management',
      icon: PeopleIcon,
      children: [
        { label: 'Admins', href: '/admin/admins', icon: SecurityIcon },
        { label: 'Users', href: '/admin/users', icon: PeopleIcon },
      ],
    },
    { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const avatarUrl = admin && !avatarError
    ? getAdminAvatar(admin.name, admin.id || admin.email)
    : getFallbackAvatar(admin?.name || 'Admin');

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src="/logo.jpeg" alt="FilmyMela" width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #e91e63, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FilmyMela
          </Typography>
          <Typography variant="caption" color="text.secondary">Admin Panel</Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {navItems.map((item) => (
          <Box key={item.label}>
            {item.children ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleExpandClick(item.label)} selected={item.children.some((child) => isActive(child.href))}>
                    <ListItemIcon sx={{ color: item.children.some((child) => isActive(child.href)) ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                    {expandedItems[item.label] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={expandedItems[item.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.href} disablePadding>
                        <Link href={child.href} passHref style={{ textDecoration: 'none', width: '100%' }}>
                          <ListItemButton selected={isActive(child.href)} sx={{ pl: 6 }} onClick={() => isMobile && setMobileOpen(false)}>
                            <ListItemIcon sx={{ color: isActive(child.href) ? 'primary.main' : 'text.secondary', minWidth: 32 }}>
                              <child.icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={child.label} />
                            {isActive(child.href) && <ChevronRightIcon fontSize="small" color="primary" />}
                          </ListItemButton>
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding>
                <Link href={item.href} passHref style={{ textDecoration: 'none', width: '100%' }}>
                  <ListItemButton selected={isActive(item.href)} onClick={() => isMobile && setMobileOpen(false)}>
                    <ListItemIcon sx={{ color: isActive(item.href) ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.href) ? 600 : 400 }} />
                    {isActive(item.href) && <ChevronRightIcon fontSize="small" color="primary" />}
                  </ListItemButton>
                </Link>
              </ListItem>
            )}
          </Box>
        ))}
      </List>

      <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar src={avatarUrl} alt={admin?.name || 'Admin'} sx={{ width: 48, height: 48 }} onError={() => setAvatarError(true)} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap fontWeight={600}>{admin?.name || 'Admin'}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SecurityIcon sx={{ fontSize: 14 }} />{admin?.role}
            </Typography>
          </Box>
        </Box>
        <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ borderRadius: 3 }}>
          Logout
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={120} />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {!hideSidebar && (
          <>
            <AppBar position="fixed" sx={{ display: { lg: 'none' }, width: '100%' }}>
              <Toolbar>
                <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Image src="/logo.jpeg" alt="FilmyMela" width={32} height={32} style={{ borderRadius: 8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #e91e63, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    FilmyMela
                  </Typography>
                </Box>
                <Avatar src={avatarUrl} alt={admin?.name || 'Admin'} sx={{ width: 36, height: 36 }} onError={() => setAvatarError(true)} />
              </Toolbar>
            </AppBar>

            <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
              {drawerContent}
            </Drawer>

            <Drawer variant="permanent" sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>
              {drawerContent}
            </Drawer>
          </>
        )}

        <Box component="main" sx={{ flexGrow: 1, width: { lg: `calc(100% - ${hideSidebar ? 0 : drawerWidth}px)` }, ml: { lg: hideSidebar ? 0 : `${drawerWidth}px` }, pt: { xs: hideSidebar ? 0 : 8, lg: 0 } }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}