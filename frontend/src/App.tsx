import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CustomerDashboard } from '@/pages/CustomerDashboard';
import { EngineerDashboard } from '@/pages/EngineerDashboard';
import { ManagerDashboard } from '@/pages/ManagerDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';

// Customer Pages
import { CustomerRequestsPage } from '@/pages/customer/CustomerRequestsPage';
import { CreateRequestPage } from '@/pages/customer/CreateRequestPage';
import { RequestDetailsPage } from '@/pages/customer/RequestDetailsPage';

// Engineer Pages
import { EngineerJobsPage } from '@/pages/engineer/EngineerJobsPage';
import { JobDetailsPage } from '@/pages/engineer/JobDetailsPage';

// Manager Pages
import { ManagerJobsPage } from '@/pages/manager/ManagerJobsPage';
import { ManagerJobDetailsPage } from '@/pages/manager/ManagerJobDetailsPage';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes - Dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/engineer/dashboard"
        element={
          <ProtectedRoute>
            <EngineerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Customer Routes */}
      <Route
        path="/customer/requests"
        element={
          <ProtectedRoute>
            <CustomerRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/requests/new"
        element={
          <ProtectedRoute>
            <CreateRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/requests/:id"
        element={
          <ProtectedRoute>
            <RequestDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Engineer Routes */}
      <Route
        path="/engineer/jobs"
        element={
          <ProtectedRoute>
            <EngineerJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/engineer/jobs/:id"
        element={
          <ProtectedRoute>
            <JobDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager/jobs"
        element={
          <ProtectedRoute>
            <ManagerJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/jobs/:id"
        element={
          <ProtectedRoute>
            <ManagerJobDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 dark:text-dark-text mb-4">
                404
              </h1>
              <p className="text-xl text-gray-600 dark:text-dark-text-secondary mb-8">
                Page not found
              </p>
              <a href="/dashboard" className="btn-primary">
                Go to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="toast-container"
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
