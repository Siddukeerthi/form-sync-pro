import { motion } from "framer-motion";
import {
  BarChart3,
  GripVertical,
  Share2,
  Sparkles,
  Twitter,
  Instagram,
  Type,
  Mail,
  CircleDot,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <div id="features" className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
      {/* Builder */}
      <Tile className="md:col-span-3 md:row-span-2 min-h-[360px]">
        <TileHeader
          eyebrow="Builder"
          title="Drag-and-drop. Drop the friction."
          body="Snap together inputs, dropdowns, file uploads. Reorder by dragging. Ship in minutes — not sprints."
        />
        <BuilderMini />
      </Tile>

      {/* Real-time sync */}
      <Tile className="md:col-span-3 min-h-[240px]">
        <TileHeader
          eyebrow="Google Sheets"
          title="Real-time sync, zero glue code."
          body="Every submission lands in your sheet the instant it happens. No Zapier, no webhooks to maintain."
        />
        <SyncMini />
      </Tile>

      {/* Analytics */}
      <Tile className="md:col-span-2 min-h-[240px]">
        <TileHeader
          eyebrow="Analytics"
          title="Conversion you can read at a glance."
        />
        <AnalyticsMini />
      </Tile>

      {/* Social */}
      <Tile className="md:col-span-1 min-h-[240px]">
        <TileHeader eyebrow="Share" title="Made to be shared." />
        <SocialMini />
      </Tile>
    </div>
  );
}

function Tile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className={`relative rounded-3xl bg-card border border-border/70 soft-shadow p-6 md:p-7 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

function TileHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-widest text-[color:var(--azure-deep)] mb-2">
        {eyebrow}
      </div>
      <h3 className="font-display text-2xl md:text-3xl leading-[1.05]">{title}</h3>
      {body && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">{body}</p>
      )}
    </div>
  );
}

function BuilderMini() {
  const items = [
    { icon: Type, label: "Short answer", color: "var(--sky)" },
    { icon: Mail, label: "Email", color: "var(--peach)" },
    { icon: CircleDot, label: "Multiple choice", color: "var(--azure)" },
  ];
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 h-[180px]">
      <div className="rounded-2xl bg-muted/60 border border-border/60 p-2 space-y-1.5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1">
          Toolbox
        </div>
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card border border-border/60 text-xs"
          >
            <it.icon className="h-3.5 w-3.5" />
            {it.label}
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[color:var(--cream)] border border-dashed border-border p-3 space-y-2">
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i }}
            className="group flex items-center gap-2 rounded-xl bg-card border border-border/70 px-3 py-2 text-xs"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{it.label}</span>
            <span
              className="ml-auto h-2 w-2 rounded-full"
              style={{ background: it.color }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SyncMini() {
  return (
    <div className="relative h-[120px]">
      <div className="absolute inset-0 grid grid-cols-5 gap-1">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="rounded-sm bg-muted/60 border border-border/40" />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 220, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full bg-foreground text-background px-2.5 py-1 text-[11px]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--azure)]" />
          new row
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsMini() {
  const bars = [40, 65, 50, 80, 70, 95, 88];
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-4xl">68%</span>
        <span className="text-xs text-muted-foreground">conversion</span>
      </div>
      <div className="mt-4 flex items-end gap-1.5 h-20">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${b}%` }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.6 }}
            className="flex-1 rounded-t-md bg-[color:var(--azure)]"
            style={{ background: i === 5 ? "var(--azure-deep)" : "var(--azure)" }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <BarChart3 className="h-3.5 w-3.5" />
        last 7 days
      </div>
    </div>
  );
}

function SocialMini() {
  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-[color:var(--sky)]/40 border border-border/60 p-3">
        <div className="flex items-center gap-2 text-xs">
          <Twitter className="h-3.5 w-3.5" />
          <span className="text-muted-foreground">formlinc.app/f/…</span>
        </div>
        <div className="mt-2 font-display text-base leading-tight">
          Capture leads on autopilot
        </div>
      </div>
      <div className="rounded-xl bg-[color:var(--peach)]/70 border border-border/60 p-3">
        <div className="flex items-center gap-2 text-xs">
          <Instagram className="h-3.5 w-3.5" />
          <span className="text-muted-foreground">@yourbrand</span>
        </div>
        <div className="mt-2 text-xs flex items-center gap-1">
          <Share2 className="h-3 w-3" />
          link in bio
        </div>
      </div>
    </div>
  );
}
