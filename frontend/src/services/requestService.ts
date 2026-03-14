import {
  ServiceRequest, JobAssignment, JobUpdate, JobPhoto,
  Asset, User, DashboardStats, CreateRequestPayload,
  RequestFilters, UrgencyLevel, RequestStatus,
} from '../types';
import {
  MOCK_USERS, MOCK_ASSETS, MOCK_REQUESTS, MOCK_ASSIGNMENTS,
  MOCK_UPDATES, MOCK_PHOTOS,
  getNextRequestId, getNextAssignmentId, getNextUpdateId, getNextPhotoId,
  generateTicketNumber,
} from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to populate a request with related data
const populateRequest = (req: ServiceRequest): ServiceRequest => {
  const customer = MOCK_USERS.find(u => u.id === req.customer_id);
  const asset = MOCK_ASSETS.find(a => a.id === req.asset_id);
  const assignment = MOCK_ASSIGNMENTS.find(a => a.request_id === req.id);
  const populatedAssignment = assignment ? {
    ...assignment,
    engineer: MOCK_USERS.find(u => u.id === assignment.engineer_id),
    assigner: MOCK_USERS.find(u => u.id === assignment.assigned_by),
  } : undefined;

  return { ...req, customer, asset, assignment: populatedAssignment };
};

export const requestService = {
  // ─── Customer Operations ─────────────────────────────

  getMyRequests: async (customerId: number): Promise<ServiceRequest[]> => {
    await delay(300);
    return MOCK_REQUESTS
      .filter(r => r.customer_id === customerId)
      .map(populateRequest)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getRequestById: async (requestId: number): Promise<ServiceRequest> => {
    await delay(300);
    const request = MOCK_REQUESTS.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    return populateRequest(request);
  },

  createRequest: async (data: CreateRequestPayload): Promise<ServiceRequest> => {
    await delay(400);
    const newRequest: ServiceRequest = {
      id: getNextRequestId(),
      ticket_number: generateTicketNumber(),
      customer_id: data.customer_id,
      asset_id: data.asset_id,
      description: data.description,
      urgency: data.urgency as UrgencyLevel,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_REQUESTS.unshift(newRequest);
    return populateRequest(newRequest);
  },

  closeRequest: async (requestId: number): Promise<ServiceRequest> => {
    await delay(300);
    const request = MOCK_REQUESTS.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    request.status = 'closed';
    request.updated_at = new Date().toISOString();
    return populateRequest(request);
  },

  getAssetsByCustomer: async (customerId: number): Promise<Asset[]> => {
    await delay(200);
    return MOCK_ASSETS.filter(a => a.customer_id === customerId);
  },

  // ─── Engineer Operations ─────────────────────────────

  getMyJobs: async (engineerId: number): Promise<ServiceRequest[]> => {
    await delay(300);
    const myAssignments = MOCK_ASSIGNMENTS.filter(a => a.engineer_id === engineerId);
    const requestIds = myAssignments.map(a => a.request_id);
    return MOCK_REQUESTS
      .filter(r => requestIds.includes(r.id))
      .map(populateRequest)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  acceptJob: async (assignmentId: number): Promise<JobAssignment> => {
    await delay(300);
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    assignment.status = 'accepted';
    assignment.accepted_at = new Date().toISOString();
    const request = MOCK_REQUESTS.find(r => r.id === assignment.request_id);
    if (request) {
      request.status = 'in_progress';
      request.updated_at = new Date().toISOString();
    }
    return { ...assignment, engineer: MOCK_USERS.find(u => u.id === assignment.engineer_id) };
  },

  rejectJob: async (assignmentId: number): Promise<JobAssignment> => {
    await delay(300);
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    assignment.status = 'rejected';
    const request = MOCK_REQUESTS.find(r => r.id === assignment.request_id);
    if (request) {
      request.status = 'new';
      request.updated_at = new Date().toISOString();
    }
    return { ...assignment };
  },

  startWork: async (requestId: number): Promise<ServiceRequest> => {
    await delay(300);
    const request = MOCK_REQUESTS.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    request.status = 'in_progress';
    request.updated_at = new Date().toISOString();
    return populateRequest(request);
  },

  markComplete: async (requestId: number): Promise<ServiceRequest> => {
    await delay(300);
    const request = MOCK_REQUESTS.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    request.status = 'completed';
    request.updated_at = new Date().toISOString();
    return populateRequest(request);
  },

  addJobUpdate: async (requestId: number, notes: string, userId: number): Promise<JobUpdate> => {
    await delay(300);
    const update: JobUpdate = {
      id: getNextUpdateId(),
      request_id: requestId,
      user_id: userId,
      notes,
      created_at: new Date().toISOString(),
      user: MOCK_USERS.find(u => u.id === userId),
    };
    MOCK_UPDATES.push(update);
    return update;
  },

  uploadPhoto: async (requestId: number, file: File, userId: number): Promise<JobPhoto> => {
    await delay(500);
    const photoUrl = URL.createObjectURL(file);
    const photo: JobPhoto = {
      id: getNextPhotoId(),
      request_id: requestId,
      uploaded_by: userId,
      photo_url: photoUrl,
      uploaded_at: new Date().toISOString(),
      uploader: MOCK_USERS.find(u => u.id === userId),
    };
    MOCK_PHOTOS.push(photo);
    return photo;
  },

  // ─── Manager Operations ──────────────────────────────

  getAllRequests: async (filters?: RequestFilters): Promise<ServiceRequest[]> => {
    await delay(300);
    let requests = MOCK_REQUESTS.map(populateRequest);

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        requests = requests.filter(r => r.status === (filters.status as RequestStatus));
      }
      if (filters.urgency && filters.urgency !== 'all') {
        requests = requests.filter(r => r.urgency === (filters.urgency as UrgencyLevel));
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        requests = requests.filter(r =>
          r.ticket_number.toLowerCase().includes(search) ||
          r.description.toLowerCase().includes(search)
        );
      }
    }

    return requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  assignEngineer: async (
    requestId: number, engineerId: number, note: string, assignedBy: number
  ): Promise<JobAssignment> => {
    await delay(400);
    const request = MOCK_REQUESTS.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');

    const assignment: JobAssignment = {
      id: getNextAssignmentId(),
      request_id: requestId,
      engineer_id: engineerId,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
      status: 'pending',
    };
    MOCK_ASSIGNMENTS.push(assignment);

    request.status = 'assigned';
    request.updated_at = new Date().toISOString();

    // Add update note
    if (note) {
      const engineer = MOCK_USERS.find(u => u.id === engineerId);
      MOCK_UPDATES.push({
        id: getNextUpdateId(),
        request_id: requestId,
        user_id: assignedBy,
        notes: `Assigned to ${engineer?.name || 'engineer'}. Note: ${note}`,
        created_at: new Date().toISOString(),
      });
    }

    return { ...assignment, engineer: MOCK_USERS.find(u => u.id === engineerId) };
  },

  getEngineers: async (): Promise<User[]> => {
    await delay(200);
    return MOCK_USERS.filter(u => u.role === 'engineer');
  },

  // ─── Shared Operations ───────────────────────────────

  getRequestUpdates: async (requestId: number): Promise<JobUpdate[]> => {
    await delay(200);
    return MOCK_UPDATES
      .filter(u => u.request_id === requestId)
      .map(u => ({ ...u, user: MOCK_USERS.find(usr => usr.id === u.user_id) }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getRequestPhotos: async (requestId: number): Promise<JobPhoto[]> => {
    await delay(200);
    return MOCK_PHOTOS
      .filter(p => p.request_id === requestId)
      .map(p => ({ ...p, uploader: MOCK_USERS.find(u => u.id === p.uploaded_by) }));
  },

  getDashboardStats: async (userId: number, role: string): Promise<DashboardStats> => {
    await delay(200);
    let requests: ServiceRequest[];

    if (role === 'customer') {
      requests = MOCK_REQUESTS.filter(r => r.customer_id === userId);
    } else if (role === 'engineer') {
      const myAssignments = MOCK_ASSIGNMENTS.filter(a => a.engineer_id === userId);
      const requestIds = myAssignments.map(a => a.request_id);
      requests = MOCK_REQUESTS.filter(r => requestIds.includes(r.id));
    } else {
      requests = [...MOCK_REQUESTS];
    }

    return {
      total_requests: requests.length,
      new_requests: requests.filter(r => r.status === 'new').length,
      assigned_requests: requests.filter(r => r.status === 'assigned').length,
      in_progress_requests: requests.filter(r => r.status === 'in_progress').length,
      completed_requests: requests.filter(r => r.status === 'completed').length,
      closed_requests: requests.filter(r => r.status === 'closed').length,
      urgent_requests: requests.filter(r => r.urgency === 'high').length,
    };
  },
};
