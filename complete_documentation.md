# Two-Portal Service Management System

## 1. Purpose
This document defines a complete, simple, and implementation-ready blueprint for building and deploying a Two-Portal Service Management platform.

It covers:
- Full functional scope
- Portal roles and access
- Recommended architecture
- Database decision (MySQL vs MongoDB, plus free-tier practical choice)
- API and data model outline
- Workflow diagrams
- Security and audit design
- Zero-cost deployment strategy
- Phased delivery and verification

---

## 2. Portal Vision
Build a centralized digital service lifecycle system with two portals:
- Customer Portal: request creation, status tracking, asset visibility, sign-off
- Internal Service Portal: dispatch, assignment, engineering execution, parts control, KPI monitoring

Outcome:
- Faster service closure
- Better visibility and accountability
- Standardized test/calibration process
- Evidence-backed completion reports
- Management KPIs in one place

---

## 3. Minimum Required Capabilities
The platform includes all required features listed in your request.

### 3.1 Service Request Intake
- Customer creates request
- Select asset/site
- Describe issue and urgency
- Attach supporting files/photos
- Auto-generate ticket number and SLA target

### 3.2 Central Job Workflow
Standard job states:
- new
- triaged
- assigned
- accepted
- in_progress
- waiting_parts
- calibration_test
- pending_signoff
- completed
- closed

### 3.3 Engineer Assignment and Acceptance
- Dispatcher/manager assigns engineer
- Engineer accepts/rejects assignment
- Rejection requires reason

### 3.4 Asset Record and Service History
- Asset master record
- Full intervention timeline
- Previous tests/calibration history

### 3.5 Test/Calibration Checklist
- Checklist templates by asset type/model
- Measured values with pass/fail
- Comments and exceptions

### 3.6 Photo and Evidence Upload
- Evidence uploaded to object storage
- Metadata in DB: file hash, uploader, timestamp, job reference

### 3.7 Parts Request + Supplier-Controlled Ordering Link
- Engineer raises parts request
- Approval flow by manager
- Supplier order link/reference captured and tracked

### 3.8 Digital Signature + Completion Report
- Customer sign-off on job completion
- Signed completion report PDF generated and stored

### 3.9 Live KPI Dashboard
- Open jobs
- MTTR
- SLA risk and breaches
- First-time fix rate
- Engineer utilization

### 3.10 Role-Based Access
- Customer, Engineer, Management role segregation
- Resource scope checks by customer/site/team

---

## 4. Roles and Access Matrix

### 4.1 Customer
- Create service requests
- View own jobs/assets/history
- Upload/view own evidence
- Sign completion reports

### 4.2 Engineer
- View assigned jobs
- Accept/reject assignment
- Update checklist and status
- Upload evidence
- Raise parts request

### 4.3 Manager
- View all jobs under scope
- Assign/reassign engineers
- Approve parts requests
- Monitor KPI dashboard
- Review closure quality

### 4.4 Optional Roles
- Dispatcher: assignment-focused role
- Admin: system configuration and user management

---

## 5. Technology Stack

## 5.1 Frontend
- React + Vite + TypeScript
- React Router
- TanStack Query
- Zustand
- UI library: MUI or Ant Design

## 5.2 Backend
- FastAPI
- Pydantic
- SQLAlchemy 2.x
- Alembic migrations
- Optional async worker: Celery/RQ

## 5.3 Storage
- Object storage for evidence and report files
- Use S3-compatible storage (Cloudflare R2 or Supabase Storage)

---

## 6. Database Decision

### 6.1 Domain-Fit Recommendation: MySQL (Primary)
For this workflow-heavy relational system, MySQL is the strongest domain fit because:
- Strong referential integrity
- Transaction safety for workflow transitions
- Mature query/index performance for reporting and dashboards
- Clear schema control for audit/compliance

### 6.2 MongoDB Consideration
MongoDB is flexible for dynamic documents but adds complexity for strict relational workflow reporting and transactional integrity in this specific use case.

### 6.3 Free-Deployment Practical Adjustment
If your strict requirement is zero-cost cloud deployment from day one:
- PostgreSQL free tiers are currently easier and more reliable than MySQL free tiers.
- Recommended free-start choice: Neon PostgreSQL.

Decision logic:
- Domain fit ideal: MySQL
- Free hosting practical: PostgreSQL (Neon)

Keep ORM models portable so migration between PostgreSQL and MySQL remains possible.

---

## 7. High-Level Architecture

System overview:
- Browser clients (Customer/Engineer/Manager)
- Frontend SPA (React + Vite)
- FastAPI backend (REST)
- Relational DB (MySQL or PostgreSQL free-start)
- Object storage for evidence and PDF reports
- Scheduled KPI refresh jobs

Architecture flow:
User Browser -> Frontend App -> FastAPI API -> Relational Database
FastAPI API -> Object Storage (evidence/reports)
Scheduler -> FastAPI KPI job -> Database KPI tables

