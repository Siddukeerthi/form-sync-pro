import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Sheet,
  Trash2,
  Unplug,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AppShell } from "@/components/app/AppShell";
import { getForm, listSubmissions, updateForm } from "@/lib/forms.functions";
import {
  connectFormToSheet,
  disconnectFormFromSheet,
  disconnectGoogle,
  getGoogleStatus,
  startGoogleAuth,
  syncFormResponses,
} from "@/lib/google.functions";
import { FIELD_LABELS, FieldType, FormField, newField } from "@/lib/forms.types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/builder/$formId")({
  head: () => ({ meta: [{ title: "Builder — Formlinc" }] }),
  component: Builder,
});

function Builder() {
  const { formId } = Route.useParams();
  const get = useServerFn(getForm);
  const update = useServerFn(updateForm);
  const listSubs = useServerFn(listSubmissions);
  const qc = useQueryClient();

  const { data: form, isLoading } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => get({ data: { id: formId } }),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [published, setPublished] = useState(false);
  const [tab, setTab] = useState<"build" | "responses">("build");

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description ?? "");
      setFields((form.fields as any) ?? []);
      setPublished(form.published);
    }
  }, [form]);

  const saveMut = useMutation({
    mutationFn: (patch: any) => update({ data: { id: formId, ...patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["form", formId] }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function addField(type: FieldType) {
    const next = [...fields, newField(type)];
    setFields(next);
    saveMut.mutate({ fields: next });
  }

  function updateField(id: string, patch: Partial<FormField>) {
    const next = fields.map((f) => (f.id === id ? { ...f, ...patch } : f));
    setFields(next);
  }

  function removeField(id: string) {
    const next = fields.filter((f) => f.id !== id);
    setFields(next);
    saveMut.mutate({ fields: next });
  }

  function commit() {
    saveMut.mutate({ title, description: description || null, fields });
    toast.success("Saved");
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = fields.findIndex((f) => f.id === active.id);
    const newIdx = fields.findIndex((f) => f.id === over.id);
    const next = arrayMove(fields, oldIdx, newIdx);
    setFields(next);
    saveMut.mutate({ fields: next });
  }

  async function togglePublish() {
    const next = !published;
    setPublished(next);
    await saveMut.mutateAsync({ published: next, title, fields });
    toast.success(next ? "Form is live" : "Form unpublished");
  }

  if (isLoading || !form) {
    return (
      <AppShell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading form…
        </div>
      </AppShell>
    );
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/f/${form.slug}`;

  return (
    <AppShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-3 mb-6">
        <Link
          to="/dashboard"
          className="text-sm inline-flex items-center gap-1 text-muted-foreground hover:text-foreground min-w-0"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">All forms</span>
        </Link>
        <div className="col-span-2 sm:col-auto flex flex-wrap items-center gap-2">
          <a
            href={`/f/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm inline-flex items-center gap-1.5 hover:bg-muted"
          >
            <Eye className="h-4 w-4" /> Preview
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast.success("Link copied");
            }}
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm inline-flex items-center gap-1.5 hover:bg-muted"
          >
            <Copy className="h-4 w-4" /> Copy link
          </button>
          <button
            onClick={togglePublish}
            className={`h-9 px-4 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 ${published ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}
          >
            {published ? (
              <>
                <Check className="h-4 w-4" /> Live
              </>
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-muted w-fit text-sm">
        {(["build", "responses"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg capitalize transition ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <SheetsBar formId={formId} sheetUrl={form.sheet_url} />

      {tab === "build" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Toolbox */}
          <aside className="lg:sticky lg:top-24 self-start rounded-3xl bg-card border border-border/70 soft-shadow p-4">
            <p className="px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Add field
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
              {(Object.keys(FIELD_LABELS) as FieldType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => addField(t)}
                  className="text-left px-3 py-2 rounded-lg text-sm hover:bg-muted flex items-center justify-between gap-2 transition"
                >
                  <span className="truncate">{FIELD_LABELS[t]}</span>
                  <Plus className="h-3.5 w-3.5 opacity-50 shrink-0" />
                </button>
              ))}
            </div>
          </aside>

          {/* Canvas */}
          <div className="rounded-3xl bg-card border border-border/70 soft-shadow p-5 sm:p-6 md:p-10 min-w-0">
            <h1 className="sr-only">{title || "Untitled form"} — form builder</h1>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commit}
              aria-label="Form title"
              className="w-full font-display text-3xl sm:text-4xl md:text-5xl bg-transparent outline-none placeholder:text-muted-foreground/60"
              placeholder="Untitled form"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={commit}
              rows={2}
              placeholder="Add a short description…"
              className="mt-3 w-full bg-transparent outline-none text-sm text-muted-foreground resize-none placeholder:text-muted-foreground/60"
            />

            <div className="mt-8 space-y-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence>
                    {fields.map((field) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        onChange={(p) => updateField(field.id, p)}
                        onBlur={commit}
                        onRemove={() => removeField(field.id)}
                      />
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>

              {fields.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                  Add your first field from the panel above.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ResponsesPanel formId={formId} fields={fields} listSubs={listSubs} />
      )}
    </AppShell>
  );
}

function SortableField({
  field,
  onChange,
  onBlur,
  onRemove,
}: {
  field: FormField;
  onChange: (p: Partial<FormField>) => void;
  onBlur: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };
  const supportsPlaceholder = !["select", "checkbox"].includes(field.type);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group rounded-2xl bg-background border border-border p-3 sm:p-4 ${isDragging ? "soft-shadow" : ""}`}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 sm:gap-3 items-start">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="mt-1 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              onBlur={onBlur}
              placeholder="Field label"
              className="flex-1 min-w-0 bg-transparent outline-none font-medium text-sm"
            />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-2 py-0.5 rounded-md bg-muted shrink-0">
              {FIELD_LABELS[field.type]}
            </span>
          </div>

          <FieldPreview field={field} />

          {supportsPlaceholder && (
            <input
              value={field.placeholder ?? ""}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              onBlur={onBlur}
              placeholder="Placeholder text (optional)"
              className="mt-2 w-full text-xs h-8 px-2 rounded-md bg-card border border-border outline-none focus:ring-2 focus:ring-ring/30"
            />
          )}

          {field.type === "select" && (
            <div className="mt-3 space-y-1.5">
              {(field.options ?? []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...(field.options ?? [])];
                      next[i] = e.target.value;
                      onChange({ options: next });
                    }}
                    onBlur={onBlur}
                    className="flex-1 min-w-0 text-xs h-8 px-2 rounded-md bg-card border border-border outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    type="button"
                    aria-label="Remove option"
                    onClick={() => {
                      onChange({ options: (field.options ?? []).filter((_, j) => j !== i) });
                      onBlur();
                    }}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  onChange({ options: [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`] });
                  onBlur();
                }}
                className="text-xs text-primary inline-flex items-center gap-1 mt-1 hover:underline"
              >
                <Plus className="h-3 w-3" /> Add option
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs">
            <button
              type="button"
              role="switch"
              aria-checked={!!field.required}
              onClick={() => {
                onChange({ required: !field.required });
                onBlur();
              }}
              className="inline-flex items-center gap-2 group/req"
            >
              <span
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  field.required ? "bg-foreground" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all ${
                    field.required ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </span>
              <span className="text-muted-foreground group-hover/req:text-foreground transition-colors">
                Required
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove field"
          className="opacity-60 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  const cls = "mt-2 w-full h-9 rounded-lg bg-card border border-border px-3 text-xs text-muted-foreground inline-flex items-center";
  switch (field.type) {
    case "long_text":
      return <div className={`${cls} h-16 py-2 items-start pt-2`}>{field.placeholder || "Long answer…"}</div>;
    case "checkbox":
      return (
        <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded-md border-2 border-border" />
          {field.placeholder || "I agree"}
        </div>
      );
    case "select":
      return null;
    default:
      return <div className={cls}>{field.placeholder || "Short answer…"}</div>;
  }
}

function ResponsesPanel({ formId, fields, listSubs }: { formId: string; fields: FormField[]; listSubs: any }) {
  const { data, isLoading } = useQuery({
    queryKey: ["subs", formId],
    queryFn: () => listSubs({ data: { formId } }),
    refetchInterval: 5000,
  });

  function exportCsv() {
    if (!data?.length) return;
    const headers = fields.map((f) => f.label);
    const rows = data.map((s: any) =>
      fields.map((f) => JSON.stringify(s.payload?.[f.id] ?? "")).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `formlinc-${formId}.csv`;
    a.click();
  }

  return (
    <div className="rounded-3xl bg-card border border-border/70 soft-shadow overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div>
          <h3 className="font-display text-2xl">Responses</h3>
          <p className="text-xs text-muted-foreground">{data?.length ?? 0} total · live refresh</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data?.length}
          className="h-9 px-3 rounded-lg text-sm bg-foreground text-background disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>
      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin inline" /> Loading…</div>
      ) : !data?.length ? (
        <div className="p-16 text-center text-sm text-muted-foreground">No responses yet. Share your link to get started.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">When</th>
                {fields.map((f) => (
                  <th key={f.id} className="text-left px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((s: any) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                  {fields.map((f) => (
                    <td key={f.id} className="px-4 py-3 max-w-xs truncate">{String(s.payload?.[f.id] ?? "—")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
