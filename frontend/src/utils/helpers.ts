import { RequestStatus, UrgencyLevel, DeliveryStatus, ProductDeliveryStatus } from '../types';

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

export const getDeliveryStatusLabel = (status: DeliveryStatus): string => {
  const map: Record<DeliveryStatus, string> = {
    site_visited: 'SITE VISITED',
    photos_taken: 'PHOTOS TAKEN',
    next_date_given: 'NEXT DATE GIVEN',
    service_solved: 'SERVICE SOLVED',
  };
  return map[status] || status.toUpperCase();
};

export const getDeliveryStatusColor = (status: DeliveryStatus): string => {
  const map: Record<DeliveryStatus, string> = {
    site_visited: 'delivery-site-visited',
    photos_taken: 'delivery-photos-taken',
    next_date_given: 'delivery-next-date-given',
    service_solved: 'delivery-service-solved',
  };
  return map[status] || 'delivery-site-visited';
};

export const getProductDeliveryStatusLabel = (status: ProductDeliveryStatus): string => {
  const map: Record<ProductDeliveryStatus, string> = {
    pending: 'PENDING',
    dispatched: 'DISPATCHED',
    in_transit: 'IN TRANSIT',
    delivered: 'DELIVERED',
  };
  return map[status] || status.toUpperCase();
};

export const getProductDeliveryStatusColor = (status: ProductDeliveryStatus): string => {
  const map: Record<ProductDeliveryStatus, string> = {
    pending: 'product-delivery-pending',
    dispatched: 'product-delivery-dispatched',
    in_transit: 'product-delivery-in-transit',
    delivered: 'product-delivery-delivered',
  };
  return map[status] || 'product-delivery-pending';
};
