import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BackButton } from '@/components/common/BackButton';
import { RequestCard } from '@/components/customer/RequestCard';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest, RequestStatus, UrgencyLevel } from '@/types';
import { Plus } from 'lucide-react';

export const CustomerRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await requestService.getMyRequests(user!.id);
        setRequests(data);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [user]);

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to Dashboard" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            My Service Requests
          </h1>
          <button
            onClick={() => navigate('/customer/requests/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>

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
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredRequests.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500 dark:text-stone-400">No requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onViewDetails={(id) => navigate(`/customer/requests/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
