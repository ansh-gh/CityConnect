import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard,
  People,
  ReportProblem,
  LocalParking,
  Poll,
  Feedback,
  NotificationsActive,
  Warning,
  Logout,
  LocationCity,
  Settings
} from '@mui/icons-material';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

import cityLogo from '../assets/photo_2026-04-23_23-37-01.jpg';

const Sidebar = ({ open, onClose, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { text: 'Users', path: '/users', icon: <People /> },
    { text: 'Complaints', path: '/complaints', icon: <ReportProblem /> },
    { text: 'Parking', path: '/parking', icon: <LocalParking /> },
    { text: 'Polls', path: '/polls', icon: <Poll /> },
    { text: 'Feedback', path: '/feedback', icon: <Feedback /> },
    { text: 'Notifications', path: '/notifications', icon: <NotificationsActive /> },
    { text: 'Settings', path: '/settings', icon: <Settings /> }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 72 : 260;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0F172A',
        color: '#F8FAFC'
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          px: collapsed ? 2 : 2.5,
          gap: 1.5,
          borderBottom: '1px solid rgba(229, 231, 235, 0.08)'
        }}
      >
        <Box
          component="img"
          src={cityLogo}
          alt="CityConnect Logo"
          sx={{
            width: collapsed ? 36 : 36,
            height: collapsed ? 36 : 36,
            borderRadius: '8px',
            objectFit: 'cover',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
          }}
        />
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              letterSpacing: '-0.5px'
            }}
          >
            CityConnect
          </Typography>
        )}
      </Box>

      {/* Menu List */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  px: collapsed ? 1.5 : 2,
                  justifyContent: collapsed ? 'center' : 'initial',
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  '&:hover': {
                    backgroundColor: isActive ? '#2563EB' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#FFFFFF' : '#F8FAFC',
                    '& .MuiListItemIcon-root': {
                      color: isActive ? '#FFFFFF' : '#F8FAFC'
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 36,
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: {
                        style: {
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '14px'
                        }
                      }
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(229, 231, 235, 0.08)' }} />

      {/* Footer / Logout */}
      <List sx={{ px: 2, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '8px',
              py: 1,
              px: collapsed ? 1.5 : 2,
              justifyContent: collapsed ? 'center' : 'initial',
              color: '#EF4444',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.08)'
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 36,
                color: '#EF4444',
                justifyContent: 'center'
              }}
            >
              <Logout />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                slotProps={{
                  primary: {
                    style: {
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px'
                    }
                  }
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            borderRight: 'none'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          })
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
