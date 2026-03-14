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
- Manager assigns job to engineer
- Engineer can accept/reject
- Job status tracking (5 simple states)

### 4. Simple Job Execution
- Engineer updates job status
- Add work notes/comments
- Upload photos (1-3 images max)
- Mark job as completed

### 5. Basic Dashboard
- Customer: View my requests and status
- Engineer: View assigned jobs
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
```

**Relationships:**
- One Customer (user) → Many Assets
- One Customer (user) → Many Service Requests
- One Asset → Many Service Requests
- One Service Request → One Job Assignment
- One Service Request → Many Job Updates
- One Service Request → Many Job Photos
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
┌─────────────────┐
│   Dashboard     │
│ • My Requests   │
│ • Create New    │
└────┬────────┬───┘
     │        │
     │        └──────────┐
     │                   ▼
     │            ┌──────────────────┐
     │            │ Create Request   │
     │            │ • Select Asset   │
     │            │ • Description    │
     │            │ • Urgency        │
     │            │ • Submit         │
     │            └────────┬─────────┘
     │                     │
     │            ┌────────▼─────────┐
     │            │ Ticket Generated │
     │            │ (e.g., REQ-2024) │
     │            └────────┬─────────┘
     │                     │
     ▼                     ▼
┌─────────────────────────────────┐
│     View Request Details        │
│ • Status: NEW/ASSIGNED/etc.     │
│ • Assigned Engineer (if any)    │
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
┌──────────────────┐
│   Dashboard      │
│ • Assigned Jobs  │
│ • Pending (2)    │
│ • Active (3)     │
└────┬─────────────┘
     │
     ▼
┌────────────────────┐
│  Job Assignment    │
│  Notification      │
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
│     ✓ user_id: 10, role: "customer"                        │
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
│     • Generate ticket_number: "REQ-2024-0042"              │
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
│    'REQ-2024-0042', 10, 5,                                 │
│    'AC not cooling', 'high',                               │
│    '2024-03-15', '10:00',                                  │
│    'new', '2024-03-14 10:30'                               │
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
│    ticket_number: "REQ-2024-0042",                         │
│    customer_id: 10,                                         │
│    asset_id: 5,                                             │
│    description: "AC not cooling",                           │
│    urgency: "high",                                         │
│    preferred_date: "2024-03-15",                            │
│    preferred_time: "10:00",                                 │
│    status: "new",                                           │
│    created_at: "2024-03-14T10:30:00Z"                      │
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
│  • Show ticket number: REQ-2024-0042                       │
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

## Simplified Data Model (6 Core Tables)

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

---

## Simplified API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Service Requests
- POST `/api/requests` (customer creates)
- GET `/api/requests` (list with filters by role)
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
│   ├── engineer/
│   │   ├── AssignedJobs.tsx
│   │   └── JobDetails.tsx
│   └── manager/
│       ├── AllJobs.tsx
│       └── AssignJob.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── RequestsPage.tsx
│   └── JobDetailsPage.tsx
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
│   ├── requests.py
│   ├── assignments.py
│   └── dashboard.py
├── dependencies/
│   └── auth.py (JWT verification)
└── utils/
    └── security.py (password hashing)
```

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
2. Sees assigned job with preferred visit schedule
3. Accepts job
4. Updates status to "In Progress"
5. Adds work notes
6. Uploads photos
7. Marks as completed

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
