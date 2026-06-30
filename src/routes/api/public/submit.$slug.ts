import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  payload: z.record(z.string(), z.any()),
});

export const Route = createFileRoute("/api/public/submit/$slug")({
  server: {
    handlers: {
      POST: async ({ request, params }: { request: Request; params: { slug: string } }) => {
        const json = (s: any, status = 200) =>
          new Response(JSON.stringify(s), {
            status,
            headers: { "content-type": "application/json" },
          });

        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch {
          return json({ error: "Invalid body" }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: form, error: fErr } = await supabaseAdmin
          .from("forms")
          .select("id, fields, published")
          .eq("slug", params.slug)
          .maybeSingle();

        if (fErr || !form || !form.published) {
          return json({ error: "Form not available" }, 404);
        }

        // Validate against declared schema
        const fields = (form.fields as any[]) ?? [];
        const cleaned: Record<string, any> = {};
        for (const f of fields) {
          const v = body.payload[f.id];
          if (f.required && (v == null || v === "" || v === false))
            return json({ error: `Field "${f.label}" is required` }, 400);
          if (v == null || v === "") continue;
          if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)))
            return json({ error: `Invalid email for "${f.label}"` }, 400);
          if (f.type === "number" && isNaN(Number(v)))
            return json({ error: `Invalid number for "${f.label}"` }, 400);
          if (f.type === "checkbox") cleaned[f.id] = Boolean(v);
          else if (f.type === "number") cleaned[f.id] = Number(v);
          else cleaned[f.id] = String(v).slice(0, 5000);
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          null;
        const ua = request.headers.get("user-agent");

        const { error: iErr } = await supabaseAdmin.from("submissions").insert({
          form_id: form.id,
          payload: cleaned,
          submitter_ip: ip,
          submitter_ua: ua,
        });
        if (iErr) return json({ error: "Could not save" }, 500);

        // increment submission counter
        const { data: cur } = await supabaseAdmin
          .from("forms")
          .select("submission_count")
          .eq("id", form.id)
          .maybeSingle();
        if (cur) {
          await supabaseAdmin
            .from("forms")
            .update({ submission_count: (cur.submission_count ?? 0) + 1 })
            .eq("id", form.id);
        }

        return json({ ok: true });
      },
    },
  },
});
