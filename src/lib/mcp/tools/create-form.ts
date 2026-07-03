import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "form"
  );
}

export default defineTool({
  name: "create_form",
  title: "Create form",
  description:
    "Create a new form with a title. Starts with Name + Email fields; edit further in the builder.",
  inputSchema: {
    title: z.string().min(1).max(120).describe("Form title shown to respondents."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let slug = slugify(title);
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await sb.from("forms").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
    }
    const { data, error } = await sb
      .from("forms")
      .insert({
        user_id: ctx.getUserId(),
        title,
        slug,
        fields: [
          { id: crypto.randomUUID(), type: "short_text", label: "Name", required: true },
          { id: crypto.randomUUID(), type: "email", label: "Email", required: true },
        ],
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created form "${title}" (id ${data.id}, slug ${data.slug}).` }],
      structuredContent: { form: data },
    };
  },
});
