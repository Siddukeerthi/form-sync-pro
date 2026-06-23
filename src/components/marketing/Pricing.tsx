import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";

type Tier = {
  name: string;
  blurb: string;
  monthly: number;
  annually: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    blurb: "Try the whole loop. No credit card.",
    monthly: 0,
    annually: 0,
    features: [
      "3 active forms",
      "100 submissions / month",
      "Real-time Google Sheets sync",
      "Branded share previews",
    ],
    cta: "Get started free",
  },
  {
    name: "Pro",
    blurb: "For marketers shipping campaigns weekly.",
    monthly: 19,
    annually: 15,
    features: [
      "Unlimited forms",
      "10,000 submissions / month",
      "Custom themes & fonts",
      "Conversion analytics",
      "Remove Formlinc branding",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    blurb: "For teams with compliance & scale.",
    monthly: 99,
    annually: 79,
    features: [
      "Unlimited everything",
      "SSO + role-based access",
      "Audit log & SOC2 report",
      "Dedicated CSM",
    ],
    cta: "Talk to sales",
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <div id="pricing">
      <div className="flex flex-col items-center mb-10">
        <div className="text-[11px] uppercase tracking-widest text-[color:var(--azure-deep)] mb-3">
          Pricing
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-center leading-[1]">
          Honest pricing.
          <br />
          <span className="italic">No surprises.</span>
        </h2>
        <div className="mt-7 inline-flex items-center rounded-full bg-card border border-border p-1 soft-shadow">
          <ToggleBtn active={!annual} onClick={() => setAnnual(false)}>
            Monthly
          </ToggleBtn>
          <ToggleBtn active={annual} onClick={() => setAnnual(true)}>
            Annually
            <span className="ml-1.5 rounded-full bg-[color:var(--peach)] text-[10px] px-1.5 py-0.5 text-foreground/70">
              −20%
            </span>
          </ToggleBtn>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TIERS.map((t) => (
          <motion.div
            key={t.name}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`relative rounded-3xl border p-7 flex flex-col ${
              t.highlighted
                ? "bg-foreground text-background border-foreground glow-ring"
                : "bg-card border-border/70 soft-shadow"
            }`}
          >
            {t.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--peach)] text-foreground text-[11px] uppercase tracking-widest px-3 py-1">
                Most loved
              </span>
            )}
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-3xl">{t.name}</h3>
            </div>
            <p
              className={`mt-1 text-sm ${
                t.highlighted ? "text-background/70" : "text-muted-foreground"
              }`}
            >
              {t.blurb}
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl">
                ${annual ? t.annually : t.monthly}
              </span>
              <span
                className={`text-sm ${
                  t.highlighted ? "text-background/70" : "text-muted-foreground"
                }`}
              >
                /mo
              </span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      t.highlighted
                        ? "text-[color:var(--azure)]"
                        : "text-[color:var(--azure-deep)]"
                    }`}
                  />
                  <span
                    className={
                      t.highlighted ? "text-background/90" : "text-foreground/85"
                    }
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className={`mt-7 inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition-all ${
                t.highlighted
                  ? "bg-background text-foreground hover:translate-y-[-1px]"
                  : "bg-foreground text-background hover:translate-y-[-1px]"
              }`}
            >
              {t.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-1.5 text-sm rounded-full transition-colors ${
        active ? "text-background" : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId="pricing-toggle"
          className="absolute inset-0 rounded-full bg-foreground"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative inline-flex items-center">{children}</span>
    </button>
  );
}
