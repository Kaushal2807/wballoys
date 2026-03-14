import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BackButton } from '@/components/common/BackButton';
import { ManagerJobCard } from '@/components/manager/JobCard';
import { AssignEngineerModal } from '@/components/manager/AssignEngineerModal';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest, RequestStatus, UrgencyLevel } from '@/types';
import { Search } from 'lucide-react';

export const ManagerJobsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number>(0);

  const loadRequests = useCallback(async () => {
    try {
      const data = await requestService.getAllRequests({
        status: statusFilter,
        urgency: urgencyFilter,
        search: searchQuery,
      });
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, urgencyFilter, searchQuery]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAssign = async (engineerId: number, note: string) => {
    try {
      await requestService.assignEngineer(selectedRequestId, engineerId, note, user!.id);
      toast.success('Engineer assigned successfully!');
      loadRequests();
    } catch {
      toast.error('Failed to assign engineer');
    }
  };

  const openAssignModal = (requestId: number) => {
    setSelectedRequestId(requestId);
    setAssignModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to Dashboard" />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-6">
          All Jobs ({requests.length})
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
            className="input-field w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as UrgencyLevel | 'all')}
            className="input-field w-auto"
          >
            <option value="all">All Urgencies</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticket or description..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : requests.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500 dark:text-stone-400">No jobs found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <ManagerJobCard
                key={req.id}
                request={req}
                onAssign={openAssignModal}
                onView={(id) => navigate(`/manager/jobs/${id}`)}
              />
            ))}
          </div>
        )}
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
