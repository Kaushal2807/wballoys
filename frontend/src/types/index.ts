// User and Auth Types
export type UserRole = 'customer' | 'engineer' | 'manager' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Asset Types
export interface Asset {
  id: number;
  customer_id: number;
  asset_name: string;
  model: string;
  serial_number: string;
  location: string;
}

// Service Request Types
export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'closed';
export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface ServiceRequest {
  id: number;
  ticket_number: string;
  customer_id: number;
  asset_id: number;
  description: string;
  urgency: UrgencyLevel;
  preferred_date: string;
  preferred_time: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  delivery_status?: DeliveryStatus;
  // Tracks which engineers have rejected this unassigned request
  rejected_by_engineers?: number[];
  // Populated fields
  customer?: User;
  asset?: Asset;
  assignment?: JobAssignment;
}

// Delivery Types
export type DeliveryStatus = 'site_visited' | 'photos_taken' | 'next_date_given' | 'service_solved';

export interface DeliveryUpdate {
  id: number;
  request_id: number;
  status: DeliveryStatus;
  updated_by: number;
  notes?: string;
  updated_at: string;
  // Populated fields
  user?: User;
}

// Job Assignment Types
export type AssignmentStatus = 'pending' | 'accepted' | 'rejected';

export interface JobAssignment {
  id: number;
  request_id: number;
  engineer_id: number;
  assigned_by: number;
  assigned_at: string;
  accepted_at?: string;
  status: AssignmentStatus;
  // Populated fields
  engineer?: User;
  assigner?: User;
}

// Job Update Types
export interface JobUpdate {
  id: number;
  request_id: number;
  user_id: number;
  notes: string;
  created_at: string;
  // Populated fields
  user?: User;
}

// Job Photo Types
export interface JobPhoto {
  id: number;
  request_id: number;
  uploaded_by: number;
  photo_url: string;
  uploaded_at: string;

  // Safety-specific fields for safety photos
  safety_category?: SafetyPhotoCategory;
  safety_notes?: string;
  file_id?: number;

  // Populated fields
  uploader?: User;
}

// Safety Types
export type SafetyPhotoCategory =
  | 'site_conditions'
  | 'safety_equipment'
  | 'hazard_identification'
  | 'workspace_preparation';

export type SafetyParameterCategory =
  | 'personal_protection'
  | 'site_safety'
  | 'equipment_safety'
  | 'emergency_procedures';

export interface SafetyParameter {
  id: number;
  name: string;
  category: SafetyParameterCategory;
  description?: string;
  is_required: boolean;
  order_index: number;
}

export interface SafetyChecklistItem {
  id: number;
  request_id: number;
  safety_parameter_id: number;
  checked_by: number;
  checked_at: string;
  notes?: string;
  // Populated fields
  safety_parameter?: SafetyParameter;
  checker?: User;
}

export interface SafetyChecklistItemCreate {
  safety_parameter_id: number;
  notes?: string;
}

export interface SafetyPhotoUpload {
  photo_url?: string;
  safety_category: SafetyPhotoCategory;
  safety_notes?: string;
}

export interface SafetyWorkStartData {
  checklist_items: SafetyChecklistItemCreate[];
  photos: SafetyPhotoUpload[];
  notes?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  total_requests: number;
  new_requests: number;
  assigned_requests: number;
  in_progress_requests: number;
  completed_requests: number;
  closed_requests: number;
  urgent_requests: number;
}

// Create Request Payload
export interface CreateRequestPayload {
  customer_id: number;
  asset_id: number;
  description: string;
  urgency: UrgencyLevel;
  preferred_date: string;
  preferred_time: string;
}

// Request Filters
export interface RequestFilters {
  status?: RequestStatus | 'all';
  urgency?: UrgencyLevel | 'all';
  search?: string;
}

// API Error Response
export interface ApiError {
  detail: string;
  status?: number;
}

// Product Delivery Types
export type ProductDeliveryStatus = 'pending' | 'dispatched' | 'in_transit' | 'delivered';

export interface ProductOrder {
  id: number;
  order_number: string;
  tracking_id: string;
  product_name: string;
  model: string;
  quantity: number;
  customer_name: string;
  customer_email: string;  // Keep for business use
  delivery_address: string;
  order_date: string;
  expected_delivery_date: string;
  delivery_status: ProductDeliveryStatus;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductOrderPayload {
  product_name: string;
  model: string;
  quantity: number;
  customer_name: string;
  customer_email: string;  // Keep for business use
  delivery_address: string;
  order_date: string;
  expected_delivery_date: string;
  notes?: string;
}

// Demo Credentials
export const DEMO_CREDENTIALS = {
  customer: {
    email: 'customer@gmail.com',
    password: 'customer123',
  },
  engineer: {
    email: 'engineer@gmail.com',
    password: 'engineer123',
  },
  manager: {
    email: 'manager@gmail.com',
    password: 'manager123',
  },
  admin: {
    email: 'admin@gmail.com',
    password: 'admin123',
  },
} as const;
