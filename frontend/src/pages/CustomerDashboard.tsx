import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { Plus, ClipboardList, Package, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest, DashboardStats } from '@/types';
import { formatDate } from '@/utils/helpers';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reqs, dashStats] = await Promise.all([
          requestService.getMyRequests(user!.id),
          requestService.getDashboardStats(user!.id, 'customer'),
        ]);
        setRequests(reqs);
        setStats(dashStats);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  const activeCount = (stats?.in_progress_requests || 0) + (stats?.assigned_requests || 0) + (stats?.new_requests || 0);
  const recentRequests = requests.slice(0, 3);

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Manage your service requests and track their progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">{activeCount}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Active Requests
            </h3>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {(stats?.completed_requests || 0) + (stats?.closed_requests || 0)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Completed
            </h3>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {stats?.total_requests || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Total Requests
            </h3>
          </div>

          <div className="card p-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
            <button
              onClick={() => navigate('/customer/requests/new')}
              className="w-full h-full flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform"
            >
              <Plus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                New Request
              </span>
            </button>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-6">
            My Recent Requests
          </h2>

          {recentRequests.length === 0 ? (
            <p className="text-gray-500 dark:text-stone-400 text-center py-8">
              No requests yet. Create your first service request!
            </p>
          ) : (
            <div className="space-y-4">
              {recentRequests.map(request => (
                <div key={request.id} className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-dark-text">
                          {request.ticket_number}
                        </span>
                        <UrgencyBadge urgency={request.urgency} />
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-dark-text-secondary mb-1">
                        {request.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-stone-400">
                        {request.assignment?.engineer && (
                          <>
                            <span>Engineer: {request.assignment.engineer.name}</span>
                            <span>·</span>
                          </>
                        )}
                        <span>Created: {formatDate(request.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/customer/requests/${request.id}`)}
                      className="btn-secondary text-sm whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/customer/requests')}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              View All Requests →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
