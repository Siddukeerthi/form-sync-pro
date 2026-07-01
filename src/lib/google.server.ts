// Server-only Google OAuth + Sheets helpers.
// Do NOT import at module scope from .functions.ts files — load inside handlers.
import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "openid",
  "email",
];

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function getRedirectUri(): string {
  return (
    process.env.GOOGLE_REDIRECT_URI ??
    "https://formlinc.lovable.app/api/public/google/callback"
  );
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

// state = base64url(payloadJson) + "." + base64url(hmac)
export function signState(payload: Record<string, unknown>): string {
  const secret = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const body = b64url(Buffer.from(JSON.stringify({ ...payload, ts: Date.now() })));
  const sig = b64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyState<T = any>(state: string): T | null {
  try {
    const secret = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const [body, sig] = state.split(".");
    if (!body || !sig) return null;
    const expected = b64url(createHmac("sha256", secret).update(body).digest());
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(fromB64url(body).toString("utf8"));
    if (Date.now() - Number(payload.ts ?? 0) > 10 * 60 * 1000) return null;
    return payload as T;
  } catch {
    return null;
  }
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
  id_token?: string;
}

export async function exchangeCode(code: string): Promise<GoogleTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as GoogleTokens;
}

export async function refreshToken(refresh_token: string): Promise<GoogleTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token,
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as GoogleTokens;
}

// Returns a valid access token for the user; refreshes if near-expiry.
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin
    .from("google_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!row) return null;

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  if (expiresAt - Date.now() > 60_000) return row.access_token;

  if (!row.refresh_token) return null;
  const t = await refreshToken(row.refresh_token);
  const newExpires = new Date(Date.now() + t.expires_in * 1000).toISOString();
  await supabaseAdmin
    .from("google_tokens")
    .update({
      access_token: t.access_token,
      expires_at: newExpires,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  return t.access_token;
}

// --- Sheets/Drive helpers ---

export async function createSpreadsheet(
  accessToken: string,
  title: string,
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ properties: { title } }),
  });
  if (!res.ok) throw new Error(`Create sheet failed: ${res.status} ${await res.text()}`);
  const j = (await res.json()) as any;
  return { spreadsheetId: j.spreadsheetId, spreadsheetUrl: j.spreadsheetUrl };
}

export async function appendRows(
  accessToken: string,
  spreadsheetId: string,
  rows: (string | number | boolean)[][],
): Promise<void> {
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ values: rows }),
  });
  if (!res.ok) throw new Error(`Append failed: ${res.status} ${await res.text()}`);
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
    method: "POST",
  }).catch(() => {});
}

// Fire-and-forget append triggered from submit endpoint.
export async function syncSubmissionToSheet(params: {
  formId: string;
  payload: Record<string, any>;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: form } = await supabaseAdmin
      .from("forms")
      .select("id, user_id, title, sheet_id, sheet_header_written, fields")
      .eq("id", params.formId)
      .maybeSingle();
    if (!form || !form.sheet_id) return;

    const token = await getValidAccessToken(form.user_id);
    if (!token) return;

    const fields = ((form.fields as any[]) ?? []) as Array<{ id: string; label: string }>;
    const rows: (string | number | boolean)[][] = [];

    if (!form.sheet_header_written) {
      rows.push(["Submitted at", ...fields.map((f) => f.label)]);
    }
    rows.push([
      new Date().toISOString(),
      ...fields.map((f) => {
        const v = params.payload[f.id];
        if (v == null) return "";
        if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
        return String(v);
      }),
    ]);

    await appendRows(token, form.sheet_id, rows);

    if (!form.sheet_header_written) {
      await supabaseAdmin
        .from("forms")
        .update({ sheet_header_written: true })
        .eq("id", form.id);
    }
    // mark the most recent matching submission as synced (best-effort)
    await supabaseAdmin
      .from("submissions")
      .update({ synced_to_sheet: true })
      .eq("form_id", form.id)
      .eq("synced_to_sheet", false)
      .order("created_at", { ascending: false })
      .limit(1);
  } catch (e) {
    console.error("[sheets] sync failed", e);
  }
}
