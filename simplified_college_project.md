# Service Management System - College Project (Simplified)

## Project Overview
A simplified two-portal service management system for managing equipment service requests between customers and engineers.

---

## Simplified Scope - Core Features Only

### 1. User Authentication & Roles
- Login/Logout with JWT
- Three roles: Customer, Engineer, Manager
- Basic profile management

### 2. Service Request Management
- Customer creates service request
- Select asset/equipment
- Add description and urgency level
- Choose preferred visit date and time
- Auto-generate ticket number

### 3. Job Assignment Workflow
- All customer requests are visible to all engineers
- Manager can also assign specific jobs to engineers
- Engineer can accept/reject assigned jobs
- Job status tracking (5 simple states)

### 4. Simple Job Execution
- Engineer updates job status
- Add work notes/comments
- Upload photos (1-3 images max)
- Mark job as completed

### 5. Delivery Tracking (Service Jobs)
- Separate delivery status tracking per service request
- 4-step delivery flow: Pending → Dispatched → In Transit → Delivered
- Engineer and Manager can update delivery status with optional notes
- Customer can view delivery progress (read-only)
- Full delivery history with timestamps and user tracking

### 6. Product Order Tracking (Physical Shipments)
- Admin/Manager creates product orders with a **customer email** and **tracking password**
- Customer uses email + tracking password (no account needed) to look up their orders
- Read-only delivery progress bar: Pending → Dispatched → In Transit → Delivered
- All matching orders for that email/password are returned at once

### 6. Basic Dashboard
- Customer: View my requests and status
- Engineer: View all customer requests + view assigned jobs
- Manager: View all jobs and simple statistics

---

## Simplified Job States
```
New → Assigned → In Progress → Completed → Closed
```

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSERS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Customer   │  │   Engineer   │  │   Manager    │         │
│  │    Portal    │  │    Portal    │  │    Portal    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   VERCEL CDN    │
                    │  React Frontend │
                    │  (Vite + TS)    │
                    └────────┬────────┘
                             │ HTTPS/REST API
                    ┌────────▼────────┐
                    │  RENDER/RAILWAY │
                    │  FastAPI Server │
                    │  (Python + JWT) │
                    └────┬────────┬───┘
                         │        │
          ┌──────────────┘        └──────────────┐
          │                                      │
  ┌───────▼────────┐                   ┌─────────▼─────────┐
  │  NEON POSTGRES │                   │ CLOUDINARY/SUPABASE│
  │   (Database)   │                   │  (Image Storage)  │
  │  - Users       │                   │  - Job Photos     │
  │  - Requests    │                   │  - Evidence Files │
  │  - Assignments │                   └───────────────────┘
  │  - Updates     │
  │  - Deliveries  │
  │  - ProductOrders│
  └────────────────┘
```

---

## 🗂️ Database Schema (ERD)

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ • id (PK)       │───┐
│ • email         │   │
│ • password_hash │   │
│ • name          │   │
│ • role          │   │
│ • created_at    │   │
└─────────────────┘   │
                      │
         ┌────────────┼────────────────────┐
         │            │                    │
         │            │                    │
┌────────▼────────┐   │   ┌────────────────▼────────┐
│     assets      │   │   │  service_requests       │
├─────────────────┤   │   ├─────────────────────────┤
│ • id (PK)       │   │   │ • id (PK)              │───┐
│ • customer_id ──┼───┘   │ • ticket_number         │   │
│ • asset_name    │       │ • customer_id (FK) ─────┼───┘
│ • model         │       │ • asset_id (FK) ────────┼───┐
│ • serial_number │       │ • description           │   │
│ • location      │       │ • urgency               │   │
└─────────────────┘       │ • preferred_date        │   │
                          │ • preferred_time        │   │
                          │ • status                │   │
                          │ • created_at            │   │
                          │ • updated_at            │   │
                          └─────────────┬───────────┘   │
                                        │               │
                     ┌──────────────────┼───────────────┘
                     │                  │
         ┌───────────▼──────────┐       │
         │  job_assignments     │       │
         ├──────────────────────┤       │
         │ • id (PK)            │       │
         │ • request_id (FK) ───┼───────┤
         │ • engineer_id (FK)   │       │
         │ • assigned_by (FK)   │       │
         │ • assigned_at        │       │
         │ • accepted_at        │       │
         │ • status             │       │
         └──────────────────────┘       │
                                        │
                     ┌──────────────────┼──────────────┐
                     │                  │              │
         ┌───────────▼──────────┐   ┌───▼──────────────▼────┐
         │   job_updates        │   │    job_photos         │
         ├──────────────────────┤   ├───────────────────────┤
         │ • id (PK)            │   │ • id (PK)             │
         │ • request_id (FK)    │   │ • request_id (FK)     │
         │ • user_id (FK)       │   │ • uploaded_by (FK)    │
         │ • notes              │   │ • photo_url           │
         │ • created_at         │   │ • uploaded_at         │
         └──────────────────────┘   └───────────────────────┘

                     ┌──────────────────────────┐
                     │   delivery_updates        │
                     ├──────────────────────────┤
                     │ • id (PK)                │
                     │ • request_id (FK)        │
                     │ • status                 │
                     │ • updated_by (FK)        │
                     │ • notes (nullable)       │
                     │ • updated_at             │
                     └──────────────────────────┘
```

**Relationships:**
- One Customer (user) → Many Assets
- One Customer (user) → Many Service Requests
- One Asset → Many Service Requests
- One Service Request → One Job Assignment
- One Service Request → Many Job Updates
- One Service Request → Many Job Photos
- One Service Request → Many Delivery Updates
- One Engineer (user) → Many Job Assignments

---

## 🔄 Complete Job Workflow State Machine

```
┌──────────┐
│   NEW    │  ← Customer creates request
└────┬─────┘
     │
     │ Manager assigns engineer
     ▼
┌──────────┐
│ ASSIGNED │  ← Waiting for engineer response
└────┬─────┘
     │
     │ Engineer accepts job
     ▼
┌─────────────┐
│ IN PROGRESS │  ← Engineer working on job
└─────┬───────┘
      │
      │ Engineer completes work + uploads photos
      ▼
┌───────────┐
│ COMPLETED │  ← Work done, waiting for customer review
└─────┬─────┘
      │
      │ Customer/Manager closes job
      ▼
┌─────────┐
│ CLOSED  │  ← Final state
└─────────┘
```

**Status Transitions:**
- `new` → `assigned` (Manager action)
- `assigned` → `in_progress` (Engineer accepts)
- `in_progress` → `completed` (Engineer marks done)
- `completed` → `closed` (Customer/Manager sign-off)

---

## 👥 User Flow Diagrams

### Customer Flow
```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌──────────────────────┐
│      Dashboard       │
│ • My Requests        │
│ • Create New         │
│ • Track Product Order│
└────┬────────┬────────┘
     │        │              │
     │        └──────────────┤
     │                       │
     │                ┌──────▼────────────────┐
     │                │  Track Product Order  │
     │                │ • Enter Email         │
     │                │ • Enter Password      │
     │                │ • View delivery stages│
     │                └───────────────────────┘
     │
     ├──── View existing ──▶ Request Details (read-only)
     │
     ▼
┌──────────────────────────────────┐
│       Create Request              │
│ • Select Asset                   │
│ • Description                    │
│ • Urgency                        │
│ • Submit                         │
└────────┬─────────────────────────┘
         │
┌────────▼─────────┐
│ Ticket Generated │
│ (e.g., REQ-2024) │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────┐
│     View Request Details        │
│ • Status: NEW/ASSIGNED/etc.     │
│ • Assigned Engineer (if any)    │
│ • Delivery Status (read-only)  │
│ • Updates Timeline              │
│ • Uploaded Photos               │
│ • Close Job (if completed)      │
└─────────────────────────────────┘
```

### Engineer Flow
```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌───────────────────────────┐
│       Dashboard           │
│                           │
│  ┌─────────────────────┐  │
│  │  My Assigned Jobs   │  │
│  │  • Pending (2)      │  │
│  │  • Active (3)       │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │  All Customer       │  │
│  │  Requests           │  │
│  │  • Browse all (10)  │  │
│  │  • View any request │  │
│  └─────────────────────┘  │
└────┬──────────────────────┘
     │
     ├──── View any request ──▶ Job Details (read-only)
     │
     ▼
┌────────────────────┐
│  Job Assignment    │
│  (assigned by mgr) │
│  [Accept] [Reject] │
└────┬───────────────┘
     │
     │ Accept
     ▼
┌─────────────────────────┐
│    Job Details          │
│ • Asset Info            │
│ • Customer Details      │
│ • Problem Description   │
│ • Current Status        │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Update Job Status      │
│  [Start Work]           │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐      ┌──────────────────┐
│  Working on Job         │─────▶│  Upload Photos   │
│ • Add Work Notes        │      │ • Before/After   │
│ • Update Progress       │      │ • Max 3 images   │
└────┬────────────────────┘      └──────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Update Delivery Status │
│ • Mark as Dispatched    │
│ • Mark as In Transit    │
│ • Mark as Delivered     │
│ • Add delivery notes    │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Mark as Completed      │
│ • Final Notes           │
│ • Confirm Completion    │
└─────────────────────────┘
```

### Manager Flow
```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌────────────────────────┐
│   Manager Dashboard    │
│ • All Jobs Overview    │
│ • New Requests (5)     │
│ • In Progress (12)     │
│ • Completed (3)        │
│ • Statistics           │
└────┬───────────────────┘
     │
     ▼
┌────────────────────────┐
│   New Requests List    │
│ REQ-001 | High | AC-1  │
│ REQ-002 | Med  | AC-2  │
│ [Assign Engineer]      │
└────┬───────────────────┘
     │
     ▼
┌────────────────────────┐
│  Assign Job Dialog     │
│ • Select Engineer      │
│ • Add Assignment Note  │
│ • [Confirm]            │
└────┬───────────────────┘
     │
     ▼
┌────────────────────────┐
│  Monitor Jobs          │
│ • Track Progress       │
│ • View Updates         │
│ • See Photos           │
│ • Update Delivery      │
│ • Close Jobs           │
└────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│ User Access │
│   Website   │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Login Page   │
│ • Email      │
│ • Password   │
└──────┬───────┘
       │
       │ POST /api/auth/login
       ▼
┌────────────────────────┐
│  FastAPI Backend       │
│  1. Verify credentials │
│  2. Hash password      │
│  3. Check DB           │
└──────┬─────────────────┘
       │
       ├─── Invalid ───► Error Message
       │
       └─── Valid
            │
            ▼
┌────────────────────────┐
│  Generate JWT Token    │
│  {                     │
│    user_id: 123,       │
│    role: "engineer",   │
│    exp: timestamp      │
│  }                     │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│  Return to Frontend    │
│  {                     │
│    token: "eyJ...",    │
│    user: {...}         │
│  }                     │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│  Store in Browser      │
│  • localStorage        │
│  • Set Auth Header     │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│  All Future Requests   │
│  Header:               │
│  Authorization:        │
│  Bearer eyJ...         │
└────────────────────────┘
```

