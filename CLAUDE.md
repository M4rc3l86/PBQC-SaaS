# CLAUDE.md - Project Context for AI Assistants

## Project Overview

**PBQC-SaaS** (Photo-Based Quality Control SaaS) is a multi-tenant SaaS platform for photo-based quality control in recurring service jobs. Initially targeting the cleaning industry (Gebäudereinigung), it enables companies to create checklists, require photo documentation from workers, and generate professional PDF reports for clients.

## Tech Stack

| Component      | Technology                                  |
| -------------- | ------------------------------------------- |
| Framework      | Next.js 16+ (App Router)                    |
| Language       | TypeScript (strict mode)                    |
| Styling        | Tailwind CSS 4                              |
| UI Components  | shadcn/ui (new-york style)                  |
| Database       | Supabase (PostgreSQL)                       |
| Auth           | Supabase Auth (Email/Password + Magic Link) |
| Storage        | Supabase Storage                            |
| Payments       | Stripe                                      |
| PDF Generation | pdfkit                                      |
| Validation     | Zod                                         |
| Forms          | react-hook-form                             |
| Hosting        | Vercel                                      |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register, invite)
│   ├── (dashboard)/       # Manager/Owner dashboard
│   ├── (worker)/          # Worker mobile-first UI
│   ├── r/[token]/         # Public report pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── job/               # Job-related components
│   ├── camera/            # Camera capture components
│   └── pdf/               # PDF-related components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── stripe/            # Stripe integration
│   ├── pdf/               # PDF generation utilities
│   └── validations/       # Zod validation schemas
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript types
    └── database.ts        # Database schema types
```

## Key Commands

```bash
# Development
npm run dev          # Start dev server on port 3000

# Build
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Database (Supabase CLI)
npx supabase db push              # Apply migrations
npx supabase gen types typescript # Generate types
```

## Database Schema

Located in `supabase/migrations/`:

- `00001_initial_schema.sql` - Tables and ENUM types
- `00002_rls_policies.sql` - Row Level Security policies
- `00003_storage_setup.sql` - Storage buckets and policies

### Core Tables

- `organizations` - Multi-tenant organizations
- `org_members` - Organization membership with roles (owner/manager/worker)
- `sites` - Physical locations for jobs
- `checklist_templates` - Reusable checklist templates
- `checklist_items` - Individual checklist items
- `jobs` - Job instances with status tracking
- `job_item_results` - Results for each checklist item
- `job_photos` - Photo attachments
- `job_comments` - Internal comments
- `client_shares` - Public share tokens for reports
- `billing_subscriptions` - Stripe subscription data

## User Roles

| Role    | Description                           |
| ------- | ------------------------------------- |
| Owner   | Org admin, billing, full access       |
| Manager | Creates jobs, reviews, shares reports |
| Worker  | Executes assigned jobs, takes photos  |

## Job Status Flow

```
scheduled → in_progress → submitted → approved
                ↓              ↓
            cancelled      rejected → in_progress (rework)
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=
```

## Development Guidelines

1. **Route Groups**: Use `(auth)`, `(dashboard)`, `(worker)` for logical grouping
2. **Server Components**: Default to server components, use `"use client"` only when needed
3. **Validation**: Always use Zod schemas from `lib/validations/`
4. **Database Access**: Use Supabase clients from `lib/supabase/`
5. **RLS**: All data access is protected by Row Level Security
6. **Mobile First**: Worker UI should be mobile-optimized

## Implementation Status

See `PLAN.md` for detailed phase tracking. Current progress:

- Phase 0: Foundation & Setup - COMPLETED
- Phase 1: Authentication & Authorization - IN PROGRESS
- Phase 2-8: Pending

## Coding Conventions

- Use TypeScript strict mode
- Prefer server components and server actions
- Use shadcn/ui for all UI components
- Follow Next.js App Router patterns
- German language for user-facing content (UI labels, emails)
- English for code and comments
