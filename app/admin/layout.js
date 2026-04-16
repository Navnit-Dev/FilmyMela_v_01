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
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  ViewModule as ViewModuleIcon,
  NotificationsActive as PopupIcon,
  Dock as DockIcon,
  ViewSidebar as ViewSidebarIcon,
  Smartphone as SmartphoneIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import theme from './theme';
import { AdminToast } from '../../components/admin-toast';
import AdminDock from '../../components/admin-dock';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dockMode, setDockMode] = useState(false); // Toggle between sidebar and dock on desktop
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

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
    { label: 'Popups', href: '/admin/popups', icon: PopupIcon },
    {
      label: 'Management',
      icon: PeopleIcon,
      children: [
        { label: 'Admins', href: '/admin/admins', icon: SecurityIcon },
        { label: 'Users', href: '/admin/users', icon: PeopleIcon },
        { label: 'Activity', href: '/admin/activity', icon: HistoryIcon },
      ],
    },
    { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
    { label: 'App Download', href: '/admin/app-download', icon: SmartphoneIcon },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const avatarUrl = admin && !avatarError
    ? getAdminAvatar(admin.name, admin.id || admin.email)
    : getFallbackAvatar(admin?.name || 'Admin');

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
        {!sidebarCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src="/logo.jpeg" alt="FilmyMela" width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(45deg, #e91e63, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FilmyMela
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Admin Panel</Typography>
            </Box>
          </Box>
        )}
        {sidebarCollapsed && (
          <Box sx={{ width: 40, height: 40, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src="/logo.jpeg" alt="FilmyMela" width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
        )}
        <IconButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)} size="small">
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
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
      <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(90deg, #1a1a2e 25%, #252542 50%, #1a1a2e 75%)', backgroundSize: '200% 100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: 120, height: 20, borderRadius: 4, background: 'linear-gradient(90deg, #1a1a2e 25%, #252542 50%, #1a1a2e 75%)', backgroundSize: '200% 100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
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

            {/* Desktop Sidebar - shown when dockMode is false */}
            {!dockMode && (
              <Drawer variant="permanent" sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: sidebarCollapsed ? 64 : drawerWidth, transition: 'width 0.3s ease' } }} open>
                {drawerContent}
              </Drawer>
            )}

            {/* Admin Dock - shown on tablet OR when dockMode is true on desktop */}
            {(isTablet || dockMode) && <AdminDock onLogout={handleLogout} />}
          </>
        )}

        <Box component="main" sx={{ 
          flexGrow: 1, 
          width: { lg: `calc(100% - ${hideSidebar ? 0 : dockMode ? 0 : sidebarCollapsed ? 64 : drawerWidth}px)` }, 
          ml: { lg: hideSidebar ? 0 : dockMode ? 0 : `${sidebarCollapsed ? 64 : drawerWidth}px` }, 
          pt: { xs: hideSidebar ? 0 : 8, lg: 0 },
          pb: { xs: isTablet ? 10 : 0, lg: dockMode ? 10 : 0 },
          transition: 'margin-left 0.3s ease',
          position: 'relative'
        }}>
          {/* Dock/Sidebar Toggle Button - Desktop only */}
          {!hideSidebar && (
            <IconButton
              onClick={() => setDockMode(!dockMode)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: { xs: 'none', lg: 'flex' },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
                zIndex: 10,
              }}
              size="small"
              title={dockMode ? 'Switch to Sidebar' : 'Switch to Dock'}
            >
              {dockMode ? <ViewSidebarIcon /> : <DockIcon />}
            </IconButton>
          )}
          {children}
        </Box>
        <AdminToast />
      </Box>
    </ThemeProvider>
  );
}