import React from 'react';
import { ServiceRequest } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { formatDate } from '@/utils/helpers';

interface JobCardProps {
  request: ServiceRequest;
  onAccept?: (assignmentId: number) => void;
  onReject?: (assignmentId: number) => void;
  onViewDetails: (id: number) => void;
  onMarkComplete?: (id: number) => void;
  isMyJob?: boolean;
  showMyJobBadge?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  request, onAccept, onReject, onViewDetails, onMarkComplete, isMyJob, showMyJobBadge,
}) => {
  const isPending = request.assignment?.status === 'pending';
  const isInProgress = request.status === 'in_progress';

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isPending && onAccept
        ? 'border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
        : showMyJobBadge && isMyJob
        ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
        : 'border-gray-200 dark:border-dark-border'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-dark-text">
              {request.ticket_number}
            </span>
            <UrgencyBadge urgency={request.urgency} />
            {isPending && onAccept ? (
              <span className="badge bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                PENDING ACCEPTANCE
              </span>
            ) : (
              <StatusBadge status={request.status} />
            )}
            {showMyJobBadge && isMyJob && (
              <span className="badge bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                MY JOB
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-dark-text-secondary mb-2">
            {request.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-stone-400 mb-3">
            {request.customer && <span>Customer: {request.customer.name}</span>}
            {request.asset && (
              <>
                <span>•</span>
                <span>{request.asset.asset_name}</span>
              </>
            )}
            <span>•</span>
            <span>Preferred: {formatDate(request.preferred_date)} at {request.preferred_time}</span>
            {request.assignment?.engineer && (
              <>
                <span>•</span>
                <span>Engineer: {request.assignment.engineer.name}</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {isPending && onAccept && onReject && request.assignment && (
              <>
                <button onClick={() => onAccept(request.assignment!.id)} className="btn-primary text-sm">
                  Accept Job
                </button>
                <button onClick={() => onReject(request.assignment!.id)} className="btn-secondary text-sm">
                  Reject
                </button>
              </>
            )}
            <button onClick={() => onViewDetails(request.id)} className="btn-primary text-sm">
              View Details
            </button>
            {isInProgress && !isPending && onMarkComplete && (
              <button onClick={() => onMarkComplete(request.id)} className="btn-secondary text-sm">
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
