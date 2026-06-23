
# Formlinc — Full Build Plan

A SaaS that lets marketers build forms, share them via link, and sync submissions into their own Google Sheets in real time.

## Design system

Pastel/editorial premium SaaS — not dark. Inspired by Linear/Typeform polish, executed in a warm light palette.

- Palette (tokens in `src/styles.css` via `@theme`):
  - `--background` cream `#FFF9D2`
  - `--surface` peach `#FFEBCC`
  - `--accent-soft` sky `#BFDDF0`
  - `--primary` blue `#8CC0EB` (with deeper `#3F7FB8` for text/CTA contrast)
  - `--foreground` ink `#1A2A3A`
- Typography: Instrument Serif for display headlines, Geist Sans (or Inter) for UI/body. Loaded via `<link>` in `__root.tsx`.
- Shapes: 20–28px radii, soft layered shadows tinted with the primary, subtle 1px borders in `#1A2A3A/10`.
- Motion: Framer Motion. Staggered fade+rise on scroll (IntersectionObserver via `useInView`), hover lift on cards, glow pulse on primary CTA, animated rows flying from form panel into a faux Sheets grid in the hero.

## Scope (single delivery)

1. Public marketing landing (`/`)
2. Auth (`/auth`) — email/password + Google via Lovable broker
3. Dashboard (`/_authenticated/dashboard`) — forms grid, metrics, create
4. Form Builder (`/_authenticated/builder/$formId`) — split-screen with toolbox, canvas, style/setup
5. Integrations page (`/_authenticated/integrations`) — Google Sheets connection
6. Public form renderer (`/f/$formId`) — themed, validated, animated success
7. Submission API (`/api/public/submit/$formId`) — validates + writes to DB + appends to Google Sheet

## Routes (TanStack Start file-based)

```text
src/routes/
  __root.tsx                              fonts, providers, toaster
  index.tsx                               landing
  auth.tsx                                sign in / sign up
  f.$formId.tsx                           public form renderer
  api/public/submit.$formId.ts            POST submission handler
  api/public/google/callback.ts           OAuth callback
  _authenticated/route.tsx                managed auth gate (exists)
  _authenticated/dashboard.tsx            forms grid
  _authenticated/builder.$formId.tsx      split-screen builder
  _authenticated/integrations.tsx        Google Sheets connect
  _authenticated/analytics.tsx           submissions analytics
  _authenticated/settings.tsx            account
```

## Backend (Lovable Cloud)

Migration creates schema + RLS + grants in one shot.

```sql
-- profiles (mirror of auth user)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text, display_name text,
  created_at timestamptz default now()
);

-- forms
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled form',
  fields jsonb not null default '[]'::jsonb,   -- array of {id,type,label,placeholder,required,options?}
  theme jsonb not null default '{}'::jsonb,    -- {primary,font,background}
  slug text unique not null,
  published boolean not null default false,
  sheet_id text, sheet_url text, sheet_tab text default 'Sheet1',
  sheet_header_written boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- submissions
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- google oauth tokens (per user)
create table public.google_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null
);
```

Grants + RLS for all four tables; submissions table allows anonymous INSERT only via the server route (we use service role inside the handler — no public RLS on insert from clients).

## Google Sheets integration

