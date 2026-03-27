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
import { SafetyStartWorkModal } from '@/components/engineer/SafetyStartWorkModal';
import { PhotoLightbox } from '@/components/common/PhotoLightbox';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ServiceRequest, JobUpdate, JobPhoto, DeliveryUpdate, DeliveryStatus, SafetyWorkStartData } from '@/types';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { MapPin, Wrench, User, Calendar, Play, CheckCircle, ThumbsUp, ThumbsDown, Send, Truck, Package, ArrowRight, Check, Shield, Upload, AlertTriangle } from 'lucide-react';

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
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [lightboxPhotos, setLightboxPhotos] = useState<JobPhoto[]>([]);

  // Safety status tracking
  const safetyPhotos = photos.filter(photo => photo.safety_category);
  const regularPhotos = photos.filter(photo => !photo.safety_category);
  const hasRequiredSafetyPhotos = safetyPhotos.some(photo =>
    photo.safety_category === 'site_conditions' ||
    photo.safety_category === 'safety_equipment' ||
    photo.safety_category === 'workspace_preparation'
  );
  // Check for both new safety start and retroactive safety verification
  const safetyStartUpdate = updates.find(update =>
    update.notes.includes('safety checks completed') ||
    update.notes.includes('safety verification')
  );

  // Lightbox helpers
  const openLightbox = (photos: JobPhoto[], index: number) => {
    setLightboxPhotos(photos);
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < lightboxPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

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
    // Open safety modal instead of directly starting work
    setShowSafetyModal(true);
  };

  const handleSafetyStartWork = async (safetyData: SafetyWorkStartData) => {
    if (!request) return;
    try {
      await requestService.startWorkWithSafety(request.id, safetyData);

      // Check if this was retroactive verification or normal start
      const isRetroactive = request.status === 'in_progress';
      const message = isRetroactive
        ? '✅ Safety verification completed! Job is now unlocked.'
        : '✅ Work started with safety checks completed!';

      toast.success(message, {
        autoClose: 4000,
        style: { backgroundColor: '#D1FAE5', color: '#065F46' }
      });

      setShowSafetyModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to complete safety verification');
      console.error('Safety verification error:', error);
    }
  };

  const handleMarkComplete = async () => {
    if (!request) return;

    // Check if safety verification was completed
    const safetyVerified = updates.some(update =>
      update.notes.includes('safety checks completed') ||
      update.notes.includes('safety verification')
    );

    if (!safetyVerified) {
      toast.error('⚠️ Safety verification required! Cannot mark job complete without safety parameters verification.', {
        autoClose: 5000,
        style: { backgroundColor: '#FEF3C7', color: '#92400E' }
      });
      return;
    }

    try {
      await requestService.markComplete(request.id);
      toast.success('Job marked as completed!');
      loadData();
    } catch { toast.error('Failed to complete job'); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !request) return;

    // Check if safety verification was completed
    const safetyVerified = updates.some(update =>
      update.notes.includes('safety checks completed') ||
      update.notes.includes('safety verification')
    );

    if (!safetyVerified) {
      toast.error('⚠️ Safety verification required! Complete safety parameters before adding work notes.', {
        autoClose: 4000,
        style: { backgroundColor: '#FEF3C7', color: '#92400E' }
      });
      return;
    }
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

    // Check if safety verification was completed
    const safetyVerified = updates.some(update =>
      update.notes.includes('safety checks completed') ||
      update.notes.includes('safety verification')
    );

    if (!safetyVerified) {
      toast.error('⚠️ Safety verification required! Complete safety parameters before progressing the job.', {
        autoClose: 5000,
        style: { backgroundColor: '#FEF3C7', color: '#92400E' }
      });
      return;
    }

    // Validation for service_solved: require at least one recent note and one recent photo
    if (nextStatus === 'service_solved') {
      // Find when "next_date_given" status was last set
      const nextDateUpdate = deliveryUpdates.find(du => du.status === 'next_date_given');

      let recentUpdates, recentPhotos;

      if (nextDateUpdate) {
        const nextDateTime = new Date(nextDateUpdate.updated_at);

        // Check for updates added after next_date_given status
        recentUpdates = updates.filter(update => new Date(update.created_at) > nextDateTime);

        // Check for photos uploaded after next_date_given status
        recentPhotos = photos.filter(photo => new Date(photo.uploaded_at) > nextDateTime);
      } else {
        // If no next_date_given status found, require both notes and photos exist
        recentUpdates = updates;
        recentPhotos = photos;
      }

      const missing = [];
      if (recentUpdates.length === 0) {
        missing.push('work notes');
      }
      if (recentPhotos.length === 0) {
        missing.push('photos');
      }
      if (missing.length > 0) {
        toast.error(`Please add ${missing.join(' and ')} after the Next Date Given stage to mark as Service Solved.`);
        return;
      }
    }

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
  const isCompleted = request.status === 'completed' || request.status === 'closed';
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
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-400">
                        Safety Check Required
                      </h3>
                      <p className="text-xs text-orange-600 dark:text-orange-500">
                        Complete safety verification before starting work
                      </p>
                    </div>
                  </div>
                  <button onClick={handleStartWork} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
                    <Shield className="w-5 h-5" /> Start Work with Safety Check
                  </button>
                </div>
              )}
              {isInProgress && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleMarkComplete}
                    disabled={!safetyStartUpdate}
                    className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Complete
                  </button>
                  {!safetyStartUpdate && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      ⚠️ Safety verification required
                    </span>
                  )}
                </div>
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

        {/* Safety Verification Warning Banner */}
        {isInProgress && !safetyStartUpdate && (
          <div className="card mb-6 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-2">
                    ⚠️ Safety Verification Required
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    This job is missing safety parameter verification. Complete safety checks to unlock all job functions.
                  </p>
                  <ul className="list-disc list-inside text-sm text-orange-700 dark:text-orange-300 space-y-1 mb-4">
                    <li><strong>Cannot add work notes</strong> - Safety verification needed first</li>
                    <li><strong>Cannot upload photos</strong> - Complete safety checks to proceed</li>
                    <li><strong>Cannot update delivery status</strong> - Safety compliance required</li>
                    <li><strong>Cannot mark job complete</strong> - Safety documentation mandatory</li>
                  </ul>
                </div>
              </div>

              {/* Complete Safety Verification Button */}
              <div className="border-t border-orange-200 dark:border-orange-700 pt-4">
                <button
                  onClick={handleStartWork}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
                >
                  <Shield className="w-6 h-6" />
                  <span className="text-lg">Complete Safety Verification Now</span>
                </button>
                <p className="text-xs text-orange-600 dark:text-orange-400 text-center mt-3">
                  Click to complete required safety checks and unlock this job
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Work Notes */}
        {(isInProgress || isAssigned) && (
          <div className={`card p-6 mb-6 ${isInProgress && !safetyStartUpdate ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Add Work Notes</h2>
              {isInProgress && !safetyStartUpdate && (
                <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  🔒 Safety Verification Required
                </span>
              )}
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={isInProgress && !safetyStartUpdate ? "Complete safety verification to add notes..." : "Enter work notes, progress updates..."}
              rows={3}
              className="input-field mb-3"
              disabled={isInProgress && !safetyStartUpdate}
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim() || addingNote || (isInProgress && !safetyStartUpdate)}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        )}

        {/* Upload Photos */}
        {(isInProgress || isAssigned) && (
          <div className={`card p-6 mb-6 ${isInProgress && !safetyStartUpdate ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Upload Photos</h2>
              {isInProgress && !safetyStartUpdate && (
                <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  🔒 Safety Verification Required
                </span>
              )}
            </div>
            <PhotoUpload existingPhotoCount={photos.length} onUpload={handlePhotoUpload} />
          </div>
        )}

        {/* Delivery Status Section */}
        {(isInProgress || request.status === 'completed') && (
          <div className={`card p-6 mb-6 ${isInProgress && !safetyStartUpdate ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-2 mb-6">
              <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Updated Status</h2>
              {isInProgress && !safetyStartUpdate && (
                <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded ml-auto">
                  🔒 Safety Verification Required
                </span>
              )}
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
                  disabled={updatingDelivery || (isInProgress && !safetyStartUpdate)}
                  className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  {updatingDelivery ? 'Updating...' : getNextDeliveryButtonLabel()}
                </button>
                {isInProgress && !safetyStartUpdate && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    ⚠️ Complete safety verification to update delivery status
                  </p>
                )}
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

        {/* Safety Compliance Summary */}
        {(isInProgress || isCompleted) && safetyStartUpdate && (
          <div className="card p-6 mb-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Safety Compliance</h2>
                  <p className="text-sm text-green-600 dark:text-green-400">✓ Safety checks completed before work start</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                <span className="text-xs font-medium text-green-800 dark:text-green-300">COMPLIANT</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Safety Photos Summary */}
              <div className="bg-gray-50 dark:bg-dark-surface p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-dark-text">Safety Photos</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{safetyPhotos.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {hasRequiredSafetyPhotos ? '✓ Required photos uploaded' : '⚠ Missing required photos'}
                </div>
              </div>

              {/* Safety Parameters Summary */}
              <div className="bg-gray-50 dark:bg-dark-surface p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-dark-text">Safety Checks</span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">✓</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">All required checks completed</div>
              </div>

              {/* Safety Start Time */}
              <div className="bg-gray-50 dark:bg-dark-surface p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-gray-900 dark:text-dark-text">Safety Start</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
                  {formatDateTime(safetyStartUpdate.created_at)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Safety verified on work start</div>
              </div>
            </div>
          </div>
        )}

        {/* Updates Timeline */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Updates</h2>
          <UpdateTimeline updates={updates} />
        </div>

        {/* Photos Gallery */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Photos</h2>
            {safetyPhotos.length > 0 && (
              <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <span className="text-xs font-medium text-orange-800 dark:text-orange-400">
                  {safetyPhotos.length} Safety • {regularPhotos.length} Work
                </span>
              </div>
            )}
          </div>

          {/* Safety Photos Section */}
          {safetyPhotos.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-orange-500" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text">Safety Documentation</h3>
                <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded text-xs font-medium text-orange-800 dark:text-orange-400">
                  {safetyPhotos.length} photos
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {safetyPhotos.map((photo, photoIndex) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer"
                    onClick={() => openLightbox(safetyPhotos, photoIndex)}
                    title="Click to view full size"
                  >
                    <img
                      src={photo.photo_url}
                      alt={photo.safety_category || 'Safety photo'}
                      className="w-full h-32 object-cover rounded-lg border-2 border-orange-200 dark:border-orange-800 transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1">
                      <Shield className="w-3 h-3" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg p-2">
                      <div className="text-white text-xs font-medium">
                        {photo.safety_category?.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-white/80 text-xs">
                        {formatDate(photo.uploaded_at)}
                      </div>
                      {photo.safety_notes && (
                        <div className="text-white/80 text-xs truncate mt-1">
                          {photo.safety_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Work Photos Section */}
          {regularPhotos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Upload className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text">Work Progress Photos</h3>
                <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded text-xs font-medium text-blue-800 dark:text-blue-400">
                  {regularPhotos.length} photos
                </div>
              </div>
              <PhotoGallery photos={regularPhotos} />
            </div>
          )}

          {/* No Photos Message */}
          {photos.length === 0 && (
            <div className="text-center py-8">
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No photos uploaded yet</p>
            </div>
          )}
        </div>

        {/* Safety Start Work Modal */}
        <SafetyStartWorkModal
          isOpen={showSafetyModal}
          onClose={() => setShowSafetyModal(false)}
          requestId={request?.id || 0}
          onStartWork={handleSafetyStartWork}
        />

        {/* Photo Lightbox */}
        {lightboxOpen && (
          <PhotoLightbox
            photos={lightboxPhotos}
            currentIndex={currentPhotoIndex}
            onClose={() => setLightboxOpen(false)}
            onNext={handleNextPhoto}
            onPrevious={handlePreviousPhoto}
          />
        )}
      </div>
    </div>
  );
};
