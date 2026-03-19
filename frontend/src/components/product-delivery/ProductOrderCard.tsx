import React, { useState } from 'react';
import { ProductOrder, ProductDeliveryStatus } from '@/types';
import { getProductDeliveryStatusColor, getProductDeliveryStatusLabel, formatDate } from '@/utils/helpers';
import { Package, MapPin, Calendar, Eye, EyeOff, Hash, Box, User, FileText, Clock, Mail } from 'lucide-react';

interface ProductOrderCardProps {
  order: ProductOrder;
  onUpdateStatus: (orderId: number, newStatus: ProductDeliveryStatus) => void;
}

export const ProductOrderCard: React.FC<ProductOrderCardProps> = ({ order, onUpdateStatus }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getNextStatus = (current: ProductDeliveryStatus): ProductDeliveryStatus | null => {
    const pipeline: ProductDeliveryStatus[] = ['pending', 'dispatched', 'in_transit', 'delivered'];
    const currentIndex = pipeline.indexOf(current);
    if (currentIndex < pipeline.length - 1) {
      return pipeline[currentIndex + 1];
    }
    return null;
  };

  const nextStatus = getNextStatus(order.delivery_status);

  const nextStatusLabels: Record<ProductDeliveryStatus, string> = {
    pending: '',
    dispatched: 'Mark Dispatched',
    in_transit: 'Mark In Transit',
    delivered: 'Mark Delivered',
  };

  // Delivery progress steps
  const STEPS: { status: ProductDeliveryStatus; label: string }[] = [
    { status: 'pending', label: 'Pending' },
    { status: 'dispatched', label: 'Dispatched' },
    { status: 'in_transit', label: 'In Transit' },
    { status: 'delivered', label: 'Delivered' },
  ];
  const currentStepIndex = STEPS.findIndex(s => s.status === order.delivery_status);

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      {/* Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-dark-text">
              {order.order_number}
            </span>
            <span className={`badge ${getProductDeliveryStatusColor(order.delivery_status)}`}>
              {getProductDeliveryStatusLabel(order.delivery_status)}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-text mb-1">
            {order.product_name} ({order.model}) — Qty: {order.quantity}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {order.customer_name}
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Expected: {formatDate(order.expected_delivery_date)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary text-sm whitespace-nowrap flex items-center gap-1"
          >
            {showDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
          {nextStatus && (
            <button
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              className="btn-primary text-sm whitespace-nowrap"
            >
              {nextStatusLabels[nextStatus]}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details Panel */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
          {/* Delivery Progress Bar */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-stone-400 uppercase tracking-wider mb-3">
              Delivery Progress
            </h4>
            <div className="flex items-center gap-0">
              {STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <React.Fragment key={step.status}>
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-card border-gray-300 dark:border-stone-600 text-gray-400 dark:text-stone-500'
                      } ${isCurrent ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
                        {index + 1}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium text-center w-16 ${
                        isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400 dark:text-stone-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-5 ${
                        index < currentStepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-stone-700'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Box className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Product</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{order.product_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Hash className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Model</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{order.model}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Quantity</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{order.quantity}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Customer</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Customer Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:col-span-2">
              <Hash className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-stone-400">Tracking ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text font-mono">
                    {order.tracking_id}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(order.tracking_id)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-stone-500 mt-1">
                  Customers use this ID to track their delivery
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Delivery Address</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{order.delivery_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Order Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{formatDate(order.order_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Expected Delivery</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{formatDate(order.expected_delivery_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{formatDate(order.created_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{formatDate(order.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-4 flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-stone-400">Notes</p>
                <p className="text-sm text-gray-700 dark:text-dark-text-secondary mt-0.5">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
