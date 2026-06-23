const QUOTES = [
  {
    quote:
      "Set up a lead-gen form in 9 minutes and pasted it into our IG bio the same morning. The sheet was filling by lunch.",
    name: "Jules Park",
    role: "Growth lead, Northbeam",
  },
  {
    quote:
      "We killed three Zapier zaps and a brittle Apps Script. Formlinc just… works.",
    name: "Ade Okafor",
    role: "Marketing ops, Hatch",
  },
  {
    quote:
      "Finally a form that looks like our brand and lands in the sheet my CMO actually checks.",
    name: "Priya Rao",
    role: "Brand director, Altura",
  },
  {
    quote:
      "Our cost-per-lead dropped 28% after switching to Formlinc landing forms.",
    name: "Maya Chen",
    role: "Performance, Studio Co",
  },
  {
    quote: "The share previews on Twitter alone made this worth it.",
    name: "Devon Kim",
    role: "Founder, Boon",
  },
  {
    quote:
      "I built a partner-application form on a Friday and shipped it before the standup.",
    name: "Luca Romero",
    role: "BD, Altura",
  },
];

function Card({ quote, name, role }: (typeof QUOTES)[number]) {
  return (
    <div className="w-[320px] shrink-0 mx-3 rounded-2xl bg-card border border-border/70 soft-shadow p-5">
      <p className="text-sm leading-relaxed text-foreground/85">"{quote}"</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[color:var(--sky)] flex items-center justify-center text-xs font-medium text-[color:var(--ink)]">
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="text-xs">
          <div className="font-medium">{name}</div>
          <div className="text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const row = [...QUOTES, ...QUOTES];
  return (
    <div id="testimonials" className="space-y-5 overflow-hidden">
      <div className="group relative">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
          {row.map((q, i) => (
            <Card key={`a-${i}`} {...q} />
          ))}
        </div>
      </div>
      <div className="group relative">
        <div className="flex animate-marquee-reverse group-hover:[animation-play-state:paused]">
          {row.map((q, i) => (
            <Card key={`b-${i}`} {...q} />
          ))}
        </div>
      </div>
      <FadeEdges />
    </div>
  );
}

function FadeEdges() {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[color:var(--cream)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[color:var(--cream)] to-transparent" />
    </>
  );
}
