import React, { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';

interface PhotoUploadProps {
  existingPhotoCount: number;
  onUpload: (file: File) => Promise<void>;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ existingPhotoCount, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxPhotos = 3;
  const canUpload = existingPhotoCount < maxPhotos;

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
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreview(null);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!canUpload) {
    return (
      <p className="text-sm text-gray-500 dark:text-stone-400 py-2">
        Maximum {maxPhotos} photos reached.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-white dark:bg-dark-surface">
          <div className="flex flex-col items-center">
            <Image className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-stone-400">
              Click to select a photo
            </p>
            <p className="text-xs text-gray-400 dark:text-stone-500 mt-1">
              JPG or PNG, max 5MB ({maxPhotos - existingPhotoCount} remaining)
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
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-2 w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