- Secrets to add: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (the `/api/public/google/callback` URL on the stable preview/prod hostname).
- OAuth scopes: `https://www.googleapis.com/auth/spreadsheets` + `userinfo.email`.
- Server functions in `src/lib/google.functions.ts`:
  - `getGoogleAuthUrl()` — returns consent URL with `state = userId`.
  - `connectSheetToForm({ formId, sheetUrl })` — parses spreadsheetId, validates via Sheets API, writes header row from `form.fields`.
  - `appendSubmissionToSheet({ formId, payload })` — used by the public submit route; refreshes token if expired; catches 404 (deleted sheet) and 429 (rate limit) and degrades gracefully (still saves submission, surfaces a warning on the form's status indicator).
- Public callback route exchanges the code, upserts into `public.google_tokens`, redirects to `/_authenticated/integrations?connected=1`.

## Submission flow

`POST /api/public/submit/$formId`:
1. Load form by slug/id (server publishable client + narrow `to anon` SELECT for published forms only).
2. Zod-validate `payload` against `form.fields` (required, email, phone regex, max lengths).
3. Insert into `submissions` via `supabaseAdmin` (loaded inside handler).
4. Fire-and-await `appendSubmissionToSheet` — non-fatal on Sheets failure.
5. Return `{ ok: true }` with CORS headers.

## Frontend pages

### Landing (`index.tsx`)
- Sticky nav: wordmark, Features, Pricing, glowing "Get Started" → `/auth`.
- Hero: serif headline "Capture Leads. Sync Instantly. Zero Friction.", sub explaining Sheets sync, two CTAs. Right side: animated mock — form card on left with three fields filling in sequence, each completed field morphs into a row pill that flies into a Sheets-style grid on the right. Looped via Framer Motion `useAnimationControls`.
- Bento features (4 tiles, asymmetric grid): Drag-and-drop builder (mini animated canvas), Real-time Sheets sync (animated row stream), Analytics (sparkline + conversion ring), Social-optimized links (Twitter/IG share card mock).
- Testimonial marquee: two rows scrolling opposite directions, paused on hover, 6 marketer quotes.
- Pricing: Monthly/Annually toggle with spring animation; Free / Pro ($19) / Enterprise cards; Pro highlighted with primary glow.
- Footer: 4 link columns + newsletter input.
- Scroll reveals via a small `<Reveal>` wrapper using Framer Motion `whileInView`.

### Dashboard (`_authenticated/dashboard.tsx`)
- `AppShell` with shadcn Sidebar (Forms, Integrations, Analytics, Settings) + top bar with user menu.
- Forms grid: cards show title, total responses, conversion rate (mock initially, real once submissions exist), published toggle (optimistic update).
- "+ Create New Form" creates a row and routes to `/builder/$formId`.

### Builder (`_authenticated/builder.$formId.tsx`)
- Three-pane layout.
  - Left toolbox: Short Text, Long Text, Email, Phone, Multiple Choice, File Upload. Click to append, drag to reorder.
  - Center canvas: live field list using `@dnd-kit/sortable`; each item has gear popover (label, placeholder, required, delete).
  - Right panel: Theme (color picker for primary, font select, background swatch picker bound to our pastel set) — updates canvas live via CSS variables on the preview wrapper. Section B: Google Sheets status + Connect button (calls `connectSheetToForm` after user pastes URL in a dialog).
- Top header: Back to Dashboard, Preview (opens `/f/$slug` in new tab), Publish & Share Link (toggles `published`, copies URL with toast).
- Autosave on field/theme changes (debounced server fn).

### Public form (`f.$formId.tsx`)
- SSR loader fetches published form via server publishable client; 404 if unpublished.
- Applies theme via inline CSS vars on root container.
- React Hook Form + Zod schema generated from `form.fields`.
- Submit shows animated spinner; success swaps form out for a Framer Motion checkmark-pop "Thank you" card with confetti-light scale animation.
- Optimized: no heavy deps on this route, lazy-loaded confetti, preconnect to API.

## Mock state first, real data progressively
- Dashboard and Builder ship wired to real Cloud tables from day one (RLS-scoped to `auth.uid()`).
- Google Sheets connection requires the user to add Google OAuth credentials (we'll prompt with `add_secret` and explain where to get them after the rest is built).

## Technical notes
- All server logic in `createServerFn` (`src/lib/*.functions.ts`); submission endpoint is a server route under `/api/public/` so the marketer's shared link works without auth.
- Bearer attached automatically via existing `attachSupabaseAuth`.
- `supabaseAdmin` only loaded inside handlers, never at module scope.
- Public submit route validates with Zod, never trusts client-declared schema.
- No Edge Functions used; everything runs in TanStack server runtime.

## Deliverables order in build mode
1. Design tokens + fonts + landing page (with mock animations).
2. Auth page + managed gate already in place.
3. Migration: profiles, forms, submissions, google_tokens.
4. Dashboard + create-form server fn.
5. Builder + autosave + theme live preview.
6. Public form renderer + submission route (DB only).
7. Google OAuth + Sheets append + Integrations page.
8. Polish: analytics page (basic counts + sparkline), settings, empty states, toasts.
