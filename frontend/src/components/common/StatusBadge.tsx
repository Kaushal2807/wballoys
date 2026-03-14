import React from 'react';
import { RequestStatus } from '@/types';
import { getStatusColor, getStatusLabel } from '@/utils/helpers';

interface StatusBadgeProps {
  status: RequestStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`badge ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};
