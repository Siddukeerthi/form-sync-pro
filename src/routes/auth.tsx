import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Formlinc" },
      {
        name: "description",
        content: "Sign in to Formlinc to build forms and sync to Google Sheets.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="grain-bg min-h-screen flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-5 lg:px-8 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl">Formlinc</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl bg-card border border-border/70 soft-shadow p-8">
          <h1 className="font-display text-4xl leading-tight">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to keep building. Auth wires up once Lovable Cloud is enabled.
          </p>

          <div className="mt-7 space-y-3">
            <input
              type="email"
              placeholder="you@studio.com"
              className="w-full h-11 rounded-xl bg-background border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full h-11 rounded-xl bg-background border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <button
              disabled
              className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-medium opacity-60 cursor-not-allowed"
            >
              Sign in
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            disabled
            className="w-full h-11 rounded-xl bg-background border border-input text-sm font-medium opacity-60 cursor-not-allowed"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Enable Lovable Cloud to activate sign-in and the dashboard.
          </p>
        </div>
      </main>
    </div>
  );
}
