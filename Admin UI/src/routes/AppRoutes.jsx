import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Users from '../pages/Users/Users';
import Complaints from '../pages/Complaints/Complaints';
import Parking from '../pages/Parking/Parking';
import Polls from '../pages/Polls/Polls';
import Feedback from '../pages/Feedback/Feedback';
import Notifications from '../pages/Notifications/Notifications';
import Settings from '../pages/Settings/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Portal */}
      <Route path="/login" element={<Login />} />

      {/* Guarded Admin Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/parking" element={<Parking />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Default dashboard redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Fallback wildcard route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
