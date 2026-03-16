import React from 'react';
import { ServiceRequest } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { formatDate } from '@/utils/helpers';

interface JobCardProps {
  request: ServiceRequest;
  // Manager-assigned pending job actions (My Jobs tab)
  onAccept?: (assignmentId: number) => void;
  onReject?: (assignmentId: number) => void;
  // Self-claim actions for new unassigned requests (All Requests tab)
  onSelfAccept?: (requestId: number) => void;
  onRejectNew?: (requestId: number) => void;
  rejectedByMe?: boolean;
  onViewDetails: (id: number) => void;
  onMarkComplete?: (id: number) => void;
  isMyJob?: boolean;
  showMyJobBadge?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  request, onAccept, onReject, onSelfAccept, onRejectNew, rejectedByMe,
  onViewDetails, onMarkComplete, isMyJob, showMyJobBadge,
}) => {
  const isPending = request.assignment?.status === 'pending';
  const isInProgress = request.status === 'in_progress';
  const isNewUnassigned = request.status === 'new' && !request.assignment;

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isPending && onAccept
        ? 'border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
        : isNewUnassigned && onSelfAccept && !rejectedByMe
        ? 'border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
        : isNewUnassigned && rejectedByMe
        ? 'border border-gray-200 dark:border-dark-border opacity-50'
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
            ) : isNewUnassigned && onSelfAccept && !rejectedByMe ? (
              <span className="badge bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                AVAILABLE
              </span>
            ) : isNewUnassigned && rejectedByMe ? (
              <span className="badge bg-gray-200 text-gray-600 dark:bg-stone-700 dark:text-stone-400">
                REJECTED BY YOU
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
          <div className="flex gap-2 flex-wrap">
            {/* Manager-assigned pending job: Accept / Reject */}
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
            {/* New unassigned request: self-claim Accept / Reject */}
            {isNewUnassigned && onSelfAccept && onRejectNew && !rejectedByMe && (
              <>
                <button
                  onClick={() => onSelfAccept(request.id)}
                  className="text-sm font-medium py-2 px-4 rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Accept Request
                </button>
                <button onClick={() => onRejectNew(request.id)} className="btn-secondary text-sm">
                  Reject
                </button>
              </>
            )}
            {isNewUnassigned && rejectedByMe && (
              <span className="text-xs text-gray-400 dark:text-stone-500 italic py-1">
                You have rejected this request
              </span>
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
