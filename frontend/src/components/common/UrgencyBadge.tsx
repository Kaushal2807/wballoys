import React from 'react';
import { UrgencyLevel } from '@/types';
import { getUrgencyColor } from '@/utils/helpers';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
  return (
    <span className={`badge ${getUrgencyColor(urgency)}`}>
      {urgency.toUpperCase()}
    </span>
  );
};
