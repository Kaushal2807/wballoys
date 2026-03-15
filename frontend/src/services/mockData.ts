import { User, Asset, ServiceRequest, JobAssignment, JobUpdate, JobPhoto } from '../types';

// ─── Mock Users ──────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: 1, email: 'customer@gmail.com', name: 'John Customer', role: 'customer', created_at: '2024-01-15T10:00:00Z' },
  { id: 2, email: 'engineer@gmail.com', name: 'Sarah Engineer', role: 'engineer', created_at: '2024-01-10T10:00:00Z' },
  { id: 3, email: 'manager@gmail.com', name: 'Mike Manager', role: 'manager', created_at: '2024-01-05T10:00:00Z' },
  { id: 4, email: 'john.smith@company.com', name: 'John Smith', role: 'engineer', created_at: '2024-01-08T10:00:00Z' },
  { id: 5, email: 'sarah.lee@company.com', name: 'Sarah Lee', role: 'engineer', created_at: '2024-01-09T10:00:00Z' },
  { id: 6, email: 'mike.johnson@company.com', name: 'Mike Johnson', role: 'engineer', created_at: '2024-01-12T10:00:00Z' },
  { id: 7, email: 'amy.chen@company.com', name: 'Amy Chen', role: 'engineer', created_at: '2024-01-14T10:00:00Z' },
  { id: 8, email: 'admin@gmail.com', name: 'System Admin', role: 'admin', created_at: '2024-01-01T00:00:00Z' },
];

// ─── Mock Assets ─────────────────────────────────────────
export const MOCK_ASSETS: Asset[] = [
  { id: 1, customer_id: 1, asset_name: 'AC Unit - Office 201', model: 'Daikin FTXM25', serial_number: 'DK-2024-001', location: 'Building A, Floor 2' },
  { id: 2, customer_id: 1, asset_name: 'Printer - Floor 3', model: 'HP LaserJet Pro M404', serial_number: 'HP-2024-042', location: 'Building A, Floor 3' },
  { id: 3, customer_id: 1, asset_name: 'Network Switch - Server Room', model: 'Cisco SG350-28', serial_number: 'CS-2024-007', location: 'Building B, Server Room' },
  { id: 4, customer_id: 1, asset_name: 'Server Rack Cooling', model: 'APC InRow RD', serial_number: 'APC-2024-003', location: 'Building B, Server Room' },
  { id: 5, customer_id: 1, asset_name: 'UPS System', model: 'APC Smart-UPS 3000', serial_number: 'APC-2024-010', location: 'Building B, Server Room' },
  { id: 6, customer_id: 1, asset_name: 'CCTV Camera - Lobby', model: 'Hikvision DS-2CD2143', serial_number: 'HK-2024-015', location: 'Building A, Lobby' },
  { id: 7, customer_id: 1, asset_name: 'Fire Alarm Panel', model: 'Honeywell XLS', serial_number: 'HW-2024-020', location: 'Building A, Ground Floor' },
  { id: 8, customer_id: 1, asset_name: 'Elevator Control Unit', model: 'Otis Gen2', serial_number: 'OT-2024-005', location: 'Building A, Basement' },
];

