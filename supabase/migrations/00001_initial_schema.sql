-- =============================================
-- Photo-Based Quality Control SaaS - Initial Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

-- Organization member roles
CREATE TYPE org_role AS ENUM ('owner', 'manager', 'worker');

-- Organization member status
CREATE TYPE member_status AS ENUM ('invited', 'active', 'inactive');

-- Checklist item types
CREATE TYPE item_type AS ENUM ('checkbox', 'text', 'number', 'photo_only');

-- Job status state machine
CREATE TYPE job_status AS ENUM ('scheduled', 'in_progress', 'submitted', 'approved', 'rejected', 'cancelled');

-- Item result status
CREATE TYPE item_result_status AS ENUM ('pass', 'fail', 'na', 'pending');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');

-- Plan types
CREATE TYPE plan_type AS ENUM ('starter', 'pro');

-- =============================================
-- TABLES
-- =============================================

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Organization members table
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'worker',
  status member_status NOT NULL DEFAULT 'invited',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  invitation_token UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- Create index for user lookups
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_email ON org_members(email);
CREATE INDEX idx_org_members_invitation_token ON org_members(invitation_token);

-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for org lookups
CREATE INDEX idx_sites_org_id ON sites(org_id);

-- Checklist templates table
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for org lookups
CREATE INDEX idx_checklist_templates_org_id ON checklist_templates(org_id);

-- Checklist items table
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  item_type item_type NOT NULL DEFAULT 'checkbox',
  requires_photo BOOLEAN NOT NULL DEFAULT FALSE,
  requires_note BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for template lookups and sorting
CREATE INDEX idx_checklist_items_template_id ON checklist_items(template_id);
CREATE INDEX idx_checklist_items_parent_id ON checklist_items(parent_id);
CREATE INDEX idx_checklist_items_sort_order ON checklist_items(template_id, sort_order);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES org_members(id) ON DELETE SET NULL,
  status job_status NOT NULL DEFAULT 'scheduled',
  scheduled_date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES org_members(id) ON DELETE SET NULL,
  review_comment TEXT,
  quick_mode_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_jobs_org_id ON jobs(org_id);
CREATE INDEX idx_jobs_site_id ON jobs(site_id);
CREATE INDEX idx_jobs_assigned_to ON jobs(assigned_to);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_org_status ON jobs(org_id, status);
CREATE INDEX idx_jobs_org_scheduled_date ON jobs(org_id, scheduled_date);

-- Job item results table
CREATE TABLE job_item_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  status item_result_status NOT NULL DEFAULT 'pending',
  note TEXT,
  number_value DECIMAL,
  text_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, item_id)
);

-- Create indexes for job lookups
CREATE INDEX idx_job_item_results_job_id ON job_item_results(job_id);
CREATE INDEX idx_job_item_results_item_id ON job_item_results(item_id);

-- Job photos table
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  item_id UUID REFERENCES checklist_items(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES org_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for job and item lookups
CREATE INDEX idx_job_photos_job_id ON job_photos(job_id);
CREATE INDEX idx_job_photos_item_id ON job_photos(item_id);

-- Job comments (internal notes) table
CREATE TABLE job_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES org_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for job lookups
CREATE INDEX idx_job_comments_job_id ON job_comments(job_id);

-- Client shares table
CREATE TABLE client_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  pdf_storage_path TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for token lookups
CREATE INDEX idx_client_shares_token ON client_shares(token);
CREATE INDEX idx_client_shares_job_id ON client_shares(job_id);

-- Billing subscriptions table
CREATE TABLE billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan plan_type NOT NULL DEFAULT 'starter',
  status subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for org lookups
CREATE INDEX idx_billing_subscriptions_org_id ON billing_subscriptions(org_id);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON checklist_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_item_results_updated_at
  BEFORE UPDATE ON job_item_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_comments_updated_at
  BEFORE UPDATE ON job_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_subscriptions_updated_at
  BEFORE UPDATE ON billing_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
