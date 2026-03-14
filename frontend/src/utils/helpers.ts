import { RequestStatus, UrgencyLevel } from '../types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const getStatusColor = (status: RequestStatus): string => {
  const map: Record<RequestStatus, string> = {
    new: 'status-new',
    assigned: 'status-assigned',
    in_progress: 'status-in-progress',
    completed: 'status-completed',
    closed: 'status-closed',
  };
  return map[status] || 'status-new';
};

export const getUrgencyColor = (urgency: UrgencyLevel): string => {
  const map: Record<UrgencyLevel, string> = {
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };
  return map[urgency] || 'badge-low';
};

export const getStatusLabel = (status: RequestStatus): string => {
  const map: Record<RequestStatus, string> = {
    new: 'NEW',
    assigned: 'ASSIGNED',
    in_progress: 'IN PROGRESS',
    completed: 'COMPLETED',
    closed: 'CLOSED',
  };
  return map[status] || status.toUpperCase();
};