// ─── Mock Service Requests ───────────────────────────────
export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: 1, ticket_number: 'REQ-2024-0045', customer_id: 1, asset_id: 4,
    description: 'Server room cooling system malfunction. Temperature rising above safe limits.',
    urgency: 'high', preferred_date: '2024-03-15', preferred_time: '09:00',
    status: 'assigned', created_at: '2024-03-10T08:30:00Z', updated_at: '2024-03-11T10:00:00Z',
  },
  {
    id: 2, ticket_number: 'REQ-2024-0042', customer_id: 1, asset_id: 1,
    description: 'AC Unit not cooling properly in Office 201. Blowing warm air since morning.',
    urgency: 'high', preferred_date: '2024-03-12', preferred_time: '10:00',
    status: 'in_progress', created_at: '2024-03-08T09:15:00Z', updated_at: '2024-03-10T14:00:00Z',
  },
  {
    id: 3, ticket_number: 'REQ-2024-0040', customer_id: 1, asset_id: 3,
    description: 'Network switch replacement needed. Current switch showing intermittent failures.',
    urgency: 'medium', preferred_date: '2024-03-14', preferred_time: '14:00',
    status: 'in_progress', created_at: '2024-03-07T11:00:00Z', updated_at: '2024-03-09T16:30:00Z',
  },
  {
    id: 4, ticket_number: 'REQ-2024-0038', customer_id: 1, asset_id: 2,
    description: 'Printer jammed on Floor 3. Paper tray not feeding correctly.',
    urgency: 'medium', preferred_date: '2024-03-11', preferred_time: '11:00',
    status: 'assigned', created_at: '2024-03-06T10:45:00Z', updated_at: '2024-03-07T09:00:00Z',
  },
  {
    id: 5, ticket_number: 'REQ-2024-0035', customer_id: 1, asset_id: 3,
    description: 'Network cable replacement needed in conference room B.',
    urgency: 'low', preferred_date: '2024-03-10', preferred_time: '15:00',
    status: 'completed', created_at: '2024-03-04T13:20:00Z', updated_at: '2024-03-08T17:00:00Z',
  },
  {
    id: 6, ticket_number: 'REQ-2024-0031', customer_id: 1, asset_id: 6,
    description: 'CCTV camera in lobby showing blurry footage. Needs lens cleaning or replacement.',
    urgency: 'high', preferred_date: '2024-03-09', preferred_time: '08:00',
    status: 'new', created_at: '2024-03-03T07:30:00Z', updated_at: '2024-03-03T07:30:00Z',
  },
  {
    id: 7, ticket_number: 'REQ-2024-0028', customer_id: 1, asset_id: 7,
    description: 'Fire alarm panel showing fault code E-04. Needs diagnostic check.',
    urgency: 'high', preferred_date: '2024-03-08', preferred_time: '09:00',
    status: 'new', created_at: '2024-03-02T16:00:00Z', updated_at: '2024-03-02T16:00:00Z',
  },
  {
    id: 8, ticket_number: 'REQ-2024-0025', customer_id: 1, asset_id: 5,
    description: 'UPS system battery replacement - scheduled maintenance.',
    urgency: 'low', preferred_date: '2024-03-20', preferred_time: '10:00',
    status: 'closed', created_at: '2024-02-28T09:00:00Z', updated_at: '2024-03-05T16:00:00Z',
  },
  {
    id: 9, ticket_number: 'REQ-2024-0022', customer_id: 1, asset_id: 8,
    description: 'Elevator making unusual noise during operation. Needs inspection.',
    urgency: 'medium', preferred_date: '2024-03-06', preferred_time: '08:00',
    status: 'closed', created_at: '2024-02-25T08:00:00Z', updated_at: '2024-03-03T12:00:00Z',
  },
  {
    id: 10, ticket_number: 'REQ-2024-0019', customer_id: 1, asset_id: 1,
    description: 'Annual AC maintenance and filter replacement for Office 201.',
    urgency: 'low', preferred_date: '2024-03-01', preferred_time: '09:00',
    status: 'closed', created_at: '2024-02-20T10:00:00Z', updated_at: '2024-02-28T15:00:00Z',
  },
];

// ─── Mock Job Assignments ────────────────────────────────
export const MOCK_ASSIGNMENTS: JobAssignment[] = [
  {
    id: 1, request_id: 1, engineer_id: 2, assigned_by: 3,
    assigned_at: '2024-03-11T10:00:00Z', status: 'pending',
  },
  {
    id: 2, request_id: 2, engineer_id: 2, assigned_by: 3,
    assigned_at: '2024-03-09T09:00:00Z', accepted_at: '2024-03-09T09:30:00Z', status: 'accepted',
  },
  {
    id: 3, request_id: 3, engineer_id: 4, assigned_by: 3,
    assigned_at: '2024-03-08T10:00:00Z', accepted_at: '2024-03-08T11:00:00Z', status: 'accepted',
  },
  {
    id: 4, request_id: 4, engineer_id: 5, assigned_by: 3,
    assigned_at: '2024-03-07T09:00:00Z', status: 'pending',
  },
  {
    id: 5, request_id: 5, engineer_id: 6, assigned_by: 3,
    assigned_at: '2024-03-05T08:00:00Z', accepted_at: '2024-03-05T08:30:00Z', status: 'accepted',
  },
  {
    id: 6, request_id: 8, engineer_id: 7, assigned_by: 3,
    assigned_at: '2024-03-01T09:00:00Z', accepted_at: '2024-03-01T09:15:00Z', status: 'accepted',
  },
  {
    id: 7, request_id: 9, engineer_id: 4, assigned_by: 3,
    assigned_at: '2024-02-26T08:00:00Z', accepted_at: '2024-02-26T08:30:00Z', status: 'accepted',
  },
  {
    id: 8, request_id: 10, engineer_id: 2, assigned_by: 3,
    assigned_at: '2024-02-21T10:00:00Z', accepted_at: '2024-02-21T10:15:00Z', status: 'accepted',
  },
];

