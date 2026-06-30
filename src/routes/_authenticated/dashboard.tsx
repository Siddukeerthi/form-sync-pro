import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Copy, ExternalLink, FileText, Loader2, Trash2 } from "lucide-react";
import { AppShell, NewFormButton } from "@/components/app/AppShell";
import { createForm, deleteForm, listForms } from "@/lib/forms.functions";
import { slugify } from "@/lib/forms.types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Formlinc" }] }),
  component: Dashboard,
});

function Dashboard() {
  const list = useServerFn(listForms);
  const create = useServerFn(createForm);
  const del = useServerFn(deleteForm);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["forms"], queryFn: () => list() });

  const createMut = useMutation({
    mutationFn: async () => {
      const title = "Untitled form";
      return create({ data: { title, slug: slugify(title + "-" + Math.random().toString(36).slice(2, 6)) } });
    },
    onSuccess: (form: any) => {
      qc.invalidateQueries({ queryKey: ["forms"] });
      navigate({ to: "/builder/$formId", params: { formId: form.id } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form deleted");
    },
  });

  async function handleCreate() {
    setCreating(true);
    try {
      await createMut.mutateAsync();
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell action={<NewFormButton onClick={handleCreate} />}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-5xl md:text-6xl leading-none">Your forms</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Build, share, and sync. Every response lands in your dashboard instantly.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState loading={creating} onCreate={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((f: any, i: number) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group rounded-3xl bg-card border border-border/70 soft-shadow p-5 flex flex-col"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`text-[11px] uppercase tracking-wider px-2 py-1 rounded-full ${f.published ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {f.published ? "Live" : "Draft"}
                </span>
                <button
                  onClick={() => confirm("Delete this form?") && delMut.mutate(f.id)}
                  aria-label={`Delete form ${f.title}`}
                  className="opacity-0 group-hover:opacity-100 transition h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-3 font-display text-2xl leading-tight">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground font-mono">/f/{f.slug}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{f.submission_count} responses</span>
              </div>
              <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/f/${f.slug}`);
                    toast.success("Link copied");
                  }}
                  className="text-xs inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </button>
                <Link
                  to="/builder/$formId"
                  params={{ formId: f.id }}
                  className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background hover:opacity-90"
                >
                  Edit <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function EmptyState({ loading, onCreate }: { loading: boolean; onCreate: () => void }) {
  return (
    <div className="rounded-3xl bg-card border border-border/70 soft-shadow p-16 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-secondary inline-flex items-center justify-center">
        <FileText className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-display text-3xl">Build your first form</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        Drop in fields, share the link, watch submissions stream in live.
      </p>
      <button
        onClick={onCreate}
        disabled={loading}
        className="mt-6 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 inline-flex items-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Create form
      </button>
    </div>
  );
}
