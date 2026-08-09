import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications,
  Logout,
  Settings,
  Person
} from '@mui/icons-material';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

import cityLogo from '../assets/photo_2026-04-23_23-37-01.jpg';

const Navbar = ({ onToggleSidebar, onToggleCollapse, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Retrieve user name/avatar info from Redux slice if stored
  const { user } = useSelector((state) => state.auth || {});

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  // Get Page Title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/users')) return 'Users List';
    if (path.startsWith('/complaints')) return 'Complaints Board';
    if (path.startsWith('/parking')) return 'Parking Operations';
    if (path.startsWith('/polls')) return 'Municipal Polls';
    if (path.startsWith('/feedback')) return 'Citizen Feedback';
    if (path.startsWith('/notifications')) return 'Broadcast Announcements';
    if (path.startsWith('/settings')) return 'System Settings';
    return 'Admin Control Panel';
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: 64, px: { xs: 2, md: 3 } }}>
        {/* Left: Toggles & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={isMobile ? onToggleSidebar : onToggleCollapse}
            sx={{ color: '#1E293B' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#1E293B',
              fontSize: { xs: '15px', sm: '18px' }
            }}
          >
            {getPageTitle()}
          </Typography>
        </Box>

        {/* Right: Search, Notifications, Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {/* Search Box */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              px: 1.5,
              py: 0.5,
              border: '1px solid #E5E7EB',
              width: 240
            }}
          >
            <SearchIcon sx={{ color: '#64748B', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Search resource..."
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                color: '#1E293B',
                width: '100%'
              }}
            />
          </Box>

          {/* Notifications Badge */}
          <IconButton sx={{ color: '#64748B' }}>
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontFamily: 'Poppins' } }}>
              <Notifications />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1E293B' }}
              >
                {user?.name || user?.full_name || 'Municipal Officer'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'Poppins, sans-serif', color: '#64748B', display: 'block' }}
              >
                {user?.role || 'Super Admin'}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
              <Avatar
                src={cityLogo}
                alt="Admin Profile Avatar"
                sx={{
                  width: 40,
                  height: 40,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              />
            </IconButton>

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={{
                mt: 1.5,
                '& .MuiPaper-root': {
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(15,23,42,.08)',
                  border: '1px solid #E5E7EB',
                  minWidth: 180
                }
              }}
            >
              <MenuItem onClick={handleSettings} sx={{ py: 1.2 }}>
                <ListItemIcon sx={{ color: '#64748B' }}>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  slotProps={{ primary: { style: { fontFamily: 'Poppins', fontSize: '14px', color: '#1E293B' } } }}
                />
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: '#EF4444' }}>
                <ListItemIcon sx={{ color: '#EF4444' }}>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  slotProps={{ primary: { style: { fontFamily: 'Poppins', fontSize: '14px' } } }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
