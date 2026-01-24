# Photo-Based Quality Control (PBQC) SaaS

A mobile-first SaaS platform for quality control inspections with photo documentation, primarily targeting the German cleaning services market.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **PDF Generation**: pdfkit

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for billing features)

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
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

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
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Manager/Owner dashboard
│   ├── (worker)/          # Worker mobile UI
│   ├── r/[token]/         # Public report pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── job/               # Job-related components
│   ├── camera/            # Camera capture components
│   └── pdf/               # PDF generation components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── stripe/            # Stripe integration
│   ├── pdf/               # PDF generation utilities
│   └── validations/       # Zod schemas
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types

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
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_STARTER_PRICE_ID`
   - `STRIPE_PRO_PRICE_ID`

### Email Setup (optional)

Configure an email provider for notifications:
- Invitation emails
- Job assignment notifications
- Review notifications
- Trial reminders

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
