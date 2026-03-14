import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case 'customer':
      return <Navigate to="/customer/dashboard" replace />;
    case 'engineer':
      return <Navigate to="/engineer/dashboard" replace />;
    case 'manager':
      return <Navigate to="/manager/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};
