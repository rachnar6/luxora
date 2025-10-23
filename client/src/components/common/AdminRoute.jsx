import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // It's better to use your spinner

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a full-page spinner while auth state is loading
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Check for the correct boolean property
  return user && user.isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;