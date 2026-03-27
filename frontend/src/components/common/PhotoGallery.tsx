import React, { useState } from 'react';
import { JobPhoto } from '@/types';
import { formatDateTime } from '@/utils/helpers';
import { PhotoLightbox } from './PhotoLightbox';
import { ZoomIn } from 'lucide-react';

interface PhotoGalleryProps {
  photos: JobPhoto[];
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-stone-400 py-4">
        No photos uploaded yet.
      </p>
    );
  }

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border cursor-pointer group relative"
            onClick={() => openLightbox(index)}
          >
            <div className="relative">
              <img
                src={photo.photo_url}
                alt={`Photo ${photo.id}`}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="p-2 bg-white dark:bg-dark-surface">
              <p className="text-xs text-gray-500 dark:text-stone-400">
                {photo.uploader?.name || 'Unknown'} &middot; {formatDateTime(photo.uploaded_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <PhotoLightbox
          photos={photos}
          currentIndex={currentPhotoIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </>
  );
};
