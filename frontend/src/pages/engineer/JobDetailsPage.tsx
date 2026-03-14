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
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest, JobUpdate, JobPhoto } from '@/types';
import { formatDate } from '@/utils/helpers';
import { MapPin, Wrench, User, Calendar, Play, CheckCircle, ThumbsUp, ThumbsDown, Send } from 'lucide-react';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [updates, setUpdates] = useState<JobUpdate[]>([]);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

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

  const handleAccept = async () => {
    if (!request?.assignment) return;
    try {
      await requestService.acceptJob(request.assignment.id);
      toast.success('Job accepted!');
      loadData();
    } catch { toast.error('Failed to accept job'); }
  };

  const handleReject = async () => {
    if (!request?.assignment) return;
    try {
      await requestService.rejectJob(request.assignment.id);
      toast.info('Job rejected');
      loadData();
    } catch { toast.error('Failed to reject job'); }
  };

  const handleStartWork = async () => {
    if (!request) return;
    try {
      await requestService.startWork(request.id);
      toast.success('Work started!');
      loadData();
    } catch { toast.error('Failed to start work'); }
  };

  const handleMarkComplete = async () => {
    if (!request) return;
    try {
      await requestService.markComplete(request.id);
      toast.success('Job marked as completed!');
      loadData();
    } catch { toast.error('Failed to complete job'); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !request) return;
    setAddingNote(true);
    try {
      await requestService.addJobUpdate(request.id, noteText.trim(), user!.id);
      toast.success('Note added!');
      setNoteText('');
      loadData();
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!request) return;
    await requestService.uploadPhoto(request.id, file, user!.id);
    toast.success('Photo uploaded!');
    loadData();
  };

  if (loading) return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg"><Navbar /><LoadingSpinner /></div>
  );

  if (!request) return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg"><Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8"><p className="text-gray-500">Job not found.</p></div>
    </div>
  );

  const isPending = request.assignment?.status === 'pending';
  const isAssigned = request.status === 'assigned' && request.assignment?.status === 'accepted';
  const isInProgress = request.status === 'in_progress';

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to My Jobs" />

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
            {/* Action Buttons */}
            <div className="flex gap-2">
              {isPending && (
                <>
                  <button onClick={handleAccept} className="btn-primary flex items-center gap-2 text-sm">
                    <ThumbsUp className="w-4 h-4" /> Accept
                  </button>
                  <button onClick={handleReject} className="btn-secondary flex items-center gap-2 text-sm">
                    <ThumbsDown className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
              {isAssigned && (
                <button onClick={handleStartWork} className="btn-primary flex items-center gap-2 text-sm">
                  <Play className="w-4 h-4" /> Start Work
                </button>
              )}
              {isInProgress && (
                <button onClick={handleMarkComplete} className="btn-primary flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" /> Mark Complete
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
                <p className="text-xs text-gray-500">{request.customer?.email}</p>
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
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Problem Description</h3>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-bg p-3 rounded-lg">
              {request.description}
            </p>
          </div>
        </div>

        {/* Add Work Notes */}
        {(isInProgress || isAssigned) && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Add Work Notes</h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter work notes, progress updates..."
              rows={3}
              className="input-field mb-3"
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim() || addingNote}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        )}

        {/* Upload Photos */}
        {(isInProgress || isAssigned) && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Upload Photos</h2>
            <PhotoUpload existingPhotoCount={photos.length} onUpload={handlePhotoUpload} />
          </div>
        )}

        {/* Updates Timeline */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Updates</h2>
          <UpdateTimeline updates={updates} />
        </div>

        {/* Photos Gallery */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Photos</h2>
          <PhotoGallery photos={photos} />
        </div>
      </div>
    </div>
  );
};
