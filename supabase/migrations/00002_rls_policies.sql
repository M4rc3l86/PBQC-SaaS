-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_item_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get all organization IDs the current user belongs to
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT org_id FROM org_members
  WHERE user_id = auth.uid()
  AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's role in a specific organization
CREATE OR REPLACE FUNCTION get_user_role(p_org_id UUID)
RETURNS org_role AS $$
DECLARE
  v_role org_role;
BEGIN
  SELECT role INTO v_role
  FROM org_members
  WHERE org_id = p_org_id
  AND user_id = auth.uid()
  AND status = 'active';

  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is owner or manager in an organization
CREATE OR REPLACE FUNCTION is_org_admin(p_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role org_role;
BEGIN
  v_role := get_user_role(p_org_id);
  RETURN v_role IN ('owner', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is the owner of an organization
CREATE OR REPLACE FUNCTION is_org_owner(p_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role org_role;
BEGIN
  v_role := get_user_role(p_org_id);
  RETURN v_role = 'owner';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get the org_member id for current user in a specific org
CREATE OR REPLACE FUNCTION get_user_member_id(p_org_id UUID)
RETURNS UUID AS $$
DECLARE
  v_member_id UUID;
BEGIN
  SELECT id INTO v_member_id
  FROM org_members
  WHERE org_id = p_org_id
  AND user_id = auth.uid()
  AND status = 'active';

  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- ORGANIZATIONS POLICIES
-- =============================================

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

-- Users can insert organizations (they will become owner via trigger in app logic)
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Only owners can update their organizations
CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  USING (is_org_owner(id))
  WITH CHECK (is_org_owner(id));

-- Only owners can delete their organizations
CREATE POLICY "Owners can delete their organizations"
  ON organizations FOR DELETE
  USING (is_org_owner(id));

-- =============================================
-- ORG_MEMBERS POLICIES
-- =============================================

-- Users can view members of their organizations
CREATE POLICY "Users can view org members"
  ON org_members FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

-- Admins can insert new members (invitations)
CREATE POLICY "Admins can invite members"
  ON org_members FOR INSERT
  TO authenticated
  WITH CHECK (is_org_admin(org_id));

-- Admins can update members (change role, status)
CREATE POLICY "Admins can update members"
  ON org_members FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

-- Admins can remove members
CREATE POLICY "Admins can remove members"
  ON org_members FOR DELETE
  USING (is_org_admin(org_id));

-- Allow users to update their own member record (e.g., accept invitation)
CREATE POLICY "Users can update their own member record"
  ON org_members FOR UPDATE
  USING (user_id = auth.uid() OR email = auth.email())
  WITH CHECK (user_id = auth.uid() OR email = auth.email());

-- =============================================
-- SITES POLICIES
-- =============================================

-- Users can view sites in their organizations
CREATE POLICY "Users can view org sites"
  ON sites FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

-- Admins can create sites
CREATE POLICY "Admins can create sites"
  ON sites FOR INSERT
  TO authenticated
  WITH CHECK (is_org_admin(org_id));

-- Admins can update sites
CREATE POLICY "Admins can update sites"
  ON sites FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

-- Admins can delete sites
CREATE POLICY "Admins can delete sites"
  ON sites FOR DELETE
  USING (is_org_admin(org_id));

-- =============================================
-- CHECKLIST_TEMPLATES POLICIES
-- =============================================

-- Users can view templates in their organizations
CREATE POLICY "Users can view org templates"
  ON checklist_templates FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

-- Admins can create templates
CREATE POLICY "Admins can create templates"
  ON checklist_templates FOR INSERT
  TO authenticated
  WITH CHECK (is_org_admin(org_id));

-- Admins can update templates
CREATE POLICY "Admins can update templates"
  ON checklist_templates FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

-- Admins can delete templates
CREATE POLICY "Admins can delete templates"
  ON checklist_templates FOR DELETE
  USING (is_org_admin(org_id));

-- =============================================
-- CHECKLIST_ITEMS POLICIES
-- =============================================

-- Users can view items of templates in their organizations
CREATE POLICY "Users can view template items"
  ON checklist_items FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM checklist_templates
      WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

-- Admins can create items
CREATE POLICY "Admins can create items"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    template_id IN (
      SELECT id FROM checklist_templates
      WHERE is_org_admin(org_id)
    )
  );

-- Admins can update items
CREATE POLICY "Admins can update items"
  ON checklist_items FOR UPDATE
  USING (
    template_id IN (
      SELECT id FROM checklist_templates
      WHERE is_org_admin(org_id)
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM checklist_templates
      WHERE is_org_admin(org_id)
    )
  );

-- Admins can delete items
CREATE POLICY "Admins can delete items"
  ON checklist_items FOR DELETE
  USING (
    template_id IN (
      SELECT id FROM checklist_templates
      WHERE is_org_admin(org_id)
    )
  );

-- =============================================
-- JOBS POLICIES
-- =============================================

-- Admins can view all jobs in their organizations
-- Workers can only view jobs assigned to them
CREATE POLICY "Users can view relevant jobs"
  ON jobs FOR SELECT
  USING (
    org_id IN (SELECT get_user_org_ids())
    AND (
      is_org_admin(org_id)
      OR assigned_to = get_user_member_id(org_id)
    )
  );

-- Admins can create jobs
CREATE POLICY "Admins can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (is_org_admin(org_id));

-- Admins can update any job, workers can update their assigned jobs
CREATE POLICY "Users can update relevant jobs"
  ON jobs FOR UPDATE
  USING (
    org_id IN (SELECT get_user_org_ids())
    AND (
      is_org_admin(org_id)
      OR assigned_to = get_user_member_id(org_id)
    )
  )
  WITH CHECK (
    org_id IN (SELECT get_user_org_ids())
    AND (
      is_org_admin(org_id)
      OR assigned_to = get_user_member_id(org_id)
    )
  );

-- Only admins can delete jobs
CREATE POLICY "Admins can delete jobs"
  ON jobs FOR DELETE
  USING (is_org_admin(org_id));

-- =============================================
-- JOB_ITEM_RESULTS POLICIES
-- =============================================

-- Users can view results for jobs they can access
CREATE POLICY "Users can view job results"
  ON job_item_results FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
      AND (
        is_org_admin(org_id)
        OR assigned_to = get_user_member_id(org_id)
      )
    )
  );

