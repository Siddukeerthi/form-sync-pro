import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Zap } from "lucide-react";

import { Nav } from "@/components/marketing/Nav";
import { HeroMock } from "@/components/marketing/HeroMock";
import { FeaturesBento } from "@/components/marketing/FeaturesBento";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";
import { Footer } from "@/components/marketing/Footer";
import { Reveal, RevealItem, RevealStagger } from "@/components/marketing/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Formlinc — Forms that sync to your Google Sheet" },
      {
        name: "description",
        content:
          "Build beautiful forms, share a link, and watch every submission land in your own Google Sheet in real time. No Zapier, no glue code.",
      },
      { property: "og:title", content: "Formlinc — Forms that sync to your Google Sheet" },
      {
        property: "og:description",
        content:
          "Build, share, collect. Every submission lands in your Google Sheet in real time. No Zapier, no glue code.",
      },
      { property: "og:url", content: "https://formlinc.lovable.app/" },
      { name: "twitter:title", content: "Formlinc — Forms that sync to your Google Sheet" },
      {
        name: "twitter:description",
        content: "Build forms, share a link, and sync submissions to your Google Sheet in real time.",
      },
    ],
    links: [{ rel: "canonical", href: "https://formlinc.lovable.app/" }],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="grain-bg min-h-screen text-foreground">
      <Nav />

      <main className="mx-auto max-w-6xl px-5 lg:px-8">
        {/* HERO */}
        <section className="pt-14 md:pt-24 pb-20 md:pb-28">
          <RevealStagger className="flex flex-col items-center text-center">
            <RevealItem>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs text-foreground/70 soft-shadow">
                <Zap className="h-3 w-3 text-[color:var(--azure-deep)]" />
                New — instant Google Sheets sync
              </span>
            </RevealItem>

            <RevealItem>
              <h1 className="mt-6 font-display text-[44px] md:text-[84px] leading-[0.95] tracking-tight max-w-4xl">
                Capture leads.
                <br />
                Sync instantly.
                <br />
                <span className="italic text-[color:var(--azure-deep)]">
                  Zero friction.
                </span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-xl">
                Formlinc lets you build beautiful forms, share a link, and watch
                every submission land in your own Google Sheet — in real time,
                no Zapier in sight.
              </p>
            </RevealItem>

            <RevealItem>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to="/auth"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium animate-pulse-glow"
                >
                  Build your first form — free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full bg-card border border-border text-foreground px-5 py-3 text-sm font-medium hover:translate-y-[-1px] transition-transform soft-shadow"
                >
                  <Play className="h-3.5 w-3.5" />
                  Watch demo
                </a>
              </div>
            </RevealItem>

            <RevealItem className="mt-3 text-xs text-muted-foreground">
              Free forever for 100 submissions / month. No credit card.
            </RevealItem>
          </RevealStagger>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 md:mt-20"
          >
            <HeroMock />
          </motion.div>

          {/* logos */}
          <Reveal delay={0.2}>
            <div className="mt-16 flex items-center justify-center gap-x-10 gap-y-3 flex-wrap opacity-70">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Trusted by teams at
              </span>
              {["Northbeam", "Altura", "Hatch", "Boon", "Studio Co"].map((l) => (
                <span
                  key={l}
                  className="font-display text-xl text-foreground/60"
                >
                  {l}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* FEATURES */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="mb-12 text-center">
              <div className="text-[11px] uppercase tracking-widest text-[color:var(--azure-deep)] mb-3">
                Features
              </div>
              <h2 className="font-display text-4xl md:text-6xl leading-[1] max-w-3xl mx-auto">
                Everything between
                <br />
                <span className="italic">"got the link"</span> and{" "}
                <span className="italic">"in the sheet"</span>.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <FeaturesBento />
          </Reveal>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="mb-10 text-center">
              <div className="text-[11px] uppercase tracking-widest text-[color:var(--azure-deep)] mb-3">
                Loved by marketers
              </div>
              <h2 className="font-display text-4xl md:text-5xl leading-[1] max-w-2xl mx-auto">
                Setup so fast it feels like cheating.
              </h2>
            </div>
          </Reveal>
          <div className="relative">
            <Testimonials />
          </div>
        </section>

        {/* PRICING */}
        <section className="py-20 md:py-28">
          <Reveal>
            <Pricing />
          </Reveal>
        </section>

        {/* CTA */}
        <section className="pb-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-10 md:p-16 text-center soft-shadow">
              <div
                aria-hidden
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 20% 30%, var(--azure) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--peach) 0%, transparent 40%)",
                }}
              />
              <div className="relative">
                <h2 className="font-display text-4xl md:text-6xl leading-[1]">
                  Ship your first form today.
                </h2>
                <p className="mt-4 text-background/70 max-w-md mx-auto">
                  No setup. No Zapier. Just a link and a sheet that fills itself.
                </p>
                <Link
                  to="/auth"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-background text-foreground px-5 py-3 text-sm font-medium hover:translate-y-[-1px] transition-transform"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
