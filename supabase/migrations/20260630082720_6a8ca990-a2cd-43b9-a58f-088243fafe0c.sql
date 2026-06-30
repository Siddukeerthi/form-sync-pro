-- Restrict public anon SELECT on forms to safe columns only (exclude user_id, sheet_id, sheet_url)
REVOKE SELECT ON public.forms FROM anon;
GRANT SELECT (id, slug, title, description, fields, theme, published, submission_count, created_at, updated_at) ON public.forms TO anon;

-- Add owner write policies for google_tokens so users can manage their own tokens via API
CREATE POLICY google_tokens_owner_insert ON public.google_tokens
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY google_tokens_owner_update ON public.google_tokens
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY google_tokens_owner_delete ON public.google_tokens
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);