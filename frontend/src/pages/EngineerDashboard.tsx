import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { CheckCircle, Clock, Wrench, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest, DashboardStats } from '@/types';
import { formatDate } from '@/utils/helpers';

export const EngineerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [jobData, dashStats] = await Promise.all([
        requestService.getMyJobs(user!.id),
        requestService.getDashboardStats(user!.id, 'engineer'),
      ]);
      setJobs(jobData);
      setStats(dashStats);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAccept = async (assignmentId: number) => {
    try {
      await requestService.acceptJob(assignmentId);
      toast.success('Job accepted!');
      loadData();
    } catch {
      toast.error('Failed to accept job');
    }
  };

  const handleReject = async (assignmentId: number) => {
    try {
      await requestService.rejectJob(assignmentId);
      toast.info('Job rejected');
      loadData();
    } catch {
      toast.error('Failed to reject job');
    }
  };

  const handleMarkComplete = async (requestId: number) => {
    try {
      await requestService.markComplete(requestId);
      toast.success('Job marked as completed!');
      loadData();
    } catch {
      toast.error('Failed to mark complete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  const pendingCount = jobs.filter(j => j.assignment?.status === 'pending').length;
  const recentJobs = jobs.slice(0, 4);

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Your assigned jobs and tasks
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">{pendingCount}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Pending Acceptance
            </h3>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {stats?.in_progress_requests || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              In Progress
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
                <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {stats?.total_requests || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Total Jobs
            </h3>
          </div>
        </div>

        {/* Assigned Jobs */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-6">
            Assigned Jobs
          </h2>

          {recentJobs.length === 0 ? (
            <p className="text-gray-500 dark:text-stone-400 text-center py-8">
              No jobs assigned yet.
            </p>
          ) : (
            <div className="space-y-4">
              {recentJobs.map(job => {
                const isPending = job.assignment?.status === 'pending';
                const isInProgress = job.status === 'in_progress';

                return (
                  <div
                    key={job.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      isPending
                        ? 'border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
                        : 'border-gray-200 dark:border-dark-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-dark-text">
                            {job.ticket_number}
                          </span>
                          <UrgencyBadge urgency={job.urgency} />
                          {isPending ? (
                            <span className="badge bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                              PENDING ACCEPTANCE
                            </span>
                          ) : (
                            <StatusBadge status={job.status} />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-dark-text-secondary mb-2">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-stone-400 mb-3">
                          {job.customer && <span>Customer: {job.customer.name}</span>}
                          <span>·</span>
                          <span>Preferred: {formatDate(job.preferred_date)} at {job.preferred_time}</span>
                        </div>
                        <div className="flex gap-2">
                          {isPending && job.assignment && (
                            <>
                              <button
                                onClick={() => handleAccept(job.assignment!.id)}
                                className="btn-primary text-sm"
                              >
                                Accept Job
                              </button>
                              <button
                                onClick={() => handleReject(job.assignment!.id)}
                                className="btn-secondary text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {!isPending && (
                            <button
                              onClick={() => navigate(`/engineer/jobs/${job.id}`)}
                              className="btn-primary text-sm"
                            >
                              View Details
                            </button>
                          )}
                          {isInProgress && !isPending && (
                            <button
                              onClick={() => handleMarkComplete(job.id)}
                              className="btn-secondary text-sm"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/engineer/jobs')}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              View All Jobs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