-- Users can insert results for jobs they can access
CREATE POLICY "Users can create job results"
  ON job_item_results FOR INSERT
  TO authenticated
  WITH CHECK (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
      AND (
        is_org_admin(org_id)
        OR assigned_to = get_user_member_id(org_id)
      )
    )
  );

-- Users can update results for jobs they can access
CREATE POLICY "Users can update job results"
  ON job_item_results FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
      AND (
        is_org_admin(org_id)
        OR assigned_to = get_user_member_id(org_id)
      )
    )
  )
  WITH CHECK (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
      AND (
        is_org_admin(org_id)
        OR assigned_to = get_user_member_id(org_id)
      )
    )
  );

-- =============================================
-- JOB_PHOTOS POLICIES
-- =============================================

-- Users can view photos for jobs they can access
CREATE POLICY "Users can view job photos"
  ON job_photos FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
      AND (
        is_org_admin(org_id)
        OR assigned_to = get_user_member_id(org_id)
      )
    )
  );

-- Users can upload photos for their assigned jobs
CREATE POLICY "Users can upload job photos"
  ON job_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
      AND (
        is_org_admin(org_id)
        OR assigned_to = get_user_member_id(org_id)
      )
    )
  );

-- Users can delete photos for their assigned jobs (before submission)
CREATE POLICY "Users can delete job photos"
  ON job_photos FOR DELETE
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
      AND status IN ('scheduled', 'in_progress', 'rejected')
      AND (
        is_org_admin(org_id)
        OR assigned_to = get_user_member_id(org_id)
      )
    )
  );

-- =============================================
-- JOB_COMMENTS POLICIES
-- =============================================

-- Users can view comments for jobs in their organizations
CREATE POLICY "Users can view job comments"
  ON job_comments FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

-- Admins can create comments
CREATE POLICY "Admins can create job comments"
  ON job_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    job_id IN (
      SELECT id FROM jobs
      WHERE is_org_admin(org_id)
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON job_comments FOR UPDATE
  USING (
    author_id IN (
      SELECT id FROM org_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    author_id IN (
      SELECT id FROM org_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON job_comments FOR DELETE
  USING (
    author_id IN (
      SELECT id FROM org_members
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- CLIENT_SHARES POLICIES
-- =============================================

-- Users can view shares for jobs in their organizations
CREATE POLICY "Users can view client shares"
  ON client_shares FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

-- Admins can create shares
CREATE POLICY "Admins can create client shares"
  ON client_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    job_id IN (
      SELECT id FROM jobs
      WHERE is_org_admin(org_id)
    )
  );

-- Admins can update shares (revoke)
CREATE POLICY "Admins can update client shares"
  ON client_shares FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE is_org_admin(org_id)
    )
  )
  WITH CHECK (
    job_id IN (
      SELECT id FROM jobs
      WHERE is_org_admin(org_id)
    )
  );

-- Allow public access to view shares by token (for client report viewing)
CREATE POLICY "Public can view shares by token"
  ON client_shares FOR SELECT
  TO anon
  USING (
    token IS NOT NULL
    AND expires_at > NOW()
    AND revoked_at IS NULL
  );

-- =============================================
-- BILLING_SUBSCRIPTIONS POLICIES
-- =============================================

-- Only owners can view their organization's subscription
CREATE POLICY "Owners can view billing"
  ON billing_subscriptions FOR SELECT
  USING (is_org_owner(org_id));

-- Only owners can update their organization's subscription
CREATE POLICY "Owners can update billing"
  ON billing_subscriptions FOR UPDATE
  USING (is_org_owner(org_id))
  WITH CHECK (is_org_owner(org_id));

-- System can insert billing (via service role)
CREATE POLICY "Service role can manage billing"
  ON billing_subscriptions FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);
