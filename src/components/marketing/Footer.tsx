import { useState } from "react";
import { Sparkles } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="mt-24 border-t border-border/60 bg-[color:var(--peach)]/40">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display text-2xl">Formlinc</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Forms that sync straight to your Google Sheet. Made for marketers
              who ship.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                setDone(true);
                setEmail("");
              }}
              className="mt-5 flex max-w-sm rounded-full bg-card border border-border p-1 soft-shadow"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@studio.com"
                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
              />
              <button className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:translate-y-[-1px] transition-transform">
                {done ? "Thanks ✓" : "Subscribe"}
              </button>
            </form>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Changelog", href: "#" },
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              { label: "Templates", href: "#" },
              { label: "Docs", href: "#" },
              { label: "Status", href: "#" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Formlinc. All rights reserved.</span>
          <span>Made for marketers who ship.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-foreground/60 mb-3">
        {title}
      </div>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
