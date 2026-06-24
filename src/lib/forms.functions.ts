import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const FieldSchema = z.object({
  id: z.string(),
  type: z.enum(["short_text", "long_text", "email", "phone", "number", "select", "checkbox"]),
  label: z.string().min(1).max(200),
  placeholder: z.string().max(200).optional(),
  required: z.boolean().optional(),
  options: z.array(z.string().max(100)).max(50).optional(),
});

export const listForms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("forms")
      .select("id, slug, title, description, published, submission_count, updated_at, created_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const getForm = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: form, error } = await context.supabase
      .from("forms")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!form) throw new Error("Form not found");
    return form;
  });

export const createForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ title: z.string().min(1).max(120), slug: z.string().min(1).max(60) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // ensure unique slug
    let slug = data.slug;
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await context.supabase
        .from("forms")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${data.slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
    const { data: form, error } = await context.supabase
      .from("forms")
      .insert({
        user_id: context.userId,
        title: data.title,
        slug,
        fields: [
          { id: crypto.randomUUID(), type: "short_text", label: "Name", required: true },
          { id: crypto.randomUUID(), type: "email", label: "Email", required: true },
        ],
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return form;
  });

export const updateForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(120).optional(),
        description: z.string().max(500).nullable().optional(),
        fields: z.array(FieldSchema).max(50).optional(),
        published: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { data: form, error } = await context.supabase
      .from("forms")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return form;
  });

export const deleteForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("forms").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ formId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("submissions")
      .select("id, payload, created_at")
      .eq("form_id", data.formId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return rows;
  });
