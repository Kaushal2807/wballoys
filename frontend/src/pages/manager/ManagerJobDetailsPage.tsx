import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BackButton } from '@/components/common/BackButton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { UpdateTimeline } from '@/components/common/UpdateTimeline';
import { PhotoGallery } from '@/components/common/PhotoGallery';
import { AssignEngineerModal } from '@/components/manager/AssignEngineerModal';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest, JobUpdate, JobPhoto } from '@/types';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { MapPin, Calendar, Clock, User, Wrench, UserPlus, XCircle } from 'lucide-react';

export const ManagerJobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [updates, setUpdates] = useState<JobUpdate[]>([]);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [req, upd, pht] = await Promise.all([
        requestService.getRequestById(parseInt(id!)),
        requestService.getRequestUpdates(parseInt(id!)),
        requestService.getRequestPhotos(parseInt(id!)),
      ]);
      setRequest(req);
      setUpdates(upd);
      setPhotos(pht);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCloseJob = async () => {
    if (!request) return;
    setClosing(true);
    try {
      await requestService.closeRequest(request.id);
      toast.success('Job closed successfully!');
      loadData();
    } catch { toast.error('Failed to close job'); }
    finally { setClosing(false); }
  };

  const handleAssign = async (engineerId: number, note: string) => {
    if (!request) return;
    try {
      await requestService.assignEngineer(request.id, engineerId, note, user!.id);
      toast.success('Engineer assigned!');
      loadData();
    } catch { toast.error('Failed to assign engineer'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg"><Navbar /><LoadingSpinner /></div>
  );

  if (!request) return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg"><Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8"><p className="text-gray-500">Job not found.</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to All Jobs" />

        {/* Header Card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">
                {request.ticket_number}
              </h1>
              <div className="flex items-center gap-2">
                <UrgencyBadge urgency={request.urgency} />
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div className="flex gap-2">
              {request.status === 'new' && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" /> Assign Engineer
                </button>
              )}
              {request.status === 'completed' && (
                <button
                  onClick={handleCloseJob}
                  disabled={closing}
                  className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {closing ? 'Closing...' : 'Close Job'}
                </button>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-2">
              <Wrench className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Asset</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{request.asset?.asset_name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{request.asset?.model} - {request.asset?.serial_number}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Location</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{request.asset?.location || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Customer</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{request.customer?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Preferred Schedule</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                  {formatDate(request.preferred_date)} at {request.preferred_time}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                  {formatDateTime(request.created_at)}
                </p>
              </div>
            </div>
            {request.assignment?.engineer && (
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-stone-400">Assigned Engineer</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                    {request.assignment.engineer.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Description</h3>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-bg p-3 rounded-lg">
              {request.description}
            </p>
          </div>
        </div>

        {/* Updates Timeline */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Updates</h2>
          <UpdateTimeline updates={updates} />
        </div>

        {/* Photos */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Photos</h2>
          <PhotoGallery photos={photos} />
        </div>
      </div>

      <AssignEngineerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        requestId={request.id}
        onAssign={handleAssign}
      />
    </div>
  );
};
