import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BackButton } from '@/components/common/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { Asset } from '@/types';
import { Send } from 'lucide-react';

interface CreateRequestFormData {
  asset_id: string;
  description: string;
  urgency: string;
  preferred_date: string;
  preferred_time: string;
}

export const CreateRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateRequestFormData>();

  useEffect(() => {
    requestService.getAssetsByCustomer(user!.id).then(data => {
      setAssets(data);
      setLoadingAssets(false);
    });
  }, [user]);

  const today = new Date().toISOString().split('T')[0];

  const onSubmit = async (data: CreateRequestFormData) => {
    setSubmitting(true);
    try {
      const result = await requestService.createRequest({
        customer_id: user!.id,
        asset_id: parseInt(data.asset_id),
        description: data.description,
        urgency: data.urgency as 'low' | 'medium' | 'high',
        preferred_date: data.preferred_date,
        preferred_time: data.preferred_time,
      });
      toast.success(`Request created! Ticket: ${result.ticket_number}`);
      navigate(`/customer/requests/${result.id}`);
    } catch {
      toast.error('Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAssets) return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to Requests" />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-6">
          Create New Service Request
        </h1>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Asset Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                Select Asset / Equipment
              </label>
              <select
                {...register('asset_id', { required: 'Please select an asset' })}
                className="input-field"
              >
                <option value="">-- Select an asset --</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_name} - {asset.location}
                  </option>
                ))}
              </select>
              {errors.asset_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.asset_id.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                Description
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' }
                })}
                rows={4}
                className="input-field"
                placeholder="Describe the issue in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                Urgency Level
              </label>
              <select
                {...register('urgency', { required: 'Please select urgency level' })}
                className="input-field"
              >
                <option value="">-- Select urgency --</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.urgency && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.urgency.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  min={today}
                  {...register('preferred_date', { required: 'Please select a date' })}
                  className="input-field"
                />
                {errors.preferred_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.preferred_date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  {...register('preferred_time', { required: 'Please select a time' })}
                  className="input-field"
                />
                {errors.preferred_time && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.preferred_time.message}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
