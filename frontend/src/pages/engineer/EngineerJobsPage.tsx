import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [allRequests, setAllRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const activeTab = searchParams.get('tab') || 'all';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
    setFilter('all');
  };

  const loadJobs = useCallback(async () => {
    try {
      const [myJobs, allReqs] = await Promise.all([
        requestService.getMyJobs(user!.id),
        requestService.getAllRequestsForEngineer(user!.id),
      ]);
      setJobs(myJobs);
      setAllRequests(allReqs);
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

  const handleSelfAccept = async (requestId: number) => {
    try {
      await requestService.engineerSelfAccept(requestId, user!.id);
      toast.success('Request accepted! It has been added to your jobs.');
      loadJobs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept request';
      toast.error(msg);
      loadJobs(); // refresh in case someone else just claimed it
    }
  };

  const handleRejectNew = async (requestId: number) => {
    try {
      await requestService.engineerRejectNew(requestId, user!.id);
      toast.info('Request rejected');
      loadJobs();
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const myAssignedIds = new Set(jobs.map(j => j.id));

  const getFilteredData = () => {
    const source = activeTab === 'my' ? jobs : allRequests;
    return source.filter(j => {
      if (filter === 'all') return true;
      if (filter === 'pending') return j.assignment?.status === 'pending';
      return j.status === filter;
    });
  };

  const filteredData = getFilteredData();

  const filterOptions = activeTab === 'my'
    ? [
        { value: 'all', label: 'All My Jobs' },
        { value: 'pending', label: 'Pending Acceptance' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'closed', label: 'Closed' },
      ]
    : [
        { value: 'all', label: 'All Requests' },
        { value: 'new', label: 'New' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'closed', label: 'Closed' },
      ];

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to Dashboard" />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-6">
          {activeTab === 'my' ? 'My Jobs' : 'All Customer Requests'}
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-dark-border mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-stone-300'
            }`}
          >
            All Requests ({allRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'my'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-stone-300'
            }`}
          >
            My Jobs ({jobs.length})
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredData.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500 dark:text-stone-400">
              {activeTab === 'my' ? 'No jobs found.' : 'No requests found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map(job => (
              <JobCard
                key={job.id}
                request={job}
                onAccept={activeTab === 'my' ? handleAccept : undefined}
                onReject={activeTab === 'my' ? handleReject : undefined}
                onSelfAccept={activeTab === 'all' ? handleSelfAccept : undefined}
                onRejectNew={activeTab === 'all' ? handleRejectNew : undefined}
                rejectedByMe={activeTab === 'all' ? job.rejected_by_engineers?.includes(user!.id) : undefined}
                onViewDetails={(id) => navigate(`/engineer/jobs/${id}`)}
                onMarkComplete={activeTab === 'my' ? handleMarkComplete : undefined}
                isMyJob={myAssignedIds.has(job.id)}
                showMyJobBadge={activeTab === 'all'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
