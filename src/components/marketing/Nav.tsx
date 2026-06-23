import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "backdrop-blur-md bg-[color-mix(in_oklab,var(--cream)_75%,transparent)] border-b border-border/60"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl leading-none">Formlinc</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-foreground/70">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">
            Customers
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden sm:inline-flex text-sm text-foreground/70 hover:text-foreground transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="relative inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium animate-pulse-glow hover:translate-y-[-1px] transition-transform"
          >
            Get Started
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