// ─── Mock Job Updates ────────────────────────────────────
export const MOCK_UPDATES: JobUpdate[] = [
  { id: 1, request_id: 2, user_id: 3, notes: 'Assigned to Sarah Engineer for immediate attention.', created_at: '2024-03-09T09:00:00Z' },
  { id: 2, request_id: 2, user_id: 2, notes: 'Accepted the job. Will visit site today.', created_at: '2024-03-09T09:30:00Z' },
  { id: 3, request_id: 2, user_id: 2, notes: 'On site. Inspecting the AC unit. Compressor seems to be the issue.', created_at: '2024-03-10T10:30:00Z' },
  { id: 4, request_id: 2, user_id: 2, notes: 'Ordered replacement compressor part. Expected delivery by tomorrow.', created_at: '2024-03-10T14:00:00Z' },
  { id: 5, request_id: 3, user_id: 3, notes: 'Assigned to John Smith.', created_at: '2024-03-08T10:00:00Z' },
  { id: 6, request_id: 3, user_id: 4, notes: 'Accepted. Will assess network switch condition.', created_at: '2024-03-08T11:00:00Z' },
  { id: 7, request_id: 3, user_id: 4, notes: 'Confirmed the switch is failing intermittently. Replacement ordered.', created_at: '2024-03-09T16:30:00Z' },
  { id: 8, request_id: 5, user_id: 6, notes: 'Cable replacement completed successfully. Tested connectivity - all good.', created_at: '2024-03-08T17:00:00Z' },
  { id: 9, request_id: 8, user_id: 7, notes: 'UPS battery replaced. System running on new batteries. Load test passed.', created_at: '2024-03-05T15:00:00Z' },
  { id: 10, request_id: 9, user_id: 4, notes: 'Elevator inspected. Bearing replacement completed. Running smoothly now.', created_at: '2024-03-03T12:00:00Z' },
];

// ─── Mock Job Photos ─────────────────────────────────────
export const MOCK_PHOTOS: JobPhoto[] = [
  { id: 1, request_id: 2, uploaded_by: 2, photo_url: 'https://placehold.co/400x300/e2e8f0/475569?text=AC+Unit+Before', uploaded_at: '2024-03-10T10:35:00Z' },
  { id: 2, request_id: 2, uploaded_by: 2, photo_url: 'https://placehold.co/400x300/e2e8f0/475569?text=Compressor+Issue', uploaded_at: '2024-03-10T10:40:00Z' },
  { id: 3, request_id: 5, uploaded_by: 6, photo_url: 'https://placehold.co/400x300/d1fae5/065f46?text=Cable+Replaced', uploaded_at: '2024-03-08T16:50:00Z' },
  { id: 4, request_id: 8, uploaded_by: 7, photo_url: 'https://placehold.co/400x300/dbeafe/1e40af?text=New+Battery', uploaded_at: '2024-03-05T14:45:00Z' },
  { id: 5, request_id: 9, uploaded_by: 4, photo_url: 'https://placehold.co/400x300/fef3c7/92400e?text=Elevator+Repair', uploaded_at: '2024-03-03T11:30:00Z' },
];

// ─── Auto-increment counters ─────────────────────────────
let nextRequestId = 11;
let nextAssignmentId = 9;
let nextUpdateId = 11;
let nextPhotoId = 6;
let nextTicketNum = 46;
let nextUserId = 9;
let nextAssetId = 9;

export const getNextRequestId = () => nextRequestId++;
export const getNextAssignmentId = () => nextAssignmentId++;
export const getNextUpdateId = () => nextUpdateId++;
export const getNextPhotoId = () => nextPhotoId++;
export const getNextUserId = () => nextUserId++;
export const getNextAssetId = () => nextAssetId++;

export const generateTicketNumber = (): string => {
  const num = nextTicketNum++;
  return `REQ-2024-${String(num).padStart(4, '0')}`;
};
