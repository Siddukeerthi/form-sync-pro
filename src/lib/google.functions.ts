import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getGoogleStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("google_tokens")
      .select("user_id, scope, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { connected: !!data, scope: data?.scope ?? null };
  });

export const startGoogleAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ returnTo: z.string().max(300).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { buildAuthUrl, signState } = await import("@/lib/google.server");
    const state = signState({ uid: context.userId, r: data.returnTo ?? "/dashboard" });
    return { url: buildAuthUrl(state) };
  });

export const disconnectGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row } = await context.supabase
      .from("google_tokens")
      .select("access_token, refresh_token")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (row) {
      const { revokeToken } = await import("@/lib/google.server");
      await revokeToken(row.refresh_token ?? row.access_token);
    }
    await context.supabase.from("google_tokens").delete().eq("user_id", context.userId);
    // Also clear sheet links on user's forms so re-connect starts fresh
    await context.supabase
      .from("forms")
      .update({ sheet_id: null, sheet_url: null, sheet_header_written: false })
      .eq("user_id", context.userId);
    return { ok: true };
  });

export const connectFormToSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ formId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: form, error } = await context.supabase
      .from("forms")
      .select("id, title, sheet_id, sheet_url")
      .eq("id", data.formId)
      .maybeSingle();
    if (error || !form) throw new Error("Form not found");
    if (form.sheet_id && form.sheet_url) {
      return { sheetId: form.sheet_id, sheetUrl: form.sheet_url, alreadyConnected: true };
    }

    const { getValidAccessToken, createSpreadsheet } = await import("@/lib/google.server");
    const token = await getValidAccessToken(context.userId);
    if (!token) throw new Error("Google not connected");

    const { spreadsheetId, spreadsheetUrl } = await createSpreadsheet(
      token,
      `${form.title} — Formlinc`,
    );

    const { error: uErr } = await context.supabase
      .from("forms")
      .update({
        sheet_id: spreadsheetId,
        sheet_url: spreadsheetUrl,
        sheet_header_written: false,
      })
      .eq("id", form.id);
    if (uErr) throw new Error(uErr.message);

    return { sheetId: spreadsheetId, sheetUrl: spreadsheetUrl, alreadyConnected: false };
  });

export const disconnectFormFromSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ formId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("forms")
      .update({ sheet_id: null, sheet_url: null, sheet_header_written: false })
      .eq("id", data.formId);
    if (error) throw new Error(error.message);
    // Mark existing submissions as unsynced so a fresh connect + backfill works
    await context.supabase
      .from("submissions")
      .update({ synced_to_sheet: false })
      .eq("form_id", data.formId);
    return { ok: true };
  });

export const syncFormResponses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ formId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: form } = await context.supabase
      .from("forms")
      .select("id, user_id, sheet_id, sheet_header_written, fields")
      .eq("id", data.formId)
      .maybeSingle();
    if (!form) throw new Error("Form not found");
    if (!form.sheet_id) throw new Error("Connect a Google Sheet first");

    const { getValidAccessToken, appendRows } = await import("@/lib/google.server");
    const token = await getValidAccessToken(context.userId);
    if (!token) throw new Error("Google not connected");

    const { data: subs } = await context.supabase
      .from("submissions")
      .select("id, payload, created_at, synced_to_sheet")
      .eq("form_id", form.id)
      .eq("synced_to_sheet", false)
      .order("created_at", { ascending: true });

    const fields = ((form.fields as any[]) ?? []) as Array<{ id: string; label: string }>;
    const rows: (string | number | boolean)[][] = [];
    if (!form.sheet_header_written) {
      rows.push(["Submitted at", ...fields.map((f) => f.label)]);
    }
    for (const s of subs ?? []) {
      const p = (s.payload as any) ?? {};
      rows.push([
        new Date(s.created_at).toISOString(),
        ...fields.map((f) => {
          const v = p[f.id];
          if (v == null) return "";
          if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
          return String(v);
        }),
      ]);
    }

    if (rows.length === 0) return { synced: 0 };

    await appendRows(token, form.sheet_id, rows);

    if (!form.sheet_header_written) {
      await context.supabase
        .from("forms")
        .update({ sheet_header_written: true })
        .eq("id", form.id);
    }
    if (subs?.length) {
      await context.supabase
        .from("submissions")
        .update({ synced_to_sheet: true })
        .in(
          "id",
          subs.map((s) => s.id),
        );
    }
    return { synced: subs?.length ?? 0 };
  });
