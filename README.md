# Photo-Based Quality Control (PBQC) SaaS

A mobile-first SaaS platform for quality control inspections with photo documentation, primarily targeting the German cleaning services market.

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password + Magic Link)
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Email**: Resend
- **PDF Generation**: pdfkit
- **Validation**: Zod
- **Forms**: react-hook-form

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for billing features)
- Resend account (for email features)

## Implementation Status

See [PLAN.md](PLAN.md) for detailed phase tracking. Current progress:

- ✅ Phase 0: Foundation & Setup - COMPLETED
- ✅ Phase 1: Authentication & Authorization - COMPLETED
- ✅ Phase 2: Core Data Management - COMPLETED
- ⏳ Phase 3: Job Management Foundation - Pending
- ⏳ Phase 4: Worker Flow (Priority) - Pending
- ⏳ Phase 5: Review & Approval Flow - Pending
- ⏳ Phase 6: PDF Report & Client Sharing - Pending
- ⏳ Phase 7: Billing & Subscription - Pending
- ⏳ Phase 8: Polish & Production Readiness - Pending

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd PBQC-SaaS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

### App
- `NEXT_PUBLIC_APP_URL` - Your application URL (e.g., http://localhost:3000)

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_STARTER_PRICE_ID` - Starter plan price ID
- `STRIPE_PRO_PRICE_ID` - Pro plan price ID

### Email (Resend)
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Sender email address

### 4. Set up Supabase

#### Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and API keys from Settings > API

#### Run database migrations

Apply the migrations to your Supabase database:

1. Navigate to the SQL Editor in your Supabase dashboard
2. Run the migration files in order:
   - `supabase/migrations/00001_initial_schema.sql` - Creates tables and ENUM types
   - `supabase/migrations/00002_rls_policies.sql` - Sets up Row Level Security
   - `supabase/migrations/00003_storage_setup.sql` - Creates storage buckets and policies

Alternatively, if you have the Supabase CLI installed:

```bash
npx supabase db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login, register, invite, etc.)
│   ├── (dashboard)/       # Manager/Owner dashboard
│   ├── (worker)/          # Worker mobile-first UI
│   ├── r/[token]/         # Public report pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Auth-related components
│   ├── forms/             # Form components
│   ├── job/               # Job-related components
│   ├── camera/            # Camera capture components
│   └── pdf/               # PDF-related components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── auth/              # Auth utilities, context, guards
│   ├── email/             # Email sending (Resend)
│   ├── stripe/            # Stripe integration
│   ├── pdf/               # PDF generation utilities
│   └── validations/       # Zod validation schemas
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types
    └── database.ts        # Database schema types

supabase/
└── migrations/            # SQL migration files
```

## Database Schema

### Core Tables

- `organizations` - Company/organization data
- `org_members` - Organization membership and roles
- `sites` - Physical locations for inspections
- `checklist_templates` - Reusable checklist templates
- `checklist_items` - Individual items within templates
- `jobs` - Scheduled/completed inspection jobs
- `job_item_results` - Results for each checklist item
- `job_photos` - Photos uploaded during inspections
- `job_comments` - Internal comments on jobs
- `client_shares` - Public share links for reports
- `billing_subscriptions` - Stripe subscription data

### User Roles

- **Owner**: Full access, can manage billing
- **Manager**: Can manage sites, templates, jobs, and workers
- **Worker**: Can execute assigned jobs

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Features (MVP)

1. **Authentication**
   - Email/password registration and login
   - Magic link authentication
   - Invitation system for team members

2. **Organization Management**
   - Create and manage organizations
   - Invite team members with roles
   - Manage sites and checklist templates

3. **Worker Flow**
   - Mobile-optimized interface
   - Checklist execution with pass/fail/n.a. options
   - Photo capture with custom camera UI
   - Quick mode for bulk completion

4. **Review & Approval**
   - Manager review workflow
   - Approve or reject with comments
   - Job rework flow for rejected jobs

5. **Reports & Sharing**
   - PDF report generation
   - Public share links with expiration
   - Client-friendly report view

6. **Billing**
   - 14-day free trial
   - Starter and Pro plans
   - Usage-based limits

## Configuration

### Stripe Setup (for billing)

1. Create products and prices in Stripe dashboard
2. Set up webhook endpoint
3. Configure environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_STARTER_PRICE_ID`
   - `STRIPE_PRO_PRICE_ID`

### Resend Setup (for emails)

1. Create an account at [resend.com](https://resend.com)
2. Verify your sender domain
3. Configure environment variables:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`

### Email Setup (optional)

Configure an email provider for notifications:

- Invitation emails
- Job assignment notifications
- Review notifications
- Trial reminders

## Language & Localization

- **Code & Comments**: English
- **User-facing Content**: German (UI labels, error messages, emails)

## Coding Conventions

- Use TypeScript strict mode
- Prefer server components and server actions over client components
- Use shadcn/ui (new-york style) for all UI components
- Follow Next.js App Router patterns
- Always use Zod schemas from `lib/validations/` for validation
- Use Supabase clients from `lib/supabase/` for database access
- All data access is protected by Row Level Security (RLS)
- Worker UI should be mobile-optimized

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy

### Manual

```bash
npm run build
npm run start
```

## Security

- All database operations use Row Level Security (RLS)
- Authentication handled by Supabase Auth
- API routes protected by middleware
- Storage buckets have proper access policies

## License

Private - All rights reserved
