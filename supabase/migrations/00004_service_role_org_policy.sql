-- Allow service role to bypass RLS for organizations
-- This is needed for server actions that use the service role client
CREATE POLICY "Service role can manage organizations"
  ON organizations FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);
