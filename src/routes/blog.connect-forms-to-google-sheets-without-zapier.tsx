import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Sheet, Zap } from "lucide-react";

import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

const URL = "https://formlinc.lovable.app/blog/connect-forms-to-google-sheets-without-zapier";
const TITLE = "How to connect a form to Google Sheets without Zapier";
const DESCRIPTION =
  "The simplest way to link a form to a Google Sheet in 2026. No Zapier, no scripts — just paste a link and every submission lands in your Sheet.";
const PUBLISHED = "2026-06-30";

export const Route = createFileRoute("/blog/connect-forms-to-google-sheets-without-zapier")({
  head: () => ({
    meta: [
      { title: `${TITLE} — Formlinc` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "article:published_time", content: PUBLISHED },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          mainEntityOfPage: URL,
          author: { "@type": "Organization", name: "Formlinc" },
          publisher: { "@type": "Organization", name: "Formlinc" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: TITLE,
          description: DESCRIPTION,
          step: [
            { "@type": "HowToStep", name: "Create a form", text: "Pick a starter or add the fields you need in the Formlinc builder." },
            { "@type": "HowToStep", name: "Connect your Sheet", text: "Sign in with Google once and choose a destination spreadsheet." },
            { "@type": "HowToStep", name: "Share the link", text: "Send the public form URL — every submission syncs to your Sheet in real time." },
          ],
        }),
      },
    ],
  }),
  component: Article,
});

function Article() {
  return (
    <div className="min-h-screen grain-bg">
      <Nav />
      <main className="mx-auto max-w-3xl px-5 lg:px-8 pt-16 pb-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">Guide · 4 min read</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
          How to connect a form to Google Sheets — without Zapier
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          If you've ever tried to link a Google Form to a Google Sheet, you've probably hit the same wall: rigid layouts,
          ugly themes, and no way to validate answers before they hit your spreadsheet. Here's the zero-friction way to do
          it in 2026 — no Zapier subscription, no Apps Script, no glue code.
        </p>

        <section className="mt-12">
          <h2 className="font-display text-3xl">The old way (and why it breaks)</h2>
          <p className="mt-3 text-muted-foreground">
            Most teams reach for one of three options when they want form submissions in a Sheet:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex gap-3"><span aria-hidden>•</span><span><strong className="text-foreground">Google Forms</strong> — free, but the UX is stuck in 2014 and you can't restyle a single pixel.</span></li>
            <li className="flex gap-3"><span aria-hidden>•</span><span><strong className="text-foreground">Typeform + Zapier</strong> — beautiful, but you're paying for two SaaS products and chaining webhooks.</span></li>
            <li className="flex gap-3"><span aria-hidden>•</span><span><strong className="text-foreground">Apps Script</strong> — free, but you're writing and maintaining custom code.</span></li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            All three solve the same problem the long way around. The job is simple: a person fills out a form, a row
            appears in your Sheet. That's it.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl">The Formlinc way</h2>
          <p className="mt-3 text-muted-foreground">
            Formlinc was built for exactly this. You design the form, connect a Google Sheet once, and share the link.
            Every submission is validated, then written to your spreadsheet as a new row in real time.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Sheet, title: "1. Build", body: "Drag fields onto the canvas. Required toggles, validation, custom theme." },
              { icon: Zap, title: "2. Connect", body: "Sign in with Google once. Pick the Sheet that should receive responses." },
              { icon: CheckCircle2, title: "3. Share", body: "Send the public link. Rows appear in your Sheet as people submit." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-border/70 bg-card p-5 soft-shadow">
                <s.icon className="h-5 w-5 text-foreground" />
                <h3 className="mt-3 font-display text-xl">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl">Step-by-step</h2>

          <h3 className="mt-6 font-display text-2xl">1. Create your form</h3>
          <p className="mt-2 text-muted-foreground">
            From your dashboard, click <em>New form</em>. Add the fields you need — short text, long text, email, number,
            select, or checkbox — and mark anything that's required. Validation runs before the submission ever leaves
            the browser.
          </p>

          <h3 className="mt-6 font-display text-2xl">2. Connect a Google Sheet</h3>
          <p className="mt-2 text-muted-foreground">
            Open the form's settings and choose <em>Connect Google Sheets</em>. You'll sign in with Google once. Pick an
            existing spreadsheet or let Formlinc create a fresh one with column headers that match your fields.
          </p>

          <h3 className="mt-6 font-display text-2xl">3. Share your link</h3>
          <p className="mt-2 text-muted-foreground">
            Publish the form and copy its public link. Drop it into an email, a Notion page, a QR code — anywhere. Every
            response shows up as a new row in your Sheet within seconds, with timestamp, submitter metadata, and clean,
            typed values.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl">Why this beats Zapier</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" /><span>One subscription instead of two.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" /><span>No task limits — submissions sync as fast as they arrive.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" /><span>Validation happens before data hits your Sheet, so no malformed rows.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" /><span>You own the Sheet — pivot, chart, or share it the same as any other spreadsheet.</span></li>
          </ul>
        </section>

        <section className="mt-12 rounded-3xl border border-border/70 bg-card p-8 soft-shadow">
          <h2 className="font-display text-3xl">Try it on your next form</h2>
          <p className="mt-2 text-muted-foreground">
            If you've got a form you'd normally build in Google Forms or wire up with Zapier, build it in Formlinc
            instead. The Sheet sync is the default, not an add-on.
          </p>
          <Link
            to="/auth"
            className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
