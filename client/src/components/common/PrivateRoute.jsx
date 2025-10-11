import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  // 1. While the auth state is loading, show a spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. If loading is finished and there is a user, show the page
  //    <Outlet /> is a placeholder for the nested route (e.g., ShippingPage)
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;