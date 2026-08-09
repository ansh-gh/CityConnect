import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
  const { token } = useSelector((state) => state.auth || {});

  // Check if token exists either in Redux state or local storage
  const isAuthenticated = token || localStorage.getItem('accessToken');

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
