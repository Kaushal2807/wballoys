import React from 'react';
import { ServiceRequest } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { formatDate } from '@/utils/helpers';

interface RequestCardProps {
  request: ServiceRequest;
  onViewDetails: (id: number) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onViewDetails }) => {
  return (
    <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-dark-text">
              {request.ticket_number}
            </span>
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
          <p className="text-sm text-gray-700 dark:text-dark-text-secondary mb-1">
            {request.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-stone-400">
            {request.assignment?.engineer && (
              <>
                <span>Engineer: {request.assignment.engineer.name}</span>
                <span>•</span>
              </>
            )}
            {request.asset && (
              <>
                <span>{request.asset.asset_name}</span>
                <span>•</span>
              </>
            )}
            <span>Created: {formatDate(request.created_at)}</span>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(request.id)}
          className="btn-secondary text-sm whitespace-nowrap"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