---

## 📸 Photo Upload Flow

```
┌──────────────────┐
│  Engineer clicks │
│  "Upload Photo"  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Select File (Browser)   │
│  • Max 5MB               │
│  • JPG/PNG only          │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Frontend Validation            │
│  • Check file size              │
│  • Check file type              │
│  • Check max 3 photos per job   │
└────────┬────────────────────────┘
         │
         │ Valid
         ▼
┌─────────────────────────────────┐
│  POST /api/requests/{id}/photos │
│  FormData:                      │
│  • file: [binary]               │
│  • request_id: 123              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  FastAPI Backend                │
│  1. Verify JWT token            │
│  2. Check user is engineer      │
│  3. Verify job assignment       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Upload to Cloudinary/Supabase  │
│  • Generate unique filename     │
│  • Upload file                  │
│  • Get public URL               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Save to Database (job_photos)  │
│  {                              │
│    request_id: 123,             │
│    uploaded_by: engineer_id,    │
│    photo_url: "https://...",    │
│    uploaded_at: timestamp       │
│  }                              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Return Response                │
│  {                              │
│    id: 456,                     │
│    url: "https://...",          │
│    message: "Photo uploaded"    │
│  }                              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Frontend Update                │
│  • Show photo in gallery        │
│  • Display success message      │
│  • Update photo count           │
└─────────────────────────────────┘
```

---

## 📦 Delivery Tracking Flow

```
┌──────────────────────────────────────────────────────────┐
│              DELIVERY STATUS FLOW                         │
│                                                           │
│   ┌─────────┐    ┌────────────┐    ┌───────────┐    ┌──────────┐
│   │ PENDING │───▶│ DISPATCHED │───▶│ IN TRANSIT│───▶│ DELIVERED│
│   └─────────┘    └────────────┘    └───────────┘    └──────────┘
│                                                           │
│   Default state    Engineer/Mgr     Engineer/Mgr     Final state
│   when job starts  clicks "Mark     clicks "Mark     (green ✓)
│                    as Dispatched"   as In Transit"
└──────────────────────────────────────────────────────────┘

WHO CAN UPDATE:
  ┌──────────────────┐    ┌──────────────────┐
  │    Engineer      │    │    Manager       │
  │  ✓ Can update    │    │  ✓ Can update    │
  │  ✓ Add notes     │    │  ✓ Add notes     │
  └──────────────────┘    └──────────────────┘

  ┌──────────────────┐
  │    Customer      │
  │  ✓ Can VIEW only │
  │  ✗ Cannot update │
  └──────────────────┘

WHEN VISIBLE:
  • Delivery section appears when job status is "in_progress" or "completed"
  • Not shown for "new", "assigned", or "closed" jobs

API FLOW:
  ┌───────────────────────────────────────────────────────┐
  │  PATCH /api/requests/{id}/delivery                     │
  │  Headers: { Authorization: "Bearer eyJ..." }           │
  │  Body: {                                               │
  │    "status": "dispatched",                             │
  │    "notes": "Parts shipped via courier"                │
  │  }                                                     │
  └───────────────────┬───────────────────────────────────┘
                      │
                      ▼
  ┌───────────────────────────────────────────────────────┐
  │  Backend validates:                                    │
  │  1. User is engineer or manager                        │
  │  2. Request exists and is in_progress/completed        │
  │  3. Transition is valid (pending → dispatched ✓)       │
  │  4. Updates service_requests.delivery_status           │
  │  5. Creates delivery_updates record                    │
  │  6. Creates job_updates record (for timeline)          │
  └───────────────────┬───────────────────────────────────┘
                      │
                      ▼
  ┌───────────────────────────────────────────────────────┐
  │  Response: 200 OK                                      │
  │  {                                                     │
  │    "id": 1,                                            │
  │    "request_id": 42,                                   │
  │    "status": "dispatched",                             │
  │    "updated_by": 2,                                    │
  │    "notes": "Parts shipped via courier",               │
  │    "updated_at": "2024-03-15T14:30:00Z"                │
  │  }                                                     │
  └───────────────────────────────────────────────────────┘

DATABASE TABLES AFFECTED:
  • service_requests → delivery_status field updated
  • delivery_updates → new row inserted (delivery history)
  • job_updates → new row inserted (appears in timeline)
```

---

## 🔄 API Request Flow Example

**Example: Customer Creates Service Request**

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
└──────────────────────────────────────────────────────────────┘
                             │
                             │ User fills form
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /api/requests                                         │
│  Headers: { Authorization: "Bearer eyJ..." }                │
│  Body: {                                                    │
│    asset_id: 5,                                             │
│    description: "AC not cooling",                           │
│    urgency: "high",                                         │
│    preferred_date: "2024-03-15",                            │
│    preferred_time: "10:00"                                  │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI on Render)                    │
│                                                             │
│  1. JWT Middleware                                          │
│     • Extract token                                         │
│     • Verify signature                                      │
│     • Get user_id and role                                  │
│     ✓ user_id: 10, role: "customer"                         │
│                                                             │
│  2. Authorization Check                                     │
│     • Check if role = "customer"                            │
│     • Check if user owns asset_id                           │
│     ✓ Authorized                                            │
│                                                             │
│  3. Validation (Pydantic)                                   │
│     • Validate required fields                              │
│     • Check urgency is valid enum                           │
│     ✓ Valid                                                 │
│                                                             │
│  4. Business Logic                                          │
│     • Generate ticket_number: "REQ-2024-0042"               │
│     • Set status: "new"                                     │
│     • Set created_at: now()                                 │
│     • Validate preferred_date is future date                │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            DATABASE (Neon PostgreSQL)                       │
│                                                             │
│  INSERT INTO service_requests (                             │
│    ticket_number, customer_id, asset_id,                    │
│    description, urgency, preferred_date,                    │
│    preferred_time, status, created_at                       │
│  ) VALUES (                                                 │
│    'REQ-2024-0042', 10, 5,                                  │
│    'AC not cooling', 'high',                                │
│    '2024-03-15', '10:00',                                   │
│    'new', '2024-03-14 10:30'                                │
│  )                                                          │
│  RETURNING *;                                               │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Row inserted
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI)                              │
│                                                             │
│  Response: 201 Created                                      │
│  Body: {                                                    │
│    id: 42,                                                  │
│    ticket_number: "REQ-2024-0042",                          │
│    customer_id: 10,                                         │
│    asset_id: 5,                                             │
│    description: "AC not cooling",                           │
│    urgency: "high",                                         │
│    preferred_date: "2024-03-15",                            │
│    preferred_time: "10:00",                                 │
│    status: "new",                                           │
│    created_at: "2024-03-14T10:30:00Z"                       │
│  }                                                          │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ JSON Response
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│                                                             │
│  • Display success notification                             │
│  • Redirect to request details page                         │
│  • Show ticket number: REQ-2024-0042                        │
│  • Update request list                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Simplified Technology Stack

### Frontend (Vercel Deployment)
- **React** + **Vite** + **TypeScript**
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** OR **MUI** (choose one for UI)
- **React Hook Form** for forms
- **React Toastify** for notifications

### Backend (Free Hosting)
- **FastAPI** (Python)
- **SQLAlchemy** for database
- **JWT** authentication
- Deploy on: **Render** (free tier) or **Railway**

### Database
- **PostgreSQL** on **Neon** (free tier)
- Or **Supabase** (includes auth + storage)

### File Storage
- **Cloudinary** (free tier - easy image upload)
- Or **Supabase Storage**

---

## Simplified Data Model (7 Core Tables)

### 1. users
```
- id (PK)
- email (unique)
- password_hash
- name
- role (customer/engineer/manager)
- created_at
```

### 2. assets
```
- id (PK)
- customer_id (FK)
- asset_name
- model
- serial_number
- location
```

### 3. service_requests
```
- id (PK)
- ticket_number (auto-generated)
- customer_id (FK)
- asset_id (FK)
- description
- urgency (low/medium/high)
- preferred_date
- preferred_time
- status (new/assigned/in_progress/completed/closed)
- delivery_status (site_visited/photos_taken/next_date_given/service_solved) - default: site_visited
- created_at
- updated_at
```

### 4. job_assignments
```
- id (PK)
- request_id (FK)
- engineer_id (FK)
- assigned_by (manager_id FK)
- assigned_at
- accepted_at
- status (pending/accepted/rejected)
```

### 5. job_updates
```
- id (PK)
- request_id (FK)
- user_id (FK)
- notes
- created_at
```

### 6. job_photos
```
- id (PK)
- request_id (FK)
- uploaded_by (FK)
- photo_url
- uploaded_at
```

### 7. delivery_updates
```
- id (PK)
- request_id (FK → service_requests)
- status (site_visited/photos_taken/next_date_given/service_solved)
- updated_by (FK → users)
- notes (nullable)
- updated_at
```

### 8. product_orders
```
- id (PK)
- order_number (unique, auto-generated: ORD-2024-XXXX)
- product_name
- model
- quantity
- customer_name
- customer_email (used as tracking lookup key)
- tracking_password (plain-text password set by admin/manager, shared with customer)
- delivery_address
- order_date
- expected_delivery_date
- delivery_status (pending/dispatched/in_transit/delivered) - default: pending
- notes (nullable)
- created_by (FK → users, manager/admin who created)
- created_at
- updated_at
```

