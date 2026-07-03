import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listForms from "./tools/list-forms";
import getForm from "./tools/get-form";
import listSubmissions from "./tools/list-submissions";
import createForm from "./tools/create-form";

// The OAuth issuer MUST be the direct Supabase host (not the .lovable.cloud proxy).
// VITE_SUPABASE_PROJECT_ID is inlined at build time by Vite. The fallback keeps the
// issuer well-formed during the manifest-extract eval; real tokens never verify
// against the sentinel.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "formlinc-mcp",
  title: "Formlinc",
  version: "0.1.0",
  instructions:
    "Tools for Formlinc: list a user's forms, read a form's structure, list submissions for a form, and create a new form. All operations are scoped to the signed-in user via Supabase RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listForms, getForm, listSubmissions, createForm],
});
