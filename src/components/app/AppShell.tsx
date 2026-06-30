import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, LogOut, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReactNode } from "react";

export function AppShell({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen grain-bg">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-cream/70 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-2xl">Formlinc</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 ${path === "/dashboard" ? "bg-foreground text-background" : "hover:bg-muted"}`}
            >
              <LayoutGrid className="h-4 w-4" /> Forms
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {action}
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 lg:px-8 py-10">{children}</main>
    </div>
  );
}

export function NewFormButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-1.5"
    >
      <Plus className="h-4 w-4" /> New form
    </button>
  );
}