> `customer_email` + `tracking_password` together authenticate a customer's order tracking lookup. No login/JWT required — customers enter these credentials on the public tracking page to view their order's delivery stages.

---

## Simplified API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Service Requests
- POST `/api/requests` (customer creates)
- GET `/api/requests` (list with filters by role)
- GET `/api/requests/all` (all requests - for engineers to browse all customer requests)
- GET `/api/requests/{id}` (details)
- PATCH `/api/requests/{id}/status` (update status)

### Assignments
- POST `/api/assignments` (manager assigns)
- PATCH `/api/assignments/{id}/accept` (engineer accepts)
- PATCH `/api/assignments/{id}/reject` (engineer rejects)

### Job Updates
- POST `/api/requests/{id}/updates` (add notes)
- GET `/api/requests/{id}/updates` (get history)

### Photos
- POST `/api/requests/{id}/photos` (upload)
- GET `/api/requests/{id}/photos` (list)

### Delivery
- GET `/api/requests/{id}/delivery` (get delivery updates history)
- PATCH `/api/requests/{id}/delivery` (update delivery status - engineer/manager only)
  - Body: `{ "status": "photos_taken", "notes": "optional notes" }`
  - Valid transitions: site_visited → photos_taken → next_date_given → service_solved

### Product Orders (Manager/Admin only)
- GET `/api/product-orders` (list all product orders)
- GET `/api/product-orders/{id}` (get single order details)
- POST `/api/product-orders` (create new product order)
  - Body: `{ "product_name": "...", "model": "...", "quantity": 100, "customer_name": "...", "customer_email": "orders@company.com", "tracking_password": "company@1234", "delivery_address": "...", "order_date": "2024-03-14", "expected_delivery_date": "2024-03-28", "notes": "optional" }`
- PATCH `/api/product-orders/{id}/status` (update delivery status)
  - Body: `{ "status": "dispatched", "notes": "optional notes" }`
  - Valid transitions: pending → dispatched → in_transit → delivered

### Product Order Tracking (No authentication required)
- POST `/api/product-orders/track` (customer lookup by email + password)
  - Body: `{ "email": "orders@company.com", "password": "company@1234" }`
  - Returns: list of matching `ProductOrder` objects (all orders for that email/password)
  - Returns 404 if no orders match

### Dashboard
- GET `/api/dashboard/stats` (simple counts by role)

---

## Simplified Frontend Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── customer/
│   │   ├── CreateRequest.tsx
│   │   └── RequestList.tsx
│   ├── product-delivery/
│   │   └── ProductOrderCard.tsx   # shows email + masked password (admin/mgr view)
│   ├── engineer/
│   │   ├── AssignedJobs.tsx
│   │   ├── AllRequests.tsx
│   │   └── JobDetails.tsx
│   └── manager/
│       ├── AllJobs.tsx
│       └── AssignJob.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProductDeliveriesPage.tsx  # admin + manager: create/manage orders (includes email/password form fields)
│   ├── RequestsPage.tsx
│   ├── JobDetailsPage.tsx
│   └── customer/
│       ├── CustomerRequestsPage.tsx
│       ├── CreateRequestPage.tsx
│       ├── RequestDetailsPage.tsx
│       └── ProductTrackingPage.tsx  # customer: enter email + password to view order stages
├── services/
│   ├── api.ts
│   ├── authService.ts
│   └── requestService.ts
├── hooks/
│   ├── useAuth.ts
│   └── useRequests.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Simplified Backend Structure

```
app/
├── main.py (FastAPI app entry)
├── config.py
├── database.py
├── models/
│   ├── user.py
│   ├── asset.py
│   └── service_request.py
├── schemas/
│   ├── user.py
│   ├── request.py
│   └── assignment.py
├── routers/
│   ├── auth.py
│   ├── requests.py          # includes GET /all for engineer access
│   ├── assignments.py
│   ├── delivery.py           # delivery status tracking
│   ├── product_orders.py     # product delivery tracking (manager/admin)
│   └── dashboard.py
├── dependencies/
│   └── auth.py (JWT verification)
└── utils/
    └── security.py (password hashing)
```

---

## FastAPI Backend Implementation

### main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, requests, assignments, dashboard, product_orders
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="WB Alloys Service Management API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(requests.router, prefix="/api/requests", tags=["Service Requests"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(product_orders.router, prefix="/api/product-orders", tags=["Product Orders"])

# Note: Delivery routes are nested under /api/requests in routers/delivery.py
# Import and include them in routers/requests.py or mount separately:
# from app.routers import delivery
# app.include_router(delivery.router, prefix="/api/requests", tags=["Delivery"])

@app.get("/")
def root():
    return {"message": "WB Alloys Service Management API"}
```

### config.py
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
```

### database.py
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### models/user.py
```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # customer, engineer, manager
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### models/service_request.py
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    serial_number = Column(String, nullable=False)
    location = Column(String, nullable=False)

    customer = relationship("User")

class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    description = Column(String, nullable=False)
    urgency = Column(String, nullable=False)  # low, medium, high
    preferred_date = Column(String, nullable=False)
    preferred_time = Column(String, nullable=False)
    status = Column(String, default="new", nullable=False)  # new, assigned, in_progress, completed, closed
    delivery_status = Column(String, default="site_visited", nullable=False)  # site_visited, photos_taken, next_date_given, service_solved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer = relationship("User", foreign_keys=[customer_id])
    asset = relationship("Asset")
    assignment = relationship("JobAssignment", back_populates="request", uselist=False)
    delivery_updates = relationship("DeliveryUpdate", back_populates="request", order_by="DeliveryUpdate.updated_at.desc()")

class JobAssignment(Base):
    __tablename__ = "job_assignments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    engineer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending, accepted, rejected

    request = relationship("ServiceRequest", back_populates="assignment")
    engineer = relationship("User", foreign_keys=[engineer_id])
    assigner = relationship("User", foreign_keys=[assigned_by])

class JobUpdate(Base):
    __tablename__ = "job_updates"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class JobPhoto(Base):
    __tablename__ = "job_photos"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    photo_url = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User")

class DeliveryUpdate(Base):
    __tablename__ = "delivery_updates"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    status = Column(String, nullable=False)  # site_visited, photos_taken, next_date_given, service_solved
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("ServiceRequest", back_populates="delivery_updates")
    user = relationship("User")

class ProductOrder(Base):
    __tablename__ = "product_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False, index=True)   # tracking lookup key
    tracking_password = Column(String, nullable=False)             # plain-text, for customer lookup
    delivery_address = Column(String, nullable=False)
    order_date = Column(String, nullable=False)
    expected_delivery_date = Column(String, nullable=False)
    delivery_status = Column(String, default="pending", nullable=False)  # pending, dispatched, in_transit, delivered
    notes = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User")
```

### schemas/request.py
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RequestCreate(BaseModel):
    asset_id: int
    description: str
    urgency: str  # low, medium, high
    preferred_date: str
    preferred_time: str

class RequestResponse(BaseModel):
    id: int
    ticket_number: str
    customer_id: int
    asset_id: int
    description: str
    urgency: str
    preferred_date: str
    preferred_time: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AssignmentCreate(BaseModel):
    request_id: int
    engineer_id: int
    note: Optional[str] = ""

class AssignmentResponse(BaseModel):
    id: int
    request_id: int
    engineer_id: int
    assigned_by: int
    assigned_at: datetime
    accepted_at: Optional[datetime]
    status: str

    class Config:
        from_attributes = True

class DeliveryStatusUpdate(BaseModel):
    status: str  # photos_taken, next_date_given, service_solved
    notes: Optional[str] = None

class DeliveryUpdateResponse(BaseModel):
    id: int
    request_id: int
    status: str
    updated_by: int
    notes: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True
```

### dependencies/auth.py
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def require_role(*roles):
    """Dependency that checks if user has one of the required roles"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(roles)}"
            )
        return current_user
    return role_checker
```

