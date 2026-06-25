import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "@/lib/forms.types";

export const Route = createFileRoute("/f/$slug")({
  head: () => ({ meta: [{ title: "Form — Formlinc" }] }),
  component: PublicForm,
});

function PublicForm() {
  const { slug } = Route.useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("forms")
        .select("id, title, description, fields, slug, published")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setForm(data);
      setLoading(false);
    })();
  }, [slug]);

  function validate(fields: FormField[]) {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.id];
      const empty = v == null || v === "" || (f.type === "checkbox" && v !== true);
      if (f.required && empty) e[f.id] = "This field is required";
      else if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        e[f.id] = "Please enter a valid email";
      else if (f.type === "phone" && v && !/^[+\d][\d\s\-()]{5,}$/.test(v))
        e[f.id] = "Please enter a valid phone number";
      else if (f.type === "number" && v && isNaN(Number(v)))
        e[f.id] = "Must be a number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(form.fields)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/submit/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: values }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setDone(true);
    } catch (err: any) {
      setErrors({ _form: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen grain-bg flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  if (!form)
    return (
      <div className="min-h-screen grain-bg flex items-center justify-center px-5">
        <div className="rounded-3xl bg-card border border-border p-10 max-w-md text-center soft-shadow">
          <h1 className="font-display text-3xl">Form not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This form is offline or doesn't exist.</p>
        </div>
      </div>
    );

  const fields: FormField[] = form.fields ?? [];

  return (
    <div className="min-h-screen grain-bg py-8 sm:py-12 px-4 sm:px-5">
      <div className="max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="rounded-3xl bg-card border border-border/70 soft-shadow p-10 sm:p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto h-16 w-16 rounded-full bg-accent inline-flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-accent-foreground" strokeWidth={3} />
              </motion.div>
              <h1 className="mt-6 font-display text-4xl">Thank you!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your response has been received.
              </p>
              <p className="mt-8 text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                Powered by <Sparkles className="h-3 w-3" /> Formlinc
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-card border border-border/70 soft-shadow p-6 sm:p-8 md:p-10"
            >
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight">{form.title}</h1>
              {form.description && (
                <p className="mt-3 text-sm text-muted-foreground">{form.description}</p>
              )}

              <div className="mt-8 space-y-6">
                {fields.map((f) => (
                  <FieldInput
                    key={f.id}
                    field={f}
                    value={values[f.id]}
                    error={errors[f.id]}
                    onChange={(v) => {
                      setValues((s) => ({ ...s, [f.id]: v }));
                      if (errors[f.id]) setErrors((e) => ({ ...e, [f.id]: "" }));
                    }}
                  />
                ))}
              </div>

              {errors._form && (
                <p className="mt-4 text-sm text-destructive">{errors._form}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full h-12 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Submitting…" : "Submit"}
              </button>

              <div className="mt-6 flex justify-center">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                  Powered by <Sparkles className="h-3 w-3" /> Formlinc
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: any;
  error?: string;
  onChange: (v: any) => void;
}) {
  const base = `w-full rounded-xl bg-background border px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-ring/40 ${
    error ? "border-destructive" : "border-input focus:border-ring"
  }`;

  const renderInput = () => {
    if (field.type === "long_text") {
      return (
        <textarea
          rows={4}
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} py-3 min-h-[110px] resize-y leading-relaxed`}
        />
      );
    }
    if (field.type === "select") {
      return (
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${base} h-12 pr-10 appearance-none cursor-pointer ${
              !value ? "text-muted-foreground" : ""
            }`}
          >
            <option value="">Select an option…</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o} className="text-foreground">
                {o}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      );
    }
    if (field.type === "checkbox") {
      const checked = !!value;
      return (
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
            checked
              ? "border-foreground bg-foreground/5"
              : error
              ? "border-destructive"
              : "border-input hover:border-foreground/40"
          }`}
        >
          <span
            className={`shrink-0 h-5 w-5 rounded-md border-2 inline-flex items-center justify-center transition-all ${
              checked ? "bg-foreground border-foreground" : "border-input bg-background"
            }`}
          >
            <AnimatePresence>
              {checked && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check className="h-3.5 w-3.5 text-background" strokeWidth={3.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span className="flex-1 leading-snug">
            {field.placeholder || "I agree"}
          </span>
        </button>
      );
    }
    return (
      <input
        type={
          field.type === "email"
            ? "email"
            : field.type === "phone"
            ? "tel"
            : field.type === "number"
            ? "number"
            : "text"
        }
        value={value ?? ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} h-12`}
      />
    );
  };

  return (
    <div>
      {field.type !== "checkbox" && (
        <label className="block text-sm font-medium mb-2">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {field.type === "checkbox" && (
        <span className="sr-only">{field.label}</span>
      )}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
