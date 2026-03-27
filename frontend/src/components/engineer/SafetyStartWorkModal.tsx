import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { SafetyParameter, SafetyWorkStartData, SafetyChecklistItemCreate, SafetyPhotoUpload } from '@/types';
import { X, Shield, CheckCircle, AlertTriangle, Upload } from 'lucide-react';
import { requestService } from '@/services/requestService';

interface SafetyStartWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number;
  onStartWork: (safetyData: SafetyWorkStartData) => Promise<void>;
}

export const SafetyStartWorkModal: React.FC<SafetyStartWorkModalProps> = ({
  isOpen,
  onClose,
  onStartWork,
}) => {
  const [safetyParameters, setSafetyParameters] = useState<SafetyParameter[]>([]);
  const [checkedParameters, setCheckedParameters] = useState<Set<number>>(new Set());
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ file: File; preview: string }>>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingParameters, setLoadingParameters] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadSafetyParameters();
    }
  }, [isOpen]);

  const resetForm = () => {
    setCheckedParameters(new Set());
    setUploadedPhotos([]);
    setGeneralNotes('');
    setLoadingParameters(true);
    // Clean up preview URLs
    uploadedPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
  };

  const loadSafetyParameters = async () => {
    try {
      const parameters = await requestService.getSafetyParameters();
      setSafetyParameters(parameters);
    } catch (error) {
      toast.error('Failed to load safety parameters');
      console.error('Error loading safety parameters:', error);
    } finally {
      setLoadingParameters(false);
    }
  };

  const handleParameterToggle = (parameterId: number) => {
    const newChecked = new Set(checkedParameters);
    if (newChecked.has(parameterId)) {
      newChecked.delete(parameterId);
    } else {
      newChecked.add(parameterId);
    }
    setCheckedParameters(newChecked);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG and PNG files are allowed');
      return;
    }

    // Check photo limit
    if (uploadedPhotos.length >= 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setUploadedPhotos(prev => [...prev, { file, preview }]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(uploadedPhotos[index].preview);
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const isFormValid = (): boolean => {
    // Check required parameters
    const requiredParams = safetyParameters.filter(p => p.is_required);
    const allRequiredChecked = requiredParams.every(p => checkedParameters.has(p.id));

    // Check at least 1 photo is uploaded
    const hasMinimumPhotos = uploadedPhotos.length >= 1;

    return allRequiredChecked && hasMinimumPhotos;
  };

  const getUncheckedRequiredParams = (): SafetyParameter[] => {
    return safetyParameters.filter(p => p.is_required && !checkedParameters.has(p.id));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      if (uploadedPhotos.length === 0) {
        toast.error('Please upload at least 1 safety photo');
      } else {
        toast.error('Please complete all required safety checks');
      }
      return;
    }

    setLoading(true);
    try {
      // Prepare checklist items without individual notes
      const checklist_items: SafetyChecklistItemCreate[] = Array.from(checkedParameters).map(parameterId => ({
        safety_parameter_id: parameterId,
        notes: null,
      }));

      // Convert photos to base64 and prepare upload data
      const photos: SafetyPhotoUpload[] = await Promise.all(
        uploadedPhotos.map(async (photo) => ({
          photo_url: await fileToBase64(photo.file),
          safety_category: 'workspace_preparation',
          safety_notes: null,
        }))
      );

      const safetyData: SafetyWorkStartData = {
        checklist_items,
        photos,
        notes: generalNotes || undefined,
      };

      await onStartWork(safetyData);
      toast.success('Work started with safety checks completed!');
      onClose();
    } catch (error) {
      toast.error('Failed to start work with safety checks');
      console.error('Error starting work with safety checks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const requiredParams = safetyParameters.filter(p => p.is_required);
  const optionalParams = safetyParameters.filter(p => !p.is_required);
  const uncheckedRequired = getUncheckedRequiredParams();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              Safety Check Required
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingParameters ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Safety Parameters Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-dark-text flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Safety Parameter Checklist
                </h3>

                {/* Required Parameters */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                    Required Safety Checks
                  </h4>
                  {requiredParams.map((parameter) => (
                    <div key={parameter.id}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedParameters.has(parameter.id)}
                          onChange={() => handleParameterToggle(parameter.id)}
                          className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                            {parameter.name}
                          </span>
                          {parameter.description && (
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                              {parameter.description}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Optional Parameters */}
                {optionalParams.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Optional Safety Checks
                    </h4>
                    {optionalParams.map((parameter) => (
                      <div key={parameter.id}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checkedParameters.has(parameter.id)}
                            onChange={() => handleParameterToggle(parameter.id)}
                            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900 dark:text-dark-text">
                            {parameter.name}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Safety Photos Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-dark-text flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-500" />
                  Safety Photos (1-3 required)
                </h3>

                <div className="space-y-3">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  {/* Add Photo Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadedPhotos.length >= 3}
                    className={`w-full border-2 border-dashed rounded-lg p-6 transition-colors ${
                      uploadedPhotos.length >= 3
                        ? 'border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface/50 cursor-not-allowed'
                        : 'border-gray-300 dark:border-dark-border hover:border-primary hover:bg-primary/5 cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className={`h-8 w-8 ${uploadedPhotos.length >= 3 ? 'text-gray-300' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${uploadedPhotos.length >= 3 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {uploadedPhotos.length >= 3 ? 'Maximum photos uploaded' : 'Click to upload photo'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadedPhotos.length}/3 photos • Required: 1-3 • JPG or PNG • Max 5MB
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Photo Thumbnails Grid */}
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border">
                            <img
                              src={photo.preview}
                              alt={`Safety photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* General Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Any additional safety observations or notes..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text resize-none"
              rows={3}
            />
          </div>

          {/* Validation Messages */}
          {(!isFormValid() && !loadingParameters) && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                    Complete Required Safety Checks
                  </h4>
                  {uncheckedRequired.length > 0 && (
                    <div className="mt-1">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Missing required parameters:
                      </p>
                      <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 ml-2">
                        {uncheckedRequired.map(param => (
                          <li key={param.id}>{param.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {uploadedPhotos.length === 0 && (
                    <div className="mt-1">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        At least 1 safety photo is required
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={!isFormValid() || loading || loadingParameters}
          >
            {loading ? 'Starting Work...' : 'Start Work with Safety Check'}
          </button>
        </div>
      </div>
    </div>
  );
};