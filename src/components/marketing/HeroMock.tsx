import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

type Row = { name: string; email: string; interest: string };

const ROWS: Row[] = [
  { name: "Maya Chen", email: "maya@studio.co", interest: "Pricing" },
  { name: "Devon Kim", email: "devon@hatch.io", interest: "Demo" },
  { name: "Priya Rao", email: "priya@northbeam.com", interest: "Partnership" },
  { name: "Luca Romero", email: "luca@altura.dev", interest: "Pricing" },
];

const FIELDS = ["Name", "Email", "Interest"];

export function HeroMock() {
  const [stage, setStage] = useState(0); // 0..3 typing fields; 4 = flying; then push
  const [rows, setRows] = useState<Row[]>([ROWS[3], ROWS[2]]);
  const [activeRow, setActiveRow] = useState<Row>(ROWS[0]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loop = async () => {
      while (mounted) {
        for (let i = 0; i < ROWS.length; i++) {
          if (!mounted) return;
          setActiveRow(ROWS[i]);
          for (let s = 1; s <= 3; s++) {
            await wait(550);
            if (!mounted) return;
            setStage(s);
          }
          await wait(450);
          if (!mounted) return;
          setStage(4); // fly
          await wait(750);
          if (!mounted) return;
          setRows((prev) => [ROWS[i], ...prev].slice(0, 4));
          setStage(0);
          setTick((t) => t + 1);
          await wait(500);
        }
      }
    };
    void loop();
    return () => {
      mounted = false;
    };
  }, []);

  const values: Record<string, string> = {
    Name: activeRow.name,
    Email: activeRow.email,
    Interest: activeRow.interest,
  };

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] gap-4 md:gap-2 items-center">
        {/* Form panel */}
        <div className="rounded-3xl bg-card border border-border/70 p-5 soft-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--peach)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--sky)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--azure)]" />
            </div>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              formlinc.app/f/lead-magnet
            </span>
          </div>

          <div className="space-y-3">
            {FIELDS.map((label, idx) => {
              const isActive = stage >= idx + 1;
              return (
                <div key={label}>
                  <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    {label}
                  </label>
                  <div
                    className={`relative h-11 rounded-xl border px-3 flex items-center text-sm transition-colors ${
                      isActive
                        ? "border-[color:var(--azure-deep)] bg-[color:var(--cream)]"
                        : "border-border bg-muted/40"
                    }`}
                  >
                    {isActive ? (
                      <TypingText text={values[label]} key={`${tick}-${label}`} />
                    ) : (
                      <span className="text-muted-foreground/60">
                        Enter your {label.toLowerCase()}…
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <button
              className={`mt-2 w-full h-11 rounded-xl font-medium text-sm transition-all ${
                stage >= 3
                  ? "bg-foreground text-background"
                  : "bg-foreground/30 text-background/70"
              }`}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Flying pill */}
        <div className="relative h-16 md:h-40 flex items-center justify-center">
          <AnimatePresence>
            {stage === 4 && (
              <motion.div
                key={`pill-${tick}`}
                initial={{ x: -40, y: -10, opacity: 0, scale: 0.9 }}
                animate={{ x: 60, y: 0, opacity: 1, scale: 1 }}
                exit={{ x: 120, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 soft-shadow text-xs whitespace-nowrap"
              >
                <span className="h-2 w-2 rounded-full bg-[color:var(--azure-deep)] animate-pulse" />
                <span className="font-medium">{activeRow.name}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground truncate max-w-[140px]">
                  {activeRow.email}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <svg
            className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 50 C 30 50, 70 50, 100 50"
              stroke="rgba(63,127,184,0.25)"
              strokeWidth="1"
              strokeDasharray="3 4"
              fill="none"
            />
          </svg>
        </div>

        {/* Sheet panel */}
        <div className="rounded-3xl bg-card border border-border/70 soft-shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[color:var(--peach)]/40">
            <div className="flex items-center gap-2">
              <SheetIcon />
              <span className="text-sm font-medium">Leads — Q4</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Live</span>
          </div>
          <div className="grid grid-cols-[40px_1.2fr_1.5fr_1fr] text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/50">
            <div className="px-2 py-2 text-right">#</div>
            <div className="px-2 py-2">Name</div>
            <div className="px-2 py-2">Email</div>
            <div className="px-2 py-2">Interest</div>
          </div>
          <div className="divide-y divide-border/70">
            <AnimatePresence initial={false}>
              {rows.map((r, i) => (
                <motion.div
                  key={`${r.email}-${tick}-${i}`}
                  initial={i === 0 ? { backgroundColor: "rgba(140,192,235,0.35)", y: -8, opacity: 0 } : false}
                  animate={{ backgroundColor: "rgba(255,255,255,0)", y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-[40px_1.2fr_1.5fr_1fr] text-sm"
                >
                  <div className="px-2 py-3 text-right text-muted-foreground">{i + 2}</div>
                  <div className="px-2 py-3 truncate">{r.name}</div>
                  <div className="px-2 py-3 truncate text-muted-foreground">{r.email}</div>
                  <div className="px-2 py-3 truncate">{r.interest}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border bg-[color:var(--cream)] text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-[color:var(--azure-deep)]" />
            Synced to Google Sheets
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingText({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span className="font-medium text-foreground">
      {shown}
      <span className="inline-block w-[1px] h-4 align-middle bg-foreground/60 ml-0.5 animate-pulse" />
    </span>
  );
}

function SheetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#0F9D58" />
      <path d="M7 8h10v2H7zM7 12h10v2H7zM7 16h10v2H7z" fill="white" opacity="0.9" />
      <path d="M11 7v12M15 7v12" stroke="white" strokeWidth="0.7" opacity="0.6" />
    </svg>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
