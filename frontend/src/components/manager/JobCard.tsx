import React from 'react';
import { ServiceRequest } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { formatDate } from '@/utils/helpers';

interface ManagerJobCardProps {
  request: ServiceRequest;
  onAssign?: (id: number) => void;
  onView: (id: number) => void;
}

export const ManagerJobCard: React.FC<ManagerJobCardProps> = ({ request, onAssign, onView }) => {
  const isUnassigned = request.status === 'new';

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isUnassigned
        ? 'border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-200 dark:border-dark-border'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-dark-text">
              {request.ticket_number}
            </span>
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
          <p className="text-sm text-gray-700 dark:text-dark-text-secondary mb-2 truncate">
            {request.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-stone-400">
            {request.customer && <span>Customer: {request.customer.name}</span>}
            {request.assignment?.engineer ? (
              <>
                <span>•</span>
                <span>Engineer: {request.assignment.engineer.name}</span>
              </>
            ) : (
              <>
                <span>•</span>
                <span className="text-red-500 font-medium">Unassigned</span>
              </>
            )}
            <span>•</span>
            <span>Created: {formatDate(request.created_at)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isUnassigned && onAssign && (
            <button onClick={() => onAssign(request.id)} className="btn-primary text-sm whitespace-nowrap">
              Assign
            </button>
          )}
          <button onClick={() => onView(request.id)} className="btn-secondary text-sm whitespace-nowrap">
            View
          </button>
        </div>
      </div>
    </div>
  );
};
