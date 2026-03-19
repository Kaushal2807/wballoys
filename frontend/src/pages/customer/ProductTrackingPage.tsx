import React, { useState } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { BackButton } from '@/components/common/BackButton';
import { requestService } from '@/services/requestService';
import { ProductOrder } from '@/types';
import { getProductDeliveryStatusColor, getProductDeliveryStatusLabel, formatDate } from '@/utils/helpers';
import { Truck, Search, MapPin, Calendar, Package, Box, Hash, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

const STEPS: { status: 'pending' | 'dispatched' | 'in_transit' | 'delivered'; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'dispatched', label: 'Dispatched' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'delivered', label: 'Delivered' },
];

export const ProductTrackingPage: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<ProductOrder[] | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error('Please enter your tracking ID');
      return;
    }
    setLoading(true);
    try {
      const result = await requestService.getProductOrderByTrackingId(trackingId.trim());
      setOrders([result]); // Single order response
    } catch (err: any) {
      toast.error(err?.message || 'Tracking ID not found');
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to Dashboard" />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
              Track My Order
            </h1>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-0.5">
              Enter your tracking ID to view delivery status
            </p>
          </div>
        </div>

        {/* Lookup Form */}
        <div className="card p-6 mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Tracking ID *
              </label>
              <input
                type="text"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value.toUpperCase())}
                className="input-field"
                placeholder="e.g. TRK-A1B2C3"
                required
              />
              <p className="text-xs text-gray-500 dark:text-stone-400 mt-1">
                Your unique tracking ID provided when the order was created
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Results */}
        {orders !== null && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </h2>
            {orders.map(order => {
              const currentStepIndex = STEPS.findIndex(s => s.status === order.delivery_status);
              return (
                <div key={order.id} className="card p-5">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-bold text-gray-900 dark:text-dark-text text-base">
                      {order.order_number}
                    </span>
                    <span className={`badge ${getProductDeliveryStatusColor(order.delivery_status)}`}>
                      {getProductDeliveryStatusLabel(order.delivery_status)}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-800 dark:text-dark-text mb-4">
                    {order.product_name} ({order.model}) — Qty: {order.quantity}
                  </p>

                  {/* Delivery Progress */}
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
                                index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-stone-700'
                              }`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-gray-100 dark:border-dark-border pt-4">
                    <div className="flex items-start gap-2">
                      <Box className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-stone-400">Product</p>
                        <p className="font-medium text-gray-900 dark:text-dark-text">{order.product_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Hash className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-stone-400">Model</p>
                        <p className="font-medium text-gray-900 dark:text-dark-text">{order.model}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-stone-400">Quantity</p>
                        <p className="font-medium text-gray-900 dark:text-dark-text">{order.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-stone-400">Expected Delivery</p>
                        <p className="font-medium text-gray-900 dark:text-dark-text">{formatDate(order.expected_delivery_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-stone-400">Delivery Address</p>
                        <p className="font-medium text-gray-900 dark:text-dark-text">{order.delivery_address}</p>
                      </div>
                    </div>
                    {order.notes && (
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-stone-400">Notes</p>
                          <p className="text-gray-700 dark:text-dark-text-secondary">{order.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
