import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { JobPhoto } from '@/types';
import { formatDateTime } from '@/utils/helpers';

interface PhotoLightboxProps {
  photos: JobPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}) => {
  const currentPhoto = photos[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onPrevious();
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length, onClose, onNext, onPrevious]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        title="Close (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous Button */}
      {currentIndex > 0 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          title="Previous (←)"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next Button */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          title="Next (→)"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Photo Counter */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Main Image */}
      <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        <img
          src={currentPhoto.photo_url}
          alt={`Photo ${currentPhoto.id}`}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Photo Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">
                Uploaded by {currentPhoto.uploader?.name || 'Unknown'}
              </p>
              <p className="text-xs text-white/70">
                {formatDateTime(currentPhoto.uploaded_at)}
              </p>
            </div>
            {currentPhoto.safety_category && (
              <div className="px-3 py-1 bg-orange-500 rounded-full text-xs font-medium">
                {currentPhoto.safety_category.replace('_', ' ').toUpperCase()}
              </div>
            )}
          </div>
          {currentPhoto.safety_notes && (
            <p className="text-sm text-white/90 mt-2">{currentPhoto.safety_notes}</p>
          )}
        </div>
      </div>

      {/* Click backdrop to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};
