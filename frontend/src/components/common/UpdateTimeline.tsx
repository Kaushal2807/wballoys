import React from 'react';
import { JobUpdate } from '@/types';
import { formatDateTime } from '@/utils/helpers';

interface UpdateTimelineProps {
  updates: JobUpdate[];
}

export const UpdateTimeline: React.FC<UpdateTimelineProps> = ({ updates }) => {
  if (updates.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-stone-400 py-4">
        No updates yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {updates.map((update, index) => (
        <div key={update.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
            {index < updates.length - 1 && (
              <div className="w-0.5 bg-gray-200 dark:bg-dark-border flex-1 my-1" />
            )}
          </div>
          <div className="pb-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                {update.user?.name || 'System'}
              </span>
              <span className="text-xs text-gray-500 dark:text-stone-400">
                {formatDateTime(update.created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-dark-text-secondary">
              {update.notes}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
