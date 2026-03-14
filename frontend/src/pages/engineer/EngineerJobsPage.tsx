import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BackButton } from '@/components/common/BackButton';
import { JobCard } from '@/components/engineer/JobCard';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest } from '@/types';

export const EngineerJobsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadJobs = useCallback(async () => {
    try {
      const data = await requestService.getMyJobs(user!.id);
      setJobs(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleAccept = async (assignmentId: number) => {
    try {
      await requestService.acceptJob(assignmentId);
      toast.success('Job accepted!');
      loadJobs();
    } catch {
      toast.error('Failed to accept job');
    }
  };

  const handleReject = async (assignmentId: number) => {
    try {
      await requestService.rejectJob(assignmentId);
      toast.info('Job rejected');
      loadJobs();
    } catch {
      toast.error('Failed to reject job');
    }
  };

  const handleMarkComplete = async (requestId: number) => {
    try {
      await requestService.markComplete(requestId);
      toast.success('Job marked as completed!');
      loadJobs();
    } catch {
      toast.error('Failed to mark complete');
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (filter === 'all') return true;
    if (filter === 'pending') return j.assignment?.status === 'pending';
    return j.status === filter;
  });

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to Dashboard" />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-6">
          My Jobs
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Jobs</option>
            <option value="pending">Pending Acceptance</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredJobs.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500 dark:text-stone-400">No jobs found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <JobCard
                key={job.id}
                request={job}
                onAccept={handleAccept}
                onReject={handleReject}
                onViewDetails={(id) => navigate(`/engineer/jobs/${id}`)}
                onMarkComplete={handleMarkComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
