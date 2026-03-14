import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { AssignEngineerModal } from '@/components/manager/AssignEngineerModal';
import { Users, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest, DashboardStats, User } from '@/types';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number>(0);

  const loadData = useCallback(async () => {
    try {
      const [allReqs, dashStats, engList] = await Promise.all([
        requestService.getAllRequests(),
        requestService.getDashboardStats(user!.id, 'manager'),
        requestService.getEngineers(),
      ]);
      setRequests(allReqs);
      setStats(dashStats);
      setEngineers(engList);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (engineerId: number, note: string) => {
    try {
      await requestService.assignEngineer(selectedRequestId, engineerId, note, user!.id);
      toast.success('Engineer assigned successfully!');
      loadData();
    } catch {
      toast.error('Failed to assign engineer');
    }
  };

  const openAssignModal = (requestId: number) => {
    setSelectedRequestId(requestId);
    setAssignModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  // Get urgent/unassigned jobs for the urgent section
  const urgentJobs = requests
    .filter(r => r.urgency === 'high' || r.status === 'new')
    .slice(0, 4);

  // Calculate engineer job counts from actual data
  const getEngineerJobCount = (engId: number) => {
    return requests.filter(r =>
      r.assignment?.engineer_id === engId &&
      ['assigned', 'in_progress'].includes(r.status)
    ).length;
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Manager Dashboard
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Overview of all service requests and team performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {stats?.new_requests || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              New Requests
            </h3>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {(stats?.assigned_requests || 0) + (stats?.in_progress_requests || 0)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Active Jobs
            </h3>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {stats?.completed_requests || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Pending Review
            </h3>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {engineers.length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Active Engineers
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Urgent Jobs */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                  Urgent / Unassigned Jobs
                </h2>
                <span className="badge badge-high">{urgentJobs.length} Items</span>
              </div>

              <div className="space-y-3">
                {urgentJobs.map(job => {
                  const isUnassigned = job.status === 'new';
                  return (
                    <div
                      key={job.id}
                      className={`border rounded-lg p-4 ${
                        isUnassigned
                          ? 'border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                          : 'border-gray-200 dark:border-dark-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-dark-text">
                              {job.ticket_number}
                            </span>
                            <UrgencyBadge urgency={job.urgency} />
                            {isUnassigned ? (
                              <span className="badge bg-gray-100 text-gray-800 dark:bg-stone-800/30 dark:text-stone-300">
                                UNASSIGNED
                              </span>
                            ) : (
                              <StatusBadge status={job.status} />
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-dark-text-secondary truncate">
                            {job.description}
                          </p>
                        </div>
                        {isUnassigned ? (
                          <button
                            onClick={() => openAssignModal(job.id)}
                            className="btn-primary text-sm whitespace-nowrap"
                          >
                            Assign
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/manager/jobs/${job.id}`)}
                            className="btn-secondary text-sm whitespace-nowrap"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/manager/jobs')}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium text-sm"
                >
                  View All Jobs →
                </button>
              </div>
            </div>
          </div>

          {/* Engineer Status & Stats */}
          <div className="space-y-6">
            {/* Engineer Status */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">
                Engineer Status
              </h2>

              <div className="space-y-3">
                {engineers.map(eng => {
                  const jobCount = getEngineerJobCount(eng.id);
                  const isBusy = jobCount >= 4;
                  return (
                    <div
                      key={eng.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isBusy
                          ? 'bg-red-50 dark:bg-red-900/10'
                          : jobCount === 0
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : 'bg-gray-50 dark:bg-dark-bg'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-dark-text text-sm">
                          {eng.name}
                        </p>
                        <p className={`text-xs ${
                          isBusy
                            ? 'text-red-600 dark:text-red-400'
                            : jobCount === 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-stone-400'
                        }`}>
                          {jobCount} active job{jobCount !== 1 ? 's' : ''}
                          {isBusy && ' - BUSY'}
                          {jobCount === 0 && ' - AVAILABLE'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">
                Statistics
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Total Requests</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text">
                      {stats?.total_requests || 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Completed</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text">
                      {(stats?.completed_requests || 0) + (stats?.closed_requests || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${stats?.total_requests ? (((stats.completed_requests + stats.closed_requests) / stats.total_requests) * 100) : 0}%`
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Urgent</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text">
                      {stats?.urgent_requests || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${stats?.total_requests ? ((stats.urgent_requests / stats.total_requests) * 100) : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AssignEngineerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        requestId={selectedRequestId}
        onAssign={handleAssign}
      />
    </div>
  );
};
