-- =============================================
-- Storage Bucket Setup
-- =============================================

-- Create the job-photos bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos',
  'job-photos',
  FALSE,  -- private bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create the pdf-reports bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-reports',
  'pdf-reports',
  FALSE,  -- private bucket
  10485760,  -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- Storage Policies for job-photos bucket
-- =============================================

-- Helper function to check if user can access a job's photos
CREATE OR REPLACE FUNCTION can_access_job_photos(job_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_org_id UUID;
  v_assigned_to UUID;
BEGIN
  SELECT org_id, assigned_to INTO v_org_id, v_assigned_to
  FROM jobs
  WHERE id = job_uuid;

  IF v_org_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user is an admin or assigned to the job
  RETURN is_org_admin(v_org_id) OR v_assigned_to = get_user_member_id(v_org_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy: Authenticated users can upload photos to their jobs
-- Path format: {org_id}/{job_id}/{filename}
CREATE POLICY "Users can upload photos to their jobs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'job-photos'
    AND can_access_job_photos((storage.foldername(name))[2]::UUID)
  );

-- Policy: Authenticated users can view photos from their jobs
CREATE POLICY "Users can view photos from their jobs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'job-photos'
    AND can_access_job_photos((storage.foldername(name))[2]::UUID)
  );

-- Policy: Authenticated users can delete photos from their jobs (before submission)
CREATE POLICY "Users can delete photos from their jobs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'job-photos'
    AND (storage.foldername(name))[2]::UUID IN (
      SELECT id FROM jobs
      WHERE status IN ('scheduled', 'in_progress', 'rejected')
      AND (
        is_org_admin(org_id)
        OR assigned_to = get_user_member_id(org_id)
      )
    )
  );

-- =============================================
-- Storage Policies for pdf-reports bucket
-- =============================================

-- Helper function to check if user can access a pdf report
CREATE OR REPLACE FUNCTION can_access_pdf_report(job_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT org_id INTO v_org_id
  FROM jobs
  WHERE id = job_uuid;

  IF v_org_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Only admins can access PDF reports
  RETURN is_org_admin(v_org_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy: Admins can upload PDF reports
-- Path format: {org_id}/{job_id}/{filename}
CREATE POLICY "Admins can upload pdf reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pdf-reports'
    AND can_access_pdf_report((storage.foldername(name))[2]::UUID)
  );

-- Policy: Admins can view PDF reports
CREATE POLICY "Admins can view pdf reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pdf-reports'
    AND can_access_pdf_report((storage.foldername(name))[2]::UUID)
  );

-- Policy: Allow public access to PDF reports via valid share token
-- This requires the path to be stored in client_shares.pdf_storage_path
CREATE POLICY "Public can view shared pdf reports"
  ON storage.objects FOR SELECT
  TO anon
  USING (
    bucket_id = 'pdf-reports'
    AND name IN (
      SELECT pdf_storage_path FROM client_shares
      WHERE expires_at > NOW()
      AND revoked_at IS NULL
    )
  );
