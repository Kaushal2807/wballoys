import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BackButton } from '@/components/common/BackButton';
import { ProductOrderCard } from '@/components/product-delivery/ProductOrderCard';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { ProductOrder, ProductDeliveryStatus } from '@/types';
import { Search, Plus, X, Truck, Package, Send, Clock } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

export const ProductDeliveriesPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProductDeliveryStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [productName, setProductName] = useState('');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [trackingPassword, setTrackingPassword] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await requestService.getAllProductOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.delivery_status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(q) ||
        order.product_name.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !model.trim() || !quantity || !customerName.trim() ||
        !customerEmail.trim() || !trackingPassword.trim() ||
        !deliveryAddress.trim() || !orderDate || !expectedDeliveryDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await requestService.createProductOrder({
        product_name: productName.trim(),
        model: model.trim(),
        quantity: parseInt(quantity),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        tracking_password: trackingPassword.trim(),
        delivery_address: deliveryAddress.trim(),
        order_date: orderDate,
        expected_delivery_date: expectedDeliveryDate,
        notes: notes.trim() || undefined,
      }, user!.id);
      toast.success('Product order created successfully!');
      setProductName(''); setModel(''); setQuantity('');
      setCustomerName(''); setCustomerEmail(''); setTrackingPassword('');
      setDeliveryAddress('');
      setOrderDate(''); setExpectedDeliveryDate(''); setNotes('');
      setShowCreateForm(false);
      loadOrders();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: ProductDeliveryStatus) => {
    try {
      await requestService.updateProductDeliveryStatus(orderId, newStatus);
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
      loadOrders();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.delivery_status === 'pending').length,
    dispatched: orders.filter(o => o.delivery_status === 'dispatched').length,
    in_transit: orders.filter(o => o.delivery_status === 'in_transit').length,
    delivered: orders.filter(o => o.delivery_status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Back to Dashboard" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text flex items-center gap-2">
              <Truck className="w-7 h-7" />
              Product Deliveries
            </h1>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
              Track and manage product delivery orders
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center gap-2"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Cancel' : 'New Order'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-dark-text">{stats.pending}</span>
            </div>
            <h3 className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary">Pending</h3>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-dark-text">{stats.dispatched}</span>
            </div>
            <h3 className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary">Dispatched</h3>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-dark-text">{stats.in_transit}</span>
            </div>
            <h3 className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary">In Transit</h3>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-dark-text">{stats.delivered}</span>
            </div>
            <h3 className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary">Delivered</h3>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
              Create New Product Order
            </h2>
            <form onSubmit={handleCreateOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Industrial Welding Rod"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="input-field"
                  placeholder="e.g. WB-7018"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 100"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Tata Steel Ltd"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Customer Email *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="input-field"
                  placeholder="e.g. orders@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Tracking Password *
                </label>
                <input
                  type="text"
                  value={trackingPassword}
                  onChange={e => setTrackingPassword(e.target.value)}
                  className="input-field"
                  placeholder="e.g. company@1234"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="input-field"
                  placeholder="Full delivery address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Order Date *
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={e => setOrderDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={e => setExpectedDeliveryDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full sm:w-auto disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProductDeliveryStatus | 'all')}
            className="input-field w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search order, product, or customer..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <div className="card p-8 text-center">
            <Truck className="w-12 h-12 text-gray-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-stone-400">No product orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <ProductOrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
