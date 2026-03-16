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
import { requestService } from '@/services/requestService';
import { ServiceRequest, JobUpdate, JobPhoto, DeliveryUpdate, DeliveryStatus } from '@/types';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { MapPin, Calendar, Clock, User, XCircle, Truck, Package, Check } from 'lucide-react';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [updates, setUpdates] = useState<JobUpdate[]>([]);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [deliveryUpdates, setDeliveryUpdates] = useState<DeliveryUpdate[]>([]);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCloseJob = async () => {
    if (!request) return;
    setClosing(true);
    try {
      await requestService.closeRequest(request.id);
      toast.success('Job closed successfully!');
      loadData();
    } catch {
      toast.error('Failed to close job');
    } finally {
      setClosing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <LoadingSpinner />
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-500">Request not found.</p>
      </div>
    </div>
  );

  const DELIVERY_STEPS: { status: DeliveryStatus; label: string }[] = [
    { status: 'pending', label: 'Pending' },
    { status: 'dispatched', label: 'Dispatched' },
    { status: 'in_transit', label: 'In Transit' },
    { status: 'delivered', label: 'Delivered' },
  ];

  const currentDeliveryStatus = request.delivery_status || 'pending';
  const currentDeliveryIndex = DELIVERY_STEPS.findIndex(s => s.status === currentDeliveryStatus);

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to My Requests" />

        {/* Header */}
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
            {request.status === 'completed' && (
              <button
                onClick={handleCloseJob}
                disabled={closing}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {closing ? 'Closing...' : 'Close Job'}
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Asset</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                  {request.asset?.asset_name || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-stone-400">
                  {request.asset?.location}
                </p>
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

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Description</h3>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-bg p-3 rounded-lg">
              {request.description}
            </p>
          </div>
        </div>

        {/* Delivery Status Section (Read-Only) */}
        {(request.status === 'in_progress' || request.status === 'completed') && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Delivery Status</h2>
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

            {currentDeliveryStatus === 'delivered' && (
              <div className="border-t border-gray-100 dark:border-dark-border pt-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Delivery completed</span>
                </div>
              </div>
            )}

            {/* Delivery History */}
            {deliveryUpdates.length > 0 && (
              <div className="border-t border-gray-100 dark:border-dark-border pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-3">Delivery History</h3>
                <div className="space-y-2">
                  {deliveryUpdates.map(du => (
                    <div key={du.id} className="flex items-start gap-3 text-sm">
                      <div className={`badge text-xs ${
                        du.status === 'delivered' ? 'delivery-delivered'
                        : du.status === 'in_transit' ? 'delivery-in-transit'
                        : du.status === 'dispatched' ? 'delivery-dispatched'
                        : 'delivery-pending'
                      }`}>
                        {du.status === 'in_transit' ? 'IN TRANSIT' : du.status.toUpperCase()}
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
            Updates
          </h2>
          <UpdateTimeline updates={updates} />
        </div>

        {/* Photos */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
            Photos
          </h2>
          <PhotoGallery photos={photos} />
        </div>
      </div>
    </div>
  );
};
