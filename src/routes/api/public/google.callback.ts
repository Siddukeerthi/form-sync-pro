import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const err = url.searchParams.get("error");

        const errorRedirect = (msg: string) =>
          Response.redirect(
            `${url.origin}/dashboard?google=error&message=${encodeURIComponent(msg)}`,
            302,
          );

        if (err) return errorRedirect(err);
        if (!code || !state) return errorRedirect("missing_code");

        const { verifyState, exchangeCode } = await import("@/lib/google.server");
        const payload = verifyState<{ uid: string; r?: string }>(state);
        if (!payload?.uid) return errorRedirect("invalid_state");

        let tokens;
        try {
          tokens = await exchangeCode(code);
        } catch (e: any) {
          console.error("[google callback] exchange failed", e);
          return errorRedirect("exchange_failed");
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

        // Preserve existing refresh_token if Google didn't return a new one
        let refresh_token = tokens.refresh_token ?? null;
        if (!refresh_token) {
          const { data: existing } = await supabaseAdmin
            .from("google_tokens")
            .select("refresh_token")
            .eq("user_id", payload.uid)
            .maybeSingle();
          refresh_token = existing?.refresh_token ?? null;
        }

        const { error: upErr } = await supabaseAdmin.from("google_tokens").upsert(
          {
            user_id: payload.uid,
            access_token: tokens.access_token,
            refresh_token,
            expires_at: expiresAt,
            scope: tokens.scope ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        if (upErr) {
          console.error("[google callback] upsert failed", upErr);
          return errorRedirect("save_failed");
        }

        const returnTo = payload.r && payload.r.startsWith("/") ? payload.r : "/dashboard";
        return Response.redirect(`${url.origin}${returnTo}?google=connected`, 302);
      },
    },
  },
});
