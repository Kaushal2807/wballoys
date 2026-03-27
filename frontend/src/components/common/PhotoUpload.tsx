import React, { useState, useRef } from 'react';
import { Upload, X, Image, Shield } from 'lucide-react';
import { SafetyPhotoCategory } from '@/types';

interface PhotoUploadProps {
  existingPhotoCount: number;
  onUpload: (file: File, safetyData?: { category: SafetyPhotoCategory; notes?: string }) => Promise<void>;
  // Safety mode props
  safetyMode?: boolean;
  requiredSafetyCategory?: SafetyPhotoCategory;
  maxPhotos?: number;
}

const SAFETY_CATEGORY_LABELS = {
  site_conditions: 'Site Conditions',
  safety_equipment: 'Safety Equipment',
  hazard_identification: 'Hazard Identification',
  workspace_preparation: 'Workspace Preparation',
};

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  existingPhotoCount,
  onUpload,
  safetyMode = false,
  requiredSafetyCategory,
  maxPhotos,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [safetyCategory, setSafetyCategory] = useState<SafetyPhotoCategory>(
    requiredSafetyCategory || 'site_conditions'
  );
  const [safetyNotes, setSafetyNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoLimit = maxPhotos || (safetyMode ? 5 : 3);
  const canUpload = existingPhotoCount < photoLimit;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPG and PNG files are allowed');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      if (safetyMode) {
        await onUpload(selectedFile, {
          category: safetyCategory,
          notes: safetyNotes || undefined,
        });
      } else {
        await onUpload(selectedFile);
      }
      setSelectedFile(null);
      setPreview(null);
      setSafetyNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setSafetyNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!canUpload) {
    return (
      <p className="text-sm text-gray-500 dark:text-stone-400 py-2">
        Maximum {photoLimit} photos reached.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Safety Category Selection */}
      {safetyMode && !requiredSafetyCategory && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-dark-text">
            Safety Photo Category
          </label>
          <select
            value={safetyCategory}
            onChange={(e) => setSafetyCategory(e.target.value as SafetyPhotoCategory)}
            className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text focus:ring-primary focus:border-primary"
          >
            {Object.entries(SAFETY_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Required Category Display */}
      {safetyMode && requiredSafetyCategory && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-400">
              Required: {SAFETY_CATEGORY_LABELS[requiredSafetyCategory]}
            </span>
          </div>
        </div>
      )}

      {!preview ? (
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-white dark:bg-dark-surface
          ${safetyMode
            ? 'border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600'
            : 'border-gray-300 dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-500'
          }`}>
          <div className="flex flex-col items-center">
            {safetyMode ? (
              <Shield className="w-8 h-8 text-orange-500 mb-2" />
            ) : (
              <Image className="w-8 h-8 text-gray-400 mb-2" />
            )}
            <p className="text-sm text-gray-500 dark:text-stone-400">
              Click to select a {safetyMode ? 'safety ' : ''}photo
            </p>
            <p className="text-xs text-gray-400 dark:text-stone-500 mt-1">
              JPG or PNG, max 5MB ({photoLimit - existingPhotoCount} remaining)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <button
            onClick={clearSelection}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Safety Notes Input */}
          {safetyMode && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-1">
                Safety Notes (Optional)
              </label>
              <textarea
                value={safetyNotes}
                onChange={(e) => setSafetyNotes(e.target.value)}
                placeholder="Add notes about this safety photo..."
                className="w-full border border-gray-300 dark:border-dark-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text resize-none"
                rows={2}
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`mt-2 w-full flex items-center justify-center gap-2 disabled:opacity-50 ${
              safetyMode ? 'btn-warning' : 'btn-primary'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                {safetyMode ? <Shield className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                <span>Upload {safetyMode ? 'Safety ' : ''}Photo</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};