### routers/auth.py
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.dependencies.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str  # customer, engineer, manager

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=pwd_context.hash(data.password),
        name=data.name,
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id})
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name, "role": current_user.role}
```

### routers/requests.py (Engineer Dual-Access: All Requests + Assigned Jobs)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.service_request import ServiceRequest, JobAssignment, JobUpdate, JobPhoto, Asset
from app.schemas.request import RequestCreate, RequestResponse
from app.dependencies.auth import get_current_user, require_role

router = APIRouter()

# ─── Ticket Number Generator ───────────────────────────
import random
def generate_ticket_number(db: Session) -> str:
    count = db.query(ServiceRequest).count() + 1
    return f"REQ-2024-{str(count).zfill(4)}"

# ─── GET /api/requests (Role-based filtering) ──────────
@router.get("/")
def get_requests(
    status: str = None,
    urgency: str = None,
    search: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns requests based on the user's role:
    - Customer: only their own requests
    - Engineer: only their assigned jobs (use GET /all for all requests)
    - Manager: all requests
    """
    query = db.query(ServiceRequest).options(
        joinedload(ServiceRequest.customer),
        joinedload(ServiceRequest.asset),
        joinedload(ServiceRequest.assignment),
    )

    if current_user.role == "customer":
        query = query.filter(ServiceRequest.customer_id == current_user.id)
    elif current_user.role == "engineer":
        # Engineer's assigned jobs only
        query = query.join(JobAssignment).filter(JobAssignment.engineer_id == current_user.id)
    # Manager sees all - no filter needed

    if status and status != "all":
        query = query.filter(ServiceRequest.status == status)
    if urgency and urgency != "all":
        query = query.filter(ServiceRequest.urgency == urgency)
    if search:
        query = query.filter(
            ServiceRequest.ticket_number.ilike(f"%{search}%") |
            ServiceRequest.description.ilike(f"%{search}%")
        )

    return query.order_by(ServiceRequest.created_at.desc()).all()

# ─── GET /api/requests/all (ALL requests - visible to engineers) ────
@router.get("/all")
def get_all_requests(
    status: str = None,
    urgency: str = None,
    current_user: User = Depends(require_role("engineer", "manager")),
    db: Session = Depends(get_db),
):
    """
    Returns ALL customer service requests.
    Accessible by engineers (to browse all requests) and managers.
    Engineers can view any request but can only work on assigned ones.
    """
    query = db.query(ServiceRequest).options(
        joinedload(ServiceRequest.customer),
        joinedload(ServiceRequest.asset),
        joinedload(ServiceRequest.assignment),
    )

    if status and status != "all":
        query = query.filter(ServiceRequest.status == status)
    if urgency and urgency != "all":
        query = query.filter(ServiceRequest.urgency == urgency)

    return query.order_by(ServiceRequest.created_at.desc()).all()

# ─── GET /api/requests/{id} (Details) ──────────────────
@router.get("/{request_id}")
def get_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Any authenticated user can view request details."""
    request = db.query(ServiceRequest).options(
        joinedload(ServiceRequest.customer),
        joinedload(ServiceRequest.asset),
        joinedload(ServiceRequest.assignment),
    ).filter(ServiceRequest.id == request_id).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Customers can only view their own requests
    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return request

# ─── POST /api/requests (Customer creates) ─────────────
@router.post("/", status_code=201)
def create_request(
    data: RequestCreate,
    current_user: User = Depends(require_role("customer")),
    db: Session = Depends(get_db),
):
    ticket = generate_ticket_number(db)
    request = ServiceRequest(
        ticket_number=ticket,
        customer_id=current_user.id,
        asset_id=data.asset_id,
        description=data.description,
        urgency=data.urgency,
        preferred_date=data.preferred_date,
        preferred_time=data.preferred_time,
        status="new",
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

# ─── PATCH /api/requests/{id}/status (Update status) ───
@router.patch("/{request_id}/status")
def update_status(
    request_id: int,
    status_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    new_status = status_data.get("status")
    valid_transitions = {
        "assigned": ["in_progress"],         # Engineer accepts
        "in_progress": ["completed"],        # Engineer completes
        "completed": ["closed"],             # Customer/Manager closes
    }

    if request.status in valid_transitions and new_status in valid_transitions[request.status]:
        request.status = new_status
        request.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(request)
        return request

    raise HTTPException(status_code=400, detail=f"Cannot transition from {request.status} to {new_status}")

# ─── POST /api/requests/{id}/updates (Add notes) ───────
@router.post("/{request_id}/updates")
def add_update(
    request_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    update = JobUpdate(
        request_id=request_id,
        user_id=current_user.id,
        notes=data["notes"],
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    return update

# ─── GET /api/requests/{id}/updates (Get history) ──────
@router.get("/{request_id}/updates")
def get_updates(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(JobUpdate).options(
        joinedload(JobUpdate.user)
    ).filter(
        JobUpdate.request_id == request_id
    ).order_by(JobUpdate.created_at.desc()).all()

# ─── POST /api/requests/{id}/photos (Upload) ───────────
@router.post("/{request_id}/photos")
def upload_photo(
    request_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # In production, handle file upload to Cloudinary here
    photo = JobPhoto(
        request_id=request_id,
        uploaded_by=current_user.id,
        photo_url=data.get("photo_url", ""),
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

# ─── GET /api/requests/{id}/photos (List) ──────────────
@router.get("/{request_id}/photos")
def get_photos(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(JobPhoto).options(
        joinedload(JobPhoto.uploader)
    ).filter(
        JobPhoto.request_id == request_id
    ).all()
```

### routers/delivery.py
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.service_request import ServiceRequest, DeliveryUpdate, JobUpdate
from app.schemas.request import DeliveryStatusUpdate, DeliveryUpdateResponse
from app.dependencies.auth import get_current_user, require_role

router = APIRouter()

# Valid delivery status transitions
DELIVERY_TRANSITIONS = {
    "site_visited": "photos_taken",
    "photos_taken": "next_date_given",
    "next_date_given": "service_solved",
}

DELIVERY_STATUS_LABELS = {
    "site_visited": "Site Visited",
    "photos_taken": "Photos Taken",
    "next_date_given": "Next Date Given",
    "service_solved": "Service Solved",
}

