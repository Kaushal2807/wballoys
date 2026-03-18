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
import { ServiceRequest, JobUpdate, JobPhoto, DeliveryUpdate, DeliveryStatus } from '@/types';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { MapPin, Wrench, User, Calendar, Play, CheckCircle, ThumbsUp, ThumbsDown, Send, Truck, Package, ArrowRight, Check } from 'lucide-react';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [updates, setUpdates] = useState<JobUpdate[]>([]);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [deliveryUpdates, setDeliveryUpdates] = useState<DeliveryUpdate[]>([]);
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [req, upd, pht, delUpdates] = await Promise.all([
        requestService.getRequestById(parseInt(id!)),
        requestService.getRequestUpdates(parseInt(id!)),
        requestService.getRequestPhotos(parseInt(id!)),
        requestService.getDeliveryUpdates(parseInt(id!)),
      ]);
      setRequest(req);
      setUpdates(upd);
      setPhotos(pht);
      setDeliveryUpdates(delUpdates);
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

  const handleSelfAccept = async () => {
    if (!request) return;
    try {
      await requestService.engineerSelfAccept(request.id, user!.id);
      toast.success('Request accepted! It has been added to your jobs.');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept request';
      toast.error(msg);
      loadData();
    }
  };

  const handleRejectNew = async () => {
    if (!request) return;
    try {
      await requestService.engineerRejectNew(request.id, user!.id);
      toast.info('Request rejected');
      loadData();
    } catch { toast.error('Failed to reject request'); }
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

  const DELIVERY_STEPS: { status: DeliveryStatus; label: string }[] = [
    { status: 'site_visited', label: 'Site Visited' },
    { status: 'photos_taken', label: 'Photos Taken' },
    { status: 'next_date_given', label: 'Next Date Given' },
    { status: 'service_solved', label: 'Service Solved' },
  ];

  const currentDeliveryStatus = request?.delivery_status || 'site_visited';
  const currentDeliveryIndex = DELIVERY_STEPS.findIndex(s => s.status === currentDeliveryStatus);

  const getNextDeliveryStatus = (): DeliveryStatus | null => {
    const nextIndex = currentDeliveryIndex + 1;
    if (nextIndex >= DELIVERY_STEPS.length) return null;
    return DELIVERY_STEPS[nextIndex].status;
  };

  const getNextDeliveryButtonLabel = (): string => {
    const next = getNextDeliveryStatus();
    if (!next) return '';
    const labels: Record<DeliveryStatus, string> = {
      site_visited: '',
      photos_taken: 'Mark as Photos Taken',
      next_date_given: 'Mark as Next Date Given',
      service_solved: 'Mark as Service Solved',
    };
    return labels[next];
  };

  const handleUpdateDelivery = async () => {
    if (!request) return;
    const nextStatus = getNextDeliveryStatus();
    if (!nextStatus) return;
    setUpdatingDelivery(true);
    try {
      await requestService.updateDeliveryStatus(request.id, nextStatus, user!.id);
      toast.success(`Status updated to "${DELIVERY_STEPS.find(s => s.status === nextStatus)?.label}"`);
      loadData();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingDelivery(false); }
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
  const isNewUnassigned = request.status === 'new' && !request.assignment;
  const rejectedByMe = request.rejected_by_engineers?.includes(user?.id ?? -1);

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
            <div className="flex gap-2 flex-wrap">
              {isNewUnassigned && !rejectedByMe && (
                <>
                  <button onClick={handleSelfAccept} className="text-sm font-medium py-2 px-4 rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" /> Accept Request
                  </button>
                  <button onClick={handleRejectNew} className="btn-secondary flex items-center gap-2 text-sm">
                    <ThumbsDown className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
              {isNewUnassigned && rejectedByMe && (
                <span className="text-sm text-gray-400 dark:text-stone-500 italic py-2">
                  You have rejected this request
                </span>
              )}
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

        {/* Delivery Status Section */}
        {(isInProgress || request.status === 'completed') && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Updated Status</h2>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {DELIVERY_STEPS.map((step, index) => {
                const isCompleted = index < currentDeliveryIndex;
                const isCurrent = index === currentDeliveryIndex;
                return (
                  <React.Fragment key={step.status}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                          : 'bg-gray-200 text-gray-500 dark:bg-stone-700 dark:text-stone-400'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : isCurrent
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 dark:text-stone-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < DELIVERY_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-1.25rem] ${
                        index < currentDeliveryIndex
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-stone-700'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Update Delivery Action */}
            {getNextDeliveryStatus() && (
              <div className="border-t border-gray-100 dark:border-dark-border pt-4">
                <button
                  onClick={handleUpdateDelivery}
                  disabled={updatingDelivery}
                  className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  {updatingDelivery ? 'Updating...' : getNextDeliveryButtonLabel()}
                </button>
              </div>
            )}

            {currentDeliveryStatus === 'service_solved' && (
              <div className="border-t border-gray-100 dark:border-dark-border pt-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Service Solved</span>
                </div>
              </div>
            )}

            {/* Status History */}
            {deliveryUpdates.length > 0 && (
              <div className="border-t border-gray-100 dark:border-dark-border pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-3">Status History</h3>
                <div className="space-y-2">
                  {deliveryUpdates.map(du => (
                    <div key={du.id} className="flex items-start gap-3 text-sm">
                      <div className={`badge text-xs ${
                        du.status === 'service_solved' ? 'delivery-service-solved'
                        : du.status === 'next_date_given' ? 'delivery-next-date-given'
                        : du.status === 'photos_taken' ? 'delivery-photos-taken'
                        : 'delivery-site-visited'
                      }`}>
                        {du.status === 'site_visited' ? 'SITE VISITED'
                        : du.status === 'photos_taken' ? 'PHOTOS TAKEN'
                        : du.status === 'next_date_given' ? 'NEXT DATE GIVEN'
                        : 'SERVICE SOLVED'}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-600 dark:text-dark-text-secondary">
                          by {du.user?.name || 'Unknown'}
                        </span>
                        {du.notes && (
                          <p className="text-gray-500 dark:text-stone-400 text-xs mt-0.5">{du.notes}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-stone-500 whitespace-nowrap">
                        {formatDateTime(du.updated_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
