-- Make it explicit that submissions cannot be created through the public Data API.
-- All submissions are created server-side by the /api/public/submit/$slug route
-- using the service role, only after verifying the target form is published.
CREATE POLICY submissions_no_api_insert ON public.submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);