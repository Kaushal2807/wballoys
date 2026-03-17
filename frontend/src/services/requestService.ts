import {
  ServiceRequest, JobAssignment, JobUpdate, JobPhoto, DeliveryUpdate, DeliveryStatus,
  Asset, User, DashboardStats, CreateRequestPayload,
  RequestFilters,
  ProductOrder, ProductDeliveryStatus, CreateProductOrderPayload,
} from '../types';
import apiClient from './api';

export const requestService = {
  // ─── Customer Operations ─────────────────────────────

  getMyRequests: async (_customerId: number): Promise<ServiceRequest[]> => {
    const response = await apiClient.get('/requests/');
    return response.data;
  },

  getRequestById: async (requestId: number): Promise<ServiceRequest> => {
    const response = await apiClient.get(`/requests/${requestId}`);
    return response.data;
  },

  createRequest: async (data: CreateRequestPayload): Promise<ServiceRequest> => {
    const response = await apiClient.post('/requests/', {
      asset_id: data.asset_id,
      description: data.description,
      urgency: data.urgency,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
    });
    return response.data;
  },

  closeRequest: async (requestId: number): Promise<ServiceRequest> => {
    const response = await apiClient.patch(`/requests/${requestId}/close`);
    return response.data;
  },

  getAssetsByCustomer: async (_customerId: number): Promise<Asset[]> => {
    const response = await apiClient.get('/assets/');
    return response.data;
  },

  // ─── Engineer Operations ─────────────────────────────

  getAllRequestsForEngineer: async (_engineerId: number): Promise<ServiceRequest[]> => {
    const response = await apiClient.get('/requests/all');
    return response.data;
  },

  getMyJobs: async (_engineerId: number): Promise<ServiceRequest[]> => {
    const response = await apiClient.get('/requests/');
    return response.data;
  },

  acceptJob: async (assignmentId: number): Promise<JobAssignment> => {
    const response = await apiClient.patch(`/assignments/${assignmentId}/accept`);
    return response.data;
  },

  rejectJob: async (assignmentId: number): Promise<JobAssignment> => {
    const response = await apiClient.patch(`/assignments/${assignmentId}/reject`);
    return response.data;
  },

  engineerSelfAccept: async (requestId: number, _engineerId: number): Promise<ServiceRequest> => {
    const response = await apiClient.post(`/requests/${requestId}/self-accept`);
    return response.data;
  },

  engineerRejectNew: async (requestId: number, _engineerId: number): Promise<ServiceRequest> => {
    const response = await apiClient.post(`/requests/${requestId}/reject-new`);
    return response.data;
  },

  startWork: async (requestId: number): Promise<ServiceRequest> => {
    const response = await apiClient.patch(`/requests/${requestId}/start`);
    return response.data;
  },

  markComplete: async (requestId: number): Promise<ServiceRequest> => {
    const response = await apiClient.patch(`/requests/${requestId}/complete`);
    return response.data;
  },

  addJobUpdate: async (requestId: number, notes: string, _userId: number): Promise<JobUpdate> => {
    const response = await apiClient.post(`/requests/${requestId}/updates`, { notes });
    return response.data;
  },

  uploadPhoto: async (requestId: number, file: File, _userId: number): Promise<JobPhoto> => {
    // For now, use a data URL approach since we don't have Cloudinary set up
    // Convert file to base64 data URL for storage
    const toBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

    const photoUrl = await toBase64(file);
    const response = await apiClient.post(`/requests/${requestId}/photos`, {
      photo_url: photoUrl,
    });
    return response.data;
  },

  // ─── Manager Operations ──────────────────────────────

  getAllRequests: async (filters?: RequestFilters): Promise<ServiceRequest[]> => {
    const params: Record<string, string> = {};
    if (filters?.status && filters.status !== 'all') params.status = filters.status;
    if (filters?.urgency && filters.urgency !== 'all') params.urgency = filters.urgency;
    if (filters?.search) params.search = filters.search;
    const response = await apiClient.get('/requests/', { params });
    return response.data;
  },

  assignEngineer: async (
    requestId: number, engineerId: number, note: string, _assignedBy: number
  ): Promise<JobAssignment> => {
    const response = await apiClient.post('/assignments/', {
      request_id: requestId,
      engineer_id: engineerId,
      note,
    });
    return response.data;
  },

  getEngineers: async (): Promise<User[]> => {
    const response = await apiClient.get('/assignments/engineers');
    return response.data;
  },

  // ─── Delivery Operations ────────────────────────────────

  getDeliveryUpdates: async (requestId: number): Promise<DeliveryUpdate[]> => {
    const response = await apiClient.get(`/requests/${requestId}/delivery`);
    return response.data;
  },

  updateDeliveryStatus: async (
    requestId: number, status: DeliveryStatus, _userId: number, notes?: string
  ): Promise<DeliveryUpdate> => {
    const response = await apiClient.patch(`/requests/${requestId}/delivery`, {
      status,
      notes: notes || null,
    });
    return response.data;
  },

  // ─── Shared Operations ───────────────────────────────

  getRequestUpdates: async (requestId: number): Promise<JobUpdate[]> => {
    const response = await apiClient.get(`/requests/${requestId}/updates`);
    return response.data;
  },

  getRequestPhotos: async (requestId: number): Promise<JobPhoto[]> => {
    const response = await apiClient.get(`/requests/${requestId}/photos`);
    return response.data;
  },

  getDashboardStats: async (_userId: number, _role: string): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  // ─── Admin Operations ─────────────────────────────────

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users/');
    return response.data;
  },

  createUser: async (name: string, email: string, password: string, role: string): Promise<User> => {
    const response = await apiClient.post('/users/', { name, email, password, role });
    return response.data;
  },

  getAllAssets: async (): Promise<Asset[]> => {
    const response = await apiClient.get('/assets/');
    return response.data;
  },

  createAsset: async (
    asset_name: string, model: string,
    serial_number: string, location: string
  ): Promise<Asset> => {
    const response = await apiClient.post('/assets/', {
      asset_name, model, serial_number, location,
    });
    return response.data;
  },

  getCustomers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users/', { params: { role: 'customer' } });
    return response.data;
  },

  // ─── Product Delivery Operations ───────────────────────

  getAllProductOrders: async (): Promise<ProductOrder[]> => {
    const response = await apiClient.get('/product-orders/');
    return response.data;
  },

  getProductOrderById: async (orderId: number): Promise<ProductOrder> => {
    const response = await apiClient.get(`/product-orders/${orderId}`);
    return response.data;
  },

  createProductOrder: async (data: CreateProductOrderPayload, _createdBy: number): Promise<ProductOrder> => {
    const response = await apiClient.post('/product-orders/', data);
    return response.data;
  },

  getProductOrdersByCredentials: async (email: string, password: string): Promise<ProductOrder[]> => {
    const response = await apiClient.post('/product-orders/track', { email, password });
    return response.data;
  },

  updateProductDeliveryStatus: async (
    orderId: number, status: ProductDeliveryStatus, notes?: string
  ): Promise<ProductOrder> => {
    const response = await apiClient.patch(`/product-orders/${orderId}/status`, {
      status,
      notes: notes || null,
    });
    return response.data;
  },
};