---

## 8. Core Data Model (Entity Outline)
- users
- roles
- user_roles
- customers
- sites
- assets
- asset_models
- asset_service_history
- service_requests
- jobs
- job_status_history
- job_assignments
- checklist_templates
- job_checklist_results
- job_media_evidence
- parts_requests
- supplier_orders
- digital_signatures
- completion_reports
- kpi_daily_snapshots

---

## 9. API Module Outline
- /auth/*
- /customers/*
- /assets/*
- /requests/*
- /jobs/*
- /jobs/{id}/assign
- /jobs/{id}/accept
- /jobs/{id}/checklist
- /jobs/{id}/complete
- /parts/*
- /supplier/*
- /evidence/upload-url
- /evidence/commit
- /reports/completion/{job_id}
- /dashboard/kpi

API cross-cutting rules:
- Idempotency for critical transitions
- Pagination/filter/sort support
- Full audit trail for mutating endpoints

---

## 10. Workflow Diagrams (Simple)

### 10.1 End-to-End Service Lifecycle
Service Request Created -> Triage -> Assign Engineer -> Engineer Accepts -> Work In Progress -> Checklist/Calibration -> Parts Needed?
If Yes: Parts Workflow -> Resume Work
If No: Continue -> Customer Sign-off -> Completion Report -> Job Closed

### 10.2 Parts Workflow
Engineer Parts Request -> Manager Approval -> Supplier Order Link/Reference -> Parts Received -> Job Resumes

### 10.3 Evidence Workflow
Upload Request -> Pre-signed URL Issued -> File Uploaded -> Metadata Commit in DB -> Evidence Appears in Job Timeline

### 10.4 Access Control Workflow
Login -> JWT Issued -> Role Middleware -> Resource Scope Check -> Allow or Deny

### 10.5 KPI Workflow
Job/Checklist/Closure Events -> KPI Aggregation Job -> KPI Snapshot Tables -> Dashboard API -> Portal Dashboard Widgets

---

## 11. Security and Compliance Baseline
- JWT auth with refresh token rotation
- RBAC and scope-based authorization
- Immutable audit records for status and assignment changes
- File integrity (checksum/hash)
- Upload restrictions (size/type)
- Rate limiting and input validation
- Data retention policy for signatures/reports/evidence

---

## 12. Zero-Cost Development and Deployment Plan

## 12.1 Free Services Mapping
- Code repository: GitHub (free)
- Frontend hosting: Cloudflare Pages (free)
- Backend hosting: Render free service or Koyeb free tier
- Database: Neon PostgreSQL free
- Object storage: Cloudflare R2 free allowance or Supabase Storage free
- Cron/scheduler: GitHub Actions scheduled workflow
- Monitoring: UptimeRobot free + provider logs

## 12.2 Zero-Cost Deployment Diagram
Developer Push -> GitHub
GitHub -> Auto Deploy Frontend (Cloudflare Pages)
GitHub -> Auto Deploy Backend (Render/Koyeb)
Backend -> Neon Postgres
Backend -> R2/Supabase Storage
GitHub Actions (cron) -> Backend KPI refresh endpoint

## 12.3 Free-Tier Constraints
- Cold starts on sleeping backend
- Monthly runtime limits
- Storage and transfer limits
- No guaranteed SLA

## 12.4 Cost-Control Rules
- Compress image uploads
- Archive old evidence/reports
- Tune DB indexes early
- Keep KPI refresh every 5-15 minutes instead of real-time streaming
- Enforce pagination and bounded queries

---

## 13. Delivery Plan (Phased)

### Phase 1
- Auth, RBAC, user/role setup
- Service request intake
- Asset master + history baseline

### Phase 2
- Central workflow state machine
- Engineer assignment and acceptance

### Phase 3
- Checklist/calibration execution
- Photo/evidence upload and timeline

### Phase 4
- Parts request and approval
- Supplier link/reference tracking

### Phase 5
- Digital signature and completion report generation

### Phase 6
- KPI dashboard
- Security hardening and performance tuning

---

## 14. Verification Checklist
1. Requirement traceability matrix (feature -> UI/API/DB)
2. Workflow scenario tests:
- Normal closure
- Parts delay path
- Calibration fail path
3. RBAC tests for customer/engineer/manager
4. Data integrity tests (FK, status transition rules)
5. KPI validation against raw transactional data
6. Backup and restore drill

---

## 15. Scope Boundaries
Included:
- End-to-end service lifecycle
- Two portals
- Full role-based access
- Evidence and digital completion
- KPI monitoring

Excluded initially:
- AI diagnostics
- Full offline-first mobile sync
- Multi-region active-active deployment

---

## 16. Recommended Next Action After Review
After your review, we can convert this documentation directly into:
- Project folder structure
- Initial DB schema migrations
- API contracts and OpenAPI-first skeleton
- Frontend route and module scaffold
- CI/CD pipeline setup for free deployment