# ─── GET /api/requests/{id}/delivery (Get delivery history) ──
@router.get("/{request_id}/delivery")
def get_delivery_updates(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns delivery update history for a request."""
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Customers can only view their own requests
    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return db.query(DeliveryUpdate).options(
        joinedload(DeliveryUpdate.user)
    ).filter(
        DeliveryUpdate.request_id == request_id
    ).order_by(DeliveryUpdate.updated_at.desc()).all()

# ─── PATCH /api/requests/{id}/delivery (Update delivery status) ──
@router.patch("/{request_id}/delivery")
def update_delivery_status(
    request_id: int,
    data: DeliveryStatusUpdate,
    current_user: User = Depends(require_role("engineer", "manager")),
    db: Session = Depends(get_db),
):
    """
    Advance delivery status to the next stage.
    Only engineers and managers can update.
    Valid transitions: site_visited → photos_taken → next_date_given → service_solved
    """
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.status not in ("in_progress", "completed"):
        raise HTTPException(status_code=400, detail="Delivery can only be updated for in-progress or completed jobs")

    # Validate transition
    current_delivery = request.delivery_status or "site_visited"
    expected_next = DELIVERY_TRANSITIONS.get(current_delivery)
    if not expected_next or data.status != expected_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid delivery transition: {current_delivery} → {data.status}. Expected: {current_delivery} → {expected_next}"
        )

    # Update the service request delivery_status
    request.delivery_status = data.status
    request.updated_at = datetime.utcnow()

    # Create delivery update record
    delivery_update = DeliveryUpdate(
        request_id=request_id,
        status=data.status,
        updated_by=current_user.id,
        notes=data.notes,
    )
    db.add(delivery_update)

    # Also add a job update note for the timeline
    status_label = DELIVERY_STATUS_LABELS.get(data.status, data.status)
    note_text = f'Status updated to "{status_label}" by {current_user.name}.'
    if data.notes:
        note_text += f" Notes: {data.notes}"

    job_update = JobUpdate(
        request_id=request_id,
        user_id=current_user.id,
        notes=note_text,
    )
    db.add(job_update)

    db.commit()
    db.refresh(delivery_update)
    return delivery_update
```

### routers/product_orders.py
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.service_request import ProductOrder
from app.dependencies.auth import get_current_user, require_role
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# ─── Schemas ──────────────────────────────────────────
class ProductOrderCreate(BaseModel):
    product_name: str
    model: str
    quantity: int
    customer_name: str
    customer_email: str          # used as customer tracking lookup key
    tracking_password: str       # set by manager/admin, shared with customer
    delivery_address: str
    order_date: str
    expected_delivery_date: str
    notes: Optional[str] = None

class ProductOrderStatusUpdate(BaseModel):
    status: str  # pending, dispatched, in_transit, delivered
    notes: Optional[str] = None

class ProductOrderTrackRequest(BaseModel):
    email: str
    password: str

# Valid delivery status transitions
DELIVERY_TRANSITIONS = {
    "pending": "dispatched",
    "dispatched": "in_transit",
    "in_transit": "delivered",
    "delivered": None,
}

# Counter for order number generation (in production, use database sequence)
import threading
_order_counter = 1
_counter_lock = threading.Lock()

def generate_order_number() -> str:
    global _order_counter
    with _counter_lock:
        num = _order_counter
        _order_counter += 1
    return f"ORD-2024-{str(num).zfill(4)}"

# ─── GET /api/product-orders (List all product orders) ──
@router.get("/")
def get_all_product_orders(
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    """Returns all product orders, sorted by created_at desc."""
    orders = db.query(ProductOrder).order_by(ProductOrder.created_at.desc()).all()
    return orders

# ─── GET /api/product-orders/{id} (Get single order) ──
@router.get("/{order_id}")
def get_product_order(
    order_id: int,
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    """Returns a single product order by ID."""
    order = db.query(ProductOrder).filter(ProductOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Product order not found")
    return order

# ─── POST /api/product-orders (Create new order) ──
@router.post("/", status_code=201)
def create_product_order(
    data: ProductOrderCreate,
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    """Creates a new product order. Only managers and admins can create."""
    new_order = ProductOrder(
        order_number=generate_order_number(),
        product_name=data.product_name,
        model=data.model,
        quantity=data.quantity,
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        tracking_password=data.tracking_password,
        delivery_address=data.delivery_address,
        order_date=data.order_date,
        expected_delivery_date=data.expected_delivery_date,
        delivery_status="pending",
        notes=data.notes,
        created_by=current_user.id,
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

# ─── PATCH /api/product-orders/{id}/status (Update delivery status) ──
@router.patch("/{order_id}/status")
def update_product_order_status(
    order_id: int,
    data: ProductOrderStatusUpdate,
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    """
    Advance product order delivery status to the next stage.
    Valid transitions: pending → dispatched → in_transit → delivered
    """
    order = db.query(ProductOrder).filter(ProductOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Product order not found")

    # Validate transition
    current_status = order.delivery_status or "pending"
    expected_next = DELIVERY_TRANSITIONS.get(current_status)
    if not expected_next or data.status != expected_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid delivery transition: {current_status} → {data.status}. Expected: {current_status} → {expected_next}"
        )

    # Update the order
    order.delivery_status = data.status
    order.updated_at = datetime.utcnow()
    if data.notes is not None:
        order.notes = data.notes

    db.commit()
    db.refresh(order)
    return order

# ─── POST /api/product-orders/track (Customer lookup - no auth required) ──
@router.post("/track")
def track_product_order(
    data: ProductOrderTrackRequest,
    db: Session = Depends(get_db),
):
    """
    Public endpoint — no JWT required.
    Customer provides their email and tracking password to view their orders.
    Returns all matching orders for that email/password combination.
    """
    orders = db.query(ProductOrder).filter(
        ProductOrder.customer_email == data.email.lower(),
        ProductOrder.tracking_password == data.password,
    ).order_by(ProductOrder.created_at.desc()).all()

    if not orders:
        raise HTTPException(status_code=404, detail="No orders found. Please check your email and password.")

    return orders
```

### routers/assignments.py
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.service_request import ServiceRequest, JobAssignment, JobUpdate
from app.schemas.request import AssignmentCreate
from app.dependencies.auth import get_current_user, require_role

router = APIRouter()

# ─── POST /api/assignments (Manager assigns engineer) ──
@router.post("/", status_code=201)
def assign_engineer(
    data: AssignmentCreate,
    current_user: User = Depends(require_role("manager")),
    db: Session = Depends(get_db),
):
    """Manager assigns an engineer to a service request."""
    request = db.query(ServiceRequest).filter(ServiceRequest.id == data.request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    engineer = db.query(User).filter(User.id == data.engineer_id, User.role == "engineer").first()
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")

    # Check if already assigned
    existing = db.query(JobAssignment).filter(
        JobAssignment.request_id == data.request_id,
        JobAssignment.status != "rejected",
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Request already has an active assignment")

    assignment = JobAssignment(
        request_id=data.request_id,
        engineer_id=data.engineer_id,
        assigned_by=current_user.id,
        status="pending",
    )
    db.add(assignment)

    # Update request status to assigned
    request.status = "assigned"
    request.updated_at = datetime.utcnow()

    # Add assignment note
    if data.note:
        update = JobUpdate(
            request_id=data.request_id,
            user_id=current_user.id,
            notes=f"Assigned to {engineer.name}. Note: {data.note}",
        )
        db.add(update)

    db.commit()
    db.refresh(assignment)
    return assignment

# ─── PATCH /api/assignments/{id}/accept (Engineer accepts) ─
@router.patch("/{assignment_id}/accept")
def accept_assignment(
    assignment_id: int,
    current_user: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    """Engineer accepts an assigned job."""
    assignment = db.query(JobAssignment).filter(JobAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.engineer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This job is not assigned to you")

    assignment.status = "accepted"
    assignment.accepted_at = datetime.utcnow()

    # Update request status to in_progress
    request = db.query(ServiceRequest).filter(ServiceRequest.id == assignment.request_id).first()
    if request:
        request.status = "in_progress"
        request.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(assignment)
    return assignment

# ─── PATCH /api/assignments/{id}/reject (Engineer rejects) ─
@router.patch("/{assignment_id}/reject")
def reject_assignment(
    assignment_id: int,
    current_user: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    """Engineer rejects an assigned job. Request goes back to 'new' status."""
    assignment = db.query(JobAssignment).filter(JobAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.engineer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This job is not assigned to you")

    assignment.status = "rejected"

    # Revert request status back to new
    request = db.query(ServiceRequest).filter(ServiceRequest.id == assignment.request_id).first()
    if request:
        request.status = "new"
        request.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(assignment)
    return assignment

# ─── GET /api/assignments/engineers (List engineers) ────
@router.get("/engineers")
def get_engineers(
    current_user: User = Depends(require_role("manager")),
    db: Session = Depends(get_db),
):
    """Returns all engineers for the assignment dropdown."""
    return db.query(User).filter(User.role == "engineer").all()
```

### routers/dashboard.py
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.service_request import ServiceRequest, JobAssignment
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dashboard statistics based on user role:
    - Customer: stats for their own requests only
    - Engineer: stats for ALL requests (since all are visible to engineers)
    - Manager: stats for all requests
    """
    query = db.query(ServiceRequest)

    if current_user.role == "customer":
        query = query.filter(ServiceRequest.customer_id == current_user.id)
    # Engineer and Manager see stats for ALL requests

    requests = query.all()

    return {
        "total_requests": len(requests),
        "new_requests": len([r for r in requests if r.status == "new"]),
        "assigned_requests": len([r for r in requests if r.status == "assigned"]),
        "in_progress_requests": len([r for r in requests if r.status == "in_progress"]),
        "completed_requests": len([r for r in requests if r.status == "completed"]),
        "closed_requests": len([r for r in requests if r.status == "closed"]),
        "urgent_requests": len([r for r in requests if r.urgency == "high"]),
    }
```

### Backend requirements.txt
```
fastapi==0.109.0
uvicorn==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic-settings==2.1.0
python-multipart==0.0.6
cloudinary==1.38.0
alembic==1.13.1
```

---

## Engineer Dual-Access Architecture

The system provides two ways engineers interact with service requests:

### 1. All Customer Requests (Browse Mode)
- **API**: `GET /api/requests/all`
- **Access**: All engineers can see every customer request
- **Purpose**: Engineers can browse, understand workload, and view any request details
- **Frontend**: "All Customer Requests" section on dashboard + "All Requests" tab on jobs page

### 2. Assigned Jobs (Work Mode)
- **API**: `GET /api/requests` (filtered by engineer's assignments)
- **Access**: Only shows jobs specifically assigned to the logged-in engineer
- **Purpose**: Engineer's personal work queue with accept/reject/complete actions
- **Frontend**: "My Assigned Jobs" section on dashboard + "My Jobs" tab on jobs page

### How Assignment Works
```
                    ┌─────────────────────────────┐
                    │   ALL CUSTOMER REQUESTS      │
                    │   (Visible to ALL engineers) │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌────────────┐   ┌────────────┐   ┌────────────┐
     │  Manager   │   │  Engineer  │   │  Engineer  │
     │  assigns   │   │  can VIEW  │   │  can VIEW  │
     │  REQ-042   │   │  any req   │   │  any req   │
     │  to John   │   │  details   │   │  details   │
     └─────┬──────┘   └────────────┘   └────────────┘
           │
           ▼
     ┌─────────────────────────┐
     │  John's "My Jobs" queue │
     │  REQ-042 [Accept/Reject]│
     └─────────────────────────┘
```

### Key Rules
- **Viewing**: Any engineer can view any request's details (read-only)
- **Working**: Engineers can only accept/reject/update jobs assigned to them by a manager
- **Manager**: Can assign any unassigned request to any engineer
- **Status**: Only changes when engineer accepts (→ in_progress) or manager assigns (→ assigned)

---

---

## 🛠️ Technology Stack Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                      FULL STACK                                 │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────────── FRONTEND ────────────────────┐
  │                                                   │
  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
  │  │   React     │  │  TypeScript │  │  Vite    │ │
  │  │   v18.x     │  │    v5.x     │  │  v5.x    │ │
  │  └─────────────┘  └─────────────┘  └──────────┘ │
  │                                                   │
  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
  │  │  React      │  │  Tailwind   │  │  Axios   │ │
  │  │  Router     │  │    CSS      │  │          │ │
  │  └─────────────┘  └─────────────┘  └──────────┘ │
  │                                                   │
  └───────────────────────┬───────────────────────────┘
                          │
                ┌─────────▼─────────┐
                │   REST API (JWT)  │
                └─────────┬─────────┘
                          │
  ┌───────────────────────▼───────────────────────────┐
  │                    BACKEND                        │
  │                                                   │
  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
  │  │   FastAPI   │  │ SQLAlchemy  │  │  Pydantic│ │
  │  │   v0.11x    │  │    v2.x     │  │  v2.x    │ │
  │  └─────────────┘  └─────────────┘  └──────────┘ │
  │                                                   │
  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
  │  │  PyJWT      │  │   Alembic   │  │  Uvicorn │ │
  │  │  (Auth)     │  │ (Migration) │  │ (Server) │ │
  │  └─────────────┘  └─────────────┘  └──────────┘ │
  │                                                   │
  └───────────────────────┬───────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
  ┌───────────▼─────────┐  ┌─────────▼──────────┐
  │     DATABASE        │  │   FILE STORAGE     │
  │                     │  │                    │
  │  ┌──────────────┐   │  │  ┌──────────────┐  │
  │  │  PostgreSQL  │   │  │  │  Cloudinary  │  │
  │  │  (Neon)      │   │  │  │  (Images)    │  │
  │  └──────────────┘   │  │  └──────────────┘  │
  │                     │  │                    │
  └─────────────────────┘  └────────────────────┘

  ┌──────────────────── DEPLOYMENT ──────────────────┐
  │                                                   │
  │   Frontend → Vercel      (Free Tier)             │
  │   Backend  → Render      (Free Tier)             │
  │   Database → Neon        (Free Tier)             │
  │   Storage  → Cloudinary  (Free Tier)             │
  │                                                   │
  └───────────────────────────────────────────────────┘
```

---

## 🎯 Quick Reference Guide

### HTTP Status Codes Used
```
200 OK              - Successful GET request
201 Created         - Successful POST (resource created)
400 Bad Request     - Invalid input data
401 Unauthorized    - Invalid/missing token
403 Forbidden       - Valid token but insufficient permissions
404 Not Found       - Resource doesn't exist
422 Validation Error- Pydantic validation failed
500 Server Error    - Backend error
```

### Common API Patterns

**List Resources (with pagination)**
```
GET /api/requests?page=1&limit=10&status=new

Response:
{
  "data": [...],
  "total": 42,
  "page": 1,
  "pages": 5
}
```

**Create Resource**
```
POST /api/requests
Content-Type: application/json
Authorization: Bearer <token>

{
  "asset_id": 5,
  "description": "...",
  "urgency": "high",
  "preferred_date": "2024-03-15",
  "preferred_time": "10:00"
}

Response: 201 Created
{
  "id": 42,
  "ticket_number": "REQ-2024-0042",
  "preferred_date": "2024-03-15",
  "preferred_time": "10:00",
  ...
}
```

**Update Resource**
```
PATCH /api/requests/42/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "in_progress"
}

Response: 200 OK
{
  "id": 42,
  "status": "in_progress",
  ...
}
```

### Database Indexes (Performance)
```sql
-- Critical indexes for queries
CREATE INDEX idx_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_assignments_engineer ON job_assignments(engineer_id);
CREATE INDEX idx_photos_request ON job_photos(request_id);
CREATE INDEX idx_delivery_request ON delivery_updates(request_id);
CREATE INDEX idx_delivery_status ON delivery_updates(status);
```

### Environment Variables Reference

**Frontend (.env)**
```bash
VITE_API_BASE_URL=http://localhost:8000
# Production: https://your-backend.onrender.com
```

**Backend (.env)**
```bash
DATABASE_URL=postgresql://user:pass@host/db
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## College Project Features Showcase

### What Makes This Impressive for College:

1. **Full-Stack Development**
   - Modern frontend with React + TypeScript
   - RESTful API backend with FastAPI
   - Relational database design

2. **Real-World Concepts**
   - Role-based access control (RBAC)
   - JWT authentication
   - File upload handling
   - Status workflow management
   - Multi-step delivery tracking with progress visualization

3. **Cloud Deployment**
   - Frontend on Vercel (free)
   - Backend on Render/Railway (free)
   - Database on Neon (free)

4. **Professional Tools**
   - Git version control
   - Environment variables
   - API documentation (FastAPI auto-generates)
   - Responsive UI design

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT                              │
│                                                                 │
│  ┌──────────────┐              ┌──────────────┐               │
│  │   Frontend   │              │   Backend    │               │
│  │   (Local)    │              │   (Local)    │               │
│  │ localhost:   │─────────────▶│ localhost:   │               │
│  │   5173       │  API Calls   │   8000       │               │
│  └──────────────┘              └──────┬───────┘               │
│                                       │                         │
│                                       ▼                         │
│                              ┌─────────────────┐               │
│                              │  Local Postgres │               │
│                              │  (Docker)       │               │
│                              └─────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ git push
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GITHUB                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Repository: service-management-system                   │ │
│  │  • main branch                                           │ │
│  │  • Auto-deploy triggers                                  │ │
│  └───────────┬─────────────────────────┬────────────────────┘ │
└──────────────┼─────────────────────────┼──────────────────────┘
               │                         │
     ┌─────────▼─────────┐     ┌─────────▼─────────┐
     │                   │     │                   │
┌────▼────────────────┐  │  ┌──▼─────────────────────┐
│     VERCEL          │  │  │     RENDER/RAILWAY     │
│                     │  │  │                        │
│  Frontend Deploy    │  │  │  Backend Deploy        │
│  • Build: npm run   │  │  │  • Install deps        │
│    build            │  │  │  • Run migrations      │
│  • Output: dist/    │  │  │  • Start: uvicorn      │
│  • CDN Distribution │  │  │  • Auto HTTPS          │
│  • Auto HTTPS       │  │  │  • Health checks       │
│                     │  │  │                        │
│  URL:               │  │  │  URL:                  │
│  yourapp.vercel.app │  │  │  yourapp.onrender.com  │
└────┬────────────────┘  │  └──┬─────────────────────┘
     │                   │     │
     │  API Calls        │     │  DB Connection
     └───────────────────┼─────┤
                         │     │
                         │  ┌──▼──────────────────┐
                         │  │  NEON POSTGRES      │
                         │  │                     │
                         │  │  • Free Tier        │
                         │  │  • Auto Backup      │
                         │  │  • Connection Pool  │
                         │  └──┬──────────────────┘
                         │     │
                         │  ┌──▼──────────────────┐
                         │  │  CLOUDINARY         │
                         │  │                     │
                         │  │  • Image Storage    │
                         │  │  • CDN Delivery     │
                         │  │  • Auto Optimize    │
                         │  └─────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                        PRODUCTION                                │
│                                                                  │
│  User Browser → Vercel CDN → React App                          │
│                      ↓                                           │
│                  API Request                                     │
│                      ↓                                           │
│               Render Backend                                     │
│                      ↓                                           │
│            Neon DB + Cloudinary                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Simplified Deployment Plan

### Step 1: Frontend (Vercel)
```bash
# Build command
npm run build

# Output directory
dist

# Environment variables
VITE_API_BASE_URL=https://your-backend.onrender.com
```

### Step 2: Backend (Render)
```bash
# Build command
pip install -r requirements.txt

# Start command
uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Environment variables
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
```

### Step 3: Database (Neon)
- Create free PostgreSQL database
- Copy connection string
- Run migrations

---

---

## 📋 Complete Job Lifecycle (Data Flow)

```
DAY 1 - CUSTOMER CREATES REQUEST
════════════════════════════════

┌──────────────┐
│  CUSTOMER    │  Creates request for broken AC
└──────┬───────┘
       │
       ▼
┌───────────────────────────────────────┐
│  service_requests table               │
│  ────────────────────────────────────│
│  id: 42                               │
│  ticket: REQ-2024-0042               │
│  customer_id: 10                      │
│  asset_id: 5 (AC Unit - Office 201)  │
│  description: "AC not cooling"        │
│  urgency: HIGH                        │
│  preferred_date: 2024-03-15           │
│  preferred_time: 10:00 AM             │
│  status: NEW ◄─────────────────────  │
│  created_at: 2024-03-14 09:00        │
└───────────────────────────────────────┘


DAY 1 - MANAGER ASSIGNS JOB
════════════════════════════

┌──────────────┐
│   MANAGER    │  Assigns to Engineer John
└──────┬───────┘
       │
       ▼
┌───────────────────────────────────────┐   ┌──────────────────────────┐
│  service_requests                     │   │  job_assignments         │
│  ─────────────────────────────────   │   │  ───────────────────────│
│  id: 42                               │   │  id: 15                  │
│  status: NEW → ASSIGNED ◄────────────│───│  request_id: 42          │
│  updated_at: 2024-03-14 10:00        │   │  engineer_id: 25 (John)  │
└───────────────────────────────────────┘   │  assigned_by: 3 (Sarah)  │
                                            │  status: pending         │
                                            │  assigned_at: 10:00      │
                                            └──────────────────────────┘


DAY 1 - ENGINEER ACCEPTS JOB
═════════════════════════════

┌──────────────┐
│  ENGINEER    │  John accepts assignment
│   (John)     │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐   ┌──────────────────────────────┐
│  job_assignments            │   │  service_requests            │
│  ──────────────────────────│   │  ───────────────────────────│
│  id: 15                     │   │  id: 42                      │
│  status: pending → accepted │───│  status: ASSIGNED →          │
│  accepted_at: 10:30         │   │          IN_PROGRESS         │
└─────────────────────────────┘   │  updated_at: 2024-03-14      │
                                  │              10:30           │
                                  └──────────────────────────────┘


DAY 2 - ENGINEER WORKS ON JOB
══════════════════════════════

┌──────────────┐
│  ENGINEER    │  Arrives at site, diagnoses issue
│   (John)     │  Finds: Refrigerant leak + filter clogged
└──────┬───────┘
       │
       ▼
┌───────────────────────────────────────────────┐
│  job_updates table                            │
│  ────────────────────────────────────────────│
│  id: 101                                      │
│  request_id: 42                               │
│  user_id: 25 (John)                           │
│  notes: "Found refrigerant leak and clogged   │
│          filter. Replacing filter and fixing  │
│          leak. ETA 2 hours."                  │
│  created_at: 2024-03-15 09:30                 │
└───────────────────────────────────────────────┘


DAY 2 - ENGINEER UPLOADS PHOTOS
════════════════════════════════

┌──────────────┐
│  ENGINEER    │  Takes photos: Before, During, After
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────┐
│  CLOUDINARY (Image Storage)            │
│  ──────────────────────────────────── │
│  Image 1: before-repair-042.jpg        │
│  Image 2: during-repair-042.jpg        │
│  Image 3: after-repair-042.jpg         │
└───────┬────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────┐
│  job_photos table                                  │
│  ─────────────────────────────────────────────────│
│  id: 201 | request_id: 42 | uploaded_by: 25       │
│  photo_url: cloudinary.com/.../before-042.jpg      │
│  uploaded_at: 2024-03-15 11:00                     │
│                                                    │
│  id: 202 | request_id: 42 | uploaded_by: 25       │
│  photo_url: cloudinary.com/.../during-042.jpg      │
│                                                    │
│  id: 203 | request_id: 42 | uploaded_by: 25       │
│  photo_url: cloudinary.com/.../after-042.jpg       │
└────────────────────────────────────────────────────┘


DAY 2 - JOB COMPLETED
══════════════════════

┌──────────────┐
│  ENGINEER    │  Marks job as complete
└──────┬───────┘
       │
       ▼
┌───────────────────────────────────────────────┐
│  service_requests                             │
│  ────────────────────────────────────────────│
│  id: 42                                       │
│  status: IN_PROGRESS → COMPLETED             │
│  updated_at: 2024-03-15 12:00                 │
└───────────────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────────┐
│  job_updates                                  │
│  ────────────────────────────────────────────│
│  id: 102                                      │
│  request_id: 42                               │
│  user_id: 25 (John)                           │
│  notes: "Job completed. Fixed refrigerant     │
│          leak, replaced filter, tested AC -   │
│          now cooling properly."               │
│  created_at: 2024-03-15 12:00                 │
└───────────────────────────────────────────────┘


DAY 3 - MANAGER CLOSES JOB
═══════════════════════════

┌──────────────┐
│   MANAGER    │  Reviews work, closes job
└──────┬───────┘
       │
       ▼
┌───────────────────────────────────────────────┐
│  service_requests                             │
│  ────────────────────────────────────────────│
│  id: 42                                       │
│  status: COMPLETED → CLOSED                  │
│  updated_at: 2024-03-16 09:00                 │
└───────────────────────────────────────────────┘

FINAL STATE: Job closed, customer notified ✓
```

---

## 📊 Dashboard Statistics Calculation

```
MANAGER DASHBOARD
═════════════════

Query 1: Total Jobs by Status
┌─────────────────────────────────────┐
│ SELECT status, COUNT(*)             │
│ FROM service_requests               │
│ GROUP BY status                     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  RESULTS:                           │
│  ──────────────────────────────────│
│  NEW           → 5 jobs             │
│  ASSIGNED      → 8 jobs             │
│  IN_PROGRESS   → 12 jobs            │
│  COMPLETED     → 3 jobs             │
│  CLOSED        → 45 jobs            │
└─────────────────────────────────────┘


Query 2: Jobs by Urgency
┌─────────────────────────────────────┐
│ SELECT urgency, COUNT(*)            │
│ FROM service_requests               │
│ WHERE status != 'CLOSED'            │
│ GROUP BY urgency                    │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  RESULTS:                           │
│  ──────────────────────────────────│
│  HIGH    → 4 jobs (Needs attention) │
│  MEDIUM  → 15 jobs                  │
│  LOW     → 9 jobs                   │
└─────────────────────────────────────┘


Query 3: Average Completion Time
┌─────────────────────────────────────┐
│ SELECT AVG(                         │
│   updated_at - created_at           │
│ ) as avg_time                       │
│ FROM service_requests               │
│ WHERE status = 'CLOSED'             │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  RESULT: 2.3 days average           │
└─────────────────────────────────────┘


DISPLAYED AS:
┌────────────────────────────────────────┐
│      MANAGER DASHBOARD                 │
├────────────────────────────────────────┤
│                                        │
│  📊 Overview                           │
│  ─────────────────────────────────    │
│  Active Jobs:        28               │
│  Pending Review:     3                │
│  Avg. Completion:    2.3 days         │
│                                        │
│  🚨 Urgent Jobs:     4                │
│                                        │
│  📈 By Status:                         │
│     New:          ████ 5              │
│     Assigned:     ███████ 8           │
│     In Progress:  ████████████ 12     │
│     Completed:    ██ 3                │
│                                        │
└────────────────────────────────────────┘
```

---

## Development Timeline (College Project)

### Week 1-2: Setup & Backend Core
- Setup project structure
- Database models and migrations
- Auth endpoints (login/register)
- Basic CRUD for service requests

### Week 3-4: Backend Complete
- Assignment logic
- Job updates and photos
- Dashboard stats API
- Testing with Postman

### Week 5-6: Frontend Core
- Login/Register pages
- Dashboard layouts for each role
- Create service request form
- Request list views

### Week 7-8: Frontend Complete & Integration
- Job assignment UI (manager)
- Job execution UI (engineer)
- Photo upload
- Status updates

### Week 9: Deployment
- Deploy backend to Render
- Deploy frontend to Vercel
- Configure environment variables
- Test end-to-end

### Week 10: Documentation & Polish
- README.md with screenshots
- API documentation
- User manual
- Presentation preparation

---

---

## 🖥️ UI Mockups (Screens Preview)

### Login Screen
```
┌────────────────────────────────────────────┐
│                                            │
│       SERVICE MANAGEMENT SYSTEM            │
│                                            │
│    ┌──────────────────────────────┐       │
│    │                              │       │
│    │  📧 Email                    │       │
│    │  ┌────────────────────────┐  │       │
│    │  │ user@example.com       │  │       │
│    │  └────────────────────────┘  │       │
│    │                              │       │
│    │  🔒 Password                 │       │
│    │  ┌────────────────────────┐  │       │
│    │  │ ••••••••••             │  │       │
│    │  └────────────────────────┘  │       │
│    │                              │       │
│    │     [ LOGIN ]                │       │
│    │                              │       │
│    │     Don't have account?      │       │
│    │     Register here            │       │
│    │                              │       │
│    └──────────────────────────────┘       │
│                                            │
└────────────────────────────────────────────┘
```

### Customer Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  SERVICE PORTAL          👤 John Doe (Customer)  [Logout]   │
├─────────────────────────────────────────────────────────────┤
│  📊 Dashboard  |  📝 My Requests  |  🏢 Assets              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OVERVIEW                        [ + New Request ]         │
│  ─────────────────────────────────────────────────         │
│                                                             │
│  📂 Active Requests: 3          ✅ Completed: 12           │
│                                                             │
│  MY REQUESTS                                                │
│  ─────────────────────────────────────────────────         │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ REQ-2024-0042  🔴 HIGH                            │    │
│  │ AC Unit not cooling - Office 201                   │    │
│  │ Status: IN PROGRESS                                │    │
│  │ Engineer: John Smith                               │    │
│  │ Scheduled: Mar 15, 2024 at 10:00 AM               │    │
│  │ Created: Mar 14, 2024                              │    │
│  │                           [View Details]           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ REQ-2024-0038  🟡 MEDIUM                          │    │
│  │ Printer jammed - Floor 3                          │    │
│  │ Status: ASSIGNED                                   │    │
│  │ Engineer: Sarah Lee                                │    │
│  │ Created: Mar 12, 2024                              │    │
│  │                           [View Details]           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Create Service Request Form
```
┌─────────────────────────────────────────────────────────────┐
│  CREATE NEW SERVICE REQUEST                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Select Asset *                                             │
│  ┌────────────────────────────────────────────────┐        │
│  │ AC Unit - Office 201 (Serial: AC-2021-045) ▼  │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  Urgency Level *                                            │
│  ┌────────────────────────────────────────────────┐        │
│  │ ○ Low    ○ Medium    ● High                   │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  Preferred Visit Date & Time *                              │
│  ┌────────────────────┐   ┌─────────────────────┐         │
│  │ 📅 2024-03-15     │   │ 🕐 10:00 AM      ▼ │         │
│  └────────────────────┘   └─────────────────────┘         │
│                                                             │
│  Problem Description *                                      │
│  ┌────────────────────────────────────────────────┐        │
│  │ The AC unit is running but not cooling         │        │
│  │ properly. Room temperature is 28°C.            │        │
│  │ Started yesterday afternoon.                   │        │
│  │                                                │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  Attach Files (optional)                                    │
│  ┌────────────────────────────────────────────────┐        │
│  │  📎 Drop files or click to upload              │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│              [ Cancel ]    [ Submit Request ]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Engineer: Job Details & Update
```
┌─────────────────────────────────────────────────────────────┐
│  JOB DETAILS: REQ-2024-0042                                 │
├─────────────────────────────────────────────────────────────┤
│  ◀ Back to Jobs                                             │
│                                                             │
│  STATUS: IN PROGRESS        Priority: 🔴 HIGH              │
│  ───────────────────────────────────────────────────       │
│                                                             │
│  ASSET INFORMATION                                          │
│  ─────────────────                                          │
│  Asset: AC Unit - Office 201                                │
│  Model: Carrier 24ABC6                                      │
│  Serial: AC-2021-045                                        │
│  Location: Building A, Floor 2, Office 201                  │
│                                                             │
│  REQUESTED VISIT                                            │
│  ────────────────                                           │
│  📅 Date: March 15, 2024                                    │
│  🕐 Time: 10:00 AM                                          │
│                                                             │
│  PROBLEM                                                    │
│  ───────                                                    │
│  "The AC unit is running but not cooling properly.          │
│   Room temperature is 28°C. Started yesterday."             │
│                                                             │
│  TIMELINE                                                   │
│  ────────                                                   │
│  ⏰ Mar 14, 09:00 - Request created by Jane Smith           │
│  ⏰ Mar 14, 10:00 - Assigned to you by Manager Sarah        │
│  ⏰ Mar 14, 10:30 - You accepted the job                    │
│  ⏰ Mar 15, 09:30 - Update: "Found refrigerant leak..."     │
│                                                             │
│  PHOTOS (3)                                                 │
│  ───────                                                    │
│  ┌───────┐ ┌───────┐ ┌───────┐                            │
│  │ 📷    │ │ 📷    │ │ 📷    │                            │
│  │Before │ │During │ │After  │                            │
│  └───────┘ └───────┘ └───────┘                            │
│             [ + Upload Photo ]                              │
│                                                             │
│  ADD UPDATE                                                 │
│  ──────────                                                 │
│  ┌────────────────────────────────────────────────┐        │
│  │ Type your update notes here...                 │        │
│  └────────────────────────────────────────────────┘        │
│              [ Add Note ]    [ Mark as Completed ]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Manager Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  MANAGER PORTAL      👤 Sarah Manager          [Logout]     │
├─────────────────────────────────────────────────────────────┤
│  📊 Dashboard  |  📋 All Jobs  |  👥 Engineers  |  📈 Stats│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OVERVIEW                                                   │
│  ─────────────────────────────────────────────────         │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   🆕 NEW     │ │ 🔧 ACTIVE    │ │ ✅ COMPLETED │       │
│  │      5       │ │     28       │ │      3       │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
│  🚨 URGENT JOBS (4)                                         │
│  ─────────────────────────────────────────────────         │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ REQ-042 │ AC not cooling    │ UNASSIGNED │ [Assign]│    │
│  │ REQ-038 │ Printer jammed    │ Sarah Lee  │ [View]  │    │
│  │ REQ-035 │ Network down      │ John Smith │ [View]  │    │
│  │ REQ-031 │ Phone not working │ UNASSIGNED │ [Assign]│    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ENGINEER STATUS                                            │
│  ─────────────────────────────────────────────────         │
│                                                             │
│  👤 John Smith    : 3 active jobs                          │
│  👤 Sarah Lee     : 5 active jobs  🔥 BUSY                 │
│  👤 Mike Johnson  : 2 active jobs                          │
│  👤 Amy Chen      : 1 active job   ✅ AVAILABLE            │
│                                                             │
│  📊 STATISTICS (Last 30 days)                              │
│  ─────────────────────────────────────────────────         │
│                                                             │
│  Total Jobs Completed: 45                                   │
│  Average Completion Time: 2.3 days                          │
│  First Time Fix Rate: 87%                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Assign Job Dialog
```
┌────────────────────────────────────────────┐
│  ASSIGN JOB: REQ-2024-0042                 │
├────────────────────────────────────────────┤
│                                            │
│  Job: AC not cooling - Office 201          │
│  Priority: HIGH                            │
│                                            │
│  Select Engineer                           │
│  ┌──────────────────────────────────────┐ │
│  │ John Smith (3 active jobs)        ▼ │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Available Engineers:                      │
│  • John Smith   - 3 jobs                   │
│  • Sarah Lee    - 5 jobs (Busy)            │
│  • Mike Johnson - 2 jobs                   │
│  • Amy Chen     - 1 job  ✅ Available      │
│                                            │
│  Assignment Notes (optional)               │
│  ┌──────────────────────────────────────┐ │
│  │ Urgent - Customer VIP               │ │
│  └──────────────────────────────────────┘ │
│                                            │
│     [ Cancel ]      [ Assign Job ]        │
│                                            │
└────────────────────────────────────────────┘
```

---

## Removed Features (For Simplicity)

❌ Digital signatures
❌ PDF generation
❌ Parts management
❌ Detailed checklist templates
❌ Complex KPI calculations
❌ Supplier integration
❌ Email notifications
❌ Advanced search/filters
❌ Audit logs
❌ Multiple sites management

---

## 📊 Original vs Simplified Comparison

| Aspect | Original Design | Simplified (College) |
|--------|----------------|---------------------|
| **Database Tables** | 20+ tables | 6 core tables |
| **Job States** | 10 states | 5 states |
| **User Roles** | 4+ roles | 3 roles (Customer, Engineer, Manager) |
| **File Storage** | S3/R2 + PDF generation | Cloudinary (images only) |
| **Features** | Full enterprise suite | Core workflow only |
| **Complexity** | Production-ready | Learning-focused |
| **Development Time** | 6+ months | 8-10 weeks |
| **Code Lines** | 10,000+ | 3,000-4,000 |
| **APIs** | 30+ endpoints | 15 endpoints |
| **Testing** | Unit + Integration + E2E | Basic testing |
| **Notifications** | Email + SMS + Push | In-app only |
| **Reports** | PDF generation + Analytics | Simple dashboard |
| **Parts Management** | Full workflow | ❌ Removed |
| **Digital Signature** | Legal-grade signatures | ❌ Removed |
| **Multi-tenancy** | Full isolation | Single organization |
| **Audit Logs** | Complete trail | ❌ Removed |

### What We Kept (Core Value)
✅ User authentication with roles
✅ Service request lifecycle
✅ Job assignment workflow
✅ Engineer acceptance/rejection
✅ Status tracking
✅ Photo uploads
✅ Work notes/updates
✅ Basic dashboard statistics
✅ Role-based access control
✅ **Preferred visit date/time selection** (Customer convenience)

### Important Feature: Preferred Visit Schedule
Customers can now specify their preferred date and time when creating a service request. This helps:
- Engineers plan their schedule better
- Customers ensure someone is available on-site
- Reduce missed appointments
- Improve overall service experience

The system stores `preferred_date` and `preferred_time` in the database and displays it to engineers when they view job details.

### What Makes This College-Appropriate
- **Manageable scope**: Can be completed in 8-10 weeks
- **Learning focus**: Covers all important concepts without overwhelming complexity
- **Impressive enough**: Full-stack, cloud-deployed, real-world workflow
- **Understandable**: You can explain every line of code
- **Portfolio-ready**: Shows modern development skills
- **Extendable**: Easy to add features later if time permits

---

## Demo Scenarios for Presentation

### Scenario 1: Customer Flow
1. Customer logs in
2. Creates service request for equipment
3. Selects preferred visit date and time
4. Views request status
5. Sees engineer updates
6. Views completed job with photos

### Scenario 2: Manager Flow
1. Manager logs in
2. Views all new requests
3. Assigns job to engineer
4. Monitors job progress
5. Views dashboard statistics

### Scenario 3: Engineer Flow
1. Engineer logs in
2. Sees dashboard with two sections: "My Assigned Jobs" and "All Customer Requests"
3. Can browse all customer requests and view details for any request
4. Sees assigned job with preferred visit schedule
5. Accepts job
6. Updates status to "In Progress"
7. Adds work notes
8. Uploads photos
9. Marks as completed

---

## Success Criteria

✅ Users can register and login
✅ Customers can create requests
✅ Managers can assign jobs
✅ Engineers can accept and complete jobs
✅ Photos can be uploaded
✅ Status updates are visible to all parties
✅ Basic dashboard shows counts
✅ Deployed and accessible online

---

## Tech Stack Recommendation for College

**Easiest Setup:**
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI
- Database: Supabase (includes PostgreSQL + Storage + Auth helpers)
- Deployment: Vercel (frontend) + Render (backend)

**Why This Stack:**
- Fast development
- Great documentation
- Free deployment
- Looks professional
- Good for resume/portfolio

---

## Next Steps

1. Review this simplified scope
2. Setup project repositories (frontend + backend)
3. Choose UI library (Tailwind vs MUI)
4. Setup database (Neon or Supabase)
5. Start with backend authentication
6. Build incrementally, test frequently

**Estimated Development Time:** 8-10 weeks (part-time college project)

**Lines of Code:** ~3000-4000 (manageable for understanding every line)

---

## Presentation Tips

1. **Demo user journeys** (all three roles)
2. **Show architecture diagram** (simple boxes and arrows)
3. **Explain database schema** (ERD with 6 tables)
4. **Highlight tech choices** (why FastAPI, React, etc.)
5. **Discuss challenges faced** (CORS, JWT, file upload, etc.)
6. **Future enhancements** (what you'd add with more time)

---

## 📝 Project Summary

### What This Project Demonstrates

**Technical Skills:**
- Full-stack development (Frontend + Backend + Database)
- REST API design and implementation
- Authentication & Authorization (JWT + RBAC)
- File upload handling
- Database modeling and relationships
- State management in React
- Form handling and validation
- Cloud deployment

**Software Engineering Concepts:**
- User flow design
- State machine (job workflow)
- Role-based access control
- API security
- Data modeling
- Version control (Git)
- Environment configuration
- CI/CD basics

**Real-World Application:**
- Solves actual business problem
- Multi-user collaboration
- Asset management
- Service lifecycle tracking
- Accountability and transparency

---

## ✅ Pre-Presentation Checklist

### Before Your Demo

- [ ] All three user roles have demo accounts (customer, engineer, manager)
- [ ] Sample data populated (5+ service requests, 3+ assets)
- [ ] At least one complete job lifecycle in the system
- [ ] Photos uploaded for demonstration
- [ ] All pages load without errors
- [ ] Mobile-responsive design works
- [ ] Backend API is live and responding
- [ ] Database has stable connection
- [ ] No console errors in browser
- [ ] README.md is complete with screenshots
- [ ] Code is commented (at least complex sections)
- [ ] Git commits have meaningful messages
- [ ] Environment variables documented

### Demo Flow Preparation

1. **Login as Customer** (2 minutes)
   - Show dashboard
   - Create new service request
   - Show status tracking

2. **Login as Manager** (2 minutes)
   - Show all jobs view
   - Assign job to engineer
   - Show statistics

3. **Login as Engineer** (3 minutes)
   - Accept assignment
   - Update status
   - Add notes
   - Upload photos
   - Mark as completed

4. **Architecture Explanation** (2 minutes)
   - Show diagram
   - Explain tech stack
   - Highlight cloud services

5. **Q&A Preparation** (anticipated questions)
   - Why did you choose this tech stack?
   - How does authentication work?
   - How are photos stored?
   - How would you scale this?
   - What would you add next?
   - What was the biggest challenge?

---

## 🚀 Getting Started (Next Steps)

### Immediate Actions

1. **Review and Approve Simplified Scope**
   - Confirm 6-table design is acceptable
   - Verify removed features are okay
   - Ensure timeline fits your schedule

2. **Setup Development Environment**
   ```bash
   # Create project directories
   mkdir service-management-system
   cd service-management-system
   mkdir frontend backend
   ```

3. **Initialize Git Repository**
   ```bash
   git init
   git remote add origin <your-repo-url>
   ```

4. **Create Free Accounts**
   - GitHub account (code repository)
   - Vercel account (frontend hosting)
   - Render account (backend hosting)
   - Neon account (database)
   - Cloudinary account (image storage)

5. **Backend First Approach** (Recommended)
   - Setup FastAPI project
   - Create database models
   - Implement authentication
   - Build API endpoints
   - Test with Postman/Insomnia

6. **Then Frontend**
   - Setup React + Vite project
   - Create login page
   - Implement dashboard layouts
   - Connect to backend APIs
   - Add forms and interactions

---

## 📚 Learning Resources

**FastAPI:**
- Official Docs: https://fastapi.tiangolo.com
- FastAPI Tutorial: Full-stack FastAPI and PostgreSQL

**React:**
- Official Docs: https://react.dev
- React TypeScript Cheatsheet

**Database:**
- SQLAlchemy Docs: https://docs.sqlalchemy.org
- PostgreSQL Tutorial

**Deployment:**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs

---

## 💡 Tips for Success

1. **Start Small, Iterate**: Get basic login working first, then add features incrementally
2. **Test Frequently**: Test each feature before moving to the next
3. **Commit Often**: Make git commits after every working feature
4. **Document as You Go**: Don't save documentation for the end
5. **Ask for Help**: Use Stack Overflow, Discord communities, and documentation
6. **Time Management**: Allocate time for unexpected debugging
7. **Keep It Simple**: Resist the urge to add complex features
8. **Focus on Core**: Perfect the main workflow before adding extras
9. **User Experience**: Make the UI intuitive and clean
10. **Prepare for Demo**: Practice your presentation multiple times

---

## ⚠️ Common Pitfalls to Avoid

1. **Over-engineering**: Don't add features not in the scope
2. **Poor time management**: Don't spend 6 weeks on backend, 2 on frontend
3. **No testing**: Test on different browsers and screen sizes
4. **Ignoring errors**: Fix console errors and warnings
5. **Poor git practices**: Commit regularly with meaningful messages
6. **Hardcoded values**: Use environment variables
7. **No error handling**: Handle edge cases and errors gracefully
8. **Last-minute deployment**: Deploy early and often
9. **No backup**: Keep multiple backup copies of your code
10. **Skipping documentation**: Document while building, not after

---

## 🎓 Project Grading Criteria (Typical)

**Technical Implementation (40%)**
- Working full-stack application
- Proper database design
- API functionality
- Authentication/Authorization
- Code quality and organization

**Features & Functionality (30%)**
- All core features working
- User flows complete
- Role-based access working
- File upload functional

**Deployment & Demo (15%)**
- Successfully deployed online
- Live demonstration
- No critical bugs during demo

**Documentation (10%)**
- README.md complete
- Code comments
- API documentation
- User manual

**Presentation (5%)**
- Clear explanation
- Architecture understanding
- Question handling

---

## 🏆 Success Metrics

Your project is successful if:

✅ Three different users can login (customer, engineer, manager)
✅ A customer can create a service request
✅ A manager can assign it to an engineer
✅ An engineer can accept, update, and complete the job
✅ Photos can be uploaded and displayed
✅ Status tracking works throughout
✅ Dashboard shows accurate counts
✅ The app is deployed and accessible via URL
✅ You can explain how every part works
✅ Demo runs smoothly without crashes

---

## 🎉 Final Words

This simplified version gives you:
- **Realistic scope** for a college project
- **Impressive tech stack** for your resume
- **Complete learning** of full-stack development
- **Working product** you can show to potential employers
- **Strong foundation** for future enhancements

Remember: A simple project done **really well** is better than a complex project done poorly.

Good luck with your project! 🎓
