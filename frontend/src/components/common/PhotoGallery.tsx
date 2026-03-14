import React from 'react';
import { JobPhoto } from '@/types';
import { formatDateTime } from '@/utils/helpers';

interface PhotoGalleryProps {
  photos: JobPhoto[];
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-stone-400 py-4">
        No photos uploaded yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border">
          <img
            src={photo.photo_url}
            alt={`Photo ${photo.id}`}
            className="w-full h-48 object-cover"
          />
          <div className="p-2 bg-white dark:bg-dark-surface">
            <p className="text-xs text-gray-500 dark:text-stone-400">
              {photo.uploader?.name || 'Unknown'} &middot; {formatDateTime(photo.uploaded_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
