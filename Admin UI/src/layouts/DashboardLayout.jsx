import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mobile sidebar open/close
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop sidebar collapsed/expanded
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleToggleCollapse = () => {
    setDesktopCollapsed((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        open={mobileOpen}
        onClose={handleToggleSidebar}
        collapsed={!isMobile && desktopCollapsed}
      />

      {/* Main Panel Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // Prevents flex child overflow in data tables
          // Removed manual margin shifts that caused the structural gap push
          marginLeft: 0, 
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        {/* Top Header Navbar */}
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          onToggleCollapse={handleToggleCollapse}
          isMobile={isMobile}
        />

        {/* Scrollable Core Content Router Outlet */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;