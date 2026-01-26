# Implementation Plan: Photo-Based Quality Control SaaS

> **Based on:** SPEC.md v1.0 (MVP)  
> **Developer:** Solo  
> **Priority:** Worker flow first (core value demonstration)

---

## Table of Contents

1. [Phase Overview](#phase-overview)
2. [Phase 0: Foundation & Setup](#phase-0-foundation--setup)
3. [Phase 1: Authentication & Authorization](#phase-1-authentication--authorization)
4. [Phase 2: Core Data Management](#phase-2-core-data-management)
5. [Phase 3: Job Management Foundation](#phase-3-job-management-foundation)
6. [Phase 4: Worker Flow (Priority)](#phase-4-worker-flow-priority)
7. [Phase 5: Review & Approval Flow](#phase-5-review--approval-flow)
8. [Phase 6: PDF Report & Client Sharing](#phase-6-pdf-report--client-sharing)
9. [Phase 7: Billing & Subscription](#phase-7-billing--subscription)
10. [Phase 8: Polish & Production Readiness](#phase-8-polish--production-readiness)
11. [Post-MVP Phases](#post-mvp-phases)
12. [Dependencies Map](#dependencies-map)
13. [Risk Assessment](#risk-assessment)
14. [Testing Strategy](#testing-strategy)
15. [Deployment Strategy](#deployment-strategy)

---

## Phase Overview

| Phase | Name                 | Description                                   | Critical Path      |
| ----- | -------------------- | --------------------------------------------- | ------------------ |
| 0     | Foundation & Setup   | Project scaffolding, DB schema, basic config  | Yes                |
| 1     | Authentication       | Supabase Auth, login/register, invitations    | Yes                |
| 2     | Core Data Management | Orgs, Sites, Templates CRUD                   | Yes                |
| 3     | Job Management       | Job creation, assignment, status machine      | Yes                |
| 4     | **Worker Flow**      | Mobile UI, checklist execution, photo capture | **YES (Priority)** |
| 5     | Review & Approval    | Manager review workflow, approve/reject       | Yes                |
| 6     | PDF & Sharing        | Report generation, public links               | Yes                |
| 7     | Billing              | Stripe integration, trials, limits            | Yes                |
| 8     | Polish               | Error handling, notifications, PWA, launch    | Yes                |

**Milestone Marker:** After Phase 4, the core value proposition is demonstrable.

---

## Phase 0: Foundation & Setup

### Objective

Set up the complete development environment, project structure, and database schema.

### Tasks

#### 0.1 Project Initialization

- [x] Create Next.js 14+ project with App Router
  ```bash
  npx create-next-app@latest --typescript --tailwind --eslint --app
  ```
- [x] Configure TypeScript strict mode
- [x] Set up path aliases (`@/components`, `@/lib`, etc.)
- [x] Initialize Git repository with `.gitignore`
- [x] Create initial `README.md` with setup instructions

#### 0.2 Dependencies Installation

- [x] Install and configure Tailwind CSS (included in create-next-app)
- [x] Install shadcn/ui and initialize
  ```bash
  npx shadcn-ui@latest init
  ```
- [x] Install core shadcn components: Button, Input, Card, Dialog, Toast, Form, Table, Badge, Dropdown
- [x] Install Supabase client libraries
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  ```
- [x] Install additional utilities: `date-fns`, `zod`, `react-hook-form`, `nanoid`
- [x] Install pdfkit for PDF generation
- [x] Install Stripe SDK

#### 0.3 Supabase Project Setup

- [x] Create new Supabase project
- [x] Note down project URL and anon/service keys
- [x] Configure environment variables in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- [x] Set up Supabase client utilities (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- [x] Configure middleware for auth session handling

#### 0.4 Database Schema Creation

- [x] Create migration for ENUM types:
  - `org_role`: owner, manager, worker
  - `member_status`: invited, active, inactive
  - `item_type`: checkbox, text, number, photo_only
  - `job_status`: scheduled, in_progress, submitted, approved, rejected, cancelled
  - `item_result_status`: pass, fail, na, pending
  - `subscription_status`: trialing, active, past_due, canceled, unpaid
  - `plan_type`: starter, pro
- [x] Create `organizations` table
- [x] Create `org_members` table with unique constraint on (org_id, email)
- [x] Create `sites` table
- [x] Create `checklist_templates` table
- [x] Create `checklist_items` table with sort_order
- [x] Create `jobs` table
- [x] Create `job_item_results` table with unique constraint on (job_id, item_id)
- [x] Create `job_photos` table
- [x] Create `job_comments` table
- [x] Create `client_shares` table with token index
- [x] Create `billing_subscriptions` table
- [x] Create `updated_at` trigger function for all tables
- [x] Apply all migrations to Supabase

#### 0.5 Row Level Security (RLS) Setup

- [x] Enable RLS on all tables
- [x] Create helper function `get_user_org_ids()`
- [x] Create helper function `get_user_role(org UUID)`
- [x] Create RLS policies for `organizations` (view own orgs)
- [x] Create RLS policies for `org_members` (view/manage based on role)
- [x] Create RLS policies for `sites` (org-based access)
- [x] Create RLS policies for `checklist_templates` (org-based access)
- [x] Create RLS policies for `checklist_items` (via template org)
- [x] Create RLS policies for `jobs` (workers see assigned only, managers see all)
- [x] Create RLS policies for `job_item_results` (via job access)
- [x] Create RLS policies for `job_photos` (upload for own jobs, view for org)
- [x] Create RLS policies for `job_comments` (org-based access)
- [x] Create RLS policies for `client_shares` (org-based access)
- [x] Create RLS policies for `billing_subscriptions` (owner only)

#### 0.6 Supabase Storage Setup

- [x] Create `job-photos` bucket
- [x] Configure bucket as private (not public)
- [x] Create storage policies for upload (authenticated + own org/job)
- [x] Create storage policies for download (authenticated + org access)
- [x] Test upload/download with Supabase client

#### 0.7 Project Structure Setup

- [x] Create folder structure as per spec:
  ```
  app/
    (auth)/
    (dashboard)/
    (worker)/
    r/[token]/
    api/
  components/
    ui/
    forms/
    job/
    camera/
    pdf/
  lib/
    supabase/
    stripe/
    pdf/
  hooks/
  types/
  ```
- [x] Create TypeScript types from database schema (`types/database.ts`)
- [x] Create Zod schemas for form validation (`lib/validations/`)

### Definition of Done

- [x] `npm run dev` starts without errors
- [x] Supabase connection verified
- [x] All database tables created and RLS enabled
- [x] Storage bucket accessible
- [x] TypeScript types match database schema
- [x] shadcn/ui components render correctly

**Phase 0 Status: COMPLETED**

---

## Phase 1: Authentication & Authorization

### Objective

Implement complete authentication flow including registration, login, magic links, and invitation system.

### Tasks

#### 1.1 Supabase Auth Configuration

- [x] Enable Email/Password auth in Supabase dashboard
- [x] Enable Magic Link auth in Supabase dashboard
- [x] Configure email templates for: *(Supabase Dashboard - Manual Configuration)*
  - Confirmation email: "Bestätigen Sie Ihre E-Mail-Adresse"
  - Magic link email: "Ihr Anmelde-Link"
  - Password reset email: "Passwort zurücksetzen"
- [x] Set up redirect URLs for auth flows
- [x] Configure auth settings (token expiry, etc.) *(Supabase Dashboard - Manual Configuration)*

#### 1.2 Auth Utility Functions

- [x] Create `lib/supabase/client.ts` for browser client
- [x] Create `lib/supabase/server.ts` for server components
- [x] Create `lib/supabase/middleware.ts` for session handling
- [x] Create auth helper functions:
  - `signUp(email, password)`
  - `signIn(email, password)`
  - `signInWithMagicLink(email)`
  - `signOut()`
  - `getSession()`
  - `getUser()`
- [x] Create middleware to protect routes

#### 1.3 Registration Flow (Owner)

- [x] Create `app/(auth)/register/page.tsx`
- [x] Build registration form component with:
  - Email input with validation
  - Password input with strength indicator
  - Confirm password field
  - Terms acceptance checkbox
- [x] Add "Register with Magic Link" option (email only)
- [x] Implement form submission with error handling
- [x] Create loading states during registration
- [x] Redirect to email verification pending page
- [x] Create email verification success page

#### 1.4 Login Flow

- [x] Create `app/(auth)/login/page.tsx`
- [x] Build login form component with:
  - Email input
  - Password input
  - "Remember me" checkbox
  - "Forgot password" link
- [x] Add "Login with Magic Link" tab/toggle
- [x] Implement password login submission
- [x] Implement magic link request flow
- [x] Create magic link sent confirmation page
- [x] Handle magic link callback route
- [x] Implement "Forgot Password" flow
- [x] Add error handling for invalid credentials
- [x] Redirect to dashboard or onboarding after login

#### 1.5 Session Management

- [x] Implement middleware for protected routes
- [x] Create auth context/provider for client components
- [x] Handle session refresh automatically
- [x] Implement logout functionality
- [x] Clear local state on logout
- [x] Redirect to login on session expiry

#### 1.6 User Profile & Onboarding Detection

- [x] Create hook to check if user has completed onboarding
- [x] Query `org_members` to check if user belongs to any org
- [x] If no org: redirect to onboarding flow
- [x] If org exists: redirect to dashboard
- [x] Store user preferences in local storage

#### 1.7 Invitation System (Basic)

- [x] Create `app/(auth)/invite/[token]/page.tsx`
- [x] Create invitation token generation function
- [x] Create API route `POST /api/auth/invite` for sending invitations
- [x] Store invitation in `org_members` with status='invited'
- [x] Generate unique invitation URL
- [x] Send invitation email with link
- [x] Handle invitation acceptance:
  - If user exists: add to org, set status='active'
  - If new user: show registration form, then add to org
- [x] Validate invitation token (check expiry, already used)
- [x] Update `org_members` on successful acceptance

#### 1.8 Role-Based Route Protection

- [x] Create role checking utility function
- [x] Create higher-order component/hook for role guards
- [x] Protect dashboard routes (require auth)
- [x] Protect admin routes (require owner/manager)
- [x] Protect worker routes (require worker role)
- [x] Show 403 page for unauthorized access

### Definition of Done

- [x] User can register with email/password
- [x] User can register with magic link
- [x] User can login with email/password
- [x] User can login with magic link
- [x] User can reset password
- [x] Session persists across page refreshes
- [x] Protected routes redirect to login
- [x] Invitation flow works end-to-end
- [x] Role-based access control enforced

**Phase 1 Status: COMPLETED** ✅

---

## Phase 2: Core Data Management

### Objective

Implement CRUD operations for Organizations, Sites, and Checklist Templates with proper UI.

### Tasks

#### 2.1 Dashboard Layout

- [x] Create `app/(dashboard)/layout.tsx`
- [x] Build responsive sidebar navigation with:
  - Dashboard link
  - Sites link
  - Templates link
  - Jobs link
  - Review link (with badge for pending)
  - Reports link
  - Team link
  - Settings link
  - Billing link (owner only)
- [x] Create top header bar with:
  - Org name/selector (future)
  - User menu dropdown
  - Logout option
- [x] Implement mobile-responsive navigation (hamburger menu)
- [x] Add breadcrumb component

#### 2.2 Organization Management

- [x] Create onboarding flow for new users:
  - Step 1: Create organization (name)
  - Step 2: Create first site
  - Step 3: Create first template (or use demo)
  - Step 4: Invite first worker (optional)
- [x] Create `app/(dashboard)/settings/page.tsx`
- [x] Build organization settings form:
  - Organization name (editable)
  - Owner information (read-only)
  - Created date
- [x] Implement organization update API
- [x] Add organization delete with confirmation (soft delete)

#### 2.3 Sites CRUD

- [x] Create `app/(dashboard)/sites/page.tsx` - list view
- [x] Build sites list component with:
  - Site name
  - Address
  - Active/Inactive status
  - Job count
  - Actions (edit, deactivate)
- [x] Create `app/(dashboard)/sites/new/page.tsx`
- [x] Build site creation form:
  - Name (required)
  - Address (optional, textarea)
  - Timezone (dropdown, default Europe/Berlin)
- [x] Create `app/(dashboard)/sites/[id]/edit/page.tsx`
- [x] Build site edit form (same fields)
- [x] Implement API routes:
  - `GET /api/sites` - list sites for org
  - `POST /api/sites` - create site
  - `GET /api/sites/[id]` - get single site
  - `PUT /api/sites/[id]` - update site
  - `DELETE /api/sites/[id]` - soft delete (set inactive)
- [x] Add confirmation dialog for deactivation
- [x] Show toast notifications for success/error

#### 2.4 Checklist Templates CRUD

- [x] Create `app/(dashboard)/templates/page.tsx` - list view
- [x] Build templates list component with:
  - Template name
  - Item count
  - Active/Inactive status
  - Last modified date
  - Actions (edit, duplicate, deactivate)
- [x] Create `app/(dashboard)/templates/new/page.tsx`
- [x] Build template creation form:
  - Template name (required)
  - Description (optional)
- [x] Create `app/(dashboard)/templates/[id]/edit/page.tsx`

#### 2.5 Checklist Items Management

- [x] Build checklist items editor component with:
  - Drag-and-drop reordering
  - Add new item button
  - Item fields:
    - Title (required)
    - Description (optional)
    - Item type dropdown (checkbox, text, number, photo_only)
    - Requires photo toggle
    - Requires note toggle
  - Delete item button with confirmation
- [x] Implement sort_order update on drag-drop
- [x] Create nested items UI (parent_id) - basic structure for post-MVP
- [x] Implement API routes:
  - `GET /api/templates` - list templates for org
  - `POST /api/templates` - create template
  - `GET /api/templates/[id]` - get template with items
  - `PUT /api/templates/[id]` - update template
  - `DELETE /api/templates/[id]` - soft delete
  - `POST /api/templates/[id]/items` - add item
  - `PUT /api/templates/[id]/items/[itemId]` - update item
  - `DELETE /api/templates/[id]/items/[itemId]` - delete item
  - `PUT /api/templates/[id]/items/reorder` - bulk update sort_order
- [x] Add template duplication functionality

#### 2.6 Team Management

- [x] Create `app/(dashboard)/team/page.tsx`
- [x] Build team members list with:
  - Name/Email
  - Role badge (Owner, Manager, Worker)
  - Status (Active, Invited)
  - Joined date
  - Actions (change role, remove)
- [x] Create invite member dialog/modal:
  - Email input
  - Role selector (Manager, Worker)
  - Send invite button
- [x] Implement role change functionality (owner/manager only)
- [x] Implement member removal with confirmation
- [x] Show pending invitations separately
- [x] Add resend invitation option
- [x] Implement API routes:
  - `GET /api/team` - list org members
  - `POST /api/team/invite` - send invitation
  - `PUT /api/team/[id]/role` - change role
  - `DELETE /api/team/[id]` - remove member
  - `POST /api/team/[id]/resend` - resend invitation

#### 2.7 Dashboard Home

- [x] Create `app/(dashboard)/page.tsx`
- [x] Build dashboard overview with:
  - Quick stats cards:
    - Total jobs this month
    - Pending review count
    - Active workers count
    - Approved jobs today
  - Recent jobs list (last 5)
  - Quick actions:
    - Create new job
    - View pending reviews
- [x] Add subscription status banner (trial days remaining, etc.)

### Definition of Done

- [x] Dashboard layout renders correctly on desktop and mobile
- [x] Organization settings can be viewed and edited
- [x] Sites can be created, listed, edited, and deactivated
- [x] Templates can be created, listed, edited, and duplicated
- [x] Checklist items can be added, edited, reordered, and deleted
- [x] Team members can be invited and managed
- [x] Dashboard shows accurate statistics
- [x] All API routes return proper responses with error handling

**Phase 2 Status: COMPLETED** ✅

---

## Phase 3: Job Management Foundation

### Objective

Implement job creation, assignment, listing, and status management (state machine).

### Tasks

#### 3.1 Job Status State Machine

- [ ] Create `lib/jobs/status-machine.ts`
- [ ] Define allowed transitions:
  ```typescript
  const transitions = {
    scheduled: ["in_progress", "cancelled"],
    in_progress: ["submitted", "cancelled"],
    submitted: ["approved", "rejected"],
    rejected: ["in_progress"],
    approved: [],
    cancelled: [],
  };
  ```
- [ ] Create transition validation function
- [ ] Create role-based transition permissions:
  - Worker: scheduled→in_progress, in_progress→submitted, rejected→in_progress
  - Manager/Owner: \*→cancelled, submitted→approved, submitted→rejected
- [ ] Create status transition helper with validation

#### 3.2 Job Creation

- [ ] Create `app/(dashboard)/jobs/new/page.tsx`
- [ ] Build job creation form:
  - Site selector (dropdown)
  - Template selector (dropdown)
  - Assigned worker selector (dropdown)
  - Scheduled date picker
- [ ] Validate all required fields
- [ ] Create job with status='scheduled'
- [ ] Create `job_item_results` entries for all template items (status='pending')
- [ ] Implement `POST /api/jobs` endpoint
- [ ] Send notification email to assigned worker

#### 3.3 Job Listing (Manager/Owner View)

- [ ] Create `app/(dashboard)/jobs/page.tsx`
- [ ] Build jobs list view with:
  - Filter by status (tabs or dropdown)
  - Filter by site (dropdown)
  - Filter by worker (dropdown)
  - Filter by date range
  - Search by job ID
- [ ] Display job cards/rows with:
  - Site name
  - Template name
  - Assigned worker
  - Scheduled date
  - Status badge (color-coded)
  - Actions (view, cancel)
- [ ] Implement pagination
- [ ] Add calendar view option (future enhancement)
- [ ] Implement `GET /api/jobs` endpoint with filters

#### 3.4 Job Detail View (Manager/Owner)

- [ ] Create `app/(dashboard)/jobs/[id]/page.tsx`
- [ ] Build job detail view with:
  - Job header (site, date, status, worker)
  - Checklist items with results
  - Photos grid/gallery
  - Notes from worker
  - Review comments (if any)
  - Action buttons based on status
- [ ] Show timeline of status changes
- [ ] Implement `GET /api/jobs/[id]` endpoint

#### 3.5 Job Cancellation

- [ ] Add cancel button to job detail (manager/owner only)
- [ ] Show confirmation dialog with reason input
- [ ] Implement `POST /api/jobs/[id]/cancel` endpoint
- [ ] Validate: only scheduled or in_progress jobs can be cancelled
- [ ] Update status to 'cancelled'
- [ ] Send notification to assigned worker

#### 3.6 Job Assignment/Reassignment

- [ ] Add reassign option to job detail
- [ ] Show worker selector dialog
- [ ] Implement `PUT /api/jobs/[id]/assign` endpoint
- [ ] Validate: only scheduled or rejected jobs can be reassigned
- [ ] Send notification to new worker
- [ ] Notify old worker of reassignment

### Definition of Done

- [ ] Status machine correctly validates all transitions
- [ ] Jobs can be created with all required fields
- [ ] Job list shows correct data with working filters
- [ ] Job detail displays all information
- [ ] Jobs can be cancelled with proper validation
- [ ] Jobs can be reassigned
- [ ] All status transitions trigger appropriate notifications

---

## Phase 4: Worker Flow (Priority)

### Objective

Implement the complete worker experience including mobile-optimized UI, job execution, photo capture, and submission.

**This is the highest priority phase - it demonstrates the core product value.**

### Tasks

#### 4.1 Worker Layout & Navigation

- [ ] Create `app/(worker)/layout.tsx`
- [ ] Design mobile-first layout with:
  - Bottom navigation bar (Today, All Jobs, Profile)
  - Minimal header with logo
  - Full-screen content area
- [ ] Create worker auth guard (redirect non-workers)
- [ ] Implement pull-to-refresh for job lists
- [ ] Add loading skeletons for async data

#### 4.2 Today's Jobs View

- [ ] Create `app/(worker)/today/page.tsx`
- [ ] Build today's jobs list with:
  - Jobs scheduled for today
  - Jobs in_progress (started but not submitted)
  - Rejected jobs (need rework)
- [ ] Display job cards with:
  - Site name and address
  - Template name
  - Status badge
  - Scheduled time (if applicable)
  - Start/Continue button
- [ ] Group by status (In Progress first, then Scheduled, then Rejected)
- [ ] Show empty state if no jobs
- [ ] Implement `GET /api/worker/jobs/today` endpoint

#### 4.3 All Jobs View (Worker)

- [ ] Create `app/(worker)/jobs/page.tsx`
- [ ] Build jobs list with:
  - Filter by status
  - Filter by date range
  - Sort by date
- [ ] Show completed jobs (approved) as read-only
- [ ] Implement pagination or infinite scroll

#### 4.4 Job Detail View (Worker)

- [ ] Create `app/(worker)/job/[id]/page.tsx`
- [ ] Build job header with:
  - Site name and address
  - Template name
  - Status
  - Start button (if scheduled)
- [ ] Show checklist items list
- [ ] Show progress indicator (X of Y completed)

#### 4.5 Job Start Flow

- [ ] Implement "Start Job" button action
- [ ] Call `POST /api/jobs/[id]/start` endpoint
- [ ] Validate: user is assigned, status is 'scheduled'
- [ ] Update status to 'in_progress'
- [ ] Set `started_at` timestamp
- [ ] Navigate to checklist execution view

#### 4.6 Checklist Item Execution

- [ ] Create checklist item component with:
  - Item title and description
  - Status selector (Pass/Fail/N.A.) - radio buttons or buttons
  - Photo indicator (required/optional/taken)
  - Note input (if required or optional)
  - Expand/collapse for details
- [ ] Implement item status update:
  - Update `job_item_results` table
  - Show visual feedback (checkmark, color change)
- [ ] Save item state immediately on change (auto-save)
- [ ] Show validation if required photo missing

#### 4.7 Camera Component

- [ ] Create `components/camera/CameraCapture.tsx`
- [ ] Implement custom camera UI with:
  - Full-screen camera preview
  - Grid overlay (rule of thirds)
  - Capture button (large, centered)
  - Flash toggle button
  - Camera switch button (front/back)
  - Cancel button
- [ ] Use `navigator.mediaDevices.getUserMedia` API
- [ ] Handle camera permissions:
  - Request permission on first use
  - Show instructions if denied
  - Handle permission errors gracefully
- [ ] Capture photo to canvas
- [ ] Convert to JPEG blob with compression (max 2MB)
- [ ] Show preview after capture with:
  - Retake button
  - Use photo button

#### 4.8 Photo Upload

- [ ] Create `components/camera/PhotoPreview.tsx`
- [ ] Implement photo upload flow:
  - Show upload progress indicator
  - Upload to Supabase Storage
  - Create `job_photos` record
  - Link to checklist item (item_id)
- [ ] Handle upload errors:
  - Timeout (10s) → show retry
  - Network error → show retry
  - File too large → prompt to retake
- [ ] Store failed uploads locally for retry
- [ ] Implement `POST /api/jobs/[id]/photos` endpoint
- [ ] Show uploaded photos in checklist item

#### 4.9 Photo Gallery in Job

- [ ] Create photo gallery component
- [ ] Display all photos for the job
- [ ] Show photos grouped by checklist item
- [ ] Tap to view full-screen
- [ ] Allow adding caption to photos
- [ ] Allow deleting photos (before submission)

#### 4.10 Quick Mode

- [ ] Add "Quick Mode" toggle/button
- [ ] Implement bulk status update:
  - Set all items to 'pass'
  - Track that quick_mode_used = true
- [ ] Still require mandatory photos:
  - Show modal listing required photos
  - Navigate through each required photo
- [ ] Show confirmation before enabling quick mode
- [ ] Allow switching back to normal mode

#### 4.11 Notes Input

- [ ] Create note input component
- [ ] Show for items with `requires_note = true`
- [ ] Allow optional notes on any item
- [ ] Implement character limit (500 chars)
- [ ] Auto-save notes

#### 4.12 Job Submission

- [ ] Create job summary view before submission:
  - List of all items with status
  - Missing required items highlighted
  - Photo count
  - Warnings for incomplete items
- [ ] Validate all required photos are uploaded
- [ ] Validate all required notes are filled
- [ ] Show "Submit Job" button
- [ ] Implement `POST /api/jobs/[id]/submit` endpoint
- [ ] Update status to 'submitted'
- [ ] Set `submitted_at` timestamp
- [ ] Send notification to manager
- [ ] Show success confirmation
- [ ] Navigate to Today view

#### 4.13 Post-Submission View (Read-Only)

- [ ] After submission, job becomes read-only for worker
- [ ] Show submitted status clearly
- [ ] Allow viewing all photos and notes
- [ ] Show review status when updated (approved/rejected)
- [ ] If rejected: show review comment and re-enable editing

#### 4.14 Rejected Job Rework

- [ ] Show rejected jobs prominently in Today view
- [ ] Display reviewer comment clearly
- [ ] Allow worker to re-open and edit
- [ ] Change status back to 'in_progress'
- [ ] Clear rejection timestamp
- [ ] Allow re-submission

#### 4.15 State Persistence (localStorage)

- [ ] Save current job state to localStorage:
  - Current screen/step
  - In-progress item results
  - Pending photo uploads
- [ ] Restore state on app reopen
- [ ] Clear state after successful submission
- [ ] Handle state conflicts gracefully
- [ ] Implement `useLocalStorageState` hook

#### 4.16 PWA Setup

- [ ] Create `manifest.json` with:
  - App name and short name
  - Icons (multiple sizes)
  - Theme color
  - Display: standalone
- [ ] Create service worker for caching (basic)
- [ ] Add meta tags for PWA
- [ ] Test home screen installation prompt
- [ ] Verify camera works in standalone mode

### Definition of Done

- [ ] Worker can see today's assigned jobs
- [ ] Worker can start a scheduled job
- [ ] Worker can complete checklist items (pass/fail/na)
- [ ] Worker can take photos with custom camera UI
- [ ] Photos upload successfully to storage
- [ ] Worker can add notes to items
- [ ] Quick mode works with photo requirements
- [ ] Worker can submit completed job
- [ ] Submitted jobs are read-only
- [ ] Worker can rework rejected jobs
- [ ] State persists across app restarts
- [ ] PWA can be installed to home screen
- [ ] All flows work on mobile devices

---

## Phase 5: Review & Approval Flow

### Objective

Implement the manager review workflow including pending reviews list, detail view, and approve/reject actions.

### Tasks

#### 5.1 Pending Reviews Badge

- [ ] Create `lib/hooks/usePendingReviewCount.ts`
- [ ] Query jobs with status='submitted' for user's org
- [ ] Display badge in sidebar navigation
- [ ] Update badge count in real-time (polling or subscription)

#### 5.2 Review List View

- [ ] Create `app/(dashboard)/review/page.tsx`
- [ ] Build pending reviews list with:
  - Jobs with status='submitted'
  - Sort by submission date (oldest first)
  - Filter by site (optional)
  - Filter by worker (optional)
- [ ] Display review cards with:
  - Site name
  - Template name
  - Worker name
  - Submitted date/time
  - Quick preview (item count, photo count)
  - Review button
- [ ] Show empty state when no pending reviews

#### 5.3 Review Detail View

- [ ] Create `app/(dashboard)/review/[id]/page.tsx`
- [ ] Build comprehensive review view with:
  - Job header (site, worker, date)
  - Checklist section:
    - All items with status (pass/fail/na)
    - Notes displayed inline
    - Visual indicators for failed items
  - Photos section:
    - Grid of all photos
    - Click to enlarge
    - Show associated item
    - Zoom/pan functionality
  - Previous comments (if job was rejected before)

#### 5.4 Photo Viewer Component

- [ ] Create `components/PhotoViewer.tsx`
- [ ] Implement full-screen photo modal:
  - Swipe between photos
  - Zoom with pinch gesture
  - Photo caption
  - Associated checklist item
  - Close button
- [ ] Support keyboard navigation (arrows, escape)

#### 5.5 Approve Action

- [ ] Add "Approve" button to review detail
- [ ] Show confirmation dialog
- [ ] Implement `POST /api/jobs/[id]/review` endpoint:
  - Validate: user is manager/owner
  - Validate: job status is 'submitted'
  - Update status to 'approved'
  - Set `reviewed_at` timestamp
  - Set `reviewed_by` to current user
- [ ] Send notification email to worker
- [ ] Show success toast
- [ ] Navigate back to review list

#### 5.6 Reject Action

- [ ] Add "Reject" button to review detail
- [ ] Show rejection dialog with:
  - Required comment field
  - Minimum character requirement
  - Helpful prompts (what needs fixing)
- [ ] Implement rejection in API:
  - Validate: comment is provided
  - Update status to 'rejected'
  - Set `review_comment`
  - Set timestamps
- [ ] Send notification email to worker with comment
- [ ] Show success toast
- [ ] Navigate back to review list

#### 5.7 Review Comments/Notes

- [ ] Create `job_comments` handling
- [ ] Allow manager to add internal notes
- [ ] Display comment history on job detail
- [ ] Notes are NOT shown in client report

#### 5.8 Bulk Review (Optional Enhancement)

- [ ] Add checkbox selection to review list
- [ ] Add "Approve Selected" button
- [ ] Show confirmation with count
- [ ] Process approvals in batch

### Definition of Done

- [ ] Pending review badge shows correct count
- [ ] Review list shows all submitted jobs
- [ ] Review detail shows complete job information
- [ ] Photos can be viewed in full-screen
- [ ] Manager can approve jobs
- [ ] Manager can reject jobs with required comment
- [ ] Worker receives notifications for approve/reject
- [ ] Rejected jobs are editable by worker again

---

## Phase 6: PDF Report & Client Sharing

### Objective

Implement PDF report generation, public share links, and client-facing report page.

### Tasks

#### 6.1 PDF Generation Setup

- [ ] Install pdfkit: `npm install pdfkit`
- [ ] Create `lib/pdf/generator.ts`
- [ ] Set up PDF document with:
  - Page size: A4
  - Margins
  - Font configuration (embedded fonts)
- [ ] Create reusable PDF components:
  - Header section
  - Checklist table
  - Photo page

#### 6.2 PDF Layout Implementation

- [ ] Implement header section:
  - "Qualitätsbericht" title
  - Organization name
  - Site name and address
  - Date (formatted German locale)
  - Status: "Freigegeben ✓"
- [ ] Implement checklist section:
  - Item title
  - Status icon (✓ for pass, ✗ for fail, − for na)
  - Notes (if any)
  - Clean table layout
- [ ] Implement photo pages:
  - One photo per page (full-width)
  - Photo caption below
  - Associated item name
  - NO timestamp
  - NO worker name
- [ ] Add page numbers
- [ ] Add generation date footer

#### 6.3 PDF Generation API

- [ ] Create `POST /api/jobs/[id]/generate-pdf` endpoint
- [ ] Fetch job with all related data:
  - Job details
  - Item results
  - Photos (download from storage)
- [ ] Generate PDF using pdfkit
- [ ] Upload PDF to Supabase Storage
- [ ] Store path in `client_shares.pdf_storage_path`
- [ ] Return PDF URL or path

#### 6.4 Share Link Generation

- [ ] Create `lib/utils/token.ts`
- [ ] Generate short URL-safe token (8-12 chars using nanoid)
- [ ] Create `POST /api/jobs/[id]/share` endpoint:
  - Validate: job status is 'approved'
  - Generate unique token
  - Generate PDF
  - Set expiration (7 days)
  - Create `client_shares` record
  - Return share URL
- [ ] Handle duplicate share creation (return existing if active)

#### 6.5 Share Management UI

- [ ] Add "Share Report" button to approved job detail
- [ ] Show share dialog with:
  - Generated link
  - Copy to clipboard button
  - Expiration date
  - Email input (optional direct send)
  - QR code (optional)
- [ ] Create `app/(dashboard)/reports/page.tsx`
- [ ] Build shared reports list with:
  - Job reference
  - Share link
  - Created date
  - Expiration date
  - Status (active/expired/revoked)
  - Actions (copy, revoke)

#### 6.6 Share Link Revocation

- [ ] Add revoke button to share management
- [ ] Show confirmation dialog
- [ ] Implement `DELETE /api/shares/[token]` endpoint
- [ ] Set `revoked_at` timestamp
- [ ] Link immediately becomes invalid

#### 6.7 Public Report Page (Web View)

- [ ] Create `app/r/[token]/page.tsx`
- [ ] Validate token:
  - Check token exists
  - Check not expired
  - Check not revoked
- [ ] Show error page for invalid tokens:
  - Friendly message
  - Contact information
- [ ] Build public report view:
  - Organization name (header)
  - "Qualitätsbericht" title
  - Site name and address
  - Date
  - Checklist section:
    - Items with status icons
    - Notes displayed
  - Photo gallery:
    - Thumbnail grid
    - Click to enlarge
  - NO login required
  - NO navigation

#### 6.8 PDF Download

- [ ] Create `app/r/[token]/pdf/route.ts`
- [ ] Validate token (same as web view)
- [ ] Fetch PDF from storage
- [ ] Return PDF with proper headers:
  - Content-Type: application/pdf
  - Content-Disposition: attachment
- [ ] Add "Download PDF" button to public report page
- [ ] Track download (optional, not in MVP)

#### 6.9 Email Sharing (Optional)

- [ ] Add email input to share dialog
- [ ] Create email template for share notification
- [ ] Send email with:
  - Report link
  - Brief description
  - Expiration notice
- [ ] Use email provider (configure in Phase 8)

### Definition of Done

- [ ] PDF generates with correct layout
- [ ] PDF includes all checklist items and photos
- [ ] PDF excludes worker name and timestamps
- [ ] Share links are generated correctly
- [ ] Share links can be copied and managed
- [ ] Share links can be revoked
- [ ] Public report page displays correctly
- [ ] Expired/revoked links show error page
- [ ] PDF can be downloaded from public page

---

## Phase 7: Billing & Subscription

### Objective

Implement Stripe integration, trial management, subscription plans, and limit enforcement.

### Tasks

#### 7.1 Stripe Account Setup

- [ ] Create Stripe account
- [ ] Configure test mode
- [ ] Create products and prices:
  - Starter plan (€X/month)
  - Pro plan (€Y/month)
- [ ] Note product and price IDs
- [ ] Configure webhook endpoint URL
- [ ] Set up webhook signing secret

#### 7.2 Environment Configuration

- [ ] Add Stripe environment variables:
  ```
  STRIPE_SECRET_KEY=
  STRIPE_PUBLISHABLE_KEY=
  STRIPE_WEBHOOK_SECRET=
  STRIPE_STARTER_PRICE_ID=
  STRIPE_PRO_PRICE_ID=
  ```
- [ ] Create `lib/stripe/client.ts` with Stripe initialization

#### 7.3 Trial Initialization

- [ ] On organization creation:
  - Create `billing_subscriptions` record
  - Set status to 'trialing'
  - Set `trial_ends_at` to 14 days from now
  - Set plan to 'starter' (default trial plan)
- [ ] Create utility function to check subscription status
- [ ] Create hook `useSubscriptionStatus()`

#### 7.4 Billing Dashboard

- [ ] Create `app/(dashboard)/billing/page.tsx`
- [ ] Build billing overview with:
  - Current plan name
  - Subscription status badge
  - Trial days remaining (if applicable)
  - Current period dates
  - Usage statistics:
    - Sites: X / Y (or unlimited)
    - Users: X / Y (or unlimited)
    - Jobs this month: X / Y (or unlimited)
- [ ] Show plan comparison table
- [ ] Add upgrade buttons

#### 7.5 Checkout Flow

- [ ] Create `POST /api/stripe/checkout` endpoint:
  - Validate user is owner
  - Create Stripe customer (if not exists)
  - Store `stripe_customer_id` in organizations
  - Create Checkout Session:
    - Line item with price ID
    - Success URL
    - Cancel URL
    - Customer email
  - Return session URL
- [ ] Redirect to Stripe Checkout
- [ ] Create success page `app/(dashboard)/billing/success/page.tsx`
- [ ] Create cancel page (redirect back to billing)

#### 7.6 Webhook Handler

- [ ] Create `POST /api/stripe/webhook` endpoint
- [ ] Verify webhook signature
- [ ] Handle events:
  - `checkout.session.completed`:
    - Update subscription status to 'active'
    - Store `stripe_subscription_id`
    - Set period dates
  - `customer.subscription.updated`:
    - Update plan if changed
    - Update status
    - Update period dates
  - `customer.subscription.deleted`:
    - Set status to 'canceled'
  - `invoice.payment_failed`:
    - Set status to 'past_due'
    - Send email to owner
- [ ] Log all webhook events for debugging

#### 7.7 Customer Portal

- [ ] Create `POST /api/stripe/portal` endpoint:
  - Validate user is owner
  - Create Customer Portal session
  - Return portal URL
- [ ] Add "Manage Subscription" button to billing page
- [ ] Configure Customer Portal in Stripe:
  - Allow payment method updates
  - Allow subscription cancellation
  - Allow plan changes (upgrades only in MVP)

#### 7.8 Limit Enforcement

- [ ] Create `lib/billing/limits.ts`:
  ```typescript
  const PLAN_LIMITS = {
    starter: { sites: 1, users: 3, jobsPerMonth: 50 },
    pro: { sites: Infinity, users: Infinity, jobsPerMonth: Infinity },
  };
  ```
- [ ] Create usage counting functions:
  - `getActiveSiteCount(orgId)`
  - `getActiveUserCount(orgId)`
  - `getMonthlyJobCount(orgId)` (exclude cancelled)
- [ ] Create limit checking middleware
- [ ] Implement soft limit enforcement:
  - Show warning banner when approaching limit (80%)
  - Show error when at limit
  - 3-day grace period after hitting limit
  - Block action after grace period

#### 7.9 Limit UI Feedback

- [ ] Add usage indicators to relevant pages
- [ ] Show warning toast when approaching limits
- [ ] Disable buttons when at limit with upgrade prompt
- [ ] Add upgrade CTA to blocked actions

#### 7.10 Trial End Handling

- [ ] Create trial expiration check
- [ ] On trial end without subscription:
  - Set status to 'unpaid'
  - Enable read-only mode
  - Show prominent upgrade banner
- [ ] Read-only mode restrictions:
  - View all existing data
  - Cannot create new jobs
  - Cannot invite users
  - Cannot create sites/templates
  - Reports remain accessible

#### 7.11 Trial Email Notifications

- [ ] Create email templates:
  - 7 days before trial end
  - 3 days before trial end
  - Trial ended
- [ ] Set up scheduled job (cron) to send emails:
  - Run daily
  - Check trial_ends_at for upcoming expirations
  - Send appropriate email
- [ ] Track emails sent (avoid duplicates)

#### 7.12 Subscription Status Banner

- [ ] Create subscription banner component
- [ ] Show on all dashboard pages when:
  - Trial ending soon (≤7 days)
  - Trial ended (read-only)
  - Payment past due
  - Subscription cancelled
- [ ] Include relevant CTA (upgrade, update payment, etc.)

### Definition of Done

- [ ] Trial starts automatically on org creation
- [ ] Billing page shows correct status and usage
- [ ] Stripe Checkout works end-to-end
- [ ] Webhooks update subscription status correctly
- [ ] Customer Portal is accessible
- [ ] Limits are enforced for Starter plan
- [ ] Grace period works correctly
- [ ] Read-only mode activates on trial end
- [ ] Trial emails are sent at correct times
- [ ] Status banners display appropriately

---

## Phase 8: Polish & Production Readiness

### Objective

Final polish, error handling, notifications, and production deployment preparation.

### Tasks

#### 8.1 Error Handling Improvements

- [ ] Create global error boundary component
- [ ] Implement consistent error display:
  - Toast for minor errors
  - Full-page for critical errors
- [ ] Add retry logic to all API calls:
  - Automatic retry (2 attempts)
  - Manual retry button
- [ ] Improve photo upload error handling:
  - Store failed uploads locally
  - Retry queue with exponential backoff
  - Clear status indicators
- [ ] Create offline detection banner
- [ ] Log errors to console (prepare for monitoring)

#### 8.2 Loading States

- [ ] Add loading skeletons to all list views
- [ ] Add loading spinners to buttons during actions
- [ ] Add page transition loading indicator
- [ ] Optimize perceived performance

#### 8.3 Email Notifications Setup

- [ ] Choose and configure email provider (e.g., Resend)
- [ ] Create email templates:
  - Invitation email
  - Job assigned email
  - Job submitted (to manager)
  - Job approved (to worker)
  - Job rejected (to worker)
  - Trial reminders (7d, 3d, expired)
  - Payment failed
- [ ] Create email sending utility
- [ ] Add unsubscribe handling (optional for MVP)
- [ ] Test all email flows

#### 8.4 In-App Notifications

- [ ] Create notification badge component
- [ ] Implement pending review badge (already done)
- [ ] Add subscription warning indicators
- [ ] Consider polling for updates (Supabase realtime post-MVP)

#### 8.5 Feedback Widget

- [ ] Choose feedback solution (Crisp, custom, etc.)
- [ ] Integrate feedback widget:
  - Floating button on web (bottom-right)
  - Menu item on mobile
- [ ] Configure categories:
  - Bug report
  - Feature request
  - General feedback
- [ ] Add screenshot capability (optional)
- [ ] Include user context automatically

#### 8.6 PWA Finalization

- [ ] Complete manifest.json configuration
- [ ] Create app icons (all required sizes)
- [ ] Implement service worker:
  - Cache static assets
  - Handle offline gracefully
  - Update notification for new versions
- [ ] Test home screen installation:
  - iOS Safari
  - Android Chrome
  - Desktop browsers
- [ ] Add install prompt at appropriate times

#### 8.7 Seed Data

- [ ] Create seed script for demo data:
  - Demo organization
  - Demo sites
  - Demo templates (Büroreinigung Standard)
  - Demo users (owner, manager, worker)
  - Sample jobs in various statuses
  - Sample photos
- [ ] Make seed idempotent (can run multiple times)
- [ ] Document seed usage

#### 8.8 Security Audit

- [ ] Review all RLS policies
- [ ] Test cross-org data access (should fail)
- [ ] Test worker accessing other worker's jobs (should fail)
- [ ] Verify share tokens only expose single job
- [ ] Check for sensitive data in client bundle
- [ ] Review API input validation
- [ ] Check CORS configuration
- [ ] Verify Stripe webhook signature validation

#### 8.9 Performance Optimization

- [ ] Audit bundle size
- [ ] Implement code splitting for routes
- [ ] Optimize images (next/image)
- [ ] Add database indexes for common queries:
  - jobs: org_id, status, scheduled_date
  - org_members: user_id, org_id
  - client_shares: token
- [ ] Test with larger datasets
- [ ] Profile slow queries

#### 8.10 Accessibility Audit

- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Add ARIA labels where needed
- [ ] Test with reduced motion preferences

#### 8.11 Browser/Device Testing

- [ ] Test on Chrome (desktop + mobile)
- [ ] Test on Safari (desktop + mobile)
- [ ] Test on Firefox
- [ ] Test on Edge
- [ ] Test on various screen sizes
- [ ] Test camera functionality on:
  - iPhone Safari
  - Android Chrome
  - Desktop browsers

#### 8.12 Documentation

- [ ] Update README with:
  - Project overview
  - Setup instructions
  - Environment variables
  - Deployment guide
- [ ] Document API endpoints
- [ ] Create user guide (basic)
- [ ] Document database schema

#### 8.13 Production Environment Setup

- [ ] Create production Supabase project
- [ ] Run migrations on production
- [ ] Configure production environment variables
- [ ] Set up production Stripe (live mode)
- [ ] Configure production email sending
- [ ] Set up custom domain
- [ ] Configure SSL

#### 8.14 Vercel Deployment

- [ ] Connect repository to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Set up production branch
- [ ] Configure custom domain
- [ ] Enable preview deployments
- [ ] Set up deployment notifications

#### 8.15 Launch Checklist

- [ ] Final testing on production
- [ ] Verify Stripe webhooks in production
- [ ] Test complete user flows:
  - Registration → Onboarding → Job Creation
  - Worker job execution
  - Manager review
  - Client report viewing
  - Billing upgrade
- [ ] Monitor for errors post-launch
- [ ] Prepare rollback plan

### Definition of Done

- [ ] All error states handled gracefully
- [ ] Loading states provide good UX
- [ ] All emails send correctly
- [ ] Feedback widget functional
- [ ] PWA installs and works properly
- [ ] Seed data generates demo environment
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Accessibility basics covered
- [ ] Works on major browsers/devices
- [ ] Documentation complete
- [ ] Production deployment successful
- [ ] All user flows verified

---

## Post-MVP Phases

### Phase 9: Post-MVP Enhancements (Based on Spec Phase 2)

#### 9.1 Recurring Jobs

- [ ] Design recurring job rules (daily, weekly, monthly)
- [ ] Create recurrence configuration UI
- [ ] Implement job auto-generation
- [ ] Handle exceptions (skip specific dates)
- [ ] Add recurring job management

#### 9.2 Offline Support / Local Sync

- [ ] Implement offline data storage (IndexedDB)
- [ ] Queue actions when offline
- [ ] Sync when back online
- [ ] Conflict resolution strategy
- [ ] Offline indicator

#### 9.3 Multi-Org Support

- [ ] Design org switcher UI
- [ ] Allow user to belong to multiple orgs
- [ ] Implement org context switching
- [ ] Handle permissions across orgs

#### 9.4 Downgrade Handling

- [ ] Implement downgrade flow (Pro → Starter)
- [ ] Site/user selection when over limits
- [ ] Data preservation strategy
- [ ] Grace period for adjustment

#### 9.5 GDPR Data Export

- [ ] Implement data export endpoint
- [ ] Generate downloadable archive
- [ ] Include all user data
- [ ] Document export format

#### 9.6 Monitoring & Error Tracking

- [ ] Set up Sentry (or similar)
- [ ] Configure error grouping
- [ ] Set up alerts
- [ ] Create dashboard

### Phase 10: Scale & Features (Based on Spec Phase 3)

- [ ] Site sharing between organizations
- [ ] Company logo in PDF reports
- [ ] Photo quality detection (blur, brightness)
- [ ] Push notifications
- [ ] Multi-language support (EN, more)
- [ ] Public API for integrations
- [ ] White-label / custom domains

### Phase 11: Enterprise (Based on Spec Phase 4)

- [ ] SSO / SAML integration
- [ ] Comprehensive audit logs
- [ ] Custom branding options
- [ ] Dedicated support tier
- [ ] SLA commitments

---

## Dependencies Map

```
Phase 0: Foundation
    └── Phase 1: Auth
        └── Phase 2: Core Data
            └── Phase 3: Job Management
                └── Phase 4: Worker Flow ★ (PRIORITY MILESTONE)
                    └── Phase 5: Review Flow
                        └── Phase 6: PDF & Sharing
                            └── Phase 7: Billing
                                └── Phase 8: Polish & Launch
```

### Critical Path

Every phase depends on the previous one. The critical path runs through all phases sequentially.

### Parallel Work Opportunities

Limited parallel work due to solo developer:

- Phase 7 (Billing) could start during Phase 6 (API parts)
- Phase 8 (Polish) tasks can be done incrementally throughout

### External Dependencies

- **Supabase**: Database, Auth, Storage (Phase 0)
- **Stripe**: Payment processing (Phase 7)
- **Email Provider**: Notifications (Phase 8)
- **Vercel**: Hosting (Phase 8)

---

## Risk Assessment

### High Risk

| Risk                          | Impact                               | Likelihood | Mitigation                                                  |
| ----------------------------- | ------------------------------------ | ---------- | ----------------------------------------------------------- |
| Camera API issues on mobile   | Cannot capture photos (core feature) | Medium     | Test early on real devices; have fallback file input        |
| Stripe integration complexity | Cannot process payments              | Low        | Use Stripe's well-documented patterns; start with test mode |
| Photo upload reliability      | Data loss, poor UX                   | Medium     | Implement robust retry logic; local storage queue           |
| Supabase RLS misconfiguration | Security breach                      | Medium     | Thorough testing; security audit before launch              |

### Medium Risk

| Risk                       | Impact                   | Likelihood | Mitigation                                     |
| -------------------------- | ------------------------ | ---------- | ---------------------------------------------- |
| PDF generation performance | Slow report creation     | Medium     | Pre-generate on approval; optimize image sizes |
| PWA installation issues    | Poor mobile adoption     | Medium     | Thorough device testing; fallback to web       |
| Email deliverability       | Users miss notifications | Medium     | Use reputable provider; monitor bounces        |
| Browser compatibility      | Features don't work      | Low        | Regular cross-browser testing                  |

### Low Risk

| Risk                       | Impact             | Likelihood | Mitigation                                     |
| -------------------------- | ------------------ | ---------- | ---------------------------------------------- |
| Scope creep                | Delayed launch     | Medium     | Strict MVP adherence; defer to post-MVP        |
| Third-party service outage | Temporary downtime | Low        | Choose reliable providers; have fallback plans |

### Mitigation Strategies

1. **Test early and often**: Especially camera functionality on real devices
2. **Incremental deployment**: Deploy after each phase to catch issues early
3. **Feature flags**: Ability to disable problematic features quickly
4. **Monitoring preparation**: Set up logging even without full monitoring
5. **Backup plans**: Document manual workarounds for critical flows

---

## Testing Strategy

### Unit Testing

- **Framework**: Jest + React Testing Library
- **Coverage Target**: 70% for critical paths
- **Focus Areas**:
  - Status machine transitions
  - Permission checks
  - Form validation
  - Utility functions
  - PDF generation

### Integration Testing

- **Framework**: Jest with Supabase test helpers
- **Focus Areas**:
  - API endpoint behavior
  - RLS policy enforcement
  - Webhook handling
  - Auth flows

### End-to-End Testing

- **Framework**: Playwright or Cypress
- **Critical Flows to Test**:
  1. Owner registration → onboarding → first job
  2. Worker receives job → executes → submits
  3. Manager reviews → approves → shares
  4. Client views report → downloads PDF
  5. Owner upgrades subscription
  6. Invitation → acceptance → org access

### Manual Testing Checklist

- [ ] All forms submit correctly
- [ ] All buttons have loading states
- [ ] Error messages display appropriately
- [ ] Mobile responsiveness
- [ ] Camera works on iOS Safari
- [ ] Camera works on Android Chrome
- [ ] PWA installation
- [ ] Offline behavior
- [ ] Cross-browser compatibility

### Testing Milestones

| Phase | Testing Focus                         |
| ----- | ------------------------------------- |
| 0     | Database schema, RLS policies         |
| 1     | Auth flows, session management        |
| 2     | CRUD operations, permissions          |
| 3     | Status machine, job lifecycle         |
| 4     | Camera, upload, mobile UX (critical!) |
| 5     | Review workflow                       |
| 6     | PDF generation, share links           |
| 7     | Stripe integration, webhooks          |
| 8     | Full E2E, cross-browser, security     |

---

## Deployment Strategy

### Environments

| Environment | Purpose                | URL                 |
| ----------- | ---------------------- | ------------------- |
| Local       | Development            | localhost:3000      |
| Preview     | PR reviews             | [branch].vercel.app |
| Staging     | Pre-production testing | staging.example.com |
| Production  | Live application       | app.example.com     |

### Deployment Flow

```
Local Development
       │
       ▼
   Push to Git
       │
       ▼
  Preview Deploy (Vercel)
       │
       ▼
   Code Review
       │
       ▼
   Merge to main
       │
       ▼
  Staging Deploy
       │
       ▼
  Manual Testing
       │
       ▼
  Production Deploy
```

### Environment Configuration

#### Local

- Supabase local or dev project
- Stripe test mode
- Email via console logging

#### Preview/Staging

- Dedicated Supabase project
- Stripe test mode
- Real email provider (sandboxed)

#### Production

- Production Supabase project
- Stripe live mode
- Production email provider
- Custom domain with SSL

### Rollback Plan

1. **Immediate rollback**: Vercel instant rollback to previous deployment
2. **Database rollback**: Restore from Supabase point-in-time backup
3. **Feature flags**: Disable problematic features without full rollback

### Monitoring (Post-MVP)

- Error tracking: Sentry
- Uptime monitoring: Better Uptime / Vercel
- Log aggregation: Vercel logs initially
- Performance: Vercel Analytics

### Pre-Launch Checklist

- [ ] Production environment variables configured
- [ ] Supabase production project set up
- [ ] Database migrations applied
- [ ] Stripe live mode configured
- [ ] Webhooks pointed to production
- [ ] Custom domain DNS configured
- [ ] SSL certificate active
- [ ] Email provider configured
- [ ] Seed data NOT applied to production
- [ ] Admin account created
- [ ] Monitoring alerts configured
- [ ] Backup schedule verified

---

## Appendix: Quick Reference

### Key Commands

```bash
# Development
npm run dev

# Build
npm run build

# Database migrations
npx supabase db push

# Seed data
npm run seed

# Tests
npm run test
npm run test:e2e
```

### Important URLs (to configure)

- App: `https://app.example.com`
- Public reports: `https://app.example.com/r/[token]`
- API: `https://app.example.com/api/*`
- Stripe webhook: `https://app.example.com/api/stripe/webhook`

### File Size Limits

- Photo upload: 5MB max (compress to ~2MB)
- PDF generation: No hard limit, but optimize images

### Token Specifications

- Share token: 8-12 chars, alphanumeric (nanoid)
- Invitation token: UUID
- Share link expiry: 7 days

---

_Plan created based on SPEC.md v1.0_  
_Last updated: [Current Date]_
